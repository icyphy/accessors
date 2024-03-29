// Copied from
// https://github.com/svaarala/duktape/blob/master/examples/eventloop/c_eventloop.c
// with modifications noted with // Accessors:

/* =============== */
/* Duktape license */
/* =============== */

/* (http://opensource.org/licenses/MIT) */

/* Copyright (c) 2013-2016 by Duktape authors (see AUTHORS.rst) */

/* Permission is hereby granted, free of charge, to any person obtaining a copy */
/* of this software and associated documentation files (the "Software"), to deal */
/* in the Software without restriction, including without limitation the rights */
/* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell */
/* copies of the Software, and to permit persons to whom the Software is */
/* furnished to do so, subject to the following conditions: */

/* The above copyright notice and this permission notice shall be included in */
/* all copies or substantial portions of the Software. */

/* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR */
/* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, */
/* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE */
/* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER */
/* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, */
/* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN */
/* THE SOFTWARE. */


/*
 *  C eventloop example.
 *
 *  Timer management is similar to eventloop.js but implemented in C.
 *  In particular, timer insertion is an O(n) operation; in a real world
 *  eventloop based on a heap insertion would be O(log N).
 *  $Id$
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>
#include <sys/time.h>
#ifndef __ARM_EABI__
#include <poll.h>
#endif
#define __USE_BSD
// Accessors:  Needed to include unistd.h for usleep()
#include <unistd.h>

#include "duktape.h"

// Accessors: Reduced MAX_TIMES from 4096 to 8.
#define  MAX_TIMERS             8         /* this is quite excessive for embedded use, but good for testing */
#define  MIN_DELAY              1.0
#define  MIN_WAIT               1.0
#define  MAX_WAIT               60000.0
#define  MAX_EXPIRYS            10

// Accessors: Reduced MAX_FSS from 256 to 4.
#define  MAX_FDS                4

typedef struct {
        int64_t id;       /* numeric ID (returned from e.g. setTimeout); zero if unused */
        double target;    /* next target time */
        double delay;     /* delay/interval */
        int oneshot;      /* oneshot=1 (setTimeout), repeated=0 (setInterval) */
        int removed;      /* timer has been requested for removal */

        /* The callback associated with the timer is held in the "global stash",
         * in <stash>.eventTimers[String(id)].  The references must be deleted
         * when a timer struct is deleted.
         */
} ev_timer;

/* Active timers.  Dense list, terminates to end of list or first unused timer.
 * The list is sorted by 'target', with lowest 'target' (earliest expiry) last
 * in the list.  When a timer's callback is being called, the timer is moved
 * to 'timer_expiring' as it needs special handling should the user callback
 * delete that particular timer.
 */
static ev_timer timer_list[MAX_TIMERS];
static ev_timer timer_expiring;
static int timer_count;  /* last timer at timer_count - 1 */
static int64_t timer_next_id = 1;

/* Socket poll state. */
#ifndef __ARM_EABI__
static struct pollfd poll_list[MAX_FDS];
#endif
static int poll_count = 0;

/* Misc */
static int exit_requested = 0;

#include <errno.h>

/* Get Javascript compatible 'now' timestamp (millisecs since 1970). */
static double get_now(void) {
        struct timeval tv;
        int rc;

        rc = gettimeofday(&tv, NULL);
        if (rc != 0) {
          // Invoke perror() before invoking fprintf in case fprintf updates errno.
          perror("gettimeofday() failed");
          // For ARM, ./src/newlib/newlib/libc/include/sys/errno.h.  Errno 88 is function not implemented.
          fprintf(stderr, "%s:%d: WARNING: gettimeofday() returned %d!!  get_now will return 0.0? This is bad. errno = %d. Note that errno on the target platform might be different.  \n", __FILE__, __LINE__, rc, errno);
                /* Should never happen, so return whatever. */
                return 0.0;
        }
        double returnValue = ((double) tv.tv_sec) * 1000.0 + ((double) tv.tv_usec) / 1000.0;
        // fprintf(stderr, "%s:%d: get_now() returning %g.\n", __FILE__, __LINE__, returnValue);
        return returnValue;
}

static ev_timer *find_nearest_timer(void) {
        /* Last timer expires first (list is always kept sorted). */
        if (timer_count <= 0) {
                return NULL;
        }
        return timer_list + timer_count - 1;
}

/* Bubble last timer on timer list backwards until it has been moved to
 * its proper sorted position (based on 'target' time).
 */
