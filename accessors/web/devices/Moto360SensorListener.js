// Copyright (c) 2016 The Regents of the University of California.
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

/** 
 * Read sensor data from a Moto 360 watch that is broadcasting the data via
 * UDP on the local network.
 *
 * FIXME: Give the app that needs to be running on the watch.
 *
 * Each sensor has its own output port.  The outputs will be objects with
 * fields 'watchID', a four-character string, and 'timestamp' representing
 * FIXME: what information is this?
 *
 * See https://www.terraswarm.org/urbanheartbeat/wiki/Main/WatchSoftware
 * for details on the software that runs on the watch.
 *  
 * @accessor devices/Moto360SensorListener
 *
 * @output message The received message as a raw byte array.
 * @output {boolean} listening True to indicate that listening has begun, false to
 *   indicate that it has stopped.
 * @output accelerometer The accelerometer data from the watch. This is an object
 *   with fields x, y, z representing measured acceleration (or the earth's gravitational
 *   field, which is indistinguishable from acceleration). These will be in SI units
 *   of meters per second squared. The 'z' field points into
 *   the watch face, so it will be roughly +9.8 (one g) when the watch is facing up.
 *   The 'x' field is transverse to the watch, where +9.8 occurs roughly when 9 o'clock
 *   is pointing straight down. The 'y' axis is along band axis, where +9.8 will occur
 *   roughly when the 12 o'clock is pointing straight up.
 * @output gyro The gyroscope data from the watch. This is an object
 *   with fields x, y, z representing measured angular rotation (in radians per second).
 *   The 'z' field represents rotation around an axis pointing into the watch face.
 *   The 'x' field axis transverse to the watch, and the 'y' axis is along band axis.
 *   These are the same axes as for the accelerometer.
 *
 * @input {string} listeningAddress The interface to listen on for incoming messages.
 *   This defaults to "0.0.0.0", which means to listen on all network interfaces.
 * @input {int} listeningPort The port to listen on for incoming messages.
 *   This defaults to 4567.
 *
 * @parameter accelerometerSensitivity If this is set to something other than zero,
 *   then this accessor will output accelerometer data only when the accelerometer
 *   reading differs in some axis by more than the specified sensitivity.
 *   A small number means high sensitivity (lots of outputs) and a larger number
 *   means low sensitivity (fewer outputs).
 * @parameter gyroSensitivity If this is set to something other than zero,
 *   then this gyroscope will output data only when the gyro
 *   reading differs in some axis by more than the specified sensitivity.
 *   A small number means high sensitivity (lots of outputs) and a larger number
 *   means low sensitivity (fewer outputs).
 *  
 * @author Christopher Brooks and Edward A. Lee
 * @version $$Id$$ 
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*globals clearTimeout, console, error, exports, httpRequest, require, setTimeout  */
/*jshint globalstrict: true*/
"use strict";

// This accessor requires the optional 'udpSocket' module, which may or may
// not be provided by an accessor host. Most hosts will provide this module.
var UDPSocket = require('udpSocket');

// FIXME: Use built in debug capability.
var debug = false;

// Initialize these to large numbers so that the first output always appears.
// Accelerometer values.
var previousX = -100.0;
var previousY = -100.0;
var previousZ = -100.0;
// Gyro values.
var previousGX = -100.0;
var previousGY = -100.0;
var previousGZ = -100.0;

/** Set up the accessor by defining the inputs and outputs.
 */
exports.setup = function () {
    this.extend('net/UDPSocketListener');

    // Override the value of listeningPort in the parent.
    this.input('listeningPort', {
        'value': 4567, // 4567 is the value found in https://github.com/Zziwei/PackageSendTest
        'type': 'int'
    });
    
    // Accelerometer output port.
    this.output('accelerometer');
    this.parameter('accelerometerSensitivity', {
        type: 'number',
        value: 0.0
    });

    // Gyro output port.
    this.output('gyro');
    this.parameter('gyroSensitivity', {
        type: 'number',
        value: 0.0
    });

    this.parameter('receiveType', {
        type: 'string',
        value: 'unsignedbyte',
        visibility:'expert'
    });
};

exports.initialize = function () {
    // FIXME: Is this needed?
    exports.ssuper.initialize.call(this);
};

// Convert the 2 bytes data to a integer.
// The first argument is the higher-order byte, and the second is the lower-order byte.
// These are assumed to be non-negative numbers between 0 and 255.
// If the result is greater than or equal to 2^15 = 32768, then the two bytes are
// interpreted as a two's complement negative number and a negative integer is returned.
// The returned result always lies between -32768 and 32767, inclusive.
function bytesToInt(a, b) {
    if (debug) {
	    console.log('******** translating: ' + a + ', ' + b);
	}
    var c = a * Math.pow(2, 8);
    c = c + b;
    if (c >= Math.pow(2, 15)) { 
        c = (Math.pow(2, 16) - c) * -1;
    }
    return c;
}

