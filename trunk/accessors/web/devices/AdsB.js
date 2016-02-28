// Copyright (c) 2015-2016 The Regents of the University of California.
// All rights reserved.

// Permission is hereby granted, without written agreement and without
// license or royalty fees, to use, copy, modify, and distribute this
// software and its documentation for any purpose, provided that the above
// copyright notice and the following two paragraphs appear in all copies
// of this software.

// IN NO EVENT SHALL THE UNIVERSITY OF CALIFORNIA BE LIABLE TO ANY PARTY
// FOR DIRECT, INDIRECT, SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES
// ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
// THE UNIVERSITY OF CALIFORNIA HAS BEEN ADVISED OF THE POSSIBILITY OF
// SUCH DAMAGE.

// THE UNIVERSITY OF CALIFORNIA SPECIFICALLY DISCLAIMS ANY WARRANTIES,
// INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE. THE SOFTWARE
// PROVIDED HEREUNDER IS ON AN "AS IS" BASIS, AND THE UNIVERSITY OF
// CALIFORNIA HAS NO OBLIGATION TO PROVIDE MAINTENANCE, SUPPORT, UPDATES,
// ENHANCEMENTS, OR MODIFICATIONS.

/** This accessor uses the dump1090 driver to access a Software-Defined Radio
 * such as the NooElec R820T (http://www.nooelec.com/store/sdr/sdr-receivers/nesdr-mini-rtl2832-r820t.html)
 * in order to receive and parse ADS-B messages. ADS-B  is a cooperative surveillance technology in which an 
 * aircraft periodically broadcasts its state such as location, altitude, heading, etc.
 * In order to run this accessor you need to compile the dump1090 driver from https://github.com/MalcolmRobb/dump1090, 
 * plug your SDR USB dongle, and run ./dump1090 --net --interactive
 *  @accessor devices/AdsB
 *  @author Eloi T. Pereira (eloi@berkeley.edu)
 *  @version $$Id: AdsB.js 1 2016-02-22 02:15:27Z eloi $$
 *  @input {trigger}  
 *  @parameter {dump1090Server} address of the web server created by dump1090
 *  @parameter {port} port of the web server created by dump1090
 *  @parameter {timeToLiveIfNotUpdated} time in millisecond after which an aircraft is removed from the list in case an update is not received from the SDR device
 *  @output an array of objects containing the aircraft information 
 */

// Stop extra messages from jslint and jshint.  Note that there should
// be no space between the / and the * and global. See
// https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSHint */
/*globals addInputHandler, get, error, exports, extend, get, input, output, parameter, require, send */
/*jshint globalstrict: true*/
'use strict';

var http = require('httpClient');

/** Set up the accessor by defining the inputs and outputs.
 */
exports.setup = function() {
    this.extend('net/REST');
    this.input('trigger', {
        'value':true,
        'type':'boolean'
    });
    
    this.parameter('dump1090Server', { // address of the web server created by dump1090
	type: 'string',
	value: 'localhost'
    });
    this.parameter('port', { // port of the web server created by dump1090
	type: 'int',
	value: 8080
    });

    this.parameter('timeToLiveIfNotUpdated', { // time in millisecond after which an aircraft is removed from the list in case an update is not received from the SDR device
	type: 'int',
	value: 20000
    });

    var serverUrl = 'http://' + this.getParameter('dump1090Server').toString() + ':' + this.getParameter('port').toString();
    this.input('options', {'visibility':'expert', 'value':JSON.stringify(serverUrl)});
    this.input('command', {'visibility':'expert', 'value':'/dump1090/data.json'});
    this.input('arguments', {'visibility':'expert', 'value':'{"env":"http://datatables.org/alltables.env", "format":"json"}'});
    this.input('body', {'visibility':'expert'});
    this.output('headers', {'visibility':'expert'});
    this.output('status', {'visibility':'expert'});
    this.output('response', {'visibility':'expert'});
    this.output('aircrafts');
    this.parameter('outputCompleteResponsesOnly', {'visibility':'expert'});
};

var AircraftState = function(lat, lon, alt, speed, heading, squawk, seen) {
    this.lat = lat;
    this.lon = lon;
    this.alt = alt;
    this.speed = speed;
    this.heading = heading;
    this.squawk = squawk;
    this.seen = seen;
}

var map = new Object();

/** Filter the response, extracting the aircrat information. The full response is produced
 *  on the 'response' output.
 */
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
	    
	    var currentTime = (new Date()).getTime();
	    for (var i = 0; i < parsed.length; i++){
		var a = parsed[i];
		if (a.flight != '' && a.validposition == 1 && a.validtrack == 1) {		    		    
			var s = new AircraftState(a.lat,a.lon,a.altitude,a.speed,a.track,a.squawk,(currentTime - a.seen*1000));
			var key = a.flight.replace(/ /g, '');
			map[key] = s;
		}
	    }
	    for(var k in map){
		var elapsed = currentTime - map[k].seen;
		if(elapsed > this.getParameter('timeToLiveIfNotUpdated')){
		    console.log(k + ", it has been more than " + this.getParameter('timeToLiveIfNotUpdated') + " ms since I've last seen you. Im going to delete you.");
		    delete map[k];
		}
	    }
            this.send('aircrafts', map);
        } catch (err) {
            error('AdsB: Unable to parse response: ' + err.message);
            this.send('aircrafts', null);
        }
    } else {
        this.send('aircrafts', null);
    }
    return response;
};