static void bubble_last_timer(void) {
        int i;
        int n = timer_count;
        ev_timer *t;
        ev_timer tmp;

        for (i = n - 1; i > 0; i--) {
                /* Timer to bubble is at index i, timer to compare to is
                 * at i-1 (both guaranteed to exist).
                 */
                t = timer_list + i;
                if (t->target <= (t-1)->target) {
                        /* 't' expires earlier than (or same time as) 't-1', so we're done. */
                        break;
                } else {
                        /* 't' expires later than 't-1', so swap them and repeat. */
                        memcpy((void *) &tmp, (void *) (t - 1), sizeof(ev_timer));
                        memcpy((void *) (t - 1), (void *) t, sizeof(ev_timer));
                        memcpy((void *) t, (void *) &tmp, sizeof(ev_timer));
                }
        }
}

static void expire_timers(duk_context *ctx) {
        ev_timer *t;
        int sanity = MAX_EXPIRYS;
        double now;
        int rc;

        /* Because a user callback can mutate the timer list (by adding or deleting
         * a timer), we expire one timer and then rescan from the end again.  There
         * is a sanity limit on how many times we do this per expiry round.
         */

        duk_push_global_stash(ctx);
        duk_get_prop_string(ctx, -1, "eventTimers");

        /* [ ... stash eventTimers ] */

        now = get_now();
        while (sanity-- > 0) {
                /*
                 *  If exit has been requested, exit without running further
                 *  callbacks.
                 */

                if (exit_requested) {
#if 0
                        fprintf(stderr, "exit requested, exiting timer expiry loop\n");
                        fflush(stderr);
#endif
                        break;
                }

                /*
                 *  Expired timer(s) still exist?
                 */

                if (timer_count <= 0) {
                        break;
                }
                t = timer_list + timer_count - 1;
                if (t->target > now) {
                        break;
                }

                /*
                 *  Move the timer to 'expiring' for the duration of the callback.
                 *  Mark a one-shot timer deleted, compute a new target for an interval.
                 */

                memcpy((void *) &timer_expiring, (void *) t, sizeof(ev_timer));
                memset((void *) t, 0, sizeof(ev_timer));
                timer_count--;
                t = &timer_expiring;

                if (t->oneshot) {
                        t->removed = 1;
                } else {
                        t->target = now + t->delay;  /* XXX: or t->target + t->delay? */
                }

                /*
                 *  Call timer callback.  The callback can operate on the timer list:
                 *  add new timers, remove timers.  The callback can even remove the
                 *  expired timer whose callback we're calling.  However, because the
                 *  timer being expired has been moved to 'timer_expiring', we don't
                 *  need to worry about the timer's offset changing on the timer list.
                 */

#if 0
                fprintf(stderr, "calling user callback for timer id %d\n", (int) t->id);
                fflush(stderr);
#endif

                duk_push_number(ctx, (double) t->id);
                duk_get_prop(ctx, -2);  /* -> [ ... stash eventTimers func ] */
                rc = duk_pcall(ctx, 0 /*nargs*/);  /* -> [ ... stash eventTimers retval ] */
                if (rc != 0) {
#if 0
                        fprintf(stderr, "timer callback failed for timer %d: %s\n", (int) t->id, duk_to_string(ctx, -1));
                        fflush(stderr);
#endif
                }
                duk_pop(ctx);    /* ignore errors for now -> [ ... stash eventTimers ] */

                if (t->removed) {
                        /* One-shot timer (always removed) or removed by user callback. */
#if 0
                        fprintf(stderr, "deleting callback state for timer %d\n", (int) t->id);
                        fflush(stderr);
#endif
                        duk_push_number(ctx, (double) t->id);
                        duk_del_prop(ctx, -2);
                } else {
                        /* Interval timer, not removed by user callback.  Queue back to
                         * timer list and bubble to its final sorted position.
                         */
#if 0
                        fprintf(stderr, "queueing timer %d back into active list\n", (int) t->id);
                        fflush(stderr);
#endif
                        if (timer_count >= MAX_TIMERS) {
                                duk_error(ctx, DUK_ERR_RANGE_ERROR, "out of timer slots");
                        }
                        memcpy((void *) (timer_list + timer_count), (void *) t, sizeof(ev_timer));
                        timer_count++;
                        bubble_last_timer();
                }
        }

        memset((void *) &timer_expiring, 0, sizeof(ev_timer));

        duk_pop_2(ctx);  /* -> [ ... ] */
}

