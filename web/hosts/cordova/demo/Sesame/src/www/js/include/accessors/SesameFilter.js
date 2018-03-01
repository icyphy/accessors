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

/** Logic that processes newly identified BLE devices
 *  from the BLEAccessor
 *   
 *  @accessor SesameFilter
 *  @param newDevice The input, an object containing rssi and uuid.
 *  @param open The output, a boolean trigger to the Door accessor.
 *  @param uuid A parameter specifiying the uuid for which to produce an output.
 *  @param rssi A parameter specifying the minimum rssi value for which to produce an output.
 *  @author Matt Weber
 *  @version $$Id: SesameFilter.js 1137 2016-12-06 22:13:55Z cxh $$
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*globals console, error, exports, require */
/*jshint globalstrict: true*/
"use strict";
exports.setup = function () {
    this.input('newDevice');
    this.output('open', {
        'type': 'boolean'
    });
    this.parameter('characteristic', {
        'type': 'string',
        'value': ''
    });
    this.parameter('serviceData', {
        'type': 'string',
        'value': ''
    });
    this.parameter('rssi', {
        'type': 'number',
        'value': '-50'
    });
};

exports.initialize = function () {
    var thiz = this;
    console.log('Filtered Service: [' + this.getParameter('characteristic') + ' : ' + this.getParameter('serviceData') + ']. Min RSSI value: ' + this.getParameter('rssi'));
    this.addInputHandler('newDevice', handleNewDevice.bind(thiz));
};

function handleNewDevice() {
    var newDevice = this.get('newDevice');
    if(typeof newDevice.advertisementData !== "undefined" && typeof newDevice.advertisementData.kCBAdvDataServiceData !== "undefined" && newDevice.advertisementData.kCBAdvDataServiceData[this.getParameter('characteristic')] === this.getParameter('serviceData') && newDevice.rssi >= this.getParameter('rssi')){
        console.log('🎉Beacon found and close enough!');
        this.send('open', true);
    } else {
        if (typeof newDevice.advertisementData !== "undefined" && typeof newDevice.advertisementData.kCBAdvDataServiceData !== "undefined" && newDevice.advertisementData.kCBAdvDataServiceData[this.getParameter('characteristic')] === this.getParameter('serviceData')) {
            console.log('🚪Beacon not close enough: ' + newDevice.rssi + ' dB.');
        } else if (newDevice.advertisementData.kCBAdvDataServiceData != null && newDevice.rssi >= -50) {
            console.log('Close estimote found with advertisement data: ' + JSON.stringify(newDevice.advertisementData.kCBAdvDataServiceData));
        }
    }
}
