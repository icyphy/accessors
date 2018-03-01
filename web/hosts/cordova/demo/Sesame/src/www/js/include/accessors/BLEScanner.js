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

/** BLE Scanner accessor for scanning BLE devices.
 *  Trigger start and stop scans. Get devices found.
 *   
 *  @accessor BLEScanner
 *  @param allowDuplicates A boolean to choose wether or not devices already found should be sent again when updated
 *  @input startScan The trigger to start BLE scan
 *  @input stopScan The trigger to stop BLE scan
 *  @output newDevice A object describing a device found during the scan
 *  @output scanError The error code in case something went wrong
 *
 *  Example usage:
 *
 *  var bleScanAcc = instantiate('bleScanAcc','BLEScanner');
 *  bleScanAcc.initialize();
 *  bleScanAcc.setParameter('allowDuplicates', true);
 *  bleScanAcc.provideInput('startScan', true);
 *  bleScanAcc.react();
 *
 *  @author Chadlia Jerad, Victor Nouvellet
 *  @version $$Id: BLEScanner.js 1137 2016-12-06 22:13:55Z cxh $$
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*globals console, error, exports, require */
/*jshint globalstrict: true*/
"use strict";

var ble = require('@accessors-modules/ble');

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
    var thiz = this;
    ble.startScan(
        function(device)
        {
            // Useful properties of the device object: device.name, device.address, device.rssi
            thiz.send('newDevice', device);
        },
        function(errorCode)
        {
            thiz.send('scanError', errorCode);
        },
        { allowDuplicates: true, timeout: 1000 }
    );
}

function stopScan() {
    ble.stopScan();
}
