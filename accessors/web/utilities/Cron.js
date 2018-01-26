// Accessor that spontaneously produces outputs at specified times of day.
//
// Copyright (c) 2018 The Regents of the University of California.
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

/** Accessor that spontaneously produces outputs at specified times of day.
 *  This implementation produces a counting sequence, so each output will have
 *  a value one greater than the previous value. The default parameters will
 *  produce an output at the zeroth minute of every hour on any day of the month
 *  and any day of the week.
 *
 *  @accessor utilities/Cron
 *  @input minute The minutes past the hour or "*" to output once per minute. This has value 0 to 59 and defaults to 0.
 *  @input hour The hour (0 to 23) or "*" to output once per hour.
 *  @input date The day of the month (0 to 31) or "*"" to output on any day of the month.
 *  @input month The month (0 to 11) or "*" to output on any month.
 *  @input day The day of the week (0 to 6, where 0 is Sunday) or "*" to output on any day of the week.
 *  @output output Output for the the counting sequence, of type number.
 *  @author Edward A. Lee
 *  @version $$Id$$
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*globals clearInterval, exports, require, setInterval */
/*jshint globalstrict: true*/
"use strict";

exports.setup = function () {
    this.input('minute', {
        'value': 0
    });
    this.input('hour', {
        'value': '*'
    });
    this.input('date', {
        'value': '*'
    });
    this.input('month', {
        'value': '*'
    });
    this.input('day', {
        'value': '*'
    });
    this.output('output', {
        'type': 'number'
    });
};

// These variables will not be visible to subclasses.
var handle = null;
var count = 0;

// Calculate the number of milliseconds to the next event.
// This needs to be invoked on this accessor so that it has
// access to the parameters. This returns -1 if the requested
// time has already passed.
function timeToNextEvent() {
    var now = new Date();
    
    // Now specify the time of the next event.
    var minute = this.get('minute');
    if (minute === '*') {
        minute = now.getMinutes();
    } else {
        if (minute !== parseInt(minute,10) || minute < 0 || minute > 59) {
            throw('Minute is required to be an integer between 0 and 59. Got ' + minute + '.');
        }
        // A specific minute is given.
    }

    var hour = this.get('hour');
    if (hour === '*') {
        hour = now.getHours();
    } else {
        if (hour !== parseInt(hour,10) || hour < 0 || hour > 23) {
            throw('Hour is required to be an integer between 0 and 23. Got ' + hour + '.');
        }
        // A specific hour is given. If the hour is in the future
        // and the minute is '*', set the minute to 0.
        if (hour > now.getHours() && this.get('minute') === '*') {
            minute = 0;
        }
    }

    var date = this.get('date');
    if (date === '*') {
        date = now.getDate();
    } else {
        if (date !== parseInt(date,10) || date < 1 || date > 31) {
            throw('Date is required to be an integer between 1 and 31. Got ' + date + '.');
        }
        // A specific date is given. If the date is in the future
        // and the hour is '*', set the hour to 0.
        if (date > now.getDate() && this.get('hour') === '*') {
            hour = 0;
        }
    }
    
    var month = this.get('month');
    if (month === '*') {
        month = now.getMonth();
    } else {
        if (month !== parseInt(month,10) || month < 0 || month > 11) {
            throw('Month is required to be an integer between 0 and 11. Got ' + month + '.');
        }
        // A specific month is given. If the month is in the future
        // and the date is '*', set the date to 1.
        if (month > now.getMonth() && this.get('date') === '*') {
            date = 1;
        }
    }

    var year = now.getFullYear();

    // console.log('FIXME: ********* ' + year + ',' + month + ',' + date + ',' + hour + ',' + minute);
    var nextEvent = new Date(year, month, date, hour, minute, 0, 0);
    
    // If a specific day of the week is given, then handle that now.
    var day = this.get('day');
    if (day !== '*') {
        if (day !== parseInt(day,10) || day < 0 || day > 6) {
            throw('Day is required to be an integer between 0 and 6. Got ' + day + '.');
        }
        var nextEventDay = nextEvent.getDay();
        while (nextEventDay !== day) {
            // Add 24 hours.
            nextEvent = nextEvent + 24 * 60 * 60 * 1000;
            nextEventDay = nextEvent.getDay();
        }
    }
    console.log('Requesting event to occur on ' + nextEvent.toLocaleString() + '.');

    var millisTillEvent = nextEvent - now;
    // Since resolution is one minute, require that the time until the next
    // event be at least two seconds.  Unfortunately, Date and setTimeout
    // don't align very well so we could get a small positive number here.
    while (millisTillEvent <= 2000) {
        var adjustment = 0;
        // If any minute works, then try incrementing minutes.
        if (this.get('minute') === '*') {
            // Add one minute to the requested time.
            nextEvent.setMinutes(nextEvent.getMinutes() + 1);
        } else if (this.get('hour') === '*') {
            // Add one hour.
            nextEvent.setHours(nextEvent.getHours() + 1);
        } else if (this.get('date') === '*') {
            // Add one day.
            nextEvent.setDate(nextEvent.getDate() + 1);
        } else if (this.get('month') === '*') {
            // Add one month.
            nextEvent.setMonth(nextEvent.getMonth() + 1);
        } else {
            // No adjustment is possible.
            console.log('Time has passed. Ignoring request.');
            return -1;
        }
        millisTillEvent = nextEvent - now;
        console.log('Time has passed. Adjusting to ' + nextEvent.toLocaleString() + '.');
    }
    console.log('Scheduling next event to occur in ' + millisTillEvent + ' ms.');
    return millisTillEvent;
}

exports.initialize = function () {
    count = 0;
    var thiz = this;

    var eventFunction = function() {
        thiz.send('output', count);
        count += 1;
        // Reschedule.
        var time = timeToNextEvent.call(thiz);
        if (time >= 0) {
            handle = setTimeout(eventFunction, time);
        } else {
            handle = null;
        }
    }
    // Request the first event.
    var time = timeToNextEvent.call(thiz);
    if (time >= 0) {
        handle = setTimeout(eventFunction, time);
    } else {
        handle = null;
    }
};

exports.wrapup = function () {
    if (handle) {
        clearTimeout(handle);
        handle = null;
    }
};
