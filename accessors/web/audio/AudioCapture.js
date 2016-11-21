// Copyright (c) 2014-2015 The Regents of the University of California.
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

/** Capture audio from the microphone. 
 *
 *  This accessor requires the optional 'audio' module, which may or may
 *  not be provided by an accessor host. 
 *
 *  @accessor audio/AudioCapture
 *  @author  Ilge Akkya
 *  @version $$Id$$
 *  @input trigger Input that triggers recording.
 *  @output {number} signal A sequence of numbers representing the captured audio signal.
 */

// Stop extra messages from jslint and jshint.  Note that there should be no
// space between the / and the * and global. See https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSHint */
/*globals addInputHandler, exports, input, output, removeInputHandler, require, send */
/*jshint globalstrict: true*/
"use strict";

exports.setup = function() {
    this.input('trigger');
    this.output('signal',{'type':'number'});  
};

var recorder = null; 
var handle = null;
var audio = require("audio");
var cacheLength = 128;  

var record = function() {
    var data = recorder.get(), i; 
    for (i = 0; i < data.length; i++) {
        this.send('signal', data[i]);
    }
};

exports.initialize = function() { 
    handle = this.addInputHandler("trigger",record); 
    recorder = new audio.Capture(); 
};

exports.wrapup = function() {
    if (recorder !== null) { 
        recorder.stop();
        this.removeInputHandler('trigger',handle);
    } 
};
