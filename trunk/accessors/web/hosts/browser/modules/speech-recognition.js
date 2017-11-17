// Copyright (c) 2017 The Regents of the University of California.
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

/**
 * ONLY works in CHROME.  Speech recognition module, using the Web Speech API.
 * https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API
 * 
 * This module recognizes speech and produces text. 
 * 
 * Many options are possible as future enhancements, including different 
 * languages and custom grammars.
 * 
 * @module speech-recognition
 * @author Elizabeth Osyk
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*globals Java, exports, require, util */
/*jshint globalstrict: true*/
"use strict";

// TODO:  Should this be a singleton, since probably only one instance can 
// can access the microphone at a time?
var EventEmitter = require('events').EventEmitter;

/** Create a SpeechRecognition object.  
 * @param options.continuous true to operate in continuous mode, false to stop
 * recognition automatically after one phrase has been detected.
 */
exports.SpeechRecognition = function (options) {
    var self = this;
    this.resultCount = 0; // If used in continuous mode, keep track of 
    // results we've already emitted.

    var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
    var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
    var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

    this.recognition = new SpeechRecognition();

    // TODO:  Allow optional gramm
    // recognition.grammars = speechRecognitionList;
    this.recognition.continuous = false;
    this.recognition.lang = 'en-US';
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;

    if (options !== null && options.hasOwnProperty('continuous')) {
        this.recognition.continuous = options.continuous;
    }

    // Propagate events. 
    // List of Web Speech API event handlers:
    // https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition#Event_handlers
    this.recognition.onresult = function (event) {
        // The event is SpeechRecognitionResultList object which is an array of
        // SpeechRecognitionResult objects.  Each object contains a 
        // .transcript and .confidence.
        // Remove any leading spaces.
        var result = event.results[self.resultCount][0].transcript;
        if (result.length > 0 && result[0] === ' ') {
            result = result.substring(1, result.length);
        }
        self.emit('result', result);
        if (options.continuous) {
            self.resultCount++;
        }
    };

    // Propagate errors.
    // List of Web Speech API errors:
    // https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognitionError/error
    this.recognition.onerror = function (err) {
        // Ignore no-speech errors.  These might occur in due to background noise.
        // Any error stops the recongition engine.  Restart in case of no-speech.
        if (err.error !== 'no-speech') {
            error('Error: ' + err.error);
        } else {
            self.recognition.onend = function () {
                self.recognition.start();
                self.recognition.onend = null;
            }
        }
    };
    /* Useful for debugging.
          
       this.recognition.onsoundstart = function() {
       console.log('sound started');
       };
        
       this.recognition.onsoundend = function() {
       console.log('sound ended');
       };
        
    */

    // TODO:  Handler for onnomatch?
};

util.inherits(exports.SpeechRecognition, EventEmitter);

/** Set options.
 * @param options.continuous true to operate in continuous mode, false to stop
 */
exports.SpeechRecognition.prototype.setOptions = function (options) {
    if (options !== null && options.hasOwnProperty('continuous')) {
        this.recognition.continuous = options.continuous;
    }
};

/** Start recognizing speech.
 * 
 */
exports.SpeechRecognition.prototype.start = function () {
    // FIXME:  Throws an error if already started (e.g. if in continuous mode).
    // Figure out how to check for this.
    this.resultCount = 0;
    this.recognition.start();
};

/** Stop recognizing speech.  Note that speech recognition stops automatically 
 * after the first phrase in non-continuous mode.
 */
exports.SpeechRecognition.prototype.stop = function () {
    this.recognition.stop();
};
