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

/** This accessor takes two WG-84 locations (latitude, longitude, and altitude)
 * and outputs the euclidean distance between them.
 *
 *
 *  @accessor geodesy/LlaDist
 *  @author Eloi T. Pereira (eloi@berkeley.edu)
 *  @version $$Id$$
 *  @input {double} lat1 latitude
 *  @input {double} lon1 longitude
 *  @input {double} alt1 altitude
 *  @input {double} lat2 latitude
 *  @input {double} lon2 longitude
 *  @input {double} alt2 altitude
 *  @output {double} dist euclidean distance
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

exports.setup = function () {
    this.input('lat1', {
        'type': 'number',
        'value': 0.0
    });
    this.input('lon1', {
        'type': 'number',
        'value': 0.0
    });
    this.input('alt1', {
        'type': 'number',
        'value': 0.0
    });
    this.input('lat2', {
        'type': 'number',
        'value': 0.0
    });
    this.input('lon2', {
        'type': 'number',
        'value': 0.0
    });
    this.input('alt2', {
        'type': 'number',
        'value': 0.0
    });
    this.output('dist', {
        'type': 'number'
    });
    var lla2ecef1 = this.instantiate('Lla2Ecef', 'geodesy/Lla2Ecef');
    var lla2ecef2 = this.instantiate('Lla2Ecef', 'geodesy/Lla2Ecef');
    var dist = this.instantiate('EuclideanDist', 'geodesy/EuclideanDist');
    this.connect('lat1', lla2ecef1, 'lat');
    this.connect('lon1', lla2ecef1, 'lon');
    this.connect('alt1', lla2ecef1, 'alt');
    this.connect('lat2', lla2ecef2, 'lat');
    this.connect('lon2', lla2ecef2, 'lon');
    this.connect('alt2', lla2ecef2, 'alt');
    this.connect(lla2ecef1, 'x', dist, 'x1');
    this.connect(lla2ecef1, 'y', dist, 'y1');
    this.connect(lla2ecef1, 'z', dist, 'z1');
    this.connect(lla2ecef2, 'x', dist, 'x2');
    this.connect(lla2ecef2, 'y', dist, 'y2');
    this.connect(lla2ecef2, 'z', dist, 'z2');
    this.connect(dist, 'dist', 'dist');
};
