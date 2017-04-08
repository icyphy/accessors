// Copyright (c) 2015-2016 The Regents of the University of California.
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

/** Accessor to play an audio signal.
 *  This accessor accepts as input in a variety of formats and plays
 *  back the audio encoded in those input values.
 *  
 *  This accessor queues the data to be played by the audio system.
 *  When the data has been accepted by the audio system to be played,
 *  it produces an output with value true. That output should be used
 *  as a trigger to provide more audio data. If that new output data
 *  is provided before the previously data has been drained by the audio
 *  queue, then continuous audio with no gaps is possible.
 *  If on the other hand input data is provided too quickly, then it
 *  will overwrite the data in the output buffer, thereby creating
 *  considerable distortion. If it is provided too slowly, then there
 *  will be gaps in the output audio.
 *
 *  The _inputFormat_ parameter specifies the form in which the audio
 *  input will be provided. The available formats include:
 *  
 *  * "raw": The input is a byte array representing audio data exactly as
 *    captured by default on the host.
 *  * "array": The audio input data is an array of arrays of numbers,
 *    where each number is in the range from -1.0 to 1.0.
 *    The first index of the input specifies the channel number.
 *  * "encoded": The audio input data is a byte array containing audio
 *    data encoded in one of the file format standards such as 
 *    AIFF (historically associated with Apple computers),
 *    AIFF-C (a compressed version of AIFF),
 *    AU (historically associated with Sun Microsystems and Unix computers), or
 *    WAVE (historically associated with Windows PCs).
 *  
 *  The _playbackOptions_ parameter is an object with the following properties,
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
 *  @input input The audio data.
 *  @output accepted An indicator that the audio data has been queued
 *   to the audio system.
 *  @parameter inputFormat The format of the input data.
 *  @parameter playbackOptions The playback options.
 *
 *  @accessor audio/AudioPlayer
 *  @author Edward A. Lee (eal@eecs.berkeley.edu)
 *  @version $$Id$$
 */

// Stop extra messages from jslint and jshint.  Note that there should be no
// space between the / and the * and global. See https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSHint */
/*globals exports, require*/
/*jshint globalstrict: true*/
"use strict";

// Set up the accessor.
exports.setup = function () {
    this.input('input');
    this.output('accepted', {
        type: 'boolean',
        spontaneous: true,
    });
    this.parameter('inputFormat', {
        type: 'string',
        value: 'raw',
        options: ['raw', 'array', 'encoded']
    });
    this.parameter('playbackOptions', {
        value: {
            bitsPerSample: 16,
            channels: 1,
            sampleRate: 8000
        }
    });
};

var player = null;
var audio = require("audio");

exports.initialize = function () {
    var self = this;
    player = new audio.Player(
        self.getParameter('inputFormat'),
        self.getParameter('playbackOptions'));
    self.addInputHandler('input', function () {
        // FIXME: Input format.
        player.play(self.get('input'), function () {
            self.send('accepted', true);
        });
    });
};

exports.wrapup = function () {
    if (player !== null) {
        player.stop();
        player = null;
    }
};