static void compact_poll_list(void) {
#ifndef __ARM_EABI__
        int i, j, n;

        /* i = input index
         * j = output index (initially same as i)
         */

        n = poll_count;
        for (i = 0, j = 0; i < n; i++) {
                struct pollfd *pfd = poll_list + i;
                if (pfd->fd == 0) {
                        /* keep output index the same */
#if 0
                        fprintf(stderr, "remove pollfd (index %d): fd=%d, events=%d, revents=%d\n",
                                i, pfd->fd, pfd->events, pfd->revents),
                        fflush(stderr);
#endif

                        continue;
                }
#if 0
                fprintf(stderr, "keep pollfd (index %d -> %d): fd=%d, events=%d, revents=%d\n",
                        i, j, pfd->fd, pfd->events, pfd->revents),
                fflush(stderr);
#endif
                if (i != j) {
                        /* copy only if indices have diverged */
                        memcpy((void *) (poll_list + j), (void *) (poll_list + i), sizeof(struct pollfd));
                }
                j++;
        }

        if (j < poll_count) {
                /* zeroize unused entries for sanity */
                memset((void *) (poll_list + j), 0, (poll_count - j) * sizeof(struct pollfd));
        }

        poll_count = j;
#endif /* __ARM_EABI__*/
}


#ifdef __ARM_EABI__
/* Delay for for the given microseconds (approximately).
 *
 * For a 16 MHz CPU, 1us == 16 instructions (assuming each instruction takes
 * one cycle).
 * Source: https://github.com/helena-project/tock/blob/master/userland/examples/blink_sync/main.c
 */
static void busy_delay_us(int duration) {
  // The inner loop instructions are: 14 NOPs + 1 SUBS/ADDS + 1 CMP
  while (duration-- != 0) {
    __asm volatile (
      "nop\n"
      "nop\n"
      "nop\n"
      "nop\n"
      "nop\n"
      "nop\n"
      "nop\n"
      "nop\n"
      "nop\n"
      "nop\n"
      "nop\n"
      "nop\n"
      "nop\n"
      "nop\n"
    );
  }
}
#endif /* __ARM_EABI__*/

duk_ret_t eventloop_run(duk_context *ctx, void *udata) {
        ev_timer *t;
        double now;
        double diff;
        int timeout;
        int rc;
        int i, n;
        int idx_eventloop;
        int idx_fd_handler;

        /* The Ecmascript poll handler is passed through EventLoop.fdPollHandler
         * which c_eventloop.js sets before we come here.
         */
        duk_push_global_object(ctx);
        duk_get_prop_string(ctx, -1, "EventLoop");
        duk_get_prop_string(ctx, -1, "fdPollHandler");  /* -> [ global EventLoop fdPollHandler ] */
        idx_fd_handler = duk_get_top_index(ctx);
        idx_eventloop = idx_fd_handler - 1;

        for (;;) {
                /*
                 *  Expire timers.
                 */

                // fprintf(stderr, "%s:%d: expire_timers()\n", __FILE__, __LINE__);
                expire_timers(ctx);

                /*
                 *  If exit requested, bail out as fast as possible.
                 */

                if (exit_requested) {
#if 0
                        fprintf(stderr, "exit requested, exiting event loop\n");
                        fflush(stderr);
#endif
                        break;
                }

                /*
                 *  Compact poll list by removing pollfds with fd == 0.
                 */

                compact_poll_list();

                /*
                 *  Determine poll() timeout (as close to poll() as possible as
                 *  the wait is relative).
                 */

                now = get_now();
                t = find_nearest_timer();
                if (t) {
                        diff = t->target - now;
                        if (diff < MIN_WAIT) {
                                diff = MIN_WAIT;
                        } else if (diff > MAX_WAIT) {
                                diff = MAX_WAIT;
                        }
                        timeout = (int) diff;  /* clamping ensures that fits */
                } else {
                        if (poll_count == 0) {
#if 1
                                fprintf(stderr, "no timers and no sockets to poll, exiting\n");
                                fflush(stderr);
#endif
                                break;
                        }
                        timeout = (int) MAX_WAIT;
                }

                /*
                 *  Poll for activity or timeout.
                 */

#if 0
                fprintf(stderr, "going to poll, timeout %d ms, pollfd count %d\n", timeout, poll_count);
                fflush(stderr);
#endif

// Accessors: Use usleep() here instead of poll().
                // printf("timeout -> %d \n", timeout);

#ifdef __ARM_EABI__
                fprintf(stderr, "%s:%d: busy_delay_us()\n", __FILE__, __LINE__);
                busy_delay_us(timeout*1000);
#else
                // fprintf(stderr, "%s:%d: usleep()\n", __FILE__, __LINE__);
                usleep(timeout*1000);
#endif
                //rc = poll(poll_list, poll_count, timeout);
                rc = 0;
#if 0
                fprintf(stderr, "poll rc: %d\n", rc);
                fflush(stderr);
#endif
                if (rc < 0) {
                        /* error */
                } else if (rc == 0) {
                        /* timeout */
                } else {
                        /* 'rc' fds active */
                }

                /*
                 *  Check socket activity, handle all sockets.  Handling is offloaded to
                 *  Ecmascript code (fd + revents).
                 *
                 *  If FDs are removed from the poll list while we're processing callbacks,
                 *  the entries are simply marked unused (fd set to 0) without actually
                 *  removing them from the poll list.  This ensures indices are not
                 *  disturbed.  The poll list is compacted before next poll().
                 */
                // fprintf(stderr, "%s:%d: RC -> %d \n", __FILE__, __LINE__, rc);


                n = (rc == 0 ? 0 : poll_count);  /* if timeout, no need to check pollfd */
#ifndef __ARM_EABI__
                for (i = 0; i < n; i++) {

                        struct pollfd *pfd = poll_list + i;

                        if (pfd->fd == 0) {
                                /* deleted, perhaps by previous callback */
                                continue;
                        }

                        if (pfd->revents) {
#if 1
                                fprintf(stderr, "fd %d has revents: %d\n", (int) pfd->fd, (int) pfd->revents);
                                fflush(stderr);
#endif
                                duk_dup(ctx, idx_fd_handler);
                                duk_dup(ctx, idx_eventloop);
                                duk_push_int(ctx, pfd->fd);
                                duk_push_int(ctx, pfd->revents);
                                rc = duk_pcall_method(ctx, 2 /*nargs*/);
                                if (rc) {
#if 1
                                        fprintf(stderr, "fd callback failed for fd %d: %s\n", (int) pfd->fd, duk_to_string(ctx, -1));
                                        fflush(stderr);
#endif
                                }
                                duk_pop(ctx);

                                pfd->revents = 0;
                        }

                }
#endif /*  __ARM_EABI__ */
        }

        duk_pop_n(ctx, 3);

        // fprintf(stderr, "%s:%d: return 0\n", __FILE__, __LINE__);
        return 0;
}

