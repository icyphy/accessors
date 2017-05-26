// Test accessor that multiplies its input by a scale factor.
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

/** Door accessor for opening the DOP center door.
 *  Enter a custom url parameter for url of the door.
 *   
 *  @accessor Door
 *  @param url The url of the Raspberry Pi that opens the DOP center door,
 * 		defaults to google.
 *  @input trigger The trigger to open the DOP center door
 *
 *  Example usage:
 *
 *  var doorAcc = instantiate('doocAcc','Door');
 *  doorAcc.initialize();
 *  doorAcc.setParameter('url', '[URL to Raspberry Pi for opening the DOP center door]');
 *  doorAcc.provideInput('trigger', true);
 *  doorAcc.react();
 *
 *  @author Hokeun Kim and Matt Weber
 *  @version $$Id: TestGain.js 1137 2016-12-06 22:13:55Z cxh $$
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*globals console, error, exports, require */
/*jshint globalstrict: true*/
"use strict";
var httpClient = require('httpClient/httpClient.js');

exports.setup = function () {
    this.input('trigger');
    this.parameter('url', {
        'value': 'https://www.google.com',
        'type': 'string'
    });
    this.output('response');
};

function triggerInputHandler() {
    httpClient.get({
            trustAll: true,
            url: this.getParameter('url')
        },
        function(data) {
        	MobileLog(data);
            this.send('response', data);
        }
    );
};

exports.initialize = function () {
    this.addInputHandler('trigger', triggerInputHandler);
};
