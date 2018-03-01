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

/** This accessor takes a mavros global_position/global message and retrieves the corresponding Latitude, Longitude, and Altitude
 *
 *  @accessor robotics/GlobalPosition2LatLonAlt
 *  @author Eloi T. Pereira (eloi@berkeley.edu)
 *  @version $$Id$$
 *  @input {object} global maveros message
 *  @output {double} lat latitude
 *  @output {double} lon longitude
 *  @output {double} alt altitude
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
    this.input('global');
    this.output('lat');
    this.output('lon');
    this.output('alt');
};

exports.initialize = function () {
    var self = this;
    this.addInputHandler('global', function () {
        var raw = self.get('global');
        self.send('lat', raw.msg.latitude);
        self.send('lon', raw.msg.longitude);
        self.send('alt', raw.msg.altitude);
    });
};
