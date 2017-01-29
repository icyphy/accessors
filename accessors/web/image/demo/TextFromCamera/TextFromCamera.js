// Optical Character Recognition demo composite accessor.
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

/** Optical Character Recognition (OCR) demo using Camera and 
 *  CharacterRecognition accessors.
 *  
 *  This accessor captures a snapshot from a webcam using the Camera accessor 
 *  and feeds this image to the CharacterRecognition accessor, which attempts
 *  to identify text in the image.  The text is sent to the output.
 *  
 *  Try it out in the browser:
 *  https://www.terraswarm.org/accessors/hosts/browser/demo/textfromcamera/textfromcamera.html
 *  
 *  @accessor image/demo/TextFromCamera
 *  @input trigger Trigger the Camera accessor to take a snapshot.
 *  @output text Text detected in the snapshot.
 *  @author Elizabeth Osyk
 *  @version $$Id$$
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*globals console, error, exports, require */
/*jshint globalstrict: true*/
"use strict";

exports.setup = function () {
    this.input('trigger');
    this.output('text', {
        'type': 'string'
    });

    var camera = this.instantiate('Camera', 'cameras/Camera'),
        ocr = this.instantiate('CharacterRecognition', 
        		'image/CharacterRecognition');

    this.connect('trigger', camera, 'trigger');
    this.connect(camera, 'image', ocr, 'input');
    this.connect(ocr, 'text', 'text');
};
