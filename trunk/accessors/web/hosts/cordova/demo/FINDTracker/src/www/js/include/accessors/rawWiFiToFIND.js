// One-off accessor that converts the raw WiFi scan result into FIND compatible input
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

/** One-off accessor that converts the raw WiFi scan result into FIND compatible input
 *
 *  @author Matt Weber
 *  @version $$Id: Hello.js 1137 2016-12-06 22:13:55Z cxh $$
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*globals console, error, exports, require */
/*jshint globalstrict: true*/
"use strict";

exports.setup = function () {
    this.input('rawWiFi');
    this.output('findWiFi');
};

function findDatum( scanDatum){

    if(scanDatum.BSSID){
        this.mac = scanDatum.BSSID;
    }
    if(scanDatum.level){
        this.rssi = scanDatum.level;
    }
    
    //FIXME: the wifiScanner doesn't seem to obtain these redpin fields.
    //the hack is to set them like this.
    this.wepEnabled = false;
    this.isInfrastructure = false;
}



function rawWiFiHandler() {
    //console.log("in rawWiFiHandler");
    var findOut = [];
    var rawWiFi = this.get('rawWiFi');
    for (var i = 0; i < rawWiFi.length; i++) {
        var datum = new findDatum(rawWiFi[i]);
        findOut.push(datum); 
    }
    //console.log(JSON.stringify(redPinOut));
    this.send('findWiFi', JSON.stringify(findOut));
}

exports.initialize = function () {
    this.addInputHandler('rawWiFi', rawWiFiHandler);
};
