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
 * @accessor audioIo/AudioIoCapture
 * @author Ilya Y. Rostovtsev
 * @version $$Id$$
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*global console, exports, require */
/*jshint globalstrict: true */
"use strict";

var audio, recording, triggerHandler;

audio = require('audio-io');

triggerHandler = null;

recording = false;

exports.record = function () {
    console.log("record funciton triggered...");
    recording = !recording;
    console.log("recording is " + recording);
    if (recording === true) {
        console.log("passing onData callback to audio.capture");
        audio.capture(this.exports.onData.bind(this));
    } else {
        console.log("passing a null callback to audio.capture");
        audio.capture(null);
    }
};

exports.setup = function () {
    console.log("Audio Capture Setup");
    this.parameter('numInputChannels', {
        type: 'number',
        value: 1
    });
    this.parameter('samplingRate', {
        type: 'number',
        value: 44100
    });
    this.parameter('blockSize', {
        type: 'number',
        value: 512
    });
    this.input('trigger');
    this.output('signal');
};

exports.onData = function (audioVector) {
    this.send('signal', audioVector);
};

exports.initialize = function () {
    console.log("Audio Capture Initialize... Initializing...");
    console.log("Number Input Channels : " + this.getParameter('numInputChannels'));
    console.log("Sampling Rate : " + this.getParameter('samplingRate'));
    console.log("Block Size : " + this.getParameter('blockSize'));
    audio.initialize(this.getParameter('numInputChannels'), 0, this.getParameter('samplingRate'), this.getParameter('blockSize'));
    console.log("Registering the trigger handler for 'trigger'");
    triggerHandler = this.addInputHandler('trigger', this.exports.record.bind(this));
    recording = false;
};

exports.wrapup = function () {
    console.log("Audio Capture Wrapup");
    audio.wrapup();
    this.removeInputHandler('trigger', triggerHandler);
};
