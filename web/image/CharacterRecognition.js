// Copyright (c) 2017 The Regents of the University of California.
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

/** An optical character detection accessor.  This accessor takes an input image
 *  and attempts to recognize text in the image.  It considers the whole image,
 *  so it works best if the image is pre-cropped to the portion containing only
 *  text.
 *
 *  This accessor uses Tesseract.js, an open source optical character
 *  recognition tool, available under the Apache 2.0 license.
 *  http://tesseract.projectnaptha.com/
 *
 *  @accessor image/CharacterDetection
 *  @input input An image
 *  @input (JSON) options A JSON object of options.  See:
 *  https://github.com/naptha/tesseract.js/blob/master/docs/tesseract_parameters.md
 *  @output {String} text A string of any text recognized in the image.
 *  @author Elizabeth Osyk
 *  @version $$Id$$
 */

// FIXME:  Handle options.  Does nothing currently.
// TODO:  Add output for meta-information? (E.g. detection quality)
// TODO:  Add output with image showing where the text was found?

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*globals addInputHandler, console, exports, get, getParameter, input, output, removeInputHandler, require, send  */
/*jshint globalstrict: true */
"use strict";

var Tesseract = null;
try {
    Tesseract = require('tesseract');
} catch (error) {
    console.log("The tesseract module was not present.  The CharacterRecognition accessor is not supported on this accessor host.");
}

exports.setup = function () {
    this.input('input');
    this.input('options'); // FIXME:  Handle options.  Does nothing currently.
    this.output('text', {
        'type': 'string'
    });
};

exports.initialize = function () {
    var self = this;
    this.window = {};
    this.addInputHandler('input', function () {
        var image = this.get('input');

        Tesseract.recognize(image)
            // Optionally: Log progress.
            // .progress(function(p) {console.log('progress', p);})
            .then(function (result) {
                self.send('text', result.text);
            });
    });
};
