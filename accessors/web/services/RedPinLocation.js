// Copyright (c) 2017 The Regents of the University of California.
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

/**
 *  This accessor obtains the location corresponding to a WiFi fingerprint
 *  from a RedPin localalization server http://redpin.org/. The RedPin server
 *  must first be configured with a map and trained with
 *  (fingerprint, location) matchings before it can be used with this accessor.
 *  For now, the easiest way to accomplish this is by walking around and
 *  tagging locations with the RedPin Android app available at
 *  https://github.com/MaKeAppDev/Redpin. Unfortunately, the
 *  iPhone app has difficulty obtaining fingerprint values from the phone.
 *
 *  This accessor is triggered by an input to the wifiReadings input, at which
 *  time a getLocation action is sent to the RedPin server over a raw TCP
 *  socket with specified host URL and port. These values default to those for
 *  the RedPin server running at "terra.eecs.berkeley.edu" on port 8090.
 *  Upon receiving a response from the server, the accessor parses out the
 *  "symbolicID" and "mapName" fields and outputs them on the location
 *  and MapName outputs respectively.
 *
 *  It appears the RedPin server doesn't validate its input
 *  and will return a location response to this accessor even if
 *  the wifiReadings array is ill formed. However, this accessor will
 *  raise an error if an element of the wifiReadings array is missing a
 *  field.
 *
 *  To obtain WiFi scan data on a mac, you can use the command line tool
 *  $/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -s
 *
 *  The format of the wifiReadings parameter is consistent with the
 *  RedPin interface specification at
 *  http://redpin.org/resources/docu/interface_spec.pdf for the
 *  "getLocation" action.  E.g. [{ "ssid": "AirBears2", "bssid":
 *  "e8:65:49:e9:16:3b", "wepEnabled": false, "rssi": -88,
 *  "isInfrastructure": true }, {...} ]. This input triggers a raw TCP
 *  socket connection to the RedPin server running at host and port.
 *
 *  @accessor services/RedPinLocation
 *  @input wifiReadings A JSON string array of RSSI readings. See the comment above.
 *  @input {string} host The IP address or domain name of the RedPin server.
 *    Defaults to 'terra.eecs.berkeley.edu' for the Berkeley server.
 *  @input {int} port The port on the RedPin server to connect to. Defaults to
 *    8090 for the Berkeley server.
 *
 *  @output {string} mapName  The name of the map determined by the RedPin
 *    server to be the best fit for wifiReadings.
 *  @output {string} location The symbolic name of the location determined
 *    by the RedPin server to be the best match for wifiReadings according to
 *    its kNN/SVM algorithm.
 *  @author Matt Weber and Edward A. Lee
 *  @version $$Id$$
 */

// Stop extra messages from jslint and jshint.  Note that there should
// be no space between the / and the * and global. See
// https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSHint */
/*globals addInputHandler, get, getParameter, error, exports, extend, get, input, output, parameter, require, send */
/*jshint globalstrict: true*/
'use strict';

exports.setup = function () {
    this.extend('net/TCPSocketClient');
    this.input('wifiReadings');
    this.output('location');
    this.output('mapName');
    this.output('received', {
        'visibility': 'expert'
    });
    this.output('connected', {
        'visibility': 'expert'
    });
    this.input('rawBytes', {
        'visibility': 'expert',
        'value': true
    });
    this.input('toSend', {
        'visibility': 'expert'
    });
    this.input('host', {
        'value': "terra.eecs.berkeley.edu"
    });
    this.input('port', {
        'value': 8090
    });
};

exports.initialize = function () {
    exports.ssuper.initialize.call(this);
    this.addInputHandler('wifiReadings', this.exports.wifiReadingsInputHandler.bind(this));
    //exports.ssuper.tempFunc.call(this);// .call(this);
};

exports.wifiReadingsInputHandler = function () {
    //The RedPin server closes its connection after each location request
    //so it must be reestablished whenever we wish to make a new one.

    var wifiArray = this.get('wifiReadings');
    //Throw an error if input is incorrectly structured
    try {
        var wifiTest = JSON.parse(wifiArray);
        for (var i = 0; i < wifiTest.length; i++) {
            if (typeof wifiTest[i].ssid !== "string") {
                throw "missing ssid string in " + i + "th element of wifiReadings: " + wifiArray;
            }
            if (typeof wifiTest[i].bssid !== "string") {
                throw "missing bssid string in " + i + "th element of wifiReadings: " + wifiArray;
            }
            if (typeof wifiTest[i].wepEnabled !== "boolean") {
                throw "missing wepEnabled boolean in " + i + "th element of wifiReadings: " + wifiArray;
            }
            if (typeof wifiTest[i].rssi !== "number") {
                throw "missing rssi number in " + i + "th element of wifiReadings: " + wifiArray;
            }
            if (typeof wifiTest[i].isInfrastructure !== "boolean") {
                throw "missing isInfrastructure boolean in " + i + "th element of wifiReadings: " + wifiArray;
            }
        }
    } catch (error) {
        this.error(error);
    }
    //Format of request matches the protocol document here:
    //http://redpin.org/resources/docu/interface_spec.pdf
    var redPinRequest = '{ "action": "getLocation", "data": { "wifiReadings":' + wifiArray + '}}' + '\n';
    //This function must be called in the superAccessor context because it uses
    //the client variable.
    console.log(redPinRequest);
    exports.ssuper.send.call(this, redPinRequest);
};

var self = this;
//Copying "this" to "self" is needed because dataReceivedHandler will be passed
// as a callback to "client" in TCPSocketClient
exports.dataReceivedHandler = function (data) {
    var serverResponse = JSON.parse(data);
    var locationID = serverResponse.data.symbolicID;
    var mapName = serverResponse.data.map.mapName;
    self.send('location', locationID);
    self.send('mapName', mapName);
};
