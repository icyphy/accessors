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
 *  @accessor image/ComputerVision
 *  @input input (string or image) An image or path to a local image.  Remote 
 *  images are not supported due to browser security restrictions - a browser 
 *  will not allow a remote image to be exported from a canvas.
 *  @output output (image) A modified image.
 *  @parameter options (JSON) Options for the selected transform, if any.
 *  @parameter transform (string) The transform to apply to the image.  Selected
 *   from a list.
 *  @author Sajjad Taheri (CV code), Elizabeth Osyk (accesorization)
 *  @version $$Id$$
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*globals addInputHandler, exports, get, getParameter, input, output, removeInputHandler, require, send  */
/*jshint globalstrict: true */

var CV = null;
var cv = null;
var imgproc = null;

try {
    CV = require('computerVision');
    cv = new CV.CV();
    imgproc = cv.imgproc();
} catch (error) {
    console.log("The CV module was not present.  The ComputerVision accessor " +
    		"is not supported on this accessor host.");
}

/** Create inputs, outputs and parameters for the accessor.
 */
exports.setup = function() {
	if (imgproc !== null) {
	    this.input('input');
	    this.parameter('options', {
	    	type: 'JSON'
	    });
	    this.parameter('transform', {
	    	type: 'string',
	    	options: Object.keys(imgproc), 
	    	value: 'findEdges'
	    });
	    this.output('output');
	} else {
	    console.log("The CV module was not present.  The ComputerVision accessor " +
		"is not supported on this accessor host.");
	}
};

/** Register an input handler to apply the selected transformation on each input 
 * image.
 */
exports.initialize = function() {
	var self = this;
	
    this.addInputHandler('input', function() {
    	// Check for null cv variable to avoid problems in Cape Code.
    	if (cv !== null) {
        	cv.setInput(self.get('input'));
        	
        	cv.once('ready', function(){
            	// Apply the selected transform.
            	var options = self.getParameter('options');
            	var transform = self.getParameter('transform');
            	
            	// Check if value is a supported transform.
            	var supported = Object.keys(imgproc);
            	
            	if (supported.includes(transform)) {
            		imgproc[transform](options);
            	} else {
            		error('Unsupported transform ' + transform);
            	}
            	
            	self.send('output', cv.getResult());
        	});
    	} else {
    	    console.log("The CV module was not present.  The ComputerVision accessor " +
    		"is not supported on this accessor host.");
    	}
    });
};
