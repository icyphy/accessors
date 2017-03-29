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
 *  This accessor accepts as input an array of arrays of audio samples,
 *  one per channel. The samples are numbers in the range between -1.0 to 1.0.
 *  It queues the data in the array to be played by the audio system.
 *  When the data has been accepted by the audio system to be played,
 *  it produces an output with value true. That output should be used
 *  as a trigger to provide more output data. If that new output data
 *  is provided before the previously data has been drained by the audio
 *  queue, then continuous audio with no gaps is possible.
 *  If on the other hand input data is provided too quickly, then it
 *  will overwrite the data in the output buffer, thereby creating
 *  considerable distortion.
 *  
 *  FIXME: This accessor is incomplete. It should accept more formats
 *  compatible with AudioCapture.
 *  
 *  @input input The audio data.
 *  @output accepted An indicator that the audio data has been queued
 *   to the audio system.
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
};

var player = null;
var audio = require("audio");

exports.initialize = function () {
    var self = this;
    player = new audio.Player(null, "raw");
    self.addInputHandler('input', function() {
        // FIXME: Input format.
        player.play(self.get('input'), function() {
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
