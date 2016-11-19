// Copyright (c) 2016 The Regents of the University of California.
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
 * One can also feed the accessor with a reference location (e.g. from an autopilot) and a threshold parameter.
 * If a reference location is provided, the accessor retrieves all the aircrafts within the threshold distance in the output "traffic"
 *  @accessor devices/AdsB
 *  @author Eloi T. Pereira (eloi@berkeley.edu)
 *  @version $$Id: AdsB.js 1 2016-02-22 02:15:27Z eloi $$
 *  @input {trigger}  
 *  @input {double} latRef Latitude of the reference location
 *  @input {double} lonRef Longitude of the reference location
 *  @input {double} altRef Altitude of the reference location
 *  @parameter {string} dump1090Server The address of the web server created by dump1090
 *  @parameter {int} port The port of the web server created by dump1090
 *  @parameter {int} timeToLiveIfNotUpdated The time interval in millisecond after which an aircraft is removed from the list in case an update is not received from the SDR device
 *  @parameter {double} threshold Threshold distance in kilometers
 *  @output {object} aircrafts An object mapping aircraft flight IDs to aircraft state
 *  @output {object} traffic Aircrafts within a threshold distance of the reference location
 */

// Stop extra messages from jslint and jshint.  Note that there should
// be no space between the / and the * and global. See
// https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSHint */
/*globals addInputHandler, console, get, error, exports, extend, get, input, output, parameter, require, send */
/*jshint globalstrict: true*/
'use strict';

var http = require('httpClient');

var map = {};

/** Set up the accessor by defining the inputs and outputs.
 */
exports.setup = function() {
    this.extend('net/REST');

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
    this.parameter('threshold',{
        type: 'double',
        value: null
    });
    this.input('options', {'visibility':'expert','value': '"http://localhost:8080"'});
    this.input('command', {'visibility':'expert','value':'/dump1090/data.json'});
    this.input('arguments', {'visibility':'expert'});
    this.input('body', {'visibility':'expert'});
    this.input('latRef', {
        type: 'double',
        value: null
    });
    this.input('lonRef', {
        type: 'double',
        value: null
    });
    this.input('altRef', {
        type: 'double',
        value: null
    });
    this.output('headers', {'visibility':'expert'});
    this.output('status', {'visibility':'expert'});
    this.output('response', {'visibility':'expert'});
    this.output('aircrafts');
    this.output('traffic');
    this.parameter('outputCompleteResponsesOnly', {'visibility':'expert'});
};

exports.initialize = function(){
    this.exports.ssuper.initialize.call(this);
    var serverUrl = 'http://' + this.getParameter('dump1090Server').toString() + ':' + this.getParameter('port').toString();
    this.send('options',{"url": serverUrl});
    var self = this;
    this.addInputHandler('latRef',function () {
        var latRef = Number(self.get('latRef'));
        var lonRef = Number(self.get('lonRef'));
        var altRef = Number(self.get('altRef'));
        var threshold = self.getParameter('threshold');
        //console.log("Reference: lat = " + latRef + " lon = " + lonRef + " alt " + altRef + " thrsld = " + threshold);
        if (latRef && lonRef && altRef && threshold){
            var filteredMap = {};
            for (var a in map){
                var lat = Number(map[a].lat);
                var lon = Number(map[a].lon);
                var alt = Number(map[a].alt);
                //console.log("Aircraft " + a + " is at lat = " + lat + " lon = " + lon + " alt " + alt);
                var distance = llaEuclideanDistance(latRef,lonRef,altRef,lat,lon,alt);
                console.log("Aircraft " + a + " is within " + distance + " meters.");
                if (distance < threshold*1000){
                    filteredMap[a] = map[a];
                    console.log("Aircraft " + a + " is within thresold distance.");
                }  
            }
            self.send('traffic', filteredMap);
        }
    });
};

var AircraftState = function(lat, lon, alt, speed, heading, squawk, seen) {
    this.lat = lat;
    this.lon = lon;
    this.alt = alt;
    this.speed = speed;
    this.heading = heading;
    this.squawk = squawk;
    this.seen = seen;
};



function llaEuclideanDistance(lat1,lon1,alt1,lat2,lon2,alt2){
    var a = 6378137.0; //WGS-84 semi-major axis (meters)
    var e2 = 0.0066943799901377997;  //WGS-84 first eccentricity squared
    var lat1Rad = lat1*Math.PI/180;
    var lon1Rad = lon1*Math.PI/180;
    var n1 = a/Math.sqrt(1 - e2*Math.sin(lat1Rad)*Math.sin(lat1Rad));
    var x1 = (n1 + alt1)*Math.cos(lat1Rad)*Math.cos(lon1Rad);
    var y1 = (n1 + alt1)*Math.cos(lat1Rad)*Math.sin(lon1Rad);
    var z1 = (n1*(1 - e2) + alt1)*Math.sin(lat1Rad);
    var lat2Rad = lat2*Math.PI/180;
    var lon2Rad = lon2*Math.PI/180;
    var n2 = a/Math.sqrt(1 - e2*Math.sin(lat2Rad)*Math.sin(lat2Rad));
    var x2 = (n2 + alt2)*Math.cos(lat2Rad)*Math.cos(lon2Rad);
    var y2 = (n2 + alt2)*Math.cos(lat2Rad)*Math.sin(lon2Rad);
    var z2 = (n2*(1 - e2) + alt2)*Math.sin(lat2Rad);
    var dist = Math.sqrt( Math.pow(x1-x2,2) + Math.pow(y1-y2,2) + Math.pow(z1-z2,2) );
    return dist;
}

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
                if (a.flight !== '' && a.validposition == 1 && a.validtrack == 1) {                                        
                    var s = new AircraftState(a.lat,a.lon,a.altitude,a.speed,a.track,a.squawk,(currentTime - a.seen*1000));
                    var key = a.flight.replace(/ /g, '');
                    map[key] = s;
                }
            }
            for(var k in map){
                var elapsed = currentTime - map[k].seen;
                if(elapsed > this.getParameter('timeToLiveIfNotUpdated')){
                    //console.log(k + ", it has been more than " + this.getParameter('timeToLiveIfNotUpdated') + " ms since I've last seen you. Im going to delete you.");
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
