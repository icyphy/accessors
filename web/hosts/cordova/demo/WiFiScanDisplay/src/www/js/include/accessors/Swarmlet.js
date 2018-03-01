// Cordova host swarmlet test
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

/** This "swarmlet" example, running on Cordova, illustrates the use of Cordova
 *  Host to run a swarmlet. The swarmlet loads loads a 'clock' and 
 *  a 'Hello' accessors, initializes them, and connect them
 *  
 *  See https://www.icyphy.org/accessors/wiki/Main/CordovaHost2
 *  
 *  @module swarmlet.js
 *  @author Matt Weber
 *  @version $$Id: swarmlet.js 1502 2017-04-17 21:34:03Z cxh $$
 */

exports.setup = function() {
    console.log('Swarmlet Setup...');

    var WiFiScan = this.instantiate('WiFiScanAccessor', "WiFiScan");
    var clock = this.instantiate('clock', 'utilities/Clock');
    clock.setParameter('interval', 10000);
    var JSONDisplay = this.instantiate('JSONDisplay', 'JSONDisplay');

    this.connect(clock, "output", WiFiScan, "trigger");
    this.connect(WiFiScan, "wifiData" ,JSONDisplay, "JSON")

    console.log('Swarmlet setup complete.');
};

exports.initialize = function() {
    console.log("Swarmlet Initialized");
};


/*

successCallback = function(arg) {
    console.log("succcess!");
    alert("success" + JSON.stringify(arg));
    //send('text', arg);    
};

errorCallback = function(arg) {
    console.log("failure");
    alert("failure" + JSON.stringify(arg));
    //send('text', arg);
};


successScanCallback = function(arg) {
    console.log("success scan :" + JSON.stringify(arg));
    setTimeout( function(){
      WifiWizard.getScanResults({numLevels: false}, successCallback, errorCallback);
      }, 5000)
    //send('text', arg);    
};

errorScanCallback = function(arg) {
    console.log("failure scan: " + JSON.stringify(arg));
    //send('text', arg);
};

exports.setup = function() {
    console.log('Swarmlet setu...');

    var permissions = cordova.plugins.permissions;
    locPermission =  permissions.ACCESS_COARSE_LOCATION;

    console.log("requesting permission");
    permissions.requestPermission(locPermission, successCallback, errorCallback);
    console.log("checking permission");
    permissions.checkPermission(locPermission, successCallback, errorCallback);
    
    setTimeout( WifiWizard.startScan(successScanCallback, errorScanCallback), 5000)

    var trigger = this.instantiate('trigger', 'test/TestSpontaneousOnce');
    var hello = this.instantiate('helloAcc', 'Hello');

    trigger.setParameter('delay', 1000.0);
    trigger.setParameter('value', true);

    ///////// Put your name here \\\\\\\\\\\
     hello.setParameter('name', 'Matt');

    this.connect(trigger, 'output', hello, 'sayHello');

    console.log('Swarmlet setup ended.');
};

exports.initialize = function () {
    console.log('Swarmlet initialized');
};

*/
