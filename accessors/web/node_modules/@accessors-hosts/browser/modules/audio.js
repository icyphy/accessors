// Below is the copyright agreement for the Ptolemy II system.
//
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
// Ptolemy II includes the work of others, to see those copyrights, follow
// the copyright link on the splash page or see copyright.htm.
/**
 * Module to access audio hardware on the host.
 * NOTE: This is very incomplete! Just a placeholder for now.
 * @module audio
 * @author Edward A. Lee, Elizabeth Osyk
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*globals Java, exports */
/*jshint globalstrict: true*/
"use strict";

/** Construct an instance of an Player object type. This should be instantiated in your
 *  JavaScript code as
 *  <pre>
 *     var Audio = require("audio");
 *     var player = new Audio.Player();
 *  </pre>
 *  An instance of this object type implements the following functions:
 *  (FIXME: replace with your design)
 *  <ul>
 *  <li> play(data): Play the specified array.
 *  <li> stop(): Stop playback and free the audio resources.
 *  </ul>
 *  @param options A JSON object with fields 'FIXME' and 'FIXME' that give the
 *   FIXME properties of the audio such as sample rate, etc. Provide reasonable
 *   defaults.
 */
exports.Player = function (options) {
    error("Player not yet implemented for browser host.");
};

/** Play audio data.
 *  @param data An array of numbers in the range -1 to 1 to be played.
 */
exports.Player.prototype.play = function (data) {
        error("Player not yet implemented for browser host.");
};

/** Stop the player and free audio resources. */
exports.Player.prototype.stop = function () {
        error("Player not yet implemented for browser host.");
};


/** Construct an instance of a ClipPlayer object type.  A ClipPlayer plays
 * audio from a URL source. This should be instantiated in your JavaScript code as:
 *  <pre>
 *     var audio = require("audio");
 *     var player = new audio.ClipPlayer();
 *  </pre>
 *  An instance of this object type implements the following functions:
 *  <ul>
 *  <li> load(url) : Load audio from the specified url.
 *  <li> play(): Play the audio from previously loaded url.
 *  <li> stop(): Stop playback.
 *  </ul>
 */

/** Create a ClipPlayer.
 */
exports.ClipPlayer = function() {
        this.clip = null;
};

/** Load audio from the specified URL.
 * @param url  The URL to load audio from.
 */
exports.ClipPlayer.prototype.load = function(url) {
        
        try {
                this.clip = new Audio(url);

        } catch(err) {
                error("Error connecting to audio URL " + url);
        } 
};

/** Play currently loaded audio clip.
 */
exports.ClipPlayer.prototype.play = function() {
    if (this.clip !== null) {
            this.clip.play();
    } else {
            error("No audio clip to play.  Please load a url first.");
    }
};

/** Stop playback. */
exports.ClipPlayer.prototype.stop = function() {
    if (this.clip !== null) {
            this.clip.pause();
    }
};


// Below is code to be added by students.

/** Construct an instance of a Capture object type. This should be instantiated in your
 *  JavaScript code as
 *  <pre>
 *     var audio = require("audio");
 *     var capture = new audio.Capture();
 *  </pre>
 *  An instance of this object type implements the following functions:
 *  (FIXME: replace with your design)
 *  <ul>
 *  <li> this.get(): Return an array of audio data.
 *  <li> stop(): Stop capture and free the audio resources.
 *  </ul>
 *  @param options A JSON object with fields 'FIXME' and 'FIXME' that give the
 *   FIXME properties of the audio such as sample rate, etc. Provide reasonable
 *   defaults.
 */
exports.Capture = function (options) {
    error("Capture not yet implemented for the browser host.");
};

/** Capture audio data.
 *  @return An array of numbers in the range -1 to 1 captured from the audio.
 */
exports.Capture.prototype.get = function (data) {
        error("Capture not yet implemented for the browser host.");
};

/** Stop the capture and free audio resources. */
exports.Capture.prototype.stop = function () {
        error("Capture not yet implemented for the browser host.");
};
