// LocationDisplay Accessor.
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

/** LocationDisplay accessor that displays the coordinates, if any.
 *
 *  Example usage:
 *
 *  var locDisplay = instantiate('locDisplay','LocationDisplay');
 *  locDisplay.initialize();
 *  locDisplay.provideInput('location', {latitude: 45.2, longitude: 37.9, error: false});
 *  locDisplay.react();
 *
 *  @accessor LocationDisplay
 *  @input location The location.
 *  @author Chadlia Jerad
 *  @version $$Id: LocationDisplay.js 1137 2016-12-06 22:13:55Z cxh $$
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*globals console, error, exports, require */
/*jshint globalstrict: true*/
"use strict";


exports.setup = function () {
    this.input('location', {
        'type': 'JSON'
    });
};

exports.initialize = function () {
    var thiz = this;

    this.addInputHandler('location', function() {
        var location = this.get('location');

        if (location.error) {
            console.log('Soory, error retieving geolocation information: '+location.error);
        } else {
            var dt = Date.now();
            console.log('Your location at ' + dt + ' is: <BR/> \
               &nbsp &nbsp latitude: ' + location.latitude + '<BR/> \
               &nbsp &nbsp longitude: ' + location.longitude);
        }
    });
};

