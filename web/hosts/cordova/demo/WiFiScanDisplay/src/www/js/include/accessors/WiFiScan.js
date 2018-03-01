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

/** Obtain a scan of nearby WiFi networks. 
*
*   The output is a JSON array of objects in the form:
*   networks = [
*        {   "level": signal_level, // raw RSSI value
*            "SSID": ssid, // SSID as string, with escaped double quotes: "\"ssid name\""
*            "BSSID": bssid // MAC address of WiFi router as string
*            "frequency": frequency of the access point channel in MHz
*            "capabilities": capabilities // Describes the authentication, key management, and encryption schemes supported by the access point.
*        }
*    ]
*
*   @accessor services/WiFiScan
*   @input trigger Initiates a WiFiScan. 
*   @output wifiData The list of networks obtained from the wifi-scanner module. 
*
*  
*  @author Matt Weber
*  @version $$Id: swarmlet.js 1502 2017-04-17 21:34:03Z cxh $$
*/

// Stop extra messages from jslint and jshint.  Note that there should
// be no space between the / and the * and global. See
// https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSHint */
/*globals addInputHandler, console, get, getParameter, getResource, error, exports, extend, get, input, output, parameter, require, send */
/*jshint globalstrict: true*/
'use strict';

var scanner = require('@accessors-modules/wifi-scanner');

exports.setup = function(){
    this.input('trigger');
    this.output('wifiData',{
        'type':'JSON'
    });
 };

//Callback function passed to scanner.scan
function scanSuccess(arg){
    this.send('wifiData', arg);
};

//Callback function passed to scanner.scan
function scanFailure(arg){
    throw "WiFiScan scanning failed: " + JSON.stringify(arg);
};

exports.initialize = function(){
    var thiz = this;

    this.addInputHandler('trigger', function(){
        scanner.scan(scanSuccess.bind(thiz), scanFailure.bind(thiz));
    });
 };
