// Below is the copyright agreement for the Ptolemy II system.
//
// Copyright (c) 2015-2016 The Regents of the University of California.
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
//
// Ptolemy II includes the work of others, to see those copyrights, follow
// the copyright link on the splash page or see copyright.htm.

/**
 * Module for BLE discovery and connection.
 *
 * @module ble
 * @author Chadlia Jerad, Victor Nouvellet
 * @version $$Id: ble.js 75980 2017-04-23 00:19:25Z victor.nouvellet@berkeley.edu $$
 */

exports.requiredPlugins = ['cordova-plugin-ble'];

exports.startScan = function (successCallback, errorCallback, options) {
    // Scan for all services.
    var foundDevices = {};

    //I don't know if this check actually does anything because to the best of my knowledge
    //we don't have a working demo for this module.
    if(typeof evothings == "undefined"){
        console.log("WARNING: ble.js module does not have cordova-plugin-ble installed and will not work correctly.");
    }

    evothings.ble.startScan(
        function(device)
        {
            // console.log('startScan found device named: ' + device.name);
            var count = Object.size(foundDevices);
            foundDevices[device.address] = device;
            if (Object.size(foundDevices) > count || options.allowDuplicates == true) {
                // New device -> call callback
                successCallback(device);
            } 
        },
        function(errorCode)
        {
            console.log('startScan error: ' + errorCode);
            errorCallback(errorCode);
        }
    );
};
exports.stopScan = function () {
    evothings.ble.stopScan();
};
exports.connectToDevice = function (device, onConnected, onDisconnected, onConnectError, options) {
    evothings.ble.connectToDevice(device, onConnected, onDisconnected, onConnectError, options);
};
exports.getService = function (device, uuid) {
    evothings.ble.getService(device, uuid);
};
exports.getCharacteristic = function (service, uuid) {
    evothings.ble.getCharacteristic(service, uuid);
};
exports.getDescriptor = function (characteristic, uuid) {
    evothings.ble.getDescriptor(characteristic, uuid);
};
exports.readCharacteristic = function (device, characteristic, success, fail) {
    evothings.ble.readCharacteristic(device, characteristic, success, fail);
};
exports.writeCharacteristic = function (device, characteristic, data, success, fail) {
    evothings.ble.writeCharacteristic(device, characteristic, data, success, fail);
};
exports.enableNotification = function (device, characteristic, success, fail) {
    evothings.ble.enableNotification(device, characteristic, success, fail);
};

