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

/** This accessor annotates an image provided at the _image_ input
 *  by rendering an SVG graphic overlaid on the image.
 *
 *  The _graphic_ input, if provided, gives an SVG specification of the graphic.
 *  Alternatively, if a _graphic_ input is not provided, or the _graphic_ input
 *  is empty, the _graphicURI_ input can provide a resource identifier for the graphic.
 *  This can be a URL or a local resource (a file) available on the host.
 *  Note that most hosts will restrict locations from which files can be read.
 *  Usually they will allow to read files in the directory where the swarmlet is located
 *  on the file system, or in a subdirectory of that directory.
 *  To read such a file, give a path relative to the location of the swarmlet.
 *
 *  The _translate_
 *  input can be used to shift the graphic in the X and Y directions,
 *  and the _rotate_ input can used to rotate the graphic.
 *
 *  The _options_ input can have the following fields:
 *  * __XOffset__: The horizontal offset for the graphic. If this is specified
 *    and a _translate_ input is also provided, the both offsets are applied.
 *  * __YOffset__: The vertical offset for the graphic. If this is specified
 *    and a _translate_ input is also provided, the both offsets are applied.
 *
 *  @accessor image/ImageAnnotate
 *  @input image The image to annotate.
 *  @input graphic The location of an SVG graphic to overlay on the image.
 *  @input translate An offset to apply to the graphic, as two element array specifying
 *   horizontal and vertical offsets in pixels.
 *  @input options A JSON object specifying options.
 *  @output output The filtered image.
 *  @author Edward A. Lee
 *  @version $$Id$$
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*globals addInputHandler, exports, get, getResource, input, output, removeInputHandler, require, send */
/*jshint globalstrict: true */
"use strict";

var imageFilters = require('imageFilters');

exports.setup = function() {
    this.input('image');
    this.input('graphic', {'value':'', 'type':'string'});
    this.input('graphicURI', {'value':'', 'type':'string'});
    this.input('scale', {'value':1.0, 'type':'number'});
    this.input('rotation', {'value':0.0, 'type':'number'});
    this.input('translate');
    this.input('options', {'value':'', 'type':'JSON'});
    this.output('output');
};

exports.initialize = function() {
    this.addInputHandler('image', function() {
        var image = this.get('image');
        var options = this.get('options');
        if (!options) {
            options = {};
        }

        var scale = this.get('scale');
        if (scale !== null) {
            // Combine with scale options, if specified.
            if (options.Scale) {
                scale *= options.Scale;
            }
            options.Scale = scale;
        }

        var rotation = this.get('rotation');
        if (rotation !== null) {
            // Combine with rotation options, if specified.
            if (options.Rotation) {
                rotation += options.Rotation;
            }
            options.Rotation = rotation;
        }

        var translate = this.get('translate');
        if (translate !== null && translate[0] !== null && translate[1] !== null) {
            // Combine with offset options, if specified.
            var xOffset = translate[0];
            if (options.XOffset) {
                xOffset += options.XOffset;
            }
            options.XOffset = xOffset;

            var yOffset = translate[1];
            if (options.YOffset) {
                yOffset += options.YOffset;
            }
            options.YOffset = yOffset;
        }
        var graphic = this.get('graphic');
        if (graphic) {
            options.Graphic = graphic;
        } else {
            var graphicURI = this.get('graphicURI');
            if (graphicURI) {
                // Second argument is a timeout.
                options.Graphic = this.getResource(graphicURI, 3000);
            }
        }
        var result = imageFilters.filter(image, 'Annotate', options);
        this.send('output', result);
    });
};
