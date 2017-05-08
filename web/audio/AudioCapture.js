// Copyright (c) 2015-2017 The Regents of the University of California.
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

/** Capture audio from the default audio source on the host (typically the
 *  microphone or line in).
 *
 *  If the _triggered_ parameter is true (the default), then capture starts
 *  when an event appears on the _trigger_ input port and stops after capturing
 *  one segment of audio. Otherwise, the accessor continuously captures segments
 *  of audio, initiating a new capture after each segment is completed.
 *  The _captureTime_ parameter specifies the duration of each segment
 *  of audio that is captured (in milliseconds).
 *
 *  The _outputFormat_ parameter specifies the form in which the audio
 *  should appear on the output. The available formats may include:
 *
 *  * "raw": The output is a byte array representing audio data exactly as
 *    captured by default on the host. This is the default and is
 *    supported by all hosts.
 *  * "array": The audio data is converted into an array of arrays of numbers (one
 *    array per channel), where each number is in the range from -1.0 to 1.0.
 *    The output is an array of arrays, where the first index specifies
 *    the channel number.
 *  * "aiff": The audio data is converted into the AIFF file format historically
 *    associated with Apple computers.
 *  * "aifc": The audio data is converted into the AIFF-C, a compressed version
 *    of AIFF.
 *  * "au": The audio data is converted into the AU file format historically
 *    associated with Sun Microsystems and Unix computers.
 *  * "wav": The audio data is converted into the WAVE file format historically
 *    associated with Windows PCs.
 *
 *  The _captureFormat_ parameter is an object with the following properties,
 *  all of which are optional:
 *
 *  * _bitsPerSample_: The number of bits per sample. This is an integer that
 *    defaults to 16.
 *  * _channels_: The number of channels. This defaults to 1.
 *  * _sampleRate_: The sample rate. This is an integer that defaults to 8000.
 *    Typical supported sample rates are 8000, 11025, 22050, 44100, and 48000.
 *
 *  This accessor requires the optional 'audio' module, which may or may
 *  not be provided by an accessor host. Moreover, a host may not support
 *  all capture formats and all output formats.
 *
 *  The default captureFormat is  {bitsPerSample: 16, channels: 1, sampleRate: 8000}.
 *
 *  @accessor audio/AudioCapture
 *  @author  Edward A. Lee and Ilge Akkya
 *  @input trigger A trigger input for triggered mode.
 *   The value is ignored and can be anything.
 *  @output {Object} signal The audio output.
 *  @parameter captureFormat The details of the audio format as an object.
 *   See the accessor comment for the default.
 *  @parameter {int} captureTime The length of time for each audio capture
 *   (in milliseconds).
 *   This defaults to 1000, capturing 1 second of audio at a time.
 *  @parameter {string} outputFormat The format of the output data representing
 *   captured audio. This is a string that defaults to 'raw', meaning that
 *   the raw bytes are produced on the output.
 *  @parameter {boolean} triggered If true, use triggered mode.
 *   Otherwise, use open-loop mode. This is a boolean that defaults to true.
 *   This parameter is checked only upon initialization.

 *  @version $$Id$$
 *  @input trigger Input that triggers recording.
 *  @output {number} signal A sequence of numbers representing the captured audio signal.
 */

// Stop extra messages from jslint and jshint.  Note that there should be no
// space between the / and the * and global. See https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSHint */
/*globals addInputHandler, error, exports, input, output, removeInputHandler, require, send */
/*jshint globalstrict: true*/
"use strict";

var audio = require("audio");

exports.setup = function () {
    this.input('trigger');
    this.parameter('captureFormat', {
        value: {
            bitsPerSample: 16,
            channels: 1,
            sampleRate: 8000
        }
    });
    this.parameter('captureTime', {
        type: 'int',
        value: 1000
    });
    this.parameter('outputFormat', {
        type: 'string',
        value: 'raw'
    });
    this.parameter('triggered', {
        type: 'boolean',
        value: true
    });
    this.output('signal');

    // Retrieve the supported outputFormat options from the audio module.
    // This is in a try-catch so that this accessor can be instantiated even if the
    // host does not provide a audio module.
    try {
        this.parameter('outputFormat', {
            type: 'string',
            value: 'raw',
            'options': audio.byteFormats()
        });
    } catch (err) {
        error(err);
    }
};

var recorder = null;
var cacheLength = 128;

exports.initialize = function () {
    var self = this;
    recorder = new audio.Capture(
        self.getParameter('captureTime'),
        self.getParameter('outputFormat'),
        self.getParameter('captureFormat')
    );
    recorder.on('capture', function (audioData) {
        self.send('signal', audioData);
        if (self.getParameter('triggered')) {
            recorder.stop();
        }
    });

    if (self.getParameter('triggered')) {
        this.addInputHandler("trigger", function () {
            recorder.start();
        });
    } else {
        recorder.start();
    }
};

exports.wrapup = function () {
    if (recorder !== null) {
        recorder.stop();
    }
};
