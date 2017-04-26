/*
 *  Main for evloop command line tool.
 *
 *  Runs a given script from file or stdin inside an eventloop.  The
 *  script can then access setTimeout() etc.
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#ifdef __ARM_EABI__
//#include "timer.h" // TockOS specific, see https://github.com/helena-project/tock/blob/master/userland/libtock/timer.h
int _gettimeofday(struct timeval *tp, void *tzp) {
  return 0;
  //return timer_read();
}
#endif

#ifndef HAIL_PRINT
#include "duktape.h"

// c_eventloop.h is created with xxd, see the makefile.
#include "c_eventloop.h"

// duktapeHost.h is created with xxd, see the makefile.
#include "duktapeHost.h"
#endif // HAIL_PRINT

#ifndef EDUK_MIN

#if defined(DUK_CMDLINE_PRINTALERT_SUPPORT)
#include "duk_print_alert.h"
#endif
#if defined(DUK_CMDLINE_MODULE_SUPPORT)
#include "duk_module_duktape.h"
#endif

extern void eventloop_register(duk_context *ctx);
extern duk_ret_t eventloop_run(duk_context *ctx, void *udata);  /* Duktape/C function, safe called */


// Use NoFileIo instead of FileIo because small embedded systems
// don't have file systems.
//extern int fileio_register(duk_context *ctx);

extern void ledcontrol_register(duk_context *ctx);
extern void modSearch_register(duk_context *ctx);
extern void nofileio_register(duk_context *ctx);
extern void print_pop_error(duk_context *ctx, FILE *f);

/** Run the accessor.
 * @param accessorFileName The file name of the accessor, suitable getAccessorCode()
 * @param timeout The number of milliseconds to wait after the
 * accessor is instantiated and initialized.  If the timeout is less than zero,
 * then the timeout will be forever.
 * @return 0 if successfully, non-zero if there is an error.
 */
int runAccessorHost(duk_context *ctx, const char *accessorFileName, int timeout) {
    int  rc;

    //fprintf(stderr, "%s:%d: About to load C version of c_eventloop.\n", __FILE__, __LINE__);

    // Use duk_peval_string_noresult() and avoid interning the string.  Good
    // for low memory, see
    // http://duktape.org/api.html#duk_peval_string_noresult
    // Note that c_eventloop_js must be null-terminated.
    if (duk_peval_string(ctx, c_eventloop_js) != 0) {
        //fprintf(stderr, "c_eventloop_js: %s\n", c_eventloop_js);
        fprintf(stderr, "%s:%d: Loading C version of c_eventloop failed.  Error was:\n", __FILE__, __LINE__);
        print_pop_error(ctx, stderr);
        return 1;
    } else {
        //printf("%s: Loading C version of c_eventloop worked\n", __FILE__);
        duk_pop(ctx);
    }

    // Use duk_peval_string_noresult() and avoid interning the string.  Good
    // for low memory, see
    // http://duktape.org/api.html#duk_peval_string_noresult
    // Note that ___duktapeHost_js must be null-terminated.
    if (duk_peval_string(ctx, ___duktapeHost_js) != 0) {
        fprintf(stderr, "%s:%d: Loading C version of duktapeHost failed.  Error was:\n", __FILE__, __LINE__);
        print_pop_error(ctx, stderr);
        return 2;
    } else {
        //printf("%s: Loading C version of duktapeHost worked\n", __FILE__);
        duk_pop(ctx);
    }

    // Call instantiateAndInitialize() on the accessorFileName, then timeout.

    // Build the command to be evaled.
    // FIXME: Note that for deployment, we could save memory and
    // choose one or the other at compile time.
    int length = strlen(accessorFileName);
    if (timeout >= 0) {
        // Increase 136 if the first snprintf string changes
        length += 136 + 8 /* Approximate Length of timeout value as a string */;
    } else {
        // Increase 79 if the second snprintf string changes.
        length += 79;
    }
    char buf[length];

    if (timeout >= 0) {
        // Timeout.

        // While exiting, invoke wrapup() on any accessors that were
        // created.  The TrainableTest accessor expects wrapup to be
        // called so that it can report an error if fire() was never
        // called.

        // requestEventLoopExit() is defined in ecma_eventloop.js
        snprintf(buf, length,
                "var a=['%s'],t=this;t.b=instantiateAndInitialize(a),setTimeout(function(){for(var i in t.b)t.b[i].wrapup();requestEventLoopExit()},%d);",
                accessorFileName, timeout);
    } else {
        // Prevent the script from exiting by repeating the empty function
        // every ~25 days.
        snprintf(buf, length,
                "var a=['%s'];instantiateAndInitialize(a);setInterval(function(){},2147483647);",
                accessorFileName);
    }

    // Eval the command, avoid interning the string.
    // Note that buf must be null-terminated.
    if (duk_peval_string(ctx, buf) != 0) {
        fprintf(stderr, "%s:%d: Failed to invoke accessor %s.  Command was:\n%s\nError was:\n", __FILE__, __LINE__, accessorFileName, buf);
        print_pop_error(ctx, stderr);
        return 3;
    } else {
        duk_pop(ctx);
    }

    // Compile solution
    //duk_compile(ctx, 0);

    /* duk_push_global_object(ctx);  /\* 'this' binding *\/ */
    /* duk_insert(ctx, -2);  /\* [ ... global func ] *\/ */
    /* duk_put_prop_string(ctx, -2, "_USERCODE"); */
    /* duk_pop(ctx); */

    /* duk_eval_string(ctx, "setTimeout(function() { _USERCODE(); }, 0);"); */
    /* duk_pop(ctx); */


    rc = duk_safe_call(ctx, eventloop_run, NULL, 0 /*nargs*/, 1 /*nrets*/);
    if (rc != 0) {
        fprintf(stderr, "%s:%d: %s: Failed invoke eventloop_run()\n", __FILE__, __LINE__, accessorFileName);
        return 4;
    }
    //fprintf(stderr, "runAccessorHost() done.\n");
    return 0;
}

