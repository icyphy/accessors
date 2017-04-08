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

/** A face detector accessor.
 *  This accessor detects faces in an input stream.
 *
 *  The options parameter can include the following fields:
 *  * _value_: The MinFaceSize and MaxFaceSize, which defaults to 50 and 400.
 *  * _type_: If set to 'JSON'
 *
 *  The implementation for the Ptolemy II host uses 
 *  [https://opencv.org](openCV) which is licensed under a BSD 3-clause license.
 *
 *  @accessor image/FaceDetector
 *  @input input A stream of images.
 *  @input options The value and type options.
 *  @output output The results of filtering the image according to the options
 *  @output {int} faceCount The number of faces
 *  @author Ilge Akkaya.  Contributor: Christopher Brooks
 *  @version $$Id$$
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*globals addInputHandler, exports, get, getParameter, input, output, removeInputHandler, require, send  */
/*jshint globalstrict: true */
"use strict";

var faceDetector = require('faceDetector');

exports.setup = function () {
    this.input('input');
    this.output('output');
    this.output('faceCount', {
        'type': 'int'
    });
    this.input('options', {
        'value': '{"MinFaceSize": 50, "MaxFaceSize": 400}',
        'type': 'JSON'
    });
};

exports.initialize = function () {
    var self = this;

    this.addInputHandler('input', function () {
        var options = this.get('options');
        var image = this.get('input');
        var result = faceDetector.filter(image, options, function (result) {
            self.send('output', result);
            var numFaces = faceDetector.numberOfFaces();
            self.send('faceCount', numFaces);
        });
    });
};
