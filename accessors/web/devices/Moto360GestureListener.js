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
 * Read UDP gesture data from a Moto 360 watch.
 *  
 * See https://github.com/Zziwei/GestureUDP for software for the watch.
 *
 * See https://github.com/terraswarm/PackageSendTest for sample JavaScript drivers.
 *
 * @accessor devices/Moto360GestureListener
 * @output {string} message The received message.
 * @output {boolean} listening True to indicate that listening has begun, false to
 *   indicate that it has stopped.
 * @output {json} data The data from the watch.
 *
 * @input {string} listeningAddress The interface to listen on for incoming messages.
 *   This defaults to "0.0.0.0", which means to listen on all network interfaces.
 * @input {int} listeningPort The port to listen on for incoming messages.
 *   This defaults to 4567, which is the value found in https://github.com/Zziwei/PackageSendTest
 *   
 * @parameter {string} receiveType See above.
 
 * @author Christopher Brooks
 * @version $$Id: Hue.js 748 2016-04-29 21:51:14Z cxh $$ 
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*globals clearTimeout, console, error, exports, httpRequest, require, setTimeout  */
/*jshint globalstrict: true*/
"use strict";

// This accessor requires the optional 'udpSocket' module, which may or may
// not be provided by an accessor host. Most hosts will provide this module.
var UDPSocket = require('udpSocket');

/** Set up the accessor by defining the inputs and outputs.
 */
exports.setup = function () {
    this.extend('net/UDPSocketListener');

    // Override the value of listeningPort in the parent.
    this.input('listeningPort', {
        'value': 4567, // 4567 is the value found in https://github.com/Zziwei/PackageSendTest
        'type': 'int'
    });

    
    this.output('data', {'type': 'JSON'});

    this.parameter('receiveType', {
        type: 'string',
        value: 'unsignedbyte',
    });
};

exports.initialize = function () {
    exports.ssuper.initialize.call(this);
};

// Convert the 2 bytes data to a integer.
function trans(a, b) {
    var c = a * Math.pow(2, 8);
    c = c + b;
    if (c > Math.pow(2, 15)) { 
        c = (Math.pow(2, 16) - c) * -1;
    }
    return c;
}

// Convert timestamp to time string.
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

var debug = false;

exports.closeAndOpen = function () {

    exports.ssuper.closeAndOpen.call(this);
    var self = this;

    exports.ssuper.socket.on('message', function (message) {
        if (exports.ssuper.running) {
            self.send('message', message);

            // Here's where Moto360GestureListener differs from UDPSocketListener.
            // See https://www.terraswarm.org/urbanheartbeat/wiki/Main/WatchSoftware#Package
            if (debug) {
                console.log("Moto360GestureListener.parseGestureData(): message: " + message);
            }
            // Receive the data and parse them and print.
            if (message[4] === "w".charCodeAt(0)) {
                var watchID = String.fromCharCode(message[0]) + String.fromCharCode(message[1]) +
                            String.fromCharCode(message[2]) + String.fromCharCode(message[3]);

                if (debug) {
                    console.log(watchID);
                    console.log(String.fromCharCode(message[4]));
                }

                for(var i = 0; i < (message.length - 5)/20; i++) {
                    var accelerometerX = trans(message[5 + i * 22 + 1], message[5 + i * 22]) / 10000.0;
                    var accelerometerY = trans(message[5 + i * 22 + 3], message[5 + i * 22] + 2) / 10000.0;
                    var accelerometerZ = trans(message[5 + i * 22 + 5], message[5 + i * 22] + 4) / 10000.0;
                    var gyroscopeX = trans(message[5 + i * 22 + 7], message[5 + i * 22] + 6) / 10000.0;
                    var gyroscopeY = trans(message[5 + i * 22 + 9], message[5 + i * 22] + 8) / 10000.0;
                    var gyroscopeZ = trans(message[5 + i * 22 + 11], message[5 + i * 22] + 10) / 10000.0;
                    var ppg = (message[5 + i * 22 + 12] | (message[5 + i * 22 + 13] << 8) | (message[5 + i * 22 + 14] << 16));
                    var heartRate = message[5 + i * 22 + 15]; 
                    var timestamp = timestamp2string(bytes2float(message.slice(5 + i * 22 + 16, 5 + i * 22 + 22 + 1)));
                    if (debug) {
                        console.log(accelerometerX + " " +
                                    accelerometerY + " " +
                                    accelerometerZ + " " +
                                    gyroscopeX + " " +
                                    gyroscopeY + " " +
                                    gyroscopeZ + " " +                                
                                    ppg + " " +
                                    heartRate + " " +
                                    timestamp);
                    }
                    var json = JSON.stringify({watchID: watchID, accelerometerX: accelerometerX, accelerometerY: accelerometerY, accelerometerZ: accelerometerZ, gyroscopeX: gyroscopeX, gyroscopeY: gyroscopeY, gyroscopeZ: gyroscopeZ, ppg: ppg, heartRate: heartRate, timestamp: timestamp})
                    self.send("data", json)
                }
            } else if (message.toString("utf-8", 4, 5) === "g") {
                console.log(message.toString("utf-8", 0, 4));
                console.log(message.toString("utf-8", 4, 5));
                for(var i = 0; i < (message.length - 5) / 10; i++) {
                    console.log(trans(message[5 + i * 10 + 1], message[5 + i * 10]) / 10000.0 + " " +
                                trans(message[5 + i * 10 + 3], message[5 + i * 10 + 2]) / 10000.0 + " " +
                                trans(message[5 + i * 10 + 5], message[5 + i * 10 + 4]) / 10000.0 + " " +
                                ((message[5 + i * 10 + 6] | (message[5 + i * 10 + 7] << 8) | (message[5 + i * 10 + 8] << 16) | (message[5 + i * 10 + 9] << 24)) >>> 0)); // Use >>> 0 to convert to unsigned.
                }
            } else if (message.toString("utf-8", 4, 5) === "b") {
                console.log(message.toString("utf-8", 0, 4));
                console.log(message.toString("utf-8", 4, 5));
                console.log(message[5]);
            }
            console.log("");


        }
    });
};


