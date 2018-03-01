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

/** An accessor for playing a sound clip from a URL or a resource on the
 *  local host. The URL or resource name can be provided as a parameter or
 *  as an input. To start playing the sound, an event must be provided to the
 *  start input. An event at the stop input, or a new event at the start input,
 *  will cause the sound to stop playing.
 *
 *  @accessor audio/ClipPlayer
 *  @author Elizabeth Osyk (beth@berkeley.edu)
 *  @input start A trigger input to start playback.
 *   The value is ignored and can be anything.
 *  @input stop A trigger to stop playback.
 *   The value is ignored and can be anything.
 *  @input clipURL The URL to retrieve the sound clip from.
 *  @version $$Id$$
 */

// Stop extra messages from jslint and jshint.  Note that there should
// be no space between the / and the * and global. See
// https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSHint */
/*globals console, error, exports, output, require, send */
/*jshint globalstrict: true*/
'use strict';

var audio = require("audio");

/** Create the inputs and outputs for this accessor. */
exports.setup = function () {
    this.input('start', {
    	'value' : true
    });
    this.input('stop');
    // Use default on icyphy so that
    // https://www.icyphy.org/accessors/library/index.html?accessor=audio.ClipPlayer
    // will work.
    this.input('clipURL', {
        'type': 'string',
        'value': 'https://www.icyphy.org/accessors/src/USAD2016_06-RhapsodyInBlueTrimmed.mp3'
    });
    this.output('done', {
        'type' : 'boolean'
    });
};

/** Load the specified URL and create a player for it.  */
exports.initialize = function () {
    var self = this;
    this.player = null;
    this.previousURL = null;

    /** Check the URL and, if changed, create a new player for it.  */
    function updateURL() {
        var url = self.get('clipURL');
        if (url && url !== self.previousURL) {
            //console.log('Got a new URL: ' + url);
            if (self.player !== null) {
                self.player.stop();        // audio.js checks if it's actually playing.
            }
    		
            self.player = new audio.ClipPlayer(url);
            self.previousURL = url;
            
            self.player.on('done', function() {
                self.send('done', true);
            });
        }
    }
    // Do not update in initialize. This causes an error
    // with the default URL if there is no network connection.
    // updateURL();

    this.addInputHandler('clipURL', function () {
        updateURL();
    });

    this.addInputHandler('start', function () {
        // In case there is a new URL...
        updateURL();

        if (self.player === null || typeof self.player === 'undefined') {
            error('No clip specified.');
            return;
        } else {
            self.player.stop();        // audio.js checks if it's actually playing.
        }
        self.player.play();
    });

    this.addInputHandler('stop', function () {
        if (self.player !== null && typeof self.player !== 'undefined') {
            self.player.stop();  // audio.js checks if it's actually playing.
        }
    });
    
};

/** Stop any playback. */
exports.wrapup = function () {
    if (this.player !== null && typeof this.player !== 'undefined') {
        this.player.stop();  // audio.js checks if it's actually playing.
        this.player = null;
    }
};
