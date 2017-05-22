//
// Copyright (c) 2017 The Regents of the University of California.
// All rights reserved.
//
// Permission is hereby granted, without written agreement and without
// license or royalty fees, to use, copy, modify, and distribute this
// software and its documentation for any purpose, provided that the above
// copyright notice and the following two paragraphs appear in all copies
// of this software.
//
// IN NO EVENT SHALL THE UNIVERSITY OF CALIFORNIA BE LIABLE TO ANY PARTY
// FOR DIRECT, INDIRECT, SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES
// ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
// THE UNIVERSITY OF CALIFORNIA HAS BEEN ADVISED OF THE POSSIBILITY OF
// SUCH DAMAGE.
//
// THE UNIVERSITY OF CALIFORNIA SPECIFICALLY DISCLAIMS ANY WARRANTIES,
// INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE. THE SOFTWARE
// PROVIDED HEREUNDER IS ON AN "AS IS" BASIS, AND THE UNIVERSITY OF
// CALIFORNIA HAS NO OBLIGATION TO PROVIDE MAINTENANCE, SUPPORT, UPDATES,
// ENHANCEMENTS, OR MODIFICATIONS.
//
/**
 * Timed events are delayed callbacks, scheduled using setTimeout or setInterval.
 * This module offers variants of setTimeout, clearTimeout, setInterval, 
 * clearInterval, and reset that enforce a synchronous semantics for timed events. 
 * Synchronization between timed events entails the following two properties: 
 * (1) A timed event that is released from within another timed event that occurred
 * at T=tau, will occur precisely at T=tau+timeout.
 * (2) Any two events t1, t2, with intervals i1, i2, that are released from within 
 * the same function will occur precisely at T=tau+i2 and T=tau+i2, respectively. 
 * The value of tau will approximate the wallclock time of the first-released event.
 * At common multiples of i1 and i2, t1 and t2 will execute simultenously i.e., 
 * in order of their release, and with no logical time elapsing until both have 
 * executed.
 * In the rare case the same function happens to execute multiple times consequtively,
 * without some timed event occurring in between, all releases in that series will
 * be scheduled with respect to the same tau. Note that this situation can only 
 * arise trough rapidly succeeding asynchronous callbacks. When precise timing
 * is desired, this scenario must be avoided.
 * 
 * WARNING: this implementation will only work correctly if the JavaScript execution
 * environment provides a working implementation of Function.caller. Also see:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/caller
 * Function.caller is supported by: Chrome, Firefox Gecko 1.0, IE 8, Opera, Safari,
 * which includes the mobile version of these respective browsers. Function.caller
 * will not work in strict mode.
 * 
 * @module @accessors-hosts/common/sync-atom
 * @author Marten Lohstroh
 * @version $Id$
 */

/**
 * Construct a new calendar queue.
 */
function CalendarQ() {
    this.q = [];
}

/**
 * Pop an element from the queue. FIXME: change signature to function(event, time)
 */
CalendarQ.prototype.enqueue = function(e) {
    for (var i = 0; i < this.q.length && e.time >= this.q[i].time; i++);
    this.q.splice(i, 0, e);
}

/**
 * Push an element onto the queue.
 */
CalendarQ.prototype.dequeue = function() {
    return this.q.shift();
}

/**
 * See what is at the start of the queue.
 */
CalendarQ.prototype.peek = function() {
    return this.q[0];
}

/**
 * Report the size of the queue.
 */
CalendarQ.prototype.size = function() {
    return this.q.length;
}

// Events.
var callbacks = {};

// Time schedule.
var calendar = new CalendarQ();

// The current time.
var time = Date.now();

// Start of simulation time.
var startTime = time;

// The next wake up time.
var alarm = Infinity;

// Handle for the alarm.
var handle;

// Counter for callback IDs.
var counter = 0;

// The last caller that scheduled a timed event.
var lastCaller = null;

// Synchronization point for releases from the same caller.
var release; 

/**
 * Construct a new Callback object.
 * @param fun
 * @param offset
 * @param period
 */
function Callback(fun, offset, period) {
    this.fun = fun;
    this.offset = offset;
    this.period = period;
}

/**
 * Construct a new Event object.
 * @param id
 * @param time
 */
function Event(id, time) {
    this.id = id;
    this.time = time;
}

/**
 * Wake up and process enabled events.
 */
