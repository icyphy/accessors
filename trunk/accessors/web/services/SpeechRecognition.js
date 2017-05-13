// Speech recognition accessor.
//
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

/** Speech recognition accessor.  This accessor opens an audio channel, listens
 * for speech, then returns text.
 *
 *  @accessor services/SpeechRecognition
 *  @input start Start listening for speech.  
 *  @input stop Stop listening for speech.
 *  @output text The text of any detected speech.
 *  @author Elizabeth Osyk
 *  @version $$Id$$
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*globals console, error, exports, require */
/*jshint globalstrict: true*/
"use strict";

var speechRecognition = require('@accessors-modules/speech-recognition');

/** Create a SpeechRecognition accessor.
 */
exports.setup = function () {
    this.parameter('continuous', {
                'type' : 'boolean', 
                'value' : false
            });
        
    this.input('start', {
                'type': 'boolean'
                    });
        
    this.input('stop', {
                'type': 'boolean'
                    });
                
    this.output('text', {
                'type': 'string'
                    });
};

/** Register input handlers for start and stop events and set up event handler
 * for recognition results.
 */
exports.initialize = function () {
    var self = this;
        
    var options = {};
    options.continuous = this.getParameter('continuous');
    this.recognition = new speechRecognition.SpeechRecognition(options);
        
    this.recognition.on('result', function(result) {
                self.send('text', result);
            });
        
    this.addInputHandler('start', function() {
                // Recheck continuous mode parameter in case it has changed.
                options.continuous = self.getParameter('continuous');
                self.recognition.setOptions(options);
                
                if (self.get('start')) {
                    self.recognition.start();
                }
            });
        
    this.addInputHandler('stop', function() {
                if (self.get('stop')) {
                    self.recognition.stop();
                }
            });
};
