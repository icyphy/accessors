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
 * @author Ilya Y. Rostovtsev
 * @version $Id$
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*global console, exports, require */
/*jshint globalstrict: true */
"use strict";

var audio, blockSize, channels, signalInputHander, signalJsonInputHandler;

audio = require('audio-io');

signalInputHander = null;

signalJsonInputHandler = null;

channels = null;

blockSize = null;

exports.playArray = function() {
    var audioVector;
    audioVector = this.get('signal');
    console.log("Audio Play (array), channels: " + channels + ", data size : " + audioVector.length);
    audio.play(channels, audioVector);
};

exports.playJSON = function(audioJSON) {
    audioJSON = this.get('signalJSON');
    console.log("Audio Play (JSON), channels: " + audioJSON.channels + ", data size : " + audioJSON.data.length);
    audio.play(audioJSON.channels, audioJSON.data);
};

exports.setup = function() {
    this.parameter('numOutputChannels', {
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
    this.input('signal');
    this.input('signalJSON', {
        type: 'json'
    });
};

exports.initialize = function() {
    console.log("Audio Play Initialize... Initializing...");
    console.log("Number Output Channels : " + this.getParameter('numOutputChannels'));
    console.log("Sampling Rate : " + this.getParameter('samplingRate'));
    console.log("Block Size : " + this.getParameter('blockSize'));
    channels = this.getParameter('numOutputChannels');
    blockSize = this.getParameter('blockSize');
    audio.initialize(0, channels, this.getParameter('samplingRate'), blockSize);
    signalInputHander = this.addInputHandler('signal', this.exports.playArray.bind(this));
    signalJsonInputHandler = this.addInputHandler('signalJSON', this.exports.playJSON.bind(this));
};

exports.wrapup = function() {
    audio.wrapup();
    this.removeInputHandler('signal', signalInputHander);
    this.removeInputHandler('signalJSON', signalJsonInputHandler);
};