#endif // EDUK_MIN

#ifdef HAIL_PRINT
#ifdef __ARM_EABI__
#include <console.h>
#endif
char hello[] = "Hello World!\r\n";
void nop() {}
#endif

/** Run an accessor.
 *
 *  Usage:
 *    eduk [--timeout time] accessorFileName\n");
 *
 *  Sample usage:
 *  ./eduk2 --timeout 4000 test/auto/RampJSDisplay.js
 *
 *  @param argc The number of arguments.
 *  @param argv The arguments.
 */
//main(void)
int main(int argc, char *argv[]) {
#ifdef HAIL_PRINT

#ifdef __ARM_EABI__
  putnstr_async(hello, sizeof(hello), nop, NULL);
#else
  printf("%s", hello);
#endif // __ARM_EABI
  return 0;

#else //HAIL_PRINT
    // FIXME: a truly embedded version will not parse command line
    // arguments.  The accessor code will be compiled in.

    const char *accessorFileName;
    duk_context *ctx = NULL;
    int timeout = -1;
    int foundFile = 0;
    int returnValue = 0;

    // Create duktape environment
    ctx = duk_create_heap_default();

#ifdef EDUK_MIN
       int length = 100;
    char buf[length];

    snprintf(buf, length, "print('hello from duktape');\n");

    if (duk_peval_string(ctx, buf) != 0) {
        fprintf(stderr, "%s:%d: Failed to invoke print.  Command was:\n%s\nError was:\n", __FILE__, __LINE__, buf);
        //print_pop_error(ctx, stderr);
        return 3;
    } else {
        duk_pop(ctx);
    }
#else // EDUK_MIN

    // Register Modules

    /* Register print() and alert() (removed in Duktape 2.x). */
#if defined(DUK_CMDLINE_PRINTALERT_SUPPORT)
    duk_print_alert_init(ctx, 0 /*flags*/);
#endif

    eventloop_register(ctx);

/* Register require() (removed in Duktape 2.x). */
#if defined(DUK_CMDLINE_MODULE_SUPPORT)
    duk_module_duktape_init(ctx);
#endif
    
    // FIXME: fileio_register() should go away eventually.
    //fileio_register(ctx);

#ifdef _TOCK_OS_
    ledControl_register(ctx);
#endif

    modSearch_register(ctx);
    nofileio_register(ctx);


    // Set accessorFileName to the name of the accessor or process the
    // command line arguments.
#ifdef EDUK_RUN_RAMPJSDISPLAY
    foundFile = 1;
    accessorFileName = strdup("test/auto/RampJSDisplay.js");
#else
    int i;
    for (i = 1; i < argc; i++) {
        char *arg = argv[i];
        if (!arg) {
            goto usage;
        }
        if (strcmp(arg, "--timeout") == 0) {
            if (i == argc - 1) {
                goto usage;
            }
            i++;
            timeout = atoi(argv[i]);
        } else {
            foundFile = 1;
            accessorFileName = arg;
        }
    }
#endif // EDUK_RUN_RAMPJSDISPLAY

    if (foundFile == 1) {
        fprintf(stderr, "eduk: About to run %s\n", accessorFileName);
        returnValue = runAccessorHost(ctx, accessorFileName, timeout);
    } else {
        fprintf(stderr, "eduk: No file passed as a command line argument?");
        returnValue = 1;
    }
#endif // EDUK_MIN
    //duk_destroy_heap(ctx);
    return returnValue;

#ifndef EDUK_RUN_RAMPJSDISPLAY
 usage: 
    duk_destroy_heap(ctx);
    fprintf(stderr, "Usage: eduk [--timeout time] accessorFileName\n");
    return 1;
#endif
#endif // HAIL_PRINT
}
