// Copyright (c) 2016-2016 The Regents of the University of California.
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
 *  This accessor controls acid, base, and nutrient dosing for your garden.
 *  When a duration in miliseconds is sent to the accessor, it doses
 *  the corresponding type of fluid. As of this time, simultaneous dosing commands will be send independtly
 *  in some arbitrary order.
 *
 *
 *  This accessor reacts to a *symbol* input by issuing a query to a web server
 *  for the most recent trade prices of the common stock whose symbol is given
 *  by the input. When the server replies, this accessor produces the most
 *  recent trade price on the *price* output.
 *
 *  This accessor does not block waiting for the response, but if any additional
 *  *symbol* input is received before a pending request has received a response
 *  or timed out, then the new request will be queued and sent out only after
 *  the pending request has completed. This strategy ensures that outputs are
 *  produced in the same order as the input requests.
 *
 *  This accessor requires the optional 'httpClient' module, which may or may
 *  not be provided by an accessor host. Most hosts will provide this module.
 *
 *  @accessor devices/DrDose
 *  @author Matt Weber (matt.weber@eecs.berkeley.edu)
 *  @version $$Id$$
 *  @input {number} Acid Duration The desired dosing time in miliseconds.
 *  @input {number} Base Duration The desired dosing time in miliseconds.
 *  @input {number} Nutrient Duration The desired dosing time in miliseconds.
 *  @output {string} Response Confirmation from Dr. Dose that it has received the request.
 */

// Stop extra messages from jslint and jshint.  Note that there should
// be no space between the / and the * and global. See
// https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSHint */
/*globals addInputHandler, get, error, exports, extend, get, input, output, parameter, require, send */
/*jshint globalstrict: true*/
'use strict';

var http = require('@accessors-modules/http-client');

/** Set up the accessor by defining the inputs and outputs.
 */
exports.setup = function () {
    this.extend('net/REST');
    /*
     this.input('AcidDuration', {
             'type':'number'
     });
    */

    this.input('Acid Duration', {
        'value': 0,
        'type': 'number'
    });
    this.input('Base Duration', {
        'value': 0,
        'type': 'number'
    });
    this.input('Nutrient Duration', {
        'value': 0,
        'type': 'number'
    });

    // Change default values of the base class inputs.
    // Also, hide base class inputs, except trigger.
    this.input('options', {
        'visibility': 'expert',
        'value': '"http://192.168.1.247:8080"'
    });
    this.input('command', {
        'visibility': 'expert'
    });
    this.input('arguments', {
        'visibility': 'expert'
    });
    //this.input('arguments', {'visibility':'expert', 'value':'{"env":"http://datatables.org/alltables.env", "format":"json"}'});
    this.input('body', {
        'visibility': 'expert'
    });
    this.input('trigger', {
        'visibility': 'expert'
    });
    this.output('headers', {
        'visibility': 'expert'
    });
    this.output('status', {
        'visibility': 'expert'
    });
    this.parameter('outputCompleteResponsesOnly', {
        'visibility': 'expert'
    });
};

/** Initialize the accessor by attaching an input handler to the *symbol* input. */
exports.initialize = function () {
    // Be sure to call the superclass so that the trigger input handler gets registered.
    this.exports.ssuper.initialize.call(this);

    // Capture 'this' for use in callback.
    var self = this;

    // Send duration to Dr Dose when input arrives.
    this.addInputHandler('Acid Duration', function () {
        // Read the current value of the 'Acid Duration' input.
        var command = "acid";
        var duration = self.get('Acid Duration');
        var args = {
            'duration': duration
        };
        //console.log(JSON.stringify(args));
        self.send('command', command);
        self.send('arguments', args);
        self.send('trigger', true);
    });

    // Send duration to Dr Dose when input arrives.
    this.addInputHandler('Base Duration', function () {
        // Read the current value of the 'Base Duration' input.
        var command = "base";
        var duration = self.get('Base Duration');
        //args = duration;
        var args = {
            'duration': duration
        };
        self.send('command', command);
        self.send('arguments', args);
        self.send('trigger', true);
    });

    // Send duration to Dr Dose when input arrives.
    this.addInputHandler('Nutrient Duration', function () {
        // Read the current value of the 'Nutrient Duration' input.
        var command = "nutrient";
        var duration = self.get('Nutrient Duration');
        //args = duration;
        var args = {
            'duration': duration
        };
        self.send('command', command);
        self.send('arguments', args);
        self.send('trigger', true);
    });

    //self.send('trigger', true);
};


/** Filter the response, extracting the stock tick information and
 *  outputting it on the price output. The full response is produced
 *  on the 'response' output.
 */
/*
exports.filterResponse = function(response) {


    if (response) {
        try {
            // Check if response is JSON or stringified JSON.  If stringified, parse.
            var parsed;
            if (typeof response == "object") {
                parsed = response;
            } else {
                parsed = JSON.parse(response);
            }

            // Extract the last trade price from the JSON record.
            var price = parseFloat(parsed.query.results.quote.LastTradePriceOnly);
            // Send the price to the 'price' output.
            this.send('price', price);
        } catch (err) {
            error('StockTick: Unable to parse response: ' + err.message);
            this.send('price', null);
        }
    } else {
        this.send('price', null);
    }
    return response;
};
*/
