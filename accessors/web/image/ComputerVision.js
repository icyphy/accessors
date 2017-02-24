// A computer vision accessor.
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

/** A computer vision accessor.  This accessor takes an input image, applies
 *  a computer vision transformation, and outputs the modified image.
 *  
 *  The input may be an image or a path to a local image.  Remote images are not
 *  supported due to browser security restrictions - a browser will not allow
 *  a remote image to be exported from a canvas.
 * 
 *  This accessor uses the computer vision library from UC Irvine, 
 *  https://github.com/ucisysarch/opencvjs
 *  Please cvlicense.txt in /accessor/web/hosts/browser/modules/cvlicense.txt
 *  
 *  To run, please point your browser to:
 *  https://www.terraswarm.org/accessors/hosts/browser/demo/computervision/computervision.html
 *
 *  To run locally, please download these 2 files:
 *  http://ucisysarch.github.io/opencvjs/examples/cv.js
 *  and place in 
 *  /accessors/web/hosts/browser/modules
 *  
 *  https://github.com/ucisysarch/opencvjs/blob/master/build/cv.data
 *  and place in the directory with your demo, e.g.
 *  /accessors/web/hosts/browser/demo/computerVision/computerVision
 *  
 *  @accessor image/ComputerVision
 *  @input input (string or image) An image or path to a local image.  Remote 
 *  images are not supported due to browser security restrictions - a browser 
 *  will not allow a remote image to be exported from a canvas.
 *  @output output (image) A modified image.
 *  @parameter options (JSON) Options for the selected transform, if any.
 *  @parameter transform (string) The transform to apply to the image.  Selected
 *   from a list.
 *  @author Elizabeth Osyk
 *  @version $$Id$$
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*globals addInputHandler, exports, get, getParameter, input, output, removeInputHandler, require, send  */
/*jshint globalstrict: true */

var CV = null;
var cv = null;

try {
    CV = require('computerVision');
    cv = new CV.CV();
} catch (error) {
    console.log("The CV module was not present.  The ComputerVision accessor " +
    		"is not supported on this accessor host.");
}

/** Create inputs, outputs and parameters for the accessor.
 */
exports.setup = function() {
    this.input('input');
    this.parameter('options', {
    	type: 'JSON'
    });
    this.parameter('transform', {
    	type: 'string',
    	options: ['findEdges'],
    	value: 'findEdges'
    });
    this.output('output');
    
};

/** Register an input handler to apply the selected transformation on each input 
 * image.
 */
exports.initialize = function() {
	var self = this;
	
    this.addInputHandler('input', function() {
    	cv.setInput(self.get('input'));
    	
    	cv.once('ready', function(){
        	// Apply the selected transform.
        	var options = self.getParameter('options');
        	var transform = self.getParameter('transform');
        	
        	if (transform === 'findEdges') {
        		cv.imgproc().findEdges(options);
        	} else {
        		error('Unsupported transform ' + transform);
        	}
        	
        	self.send('output', cv.getResultImage());
    	});
    });
};