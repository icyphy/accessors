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
 * @accessor devices/Moto360GestureListener
 * @output {string} message The received message.
 * @output {boolean} listening True to indicate that listening has begun, false to
 *   indicate that it has stopped.
 *
 * @input {string} listeningAddress The interface to listen on for incoming messages.
 *   This defaults to "0.0.0.0", which means to listen on all network interfaces.
 * @input {int} listeningPort The port to listen on for incoming messages.
 *   This defaults to 4567, which is the value found in https://github.com/Zziwei/PackageSendTest
 *   
 *  @parameter {string} receiveType See above.

 *  @author Christopher Brooks
 *  @version $$Id: Hue.js 748 2016-04-29 21:51:14Z cxh $$ 
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
    this.input('listeningPort', {
        'value': 4567, // 4567 is the value found in https://github.com/Zziwei/PackageSendTest
        'type': 'int'
    });
    this.parameter('receiveType', {
        type: 'string',
        value: 'unsignedbyte',
    });
};

exports.initialize = function () {
    exports.ssuper.initialize.call(this);
    console.log("Moto360GesterListener.js: initialize()");
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

/** Parse the gesture data.
 *  See https://www.terraswarm.org/urbanheartbeat/wiki/Main/WatchSoftware#Package
 */
function parseGestureData(data) {
    console.log("Moto360GestureListener.parseGestureData(): data: " + data);
    // Receive the data and parse them and print.
    if (data[4] === "w".charCodeAt(0)) {
        console.log(String.fromCharCode(data[0]) + String.fromCharCode(data[1]) +
                    String.fromCharCode(data[2]) + String.fromCharCode(data[3]));
        console.log(String.fromCharCode(data[4]));
        for(var i = 0; i < 10; i++) {
            console.log(trans(data[5 + i * 20 + 1], data[5 + i * 20]) / 10000.0 + " " +
                        trans(data[5 + i * 20 + 3], data[5 + i * 20 + 2]) / 10000.0 + " " +
                        trans(data[5 + i * 20 + 5], data[5 + i * 20 + 4]) / 10000.0 + " " +
                        trans(data[5 + i * 20 + 7], data[5 + i * 20 + 6]) / 10000.0 + " " +
                        trans(data[5 + i * 20 + 9], data[5 + i * 20 + 8]) / 10000.0 + " " +
                        trans(data[5 + i * 20 + 11], data[5 + i * 20 + 10]) / 10000.0 + " " +
                        (data[5 + i * 20 + 12] | (data[5 + i * 20 + 13] << 8) | (data[5 + i * 20 + 14] << 16)) + " " +
                        data[5 + i * 20 + 15] + " " +
                        ((data[5 + i * 20 + 16] | (data[5 + i * 20 + 17] << 8) | (data[5 + i * 20 + 18] << 18) | (data[5 + i * 20 + 19] << 24)) >>> 0)); // Use >>> 0 to convert to unsigned.
        }
    } else if (data.toString("utf-8", 4, 5) === "g") {
        console.log(data.toString("utf-8", 0, 4));
        console.log(data.toString("utf-8", 4, 5));
        for(var i = 0; i < 10; i++) {
            console.log(trans(data[5 + i * 10 + 1], data[5 + i * 10]) / 10000.0 + " " +
                        trans(data[5 + i * 10 + 3], data[5 + i * 10 + 2]) / 10000.0 + " " +
                        trans(data[5 + i * 10 + 5], data[5 + i * 10 + 4]) / 10000.0 + " " +
                        ((data[5 + i * 10 + 6] | (data[5 + i * 10 + 7] << 8) | (data[5 + i * 10 + 8] << 16) | (data[5 + i * 10 + 9] << 24)) >>> 0)); // Use >>> 0 to convert to unsigned.
        }
    } else if (data.toString("utf-8", 4, 5) === "b") {
        console.log(data.toString("utf-8", 0, 4));
        console.log(data.toString("utf-8", 4, 5));
        console.log(data[5]);
    }
    console.log("");
};

exports.closeAndOpen = function () {
    console.log("Moto360GestureListener.js: closeAndOpen()");

    exports.ssuper.closeAndOpen.call(this);
    var self = this;

    exports.ssuper.socket.on('message', function (message) {
        console.log("Moto360GestureListener: sending message0");
        if (exports.ssuper.running) {
            console.log("Moto360GestureListener: sending message");
            self.send('message', message);
            // Here's where Moto360GestureListener differs from UDPSocketListener.
            parseGestureData(message);
            // Here, we want to parse the data
        }
    });
};


