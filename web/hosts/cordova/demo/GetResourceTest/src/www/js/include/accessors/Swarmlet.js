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

/** This swarmlet demos the asynchronous usage of the getResource accessor in Cordova.
 *  
 *  See https://www.icyphy.org/accessors/wiki/Main/CordovaHost2
 *  
 *  @module swarmlet.js
 *  @author Matt Weber
 *  @version $$Id: swarmlet.js 1502 2017-04-17 21:34:03Z cxh $$
 */

exports.setup = function() {
    console.log('Swarmlet setup...');

    var trigger = this.instantiate('trigger', 'test/TestSpontaneousOnce');

    trigger.setParameter('delay', 1000.0);
    trigger.setParameter('value', true);

    //The Cordova host's implementation of getResource is asynchronous. It can
    //be invoked like this:
//     this.getResource("https://ptolemy.berkeley.edu/accessors/index.html", 4000,
//      // this.getResource("https://httpstat.us/400", {},
//      // this.getResource("test.txt", {},
//      // this.getResource("file:///android_asset/www/test.txt", 2000,
//          function(status, value){
//             console.log("status: " + status);
// //            if(status != null) console.log(status);
//             console.log("value: ");
//             if(value != null) console.log(value);
//     });

    var gr = this.instantiate('GetResource', 'utilities/GetResource');
    gr.setDefault('resource', 'test.txt');
    gr.setDefault('options', {"timeout": 3000 });
    gr.setParameter('synchronous', false);

    var disp = this.instantiate('jsDisplay', 'JSONDisplay');
    // gr.setDefault('resource', 'https://www.google.com');


    this.connect(trigger, 'output', gr, 'trigger');
    this.connect(gr, 'output', disp, 'JSON');

    console.log('Swarmlet setup ended.');
};

exports.initialize = function () {
    console.log('Swarmlet initialized');
};