static int create_timer(duk_context *ctx) {
        double delay;
        int oneshot;
        int idx;
        int64_t timer_id;
        double now;
        ev_timer *t;

        now = get_now();

        /* indexes:
         *   0 = function (callback)
         *   1 = delay
         *   2 = boolean: oneshot
         */

        delay = duk_require_number(ctx, 1);
        if (delay < MIN_DELAY) {
                delay = MIN_DELAY;
        }
        oneshot = duk_require_boolean(ctx, 2);

        if (timer_count >= MAX_TIMERS) {
                duk_error(ctx, DUK_ERR_RANGE_ERROR, "out of timer slots");
        }
        idx = timer_count++;
        timer_id = timer_next_id++;
        t = timer_list + idx;

        memset((void *) t, 0, sizeof(ev_timer));
        t->id = timer_id;
        t->target = now + delay;
        t->delay = delay;
        t->oneshot = oneshot;
        t->removed = 0;

        /* Timer is now at the last position; use swaps to "bubble" it to its
         * correct sorted position.
         */

        bubble_last_timer();

        /* Finally, register the callback to the global stash 'eventTimers' object. */

        duk_push_global_stash(ctx);
        duk_get_prop_string(ctx, -1, "eventTimers");  /* -> [ func delay oneshot stash eventTimers ] */
        duk_push_number(ctx, (double) timer_id);
        duk_dup(ctx, 0);
        duk_put_prop(ctx, -3);  /* eventTimers[timer_id] = callback */

        /* Return timer id. */

        duk_push_number(ctx, (double) timer_id);
#if 0
        fprintf(stderr, "created timer id: %d\n", (int) timer_id);
        fflush(stderr);
#endif
        return 1;
}

