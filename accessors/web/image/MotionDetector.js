// Copyright (c) 2015 The Regents of the University of California.
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

/** A motion detector accessor.
 *  This accessor compares each input image against the previous
 *  input image. There are three outputs.
 *  The one named 'output' is a modified image that graphically illustrates
 *  the center of gravity of motion, if motion is detected.
 *  If enough of the pixels differ by enough, then the 'cog'
 *  output will produce the center of gravity of the pixels that
 *  differ by enough.
 *  Finally, the 'area' output produces the percentage of area
 *  covered by motion in the input image, where 0 means no motion
 *  and 100 means full image motion.
 *  
 *  The options parameter can include the following fields:
 *  * _PixelThreshold_: Intensity threshold whereby a pixel is
 *    deemed to different (an int in the range of 0 to 255, with default 25).
 *  * _AreaThreshold_: The percentage threshold of image
 *    that has different pixels for motion to be detected
 *    (a double 0-100, with default 0.2).
 *  * _ModifyImage_: If true (the default), the modify the
 *    provided image with a visual indication of the location
 *    and amount of motion.
 *
 *  The implementation for the Ptolemy II host is taken from
 *  the webcam-capture package by Bartosz Firyn (SarXos), available from
 *  [https://github.com/sarxos/webcam-capture](https://github.com/sarxos/webcam-capture).
 *  The webcam-capture package is licensed under the MIT License.
 * 
 *  @accessor image/MotionDetector
 *  @input input A stream of images.
 *  @input {{"PixelThreshold": number, "AreaThreshold": number}} options The options controlling the filter.
 *  @output {array<{'horizontal': 'number', 'vertical': 'number'}>} cog The horizontal and vertical position of the center of gravity of motion, in pixels.
 *  @output {Object} output The filtered image.
 *  @author Edward A. Lee
 *  @version $$Id$$
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*globals addInputHandler, exports, get, getParameter, input, output, removeInputHandler, require, send  */
/*jshint globalstrict: true */
"use strict";

var motionDetector = require('motionDetector');

exports.setup = function() {
    input('input');
    output('output');
    output('cog');
    output('area', {'type':'number'});
    input('options', {'value':'{"PixelThreshold": 25, "AreaThreshold": 0.2}', 'type':'JSON'});
};

exports.initialize = function() {
    addInputHandler('input', function() {
        var options = get('options');
        var image = get('input');
        var result = motionDetector.filter(image, options);
        send('output', result);
        var cog = motionDetector.cog();
        if (cog) {
            send('cog', cog);
        }
        send('area', motionDetector.area());
    });
};

