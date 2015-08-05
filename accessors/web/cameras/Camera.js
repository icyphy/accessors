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

/** An accessor for a camera on the local host. This can be a built-in camera or
 *  a USB-connected camera. This accessor has two modes of operation, "triggered"
 *  and "open loop." In triggered mode, it captures an image whenever a trigger
 *  input is received and produces that image on its output. In open-loop mode,
 *  it captures every image produced by the camera, at the speed of the camera,
 *  and produces on the output a stream of such images.
 * 
 *  @accessor Camera
 *  @author Edward A. Lee (eal@eecs.berkeley.edu)
 *  @input trigger A trigger input for triggered mode. The value is ignored and can be anything.
 *  @output {Object} image A stream of captured images.
 *  @parameter {boolean} triggered If true, use triggered mode. Otherwise, use open-loop mode. This is a boolean that defaults to true.
 *  @parameter {string} camera The name of the camera to use. A list of available cameras is presented as options. This is a string that defaults to "default camera", which uses the system default, if there is one.
 *  @parameter {{width: number, height: number}} viewSize The view size to use for capture, in pixels. A list of available view sizes for the selected camara is presented as options. This is a JSON specification with a "width" and "height" field, as in for example {"width":640, "height":480}.
 */
var cameras = require("cameras");
var camera;
var handle = null;

/** Create the inputs, outputs, and parameters, and update the parameters for the selected camera. */
exports.setup = function() {
  input('trigger');
  output('image');
  parameter('triggered', {'type':'boolean', 'value':true});
  parameter('camera', {'type':'string', 'value':'default camera', 'options':cameras.cameras()});
  // NOTE: The following assumes that setup() is reinvoked whenever a parameter value changes,
  // since the camera will change and so will the available options.
  camera = new cameras.Camera(getParameter('camera'));
  parameter('viewSize', {'type':'JSON', 'value':camera.getViewSize(), 'options':camera.viewSizes()});
}

/** Set the view size of the camera, open it, and depending on the triggered mode, either
 *  set up an input handler for the trigger input or set up a handler for the 'image'
 *  event notification from the camera.
 */
exports.initialize = function() {
  camera.setViewSize(getParameter('viewSize'));
  camera.open();
  if (getParameter('triggered')) {
    handle = addInputHandler('trigger', function() {
      send('image', camera.snapshot());
    });
  } else {
    camera.on('image', function(image) {
      send('image', image);
    });
  }
}

/** Remove handlers and close the camera. */
exports.wrapup = function() {
  camera.removeAllListeners('image');
  if (handle != null) {
    removeInputHandler(handle);
  }
  camera.close();
}