static int delete_timer(duk_context *ctx) {
        int i, n;
        int64_t timer_id;
        ev_timer *t;
        int found = 0;

        /* indexes:
         *   0 = timer id
         */

        timer_id = (int64_t) duk_require_number(ctx, 0);

        /*
         *  Unlike insertion, deletion needs a full scan of the timer list
         *  and an expensive remove.  If no match is found, nothing is deleted.
         *  Caller gets a boolean return code indicating match.
         *
         *  When a timer is being expired and its user callback is running,
         *  the timer has been moved to 'timer_expiring' and its deletion
         *  needs special handling: just mark it to-be-deleted and let the
         *  expiry code remove it.
         */

        t = &timer_expiring;
        if (t->id == timer_id) {
                t->removed = 1;
                duk_push_true(ctx);
#if 0
                fprintf(stderr, "deleted expiring timer id: %d\n", (int) timer_id);
                fflush(stderr);
#endif
                return 1;
        }

        n = timer_count;
        for (i = 0; i < n; i++) {
                t = timer_list + i;
                if (t->id == timer_id) {
                        found = 1;

                        /* Shift elements downwards to keep the timer list dense
                         * (no need if last element).
                         */
                        if (i < timer_count - 1) {
                                memmove((void *) t, (void *) (t + 1), (timer_count - i - 1) * sizeof(ev_timer));
                        }

                        /* Zero last element for clarity. */
                        memset((void *) (timer_list + n - 1), 0, sizeof(ev_timer));

                        /* Update timer_count. */
                        timer_count--;

                        /* The C state is now up-to-date, but we still need to delete
                         * the timer callback state from the global 'stash'.
                         */

                        duk_push_global_stash(ctx);
                        duk_get_prop_string(ctx, -1, "eventTimers");  /* -> [ timer_id stash eventTimers ] */
                        duk_push_number(ctx, (double) timer_id);
                        duk_del_prop(ctx, -2);  /* delete eventTimers[timer_id] */

#if 0
                        fprintf(stderr, "deleted timer id: %d\n", (int) timer_id);
                        fflush(stderr);
#endif
                        break;
                }
        }

#if 0
        if (!found) {
                fprintf(stderr, "trying to delete timer id %d, but not found; ignoring\n", (int) timer_id);
                fflush(stderr);
        }
#endif

        duk_push_boolean(ctx, found);
        return 1;
}

static int listen_fd(duk_context *ctx) {
        int fd = duk_require_int(ctx, 0);
        int events = duk_require_int(ctx, 1);
        int i, n;
#ifndef __ARM_EABI__
        struct pollfd *pfd;

#if 0
        fprintf(stderr, "listen_fd: fd=%d, events=%d\n", fd, events);
        fflush(stderr);
#endif
        /* events == 0 means stop listening to the FD */

        n = poll_count;
        for (i = 0; i < n; i++) {
                pfd = poll_list + i;
                if (pfd->fd == fd) {
#if 0
                        fprintf(stderr, "listen_fd: fd found at index %d\n", i);
                        fflush(stderr);
#endif
                        if (events == 0) {
                                /* mark to-be-deleted, cleaned up by next poll */
                                pfd->fd = 0;
                        } else {
                                pfd->events = events;
                        }
                        return 0;
                }
        }

        /* not found, append to list */
#if 0
        fprintf(stderr, "listen_fd: fd not found on list, add new entry\n");
        fflush(stderr);
#endif

        if (poll_count >= MAX_FDS) {
                duk_error(ctx, DUK_ERR_ERROR, "out of fd slots");
        }

        pfd = poll_list + poll_count;
        pfd->fd = fd;
        pfd->events = events;
        pfd->revents = 0;
        poll_count++;
#endif /* __ARM_EABI__*/
        return 0;
}

static int request_exit(duk_context *ctx) {
        (void) ctx;
        exit_requested = 1;
        return 0;
}

static duk_function_list_entry eventloop_funcs[] = {
        { "createTimer", create_timer, 3 },
        { "deleteTimer", delete_timer, 1 },
        { "listenFd", listen_fd, 2 },
        { "requestExit", request_exit, 0 },
        { NULL, NULL, 0 }
};

void eventloop_register(duk_context *ctx) {
        memset((void *) timer_list, 0, MAX_TIMERS * sizeof(ev_timer));
        memset((void *) &timer_expiring, 0, sizeof(ev_timer));
#ifndef __ARM_EABI__
        memset((void *) poll_list, 0, MAX_FDS * sizeof(struct pollfd));
#endif
        /* Set global 'EventLoop'. */
        duk_push_global_object(ctx);
        duk_push_object(ctx);
        duk_put_function_list(ctx, -1, eventloop_funcs);
        duk_put_prop_string(ctx, -2, "EventLoop");
        duk_pop(ctx);

        /* Initialize global stash 'eventTimers'. */
        duk_push_global_stash(ctx);
        duk_push_object(ctx);
        duk_put_prop_string(ctx, -2, "eventTimers");
        duk_pop(ctx);
}
