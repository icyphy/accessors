// GeoLocation demo app for Accessors Cordova host
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

/** This swarmlet, running on Cordova Host, illustrates the use of geolocation
 *  accessor. The swarmlet loads a 'Clock' accessor, a 'GeoLocation' accessors
 *  and a 'LocationDisplay' accessor, and connects them. 
 *  If the location is activated on your phone, the the application will
 *  periodically display the coordinates.
 *  
 *  See https://www.icyphy.org/accessors/wiki/Main/CordovaHost
 *  
 *  @author Chadlia Jerad
 *  @version $$Id: swarmlet.js 1502 2017-04-17 21:34:03Z cxh $$
 */

exports.setup = function() {
    
    var clock = this.instantiate('clock', 'utilities/Clock');
    clock.setParameter('interval', 2500);

    var geoLocation = this.instantiate('geoLocation', 'services/GeoLocation');
    geoLocation.setParameter('enableHighAccuracy', true);

    var locationDisplay = this.instantiate('locationDisplay', 'LocationDisplay');

    this.connect(clock, 'output', geoLocation, 'trigger');
    this.connect(geoLocation, 'location', locationDisplay, 'location');
};

exports.initialize = function () {
    console.log('Swarmlet initialized');
};
