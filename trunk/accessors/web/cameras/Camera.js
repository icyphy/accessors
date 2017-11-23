// Copyright (c) 2015-2017 The Regents of the University of California.
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

/** An accessor for a camera on the local host. This can be a built-in camera or
 *  a USB-connected camera. This accessor has two modes of operation, "triggered"
 *  and "open loop." In triggered mode, it captures an image whenever a trigger
 *  input is received and produces that image on its output. In open-loop mode,
 *  it captures every image produced by the camera, at the speed of the camera,
 *  and produces on the output a stream of such images. It limits the number of
 *  outputs to maxFrameRate images per second, even if the camera produces more
 *  images than that. You can use the maxFrameRate parameter to avoid overwhelming
 *  your application.
 *
 *  @accessor cameras/Camera
 *  @author Edward A. Lee (eal@eecs.berkeley.edu)
 *  @input trigger A trigger input for triggered mode.
 *   The value is ignored and can be anything.
 *  @output {Object} image A stream of captured images.
 *  @parameter {boolean} triggered If true, use triggered mode.
 *   Otherwise, use open-loop mode. This is a boolean that defaults to false.
 *  @parameter {number} maxFrameRate If not triggered, this limits the output
 *   to the specified number of frames per second. This is a number that defaults to 25.
 *  @parameter {string} camera The name of the camera to use.
 *   A list of available cameras is presented as options.
 *   This is a string that defaults to "default camera",
 *   which uses the system default, if there is one.
 *  @parameter {{width: number, height: number}} viewSize The view size
 *   to use for capture, in pixels. A list of available view sizes for
 *   the selected camara is presented as options. This is a JSON specification
 *   with a "width" and "height" field, as in for example {"width":640, "height":480}.
 *  @version $$Id$$
 */

// Stop extra messages from jslint and jshint.  Note that there should be no
// space between the / and the * and global. See https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSHint */
/*global addInputHandler, error, exports, getParameter, input, output, parameter, removeInputHandler, require, send */
/*jshint globalstrict: true*/
"use strict";

var cameras = require("@accessors-modules/cameras");
var camera;
var handle = null;

/** Create the inputs, outputs, and parameters, and update the parameters for the selected camera. */
exports.setup = function () {
    this.input('trigger');
    this.output('image');
    this.parameter('triggered', {
        'type': 'boolean',
        'value': false
    });
    this.parameter('maxFrameRate', {
        'type': 'number',
        'value': 25
    });
    // NOTE: The following assumes that setup() is reinvoked whenever a parameter
    // value changes, since the camera will change and so will the available options.
    this.parameter('camera', {
        'type': 'string',
        'value': 'default camera'
    });
    this.parameter('viewSize', {
        'type': 'JSON'
    });
    // This is in a try-catch so that this accessor can be instantiated even if the
    // host does not provide a cameras module.
    try {
        this.parameter('camera', {
            'options': cameras.cameras()
        });
        camera = new cameras.Camera(this.getParameter('camera'));
        this.parameter('viewSize', {
            'value': camera.getViewSize(),
            'options': camera.viewSizes()
        });
    } catch (err) {
        error(err);
    }
};

/** Set the view size of the camera, open it, and depending on the triggered mode, either
 *  set up an input handler for the trigger input or set up a handler for the 'image'
 *  event notification from the camera.
 */
exports.initialize = function () {
    camera.setViewSize(this.getParameter('viewSize'));
    camera.open();
    var self = this;
    if (this.getParameter('triggered')) {
        // Request a snapshot.  Note the video stream might not be playing.
        // An event will be generated when a snapshot is available.
        camera.on('snapshot', function (image) {
            self.send('image', image);
        });

        handle = this.addInputHandler('trigger', function () {
            camera.snapshot();
        });
    } else {
        var maxFrameRate = self.getParameter('maxFrameRate');
        var frameInterval = 1000.0/maxFrameRate; // In ms.
        var lastFrameTime = 0;
        camera.on('image', function (image) {
            var currentTime = Date.now();
            if (currentTime - lastFrameTime >= frameInterval) {
                self.send('image', image);
                lastFrameTime = currentTime;
            }
        });
    }
};

/** Remove handlers and close the camera. */
exports.wrapup = function () {
    camera.removeAllListeners('image');
    if (handle !== null) {
        this.removeInputHandler(handle);
    }
    camera.close();
};