// Convert a timestamp to time string.
function timestamp2string(time_stamp) {
    try {
        // Python time is in seconds.  JavaScript milliseconds.
        //d = datetime.fromtimestamp(time_stamp / 1000.0);
        time_stamp = Math.round(time_stamp * 1000);
        var d = new Date(time_stamp);
        //str1 = d.strftime("%Y-%m-%d %H:%M:%S.%f");
        var str1 = d.toISOString();
        //console.log("timestamp2string(" + time_stamp + ")" + d + " " + Date.now());
        
        // Python: 2015-08-28 16:43:37.283000
        // JavaScript: 2016-10-05T03:21:09.617Z 
        return str1;
    } catch (e) {
        console.log(e);
        return '';
    }
}

// Convert the 8 bytes timestamp to float.
function bytes2float(byte_array) {
    var value = (byte_array[0] & 0xff) | ((byte_array[1] << 8) & 0xff00) | ((byte_array[2] << 16) & 0xff0000) | ((byte_array[3] << 24) & 0xff000000);
    value += ((((byte_array[4]) & 0xff) | ((byte_array[5] << 8) & 0xff00)) / 1000);
    return value;
}

// Override the base class to attach a message listening function.
exports.closeAndOpen = function () {

    exports.ssuper.closeAndOpen.call(this);
    var self = this;

    exports.ssuper.socket.on('message', function (message) {
        if (exports.ssuper.running) {
            // Send out the raw message.
            self.send('message', message);

            var watchID = String.fromCharCode(message[0]) + String.fromCharCode(message[1]) +
            		String.fromCharCode(message[2]) + String.fromCharCode(message[3]);
            // Get the timestamp.
            var timestamp = timestamp2string(bytes2float(message.slice(11, 17)));
            
            if (debug) {
                console.log("Message received: " + message);
                console.log('Watch ID: ' + watchID);
                console.log('Message type: ' + String.fromCharCode(message[4]));
            }
            // Check for accelerometer data.
            if (message[4] == "A".charCodeAt(0)) {
            	// Received accelerometer data.
            	// To get SI units of m/s^2, the scaling factor needs to match
            	// what is used in the watch application's SCALE_ACCELEROMETER
            	// variable.
            	var SCALE_ACCELEROMETER = 836;
            	var x = bytesToInt(message[6], message[5]) / SCALE_ACCELEROMETER;
                var y = bytesToInt(message[8], message[7]) / SCALE_ACCELEROMETER;
                var z = bytesToInt(message[10], message[9]) / SCALE_ACCELEROMETER;
                
                // Compare current data against previous data.
                var sensitivity = self.getParameter('accelerometerSensitivity');
                if (sensitivity == 0.0
                        || Math.abs(x - previousX) > sensitivity
                        || Math.abs(y - previousY) > sensitivity
                        || Math.abs(z - previousZ) > sensitivity) {
                        
                    // Output is to be produced.
                    previousX = x;
                    previousY = y;
                    previousZ = z;
                    
                    var json = {
                        watchID: watchID,
                        'x': x,
                        'y': y,
                        'z': z,
                        'timestamp': timestamp
                    };
                    if (debug) {
                        console.log("Accelerometer output: " + JSON.stringify(json));
                    }
                    self.send("accelerometer", json);
                }
            } else if (message[4] == "G".charCodeAt(0)) {
            	// Received gyro data.
            	// To get units of radians per second, the scaling factor needs to match
            	// what is used in the watch application's SCALE_GYRO
            	// variable.
            	var SCALE_GYRO = 5208;
            	var x = bytesToInt(message[6], message[5]) / SCALE_GYRO;
                var y = bytesToInt(message[8], message[7]) / SCALE_GYRO;
                var z = bytesToInt(message[10], message[9]) / SCALE_GYRO;
                
                // Compare current data against previous data.
                var sensitivity = self.getParameter('gyroSensitivity');
                if (sensitivity == 0.0
                        || Math.abs(x - previousGX) > sensitivity
                        || Math.abs(y - previousGY) > sensitivity
                        || Math.abs(z - previousGZ) > sensitivity) {
                        
                    // Output is to be produced.
                    previousGX = x;
                    previousGY = y;
                    previousGZ = z;
                    
                    var json = {
                        watchID: watchID,
                        'x': x,
                        'y': y,
                        'z': z,
                        'timestamp': timestamp
                    };
                    if (debug) {
                        console.log("Gyro output: " + JSON.stringify(json));
                    }
                    self.send("gyro", json);
                }
            }
            if (debug) {
                console.log("---------");
            }
        }
    });
};
