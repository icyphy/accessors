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

/** This accessor takes a WG-84 location (latitude, longitude, and altitude) 
 * and converts it to ECEF (Earth-Centered, Earth-Fixed) cartesian coordinates.
 *  Based on http://danceswithcode.net/engineeringnotes/geodetic_to_ecef/geodetic_to_ecef.html
 * 
 *  @accessor geodesy/Lla2Ecef
 *  @author Eloi T. Pereira (eloi@berkeley.edu)
 *  @version $$Id$$
 *  @input {double} lat latitude
 *  @input {double} lon longitude
 *  @input {double} alt altitude
 *  @output {double} x ecef x coordinate
 *  @output {double} y ecef y coordinate
 *  @output {double} z ecef z coordinate
 *  
 */

// Stop extra messages from jslint and jshint.  Note that there should
// be no space between the / and the * and global. See
// https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSHint */
/*globals addInputHandler, get, error, exports, extend, get, input, output, parameter, require, send */
/*jshint globalstrict: true*/
'use strict';

/** Set up the accessor by defining the inputs and outputs.
 */

exports.setup = function() {
    this.input('lat');
    this.input('lon');
    this.input('alt');
    this.output('x');
    this.output('y');
    this.output('z');
};

exports.initialize = function() {
    // WGS-84 parameters
    var a = 6378137.0; //WGS-84 semi-major axis (meters)
    var e2 = 6.6943799901377997e-3;  //WGS-84 first eccentricity squared

    var self = this;
    this.addInputHandler(function () {
        var lat = this.get('lat')*Math.PI/180;
        var lon = this.get('lon')*Math.PI/180;
        var alt = this.get('alt');
        var n = a/Math.sqrt(1 - e2*Math.sin( lat )*Math.sin( lat ) );
        var x = ( n + alt )*Math.cos( lat )*Math.cos( lon );
        var y = ( n + alt )*Math.cos( lat )*Math.sin( lon );
        var z = ( n*(1 - e2 ) + alt )*Math.sin( lat );
        self.send('x',x);
        self.send('y',y);
        self.send('z',z);
    });
};
