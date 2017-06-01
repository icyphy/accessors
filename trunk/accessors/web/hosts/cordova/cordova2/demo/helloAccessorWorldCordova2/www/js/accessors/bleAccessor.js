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

/** Test accessor that multiplies its input by a scale factor.
 *  This is a slightly modified copy of TestGain.js
 *  The realized feature is added using this.realizes, the feature
 *  being 'gain'.
 *   
 *  @accessor mutable/TestGain1
 *  @param gain The gain, a number with default 2.
 *  @param input The input, a number with default 0.
 *  @param scaled The output, the result of input * gain.
 *  @author Chadlia, Victor
 *  @version $$Id: BLE.js 1137 2016-12-06 22:13:55Z cxh $$
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*globals console, error, exports, require */
/*jshint globalstrict: true*/
"use strict";

var ble = require('bluetooth/ble.js');

exports.setup = function () {
    this.input('startScan');
    this.input('stopScan');
    this.parameter('allowDuplicates', {
        'type': 'boolean',
        'value': false
    });
    this.output('newDevice', {
        'type': 'JSON',
        'value': ''
    });

    this.output('scanError', {
        'type': 'JSON',
        'value': ''
    });
};

exports.initialize = function () {
    this.addInputHandler('startScan', startScan);
    this.addInputHandler('stopScan', stopScan);
};

function startScan() {
    // var allowDuplicates = this.getParameter('allowDuplicates');
    ble.startScan(
        function(device)
        {
            if (device.name === 'estimote') {
                MobileLog('Found ibeacon: ' + (!(device.name) ? device.address : device.name) + " (" + device.rssi + " dB). Address: " + device.address + ".");
            }
            
            // this.send('newDevice', device);
        },
        function(errorCode)
        {
            MobileLog('startScan error: ' + errorCode);
            // this.send('scanError', errorCode);
        },
        { allowDuplicates: true, timeout: 1000 }
    );
}

function stopScan() {
    ble.stopScan();
}
