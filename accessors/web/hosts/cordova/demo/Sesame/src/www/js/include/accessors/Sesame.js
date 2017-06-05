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
 *  Host. The swarmlet loads loads a 'testAcc', initializes it, provides an input
 *  and then diplays the output after caling react().
 *  
 *  See https://www.icyphy.org/accessors/wiki/Main/CordovaHost2
 *  
 *  @module swarmlet.js
 *  @author Chadlia Jerad, Victor Nouvellet
 *  @version $$Id: swarmlet.js 1502 2017-04-17 21:34:03Z cxh $$
 */

exports.setup = function() {
    console.log('setup of bleDoorOpening');

    var trigger = this.instantiate('trigger', 'test/TestSpontaneousOnce');
    var ble = this.instantiate('ble', 'BLE');
    var sesameFilter = this.instantiate('sesameFilter', 'SesameFilter');
    var door = this.instantiate('door', 'Door');

    console.log('Type of trigger: ' + typeof trigger);
    console.log('Type of ble: ' + typeof ble);
    console.log('Type of sesameFilter: ' + typeof sesameFilter);
    console.log('Type of door: ' + typeof door);

    trigger.setParameter('delay', 1000.0);
    trigger.setParameter('value', true);

    sesameFilter.setParameter('rssi', -70);
    sesameFilter.setParameter('characteristic', '0000feaa-0000-1000-8000-00805f9b34fb');
    sesameFilter.setParameter('serviceData', 'EOECYWNjZXNzb3JzADg='); //door estimote
    //sesameFilter.setParameter('serviceData', 'EOECaWN5cGh5CA=='); //ice estimote

    door.setParameter('minDoorPeriod', 20000);

    // WARNING: Do not commit this URL!!!
    door.setParameter('url', 'https:...');

    this.connect(trigger, 'output', ble, 'startScan');
    this.connect(ble, 'newDevice', sesameFilter, 'newDevice');
    this.connect(sesameFilter, 'open', door, 'trigger');
};

exports.initialize = function () {
  console.log('Sesame swarmlet initialized');
};
