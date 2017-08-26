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
 *  @accessor services/GeoLocation
 *
 *  @param enableHighAccuracy Boolean value that says if the user
 *   wants to enable or not high accuracy (needs the best possible results).
 *   If set to false, the position will be retieved using network-based methods.
 *   If the device hosting the swarmelt is endowed with GPS (that is enabled), 
 *   then satellite positioning is used, for a more accurate results.
 *  @param maximumAge Number value to feed as options to get location. It says
 *   is cached position whose age is no greater than the specified time is 
 *   acceptedin (Number, unit: milliseconds).
 *  @input trigger The trigger to get the location
 *  @output location The location object. It error attribute is a boolean,
 *   if set to true, then an error accured. If set to false, then the
 *   location object may have the aditionnal following attributes:
 *   ** latitude: Latitude (float, unit: degree). This attribute is 
 *      mandatory.
 *   ** longitude: Longitude (float, unit: degree). This attribute is 
 *      mandatory.
 *   ** accuracy: String that describes, in a fuzzy way the accuracy level.
 *      That is, if the swarmlet is running in a device that is equiped 
 *      with GPS, then the accuracy will be set to 'high'. If it uses an ip
 *      address based lookup, the it will be set to 'low'. These values are
 *      set at the module level.
 *   ** timestamp: Creation timestamp of the coordiantes (Number, unit: 
 *      milliseconds).
 *
 *  Example usage:
 *
 *  var geoLoc = instantiate('geoLoc','services/GeoLocation');
 *  geoLoc.initialize();
 *  geoLoc.provideInput('trigger', true);
 *  geoLoc.react();
 *  latestOutput('location');
 *
 *  @author Chadlia Jerad
 *  @version $$Id: GeoLocation.js 1137 2017-07-19 22:13:55Z chadlia.jerad $$
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*globals console, error, exports, require */
/*jshint globalstrict: true*/
"use strict";

var geoLocation = require('@accessors-modules/geolocation');

exports.setup = function () {
    // Parameters
    this.parameter('enableHighAccuracy', {
        'type': 'boolean',
        'value': true
    });
    this.parameter('maximumAge', {
        'type': 'number',
        'value': 3600000
    });

    // Inputs
    this.input('trigger');
    //Outputs
    this.output('location', {
        'type': 'JSON'
    });
};

exports.initialize = function () {
    var thiz = this;

    thiz.addInputHandler('trigger', function() {
        // Set the options for calling getPosition
        var options = {
            enableHighAccuracy: this.getParameter('enableHighAccuracy'),
            maximumAge: this.getParameter('maximumAge')
        };

        geoLocation.getPosition(
            function(position) {
                // onSuccess function
                thiz.send('location', position);
            }, 
            function(e) {
                // onError function
                thiz.send('error', e);
            }, 
            options);
    });
    // console.log('GeoLocation accessor initialized');
};

