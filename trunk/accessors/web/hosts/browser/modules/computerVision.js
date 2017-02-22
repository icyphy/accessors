// A module for computer vision.
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
// This module uses the UC Irvine computer vision library; see cvlicense.txt.
// Based on code from examples in:  https://github.com/ucisysarch/opencvjs
//
// The API follows the OpenCV API:
// http://docs.opencv.org/3.0-beta/modules/refman.html

/**
 * A module for computer vision.  This module offers functionality from the 
 * OpenCV computer vision framework.
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
 *  /accessors/web/hosts/browser/demo/computervision/computervision
 *  
 * @module computervision
 * @author Sajjad Taheri (CV code), Elizabeth Osyk (accesorization)  
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*globals Java, exports */
/*jshint globalstrict: true*/
"use strict";

/** Construct an instance of a CV object type. This should be instantiated in 
 *  your JavaScript code as:
 *  <pre>
 *     var CV = require("computerVision");
 *     var cv = new CV.CV();
 *  </pre>
 *  
 *  The CV object offers image processing functions categorized according to the
 *  OpenCV API, http://docs.opencv.org/3.0-beta/modules/refman.html .
 *  For example, to call the findEdges function:
 *  <pre>
 *  	cv.imgproc().findEdges(options);
 *  </pre>
 *  Where options is optional and contains any function-specific options, such 
 *  as thresholds.
 *  
 *  An instance of the CV object type implements the following functions:
 *  <ul>
 *  <li> imgproc().findEdges(options): Find edges using the canny edge detector.
 *  </ul>
 */

var EventEmitter = require('events').EventEmitter;
var cv = require('cv.js');

exports.CV = function () {
	this.defaultOptions = {};
	this.defaultOptions.canny_threshold = 75;
	
	// Create a pair of canvases to show original image and result.
	this.originalCanvas = document.createElement('canvas');
	this.resultCanvas = document.createElement('canvas');
	this.image = null;
	
	// Create a div to contain the canvases.
	var container = document.createElement('div');
	container.style.width = '95';
	container.style.margin = '1em';
	container.style.padding = '1em';
	
	var labels = document.createElement('div');
	labels.style.fontSize = '1.5em';
	labels.style.width = '100%';
	
	var originalLabel = document.createElement('div');
	originalLabel.innerHTML = "Original Image";
	originalLabel.style.width = '45%';
	originalLabel.style.float = 'left';
	originalLabel.style.textAlign = 'center';
	
	var resultLabel = document.createElement('div');
	resultLabel.innerHTML = "Result";
	resultLabel.style.width = '45%';
	resultLabel.style.float = 'right';
	resultLabel.style.textAlign = 'center';
	resultLabel.style.verticalAlign = 'top';
	
	labels.appendChild(originalLabel);
	labels.appendChild(resultLabel);
	
	this.originalContainer = document.createElement('div');
	this.originalContainer.style.display = 'inline-block';
	this.originalContainer.style.width = '45%';
	
	this.resultContainer = document.createElement('div');
	this.resultContainer.style.float = 'right';
	this.resultContainer.style.width = '45%';

	
	this.originalContainer.appendChild(this.originalCanvas);
	this.resultContainer.appendChild(this.resultCanvas);
	container.appendChild(this.originalContainer);
	container.appendChild(this.resultContainer);
	container.appendChild(labels);
	
	// TODO: Page placement
	// Right now - just put at page top.
	
	if (document.body.firstChild !== null && 
			typeof document.body.firstChild !== 'undefined') {
		document.body.insertBefore(container, document.body.firstChild);
	} else {
		document.body.appendChild(container);
	}
	
	// From https://github.com/ucisysarch/opencvjs
	// TODO:  Refactor so this has local scope?
	this.setResult = function(mat, canvas) {
		var data = mat.data(); 	// output is a Uint8Array that aliases directly into the Emscripten heap

		var channels = mat.channels();
		var channelSize = mat.elemSize1();

		var ctx = canvas.getContext("2d");
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		canvas.width = mat.cols;
		canvas.height = mat.rows;

		var imdata = ctx.createImageData(mat.cols, mat.rows);

		for (var i = 0,j=0; i < data.length; i += channels, j+=4) {
			imdata.data[j] = data[i];
			imdata.data[j + 1] = data[i+1%channels];
			imdata.data[j + 2] = data[i+2%channels];
			imdata.data[j + 3] = 255;
		}
		ctx.putImageData(imdata, 0, 0);
	}
};

util.inherits(exports.CV, EventEmitter);

/** Set class variables to none so that garbage collector may activate.
 *  Note that garbage collection might NOT occur otherwise.
 */
// FIXME:  What needs to be done here?
exports.CV.prototype.done = function() {
	
};

/** Get the image on the specified canvas. See also getOriginalImage() and
 * getResultImage().
 * @parameter canvas  The canvas to return image data from.
 * @return The image on the specified canvas.
 */
// TODO:  Locally scope this?
exports.CV.prototype.getImage = function(canvas) {
	var ctx = canvas.getContext('2d');
	var image =  ctx.getImageData(0, 0, canvas.width, canvas.height);
	return image;
}

/** Get the original image.
 * @return The original image.
 */ 
exports.CV.prototype.getOriginalImage = function(){
	return this.getImage(this.originalCanvas);
}

/** Get the result image.
 * @return The result image.
 */
exports.CV.prototype.getResultImage = function(){
	return this.getImage(this.resultCanvas);
}

/** Image processing functions.  Functions are categorized according to OpenCV
 *  API, http://docs.opencv.org/3.0-beta/modules/refman.html .
 */

exports.CV.prototype.imgproc = function() {
	var self = this;

	/** Find edges.  From https://github.com/ucisysarch/opencvjs .
	 *  @param options The threshold for the canny edge detector, as 
	 *  	options.canny_threshold.  Optional.
	 */
	var findEdges = function(options) {
		var cthresh = self.defaultOptions.canny_threshold;
		
		if (options !== null && typeof options !== 'undefined' &&
				options.canny_threshold !== null && 
				typeof options.canny_threshold !== 'undefined') {
			cthresh = options.canny_threshold;
		}
		
		var data = self.getOriginalImage();
		
		var src = cv.matFromArray(data, cv.CV_8UC4);
		cv.cvtColor(src, src, cv.ColorConversionCodes.COLOR_RGBA2RGB.value, 0);

		var canny_output = new cv.Mat();
		var blurred = new cv.Mat();
		
		cv.blur(src, blurred, [5, 5], [-1, -1], 4);
		cv.Canny(blurred, canny_output, cthresh, cthresh*2, 3, 0);
		self.setResult(canny_output, self.resultCanvas);
		src.delete();
		blurred.delete();
		canny_output.delete();
	}
	
	return { findEdges : findEdges};
};

/** Set the input image.
 * @parameter input The image or path to a local image.  Remote images are not
 * supported due to browser security restrictions - a browser will not allow a
 * remote image to be exported from a canvas.
 */
exports.CV.prototype.setInput = function(input) {
	
	var self = this;
	var context = this.originalCanvas.getContext("2d");
	
	if (input !== null && typeof input === 'string') {
		var imageObj = new Image();
		imageObj.src = input;

		// TODO:  Catch bad input strings?
		imageObj.onload = function () {
			self.originalCanvas.width = imageObj.width;
			self.originalCanvas.height = imageObj.height;
			context.drawImage(imageObj, 0, 0);
			self.emit('ready', true);
		};
	} else {
		// TODO:  Implement this.
	}
}