var tick = function() {
    console.log("Tick at T=" + time);

    // Process enabled events.
    while (calendar.peek() != undefined && Date.now() >= calendar.peek().time) {
        var e = calendar.dequeue();
        console.log("Event: " + JSON.stringify(e));
        // Update the global time.
        time = e.time;
        if (e.id in callbacks) {
            var cb = callbacks[e.id];
            console.log("Callback: " + JSON.stringify(cb));
            console.log(e.time - startTime);
            cb.fun.call();
            if (cb.period >= 0) {
                calendar.enqueue(e.id, e.time + events[e.id].period);
            }
        }
    }
    
    // Set a timer to wake up for the next tick.
    if (calendar.peek() != undefined) {
        handle = setTimeout(tick, Math.max(calendar.peek().time - Date.now(), 0)); 
    }
    
    // Clear the last caller.
    lastCaller = null;   
};

/** 
 * Unschedule a periodic callback.
 * @param cbId Handle returned by setInterval().
 */
function clearIntervalSync(cbId){
    if (callbacks[cbId].period >= 0) {
        delete callbacks[cbId];
    }
}

/**
 * Unschedule a delayed callback.
 * @param cbId Handle returned by setTimeout().
 */
function clearTimeoutSync(cbId){
    if (callbacks[cbId].period < 0) {
        delete callbacks[cbId];
    }
}

/**
 * Schedule a new timed event. This entails adding to the callbacks dictonary,
 * as well as adding it to the calendar queue, and if needed, (re)setting a 
 * timer to wake up in time to process enabled events.
 * @param callback The callback to be scheduled.
 * @param timeout The interval with respect to the current time.
 * @param caller The function from which this event was released.
 * @param repeat Whether this timed event is periodic or not.
 * @return the id of the event.
 */
function schedule(callback, timeout, caller, repeat) {
    var id = counter++;
    var offset;

    // Use logical time if the caller was a sync function.
    // Use wallclock time otherwise.
    if (caller.includes("setInterval") || caller.includes("setTimeout")) {
        console.log("Synchronous release at T=" + time);
        offset = time;
    } else {
        console.log("Asynchronous release at T=" + time);
        // The same caller released a timed event, and no other timed events have
        // occurred since (lastCaller would have been cleared). 
        // These releases ought to have the _same_ offset.
        if (caller != lastCaller) {
            release = Date.now();
            lastCaller = caller;
        }
        offset = release;
    }

    // FIXME: make this function idempotent, don't schedule duplicate events.

    if (repeat) {
        callbacks[id] = new Callback(callback, offset, timeout);
    } else {
        callbacks[id] = new Callback(callback, offset, -1);
    }

    var newTime = offset + timeout;
    calendar.enqueue(new Event(id, newTime));
    
    // Reset the alarm, if necessary.
    if (newTime < alarm) {
        clearTimeout(handle);
        alarm = newTime;
        handle = setTimeout(tick, Math.max(newTime - Date.now(), 0))
    }
    return id;
}

/**
 * Schedule a periodic timed event.
 * @param callback The function to be executed.
 * @param timeout The interval with respect to the (re)current time.
 * @return the unique id of the setInterval call.
 */
function setIntervalSync(callback, timeout) {
    if (timeout >= 0) {
        return schedule(callback, timeout, setIntervalSync.caller.toString(), true);
    }
}

/**
 * Schedule a timed event.  
 * @param callback The function to be executed.
 * @param timeout The interval with respect to the (re)current time.
 * @return the unique id of setTimeout call
 */
function setTimeoutSync(callback, timeout) {
    if (timeout >= 0) {
        return schedule(callback, timeout, setTimeoutSync.caller.toString(), false);
    }
}

/** 
 * Clear all (period) timed events. 
 */
function reset() {
    // Clear timer for the next tick.
    clearTimeout(handle);
    
    // Empty calendar queue, reset all kept state.
    calendar = new CalendarQ();

    callbacks = {};
    alarm = Infinity;
    time = Date.now();
    
}

///////////////////////////////////////////////////////////////////
//// Exports

exports.setTimeoutSync = setTimeoutSync;
exports.clearTimeoutSync = clearTimeoutSync;
exports.setIntervalSync = setIntervalSync;
exports.clearIntervalSync = clearIntervalSync;
exports.reset = reset;

// Some test code...

// function g() {
//     console.log("3@4000.")
//     //console.log("3@3200.")
// }

// function f() {
//     console.log("1@1200.")
//     //setTimeoutSync(g, 2000);
// }

// function h() {
//     console.log("3@2000.")
//     setTimeoutSync(g, 2000);
// }

// setTimeoutSync(f, 1200);
// setTimeoutSync(h, 2000);
