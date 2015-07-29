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
AprilTags were created by Associate Professor Edwin Olson (ebolson@umich.edu),
EECS, University of Michigan. See https://april.eecs.umich.edu/.

To use this accessor in the Ptolemy II/Nashorn accessor host,
you have separately install a modified version of the
AprilTags code by Edwin Olson. This has to be a separate install, because
(sadly) the code is GPL'd.  See: http://ptolemy.eecs.berkeley.edu/~eal/aprilTags/

@accessor AprilTags
@author Edward A. Lee (eal@eecs.berkeley.edu)
@input input An input image.
@output output An output image, with detected AprilTags outlined in green and identified.
@output tags An array of objects, one object for each tag detected in the image.
@parameter options The options for the detector.
*/
var aprilTags = require('aprilTags');

exports.setup = function() {
    input('input');
    output('output');
    output('tags');
    input('options', {'value':{}});
}

exports.initialize = function() {
    handle = addInputHandler('input', function() {
        var options = get('options');
        var token = get('input');
        var image = token.asAWTImage();
        var result =aprilTags.filter(image, options);
        send('output', result);
        var tags = aprilTags.tags();
        if (tags) {
            send('tags', tags);
        }
    });
}

exports.wrapup = function() {
    if (handle) {
        removeInputHandler(handle);
    }
}