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

/**
Accessor to detect AprilTags in an image or stream of images.
An AprilTag is a pattern of dark and light squares similar to a QR code but easier for
cameras to detect robustly and at a distance.
AprilTags were created by Associate Professor Edwin Olson (ebolson@umich.edu),
EECS, University of Michigan. See [https://april.eecs.umich.edu/](https://april.eecs.umich.edu/#in_browser).

The implementation of this accessor on the Ptolemy II/Nashorn accessor host
uses an older Java implementation of the AprilTags detector written by Edwin Olson
and more recently supplanted by a C version that performs much better. But this Java
version is more easily included in Ptolemy II in a portable way. If you need better
performance, consider replacing this with the C implementation and using JNI to interface
to Ptolemy II.

The input to this accessor is an image or a stream of images, e.g. from the Camera
accessor.  There are two outputs. The one named _output_ is a modified version
of the input image that outlines any detected AprilTags in the image
and indicates their center and ID.  The _tags_ output is an array of
objects representing the detected tags. Each object includes the following fields:

+ _id_: The ID of the detected tag.
+ _center_: An array with two doubles giving the center of the tag in pixel coordinates.
+ _perimeter_: An array with four arrays, each of which gives the x and y coordinates of
  a corner of the AprilTag.

The AprilTags detector has a large number of parameters that can be tuned via
the _options_ input. To set an option, provide a JSON object with a field matching
the option name.  The options are described below using descriptions provided by
by Edwin Olson in his Java implementation of an AprilTag detector:

+ _MagThresh_: When growing components, the intra component variation is
  allowed to grow when the component is small in size. This
  threshold affects how much. The default is 1200.
+ _MaxEdgeCost_: Set the maximum angle range allowed for the gradient directions
  when connecting edges, in radians. This defaults to the radian
  equivalent of 30 degrees.
+ _MinMag_: Set the gradient magnitude threshold for ignoring pixels.
  Do not consider pixels whose gradient magnitude is less than
  minMag. Small values make the detector more sensitive, but also
  force us to consider many more edges resulting in slower
  computation time. A value of 0.001 is very sensitive. A value
  of 0.01 is quite fast. The default is 0.004.
+ _SegDecimate_: Set whether decimating before segmenting is enabled.
  Instead of blurring the input image before segmentation, we
  can achieve similar effects by decimating the image by a factor
  of two. When enabled, this option applies a block LPF filter of
  width 2, then decimates the image. With this option, not only
  can we safely set segSigma = 0, but the slowest part of the
  algorithm (the segmentation) runs about 4 times faster. The
  downside is that the position of the targets is determined
  based on the segmentation: lower resolution will result in more
  localization error. However, the effect on quality is quite
  modest, and this optimization is generally recommended (along
  with segSigma = 0). If segSigma is non-zero, the filtering by
  segSigma occurs first, followed by the block LPF, and the
  decimation. This defaults to false, indicating that the option
  is not enabled.
+ _SegSigma_: Set the Gaussian smoothing kernel applied to image (0 == no filter)
  used when detecting the outline of the box. It is almost always
  useful to have some filtering, since the loss of small details
  won't hurt. Recommended value = 0.8 (the default). The case where sigma ==
  segsigma has been optimized to avoid a redundant filter
  operation.
+ _Sigma_: Set the Gaussian smoothing kernel applied to image (0 == no filter, the default)
  used when sampling bits. Filtering is a good idea in cases
  where A) a cheap camera is introducing artifical sharpening, B)
  the bayer pattern is creating artifcats, C) the sensor is very
  noisy and/or has hot/cold pixels. However, filtering makes it
  harder to decode very small tags. Reasonable values are 0, or
  [0.8, 1.5].
+ _TagFamily_: Set the name of the tag family being detected.
  This defaults to "Tag36h11".
  The supported families are "Tag16h5", "Tag25h7", "Tag25h9", "Tag36h10", and "Tag36h11".
  The default family seems least susceptible to false positives.
+ _ThetaThresh_: When growing components, the intra component variation is
  allowed to grow when the component is small in size. This
  threshold affects how much. The default is 100.

  @accessor image/AprilTags
  @author Edward A. Lee (eal@eecs.berkeley.edu)
  @input input An input image.
  @output output An output image, with detected AprilTags outlined in green and identified.
  @output tags An array of objects, one object for each tag detected in the image.
  @parameter options The options for the detector. This is a JSON object with fields defined above.
  It defaults to an empty object, meaning to use default values for all the otpions.
  @version $$Id$$ 
*/

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*globals addInputHandler, exports, get, input, output, removeInputHandler, require, send,  */
/*jshint globalstrict: true */
"use strict";

var aprilTags = require('aprilTags');

exports.setup = function() {
    input('input');
    output('output');
    output('tags');
    input('options', {'type':'JSON', 'value':''});
};

var handle;
exports.initialize = function() {
    handle = addInputHandler('input', function() {
        var options = get('options');
        var image = get('input');
        var result = aprilTags.filter(image, options);
        send('output', result);
        var tags = aprilTags.tags();
        if (tags) {
            send('tags', tags);
        }
    });
};

exports.wrapup = function() {
    if (handle) {
        removeInputHandler(handle);
    }
};
