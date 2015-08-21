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


/** Accessor to play an audio signal.
 *  FIXME: This accessor is a placeholder.
 *  It just plays 2 seconds of fixed audio in initialize().
 *  You should update it to accept an input and play that.
 *
 *  @accessor AudioPlayer
 *  @author Edward A. Lee (eal@eecs.berkeley.edu)
 *  @version $Id$
 */

// Set up the accessor.
exports.setup = function() {
    // FIXME: Define your inputs and outputs here.
};

var player = null;
var audio = require("audio");

exports.initialize = function() {
    // Create an empty array.
    var sinusoid = [];
    // As a test, produce about 2 seconds of sound in 128-sample chunks.
    var n = 0;
    player = new audio.Player();
    for (var j = 0; j < 128; j++) {
        for (var i = 0; i < 128; i++) {
            // Note that in JavaScript, arrays don't have fixed size.
            // They grow as needed.
            sinusoid[i] = Math.sin(2 * Math.PI * 440 * n++/ 8000);
        }
        player.play(sinusoid);
    }
}

exports.wrapup = function() {
    if (player != null) {
        player.stop();
        player = null;
    }
}
