// GeoLocation Accessor.
//
// Copyright (c) 2016-2017 The Regents of the University of California.
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

/** GeoLocation accessor that outputs the coordinates.
 *  Location retieval parameters needs to be set.
 *   
 *  @accessor GeoLocation
 *  @param enableHighAccuracy Boolean value that says if the 
 *   user wants to enable or not high accuracy.
 *  @param maximumAge Number value to feed as options to get location
 *  @input trigger The trigger to get the location
 *  @output location The location object
 *
 *  Example usage:
 *
 *  var geoLoc = instantiate('geoLoc','GeoLocation');
 *  geoLoc.initialize();
 *  geoLoc.provideInput('trigger', true);
 *  geoLoc.react();
 *  latestOutput('location');
 *
 *  @author Chadlia Jerad
 *  @version $$Id: GeoLocation.js 1137 2016-12-06 22:13:55Z cxh $$
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*globals console, error, exports, require */
/*jshint globalstrict: true*/
"use strict";

var geoLocation = require('geolocation/geolocation');

exports.setup = function () {
    this.parameter('enableHighAccuracy', {
        'type': 'boolean',
        'value': true
    });
    this.parameter('maximumAge', {
        'type': 'number',
        'value': 3600000
    });

    this.input('trigger');
    
    this.output('location', {
        'type': 'JSON'
    });
};

exports.initialize = function () {
    var thiz = this;

    thiz.addInputHandler('trigger', function() {
        var options = {
            enableHighAccuracy: this.getParameter('enableHighAccuracy'),
            maximumAge: this.getParameter('maximumAge')
        };

        geoLocation.getPosition(
            function(position) {
                // onSuccess function
                var pos = {};
                pos.latitude = position.coords.latitude;
                pos.longitude = position.coords.longitude;         
                pos.altitude = position.coords.altitude;          
                pos.accuracy = position.coords.accuracy;            
                pos.altitudeAccuracy = position.coords.altitudeAccuracy;  
                pos.heading = position.coords.heading;           
                pos.speed = position.coords.speed;
                pos.timestamp = position.timestamp;
                pos.error = false;
                thiz.send('location', pos);
            }, 
            function(e) {
                // onError function
                var pos = {};
                pos.error = e;
                thiz.send('location', pos);
            }, 
            options);
    });
    // console.log('GeoLocation accessor initialized');
};

