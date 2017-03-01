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
	this.defaultOptions.blurSize = 10;
	this.defaultOptions.cannyThreshold = 75;
	this.defaultOptions.erosionSize = 1;
	
	// Store the trained face detector.  Loaded when first called.
	this.face_cascade = null;
	
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
	
	var accessorDiv = document.getElementById('Camera');
	var parent;
	
	if (accessorDiv !== null && typeof accessorDiv !== 'undefined') {
		// Found Camera accessor.
		parent = accessorDiv.parentNode;
		
		if (parent !== null && typeof parent !== 'undefined') {
			parent.insertBefore(container, accessorDiv);
		} else {
			document.body.insertBefore(container, accessorDiv);
		}
	} else {
		// Look for accessorDirectoryTarget, as in terraswarm library page.
		accessorDiv = document.getElementById('accessorDirectoryTarget');
		
		if (accessorDiv !== null && typeof accessorDiv !== 'undefined') {
			parent = accessorDiv.parentNode;
			
			if (parent !== null && typeof parent !== 'undefined') {
				parent.insertBefore(container, accessorDiv);
			} else {
				document.body.insertBefore(container, accessorDiv);
			}
		} else {
			// No Camera accessor.  Find any accessor.  If none, use page top.
			accessorDiv = document.getElementsByClassName('accessor');
			if (accessorDiv !== null && typeof accessorDiv !== 'undefined' && 
					accessorDiv.length > 0) {
				accessorDiv = accessorDiv[0];
				var parent = accessorDiv.parentNode;
				if (parent !== null && typeof parent !== 'undefined') {
					parent.insertBefore(container, accessorDiv);
				} else {
					document.body.insertBefore(container, accessorDiv);
				}
			} else if (document.body.firstChild !== null && 
					typeof document.body.firstChild !== 'undefined') {
					document.body.insertBefore(container, document.body.firstChild);
			} else {
				document.body.appendChild(container);
			}
		}
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
 *  Functions from http://ucisysarch.github.io/opencvjs/examples/img_proc.html
 */

exports.CV.prototype.imgproc = function() {
	var self = this;

	/** Blur the original image.
	 */
	function blur(options) {
		var raw = cv.matFromArray(self.getOriginalImage(), cv.CV_8UC4);
		var src = new cv.Mat();

		cv.cvtColor(raw, src, cv.ColorConversionCodes.COLOR_RGBA2RGB.value, 0);
		var blurred = new cv.Mat();
		var blurSize = self.defaultOptions.blurSize;
		
		if (options !== null && typeof options !== 'undefined' &&
				options.blurSize !== null && 
				typeof options.blurSize !== 'undefined') {
			blurSize = options.blurSize;
		}

		cv.blur(src, blurred, [blurSize, blurSize], [-1, -1], cv.BORDER_DEFAULT);
		self.setResult(blurred, self.resultCanvas);
		raw.delete();
		src.delete();
		blurred.delete();
	}
	
	/** Dilate the image.
	 */
	function dilate(options) {
		//var src = cv.matFromArray(self.getOriginalImage(), cv.CV_8UC4);
		var src = cv.matFromArray(self.getOriginalImage(), cv.CV_8UC4);
		cv.cvtColor(src, src, cv.ColorConversionCodes.COLOR_RGBA2RGB.value, 0);

		var borderValue = cv.Scalar.all(Number.MIN_VALUE);

		var erosion_type = cv.MorphShapes.MORPH_RECT.value;
		var erosionOption = self.defaultOptions.erosionSize;
	
		if (options !== null && typeof options !== 'undefined' &&
				options.erosionSize !== null && 
				typeof options.erosionSize !== 'undefined') {
			erosionOption = options.erosionSize;
		}
		
	    var erosion_size = [2*erosionOption+1, 2*erosionOption+1];
		var element = cv.getStructuringElement(erosion_type, erosion_size, [-1, -1]);
		var dst = new cv.Mat();
		cv.dilate(src, dst, element, [-1, -1], 1, cv.BORDER_CONSTANT, borderValue);
		self.setResult(dst, self.resultCanvas);
		src.delete();
		dst.delete();
	}
	
	/** Erode the image.
	 */
	function erode(options) {
		var src = cv.matFromArray(self.getOriginalImage(), cv.CV_8UC4);
		cv.cvtColor(src, src, cv.ColorConversionCodes.COLOR_RGBA2RGB.value, 0);

        var borderValue = cv.Scalar.all(Number.MAX_VALUE);

		var erosion_type = cv.MorphShapes.MORPH_RECT.value;
		var erosionOption = self.defaultOptions.erosionSize;
		
		if (options !== null && typeof options !== 'undefined' &&
				options.erosionSize !== null && 
				typeof options.erosionSize !== 'undefined') {
			erosionOption = options.erosionSize;
		}
		
	    var erosion_size = [2*erosionOption+1, 2*erosionOption+1];
		var element = cv.getStructuringElement(erosion_type, erosion_size, [-1, -1]);
		var dst = new cv.Mat();
		cv.erode(src, dst, element, [-1, -1], 1, cv.BORDER_CONSTANT, borderValue);
		self.setResult(dst, self.resultCanvas);
		src.delete();
		dst.delete();
	}
	
	/** Find contours in the image.
	 */
	function findContours(options) {
		var src = cv.matFromArray(self.getOriginalImage(), cv.CV_8UC4);
		cv.cvtColor(src, src, cv.ColorConversionCodes.COLOR_RGBA2RGB.value, 0);

		var canny_output = new cv.Mat();
		var blurred = new cv.Mat();
		var cthresh = self.defaultOptions.cannyThreshold;
		
		if (options !== null && typeof options !== 'undefined' &&
				options.cannyThreshold !== null && 
				typeof options.cannyThreshold !== 'undefined') {
			cthresh = options.cannyThreshold;
		}
		
		cv.blur(src, blurred, [5, 5], [-1, -1], cv.BORDER_DEFAULT);

		cv.Canny(blurred, canny_output, cthresh, cthresh*2, 3, 0);

		/// Find contours
		var contours = new cv.MatVector();
		var hierarchy = new cv.Mat();
		cv.findContours(canny_output, contours, hierarchy, 3, 2, [0, 0]);

		// Convex hull
		var hull = new cv.MatVector();
		for( i = 0; i < contours.size(); i++ )
		{
			var item = new cv.Mat();
			cv.convexHull(contours.get(i), item, false, true);
			hull.push_back(item);
			item.delete();
		}

		// Draw contours + hull results
		var size = canny_output.size();
		var drawing = cv.Mat.zeros(size.get(0), size.get(1), cv.CV_8UC4);
		for(i = 0; i< contours.size(); i++ )
		{
			var color = new cv.Scalar(Math.random()*255, Math.random()*255, Math.random()*255);
			cv.drawContours(drawing, contours, i, color, 2, 8, hierarchy, 0, [0, 0]);
			var green = new cv.Scalar(30, 150, 30);
			cv.drawContours(drawing, hull, i, green, 1, 8, new cv.Mat(), 0, [0, 0]);
			color.delete();
			green.delete();
		}

		self.setResult(canny_output, self.resultCanvas);
		src.delete();
		blurred.delete();
		drawing.delete();
		hull.delete();
		contours.delete();
		hierarchy.delete();
		canny_output.delete();
	}
	
	/** Find edges.  From https://github.com/ucisysarch/opencvjs .
	 *  @param options The threshold for the canny edge detector, as 
	 *  	options.cannyThreshold.  Optional.
	 */
	function findEdges(options) {
		var cthresh = self.defaultOptions.cannyThreshold;
		
		if (options !== null && typeof options !== 'undefined' &&
				options.cannyThreshold !== null && 
				typeof options.cannyThreshold !== 'undefined') {
			cthresh = options.cannyThreshold;
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
	
	/** Apply a gaussian blur to the original image.
	 */
	function gaussianBlur(options) {
		var src = cv.matFromArray(self.getOriginalImage(), cv.CV_8UC4);
		cv.cvtColor(src, src, cv.ColorConversionCodes.COLOR_RGBA2RGB.value, 0);

		var blurred = new cv.Mat();
		var blurSize = self.defaultOptions.blurSize;
		
		if (options !== null && typeof options !== 'undefined' &&
				options.blurSize !== null && 
				typeof options.blurSize !== 'undefined') {
			blurSize = options.blurSize;
		}
		var size = [2*blurSize+1, 2*blurSize+1];

		cv.GaussianBlur(src, blurred, size, 0, 0, cv.BORDER_DEFAULT);
		self.setResult(blurred, self.resultCanvas);
		src.delete();
		blurred.delete();
	}
	
	/** Create a histogram from the image.
	 */
	// TODO:  Add a key for what the lines are.
	function histogram() {
		var numBins = 255 ;

		var src = cv.matFromArray(self.getOriginalImage(), cv.CV_8UC4); // 24 for rgba
		var rgbPlanes = new cv.MatVector();
		cv.split(src, rgbPlanes);

		var planes = new cv.IntVector();

		var ranges = new cv.FloatVector();
		ranges.push_back(0);
		ranges.push_back(255);

		var histSize = new cv.IntVector();
		histSize.push_back(numBins);

		var histr = new cv.Mat();
		var histg = new cv.Mat();
		var histb = new cv.Mat();
		planes.push_back(0);
		cv.calcHist(rgbPlanes, planes, new cv.Mat(), histr, histSize, ranges, false);
		planes.set(0,1);
		cv.calcHist(rgbPlanes, planes, new cv.Mat(), histg, histSize, ranges, false);
		planes.set(0,2);
		cv.calcHist(rgbPlanes, planes, new cv.Mat(), histb, histSize, ranges, false);

		var total = 0 ;
		for (var i = 0 ; i < numBins ; ++i ){
			total += histr.get_float_at(i);
		}

		// Normalize

		var noArray = new cv.Mat();

		cv.normalize(histr, histr, 1, 0, cv.NORM_L2, -1, noArray);
		cv.normalize(histg, histg, 1, 0, cv.NORM_L2, -1, noArray);
		cv.normalize(histb, histb, 1, 0, cv.NORM_L2, -1, noArray);

		// Draw histogram
		var hist_w = 300;
		var hist_h = 300;
		var bin_w = hist_w/numBins|0 ;
		var histImage = cv.Mat.ones([hist_h, hist_w], cv.CV_8UC4);

		for(var i = 1; i < numBins	 ; i++ )
		{
			cv.line(histImage,
						[bin_w*(i-1), hist_h - histr.get_float_at(i-1)*hist_h],
						[bin_w*(i), hist_h - histr.get_float_at(i)*hist_h],
						new cv.Scalar(255, 0, 0),
						1, cv.LineTypes.LINE_8.value, 0
					);
			cv.line(histImage,
						[bin_w*(i-1), hist_h - histg.get_float_at(i-1)*hist_h],
						[bin_w*(i), hist_h - histg.get_float_at(i)*hist_h],
						new cv.Scalar(0, 255, 0),
						1, cv.LineTypes.LINE_8.value, 0
					);
			cv.line(histImage,
						[bin_w*(i-1), hist_h - histb.get_float_at(i-1)*hist_h],
						[bin_w*(i), hist_h - histb.get_float_at(i)*hist_h],
						new cv.Scalar(0, 0, 255),
						1, cv.LineTypes.LINE_8.value, 0
					);
		}
		self.setResult(histImage, self.resultCanvas);
	}
	
	/** Convert image to BGRA (Blue, Green, Red, Alpha) colorspace.
	 */
	function makeBGRA() {
		var src = cv.matFromArray(self.getOriginalImage(), 24); // 24 for rgba
		var res = new cv.Mat();
		cv.cvtColor(src, res, cv.ColorConversionCodes.COLOR_RGBA2BGRA.value, 0);
		self.setResult(res, self.resultCanvas);
		src.delete();
		res.delete();
	}
	
	/** Convert image to grayscale.
	 */
	function makeGray() {
		var src = cv.matFromArray(self.getOriginalImage(), 24); // 24 for rgba
		var res = new cv.Mat();
		cv.cvtColor(src, res, cv.ColorConversionCodes.COLOR_RGBA2GRAY.value, 0);
		self.setResult(res, self.resultCanvas);
		src.delete();
		res.delete();
	}

	/** Convert image to HSV (Hue, Saturation, Value) colorspace.
	 */
	function makeHSV() {
		var src = cv.matFromArray(self.getOriginalImage(), 24); // 24 for rgba
		var tmp = new cv.Mat();
		var res = new cv.Mat();
		cv.cvtColor(src, tmp, cv.ColorConversionCodes.COLOR_RGBA2RGB.value, 0);
		cv.cvtColor(tmp, res, cv.ColorConversionCodes.COLOR_RGB2HSV.value, 0);
		self.setResult(res, self.resultCanvas);
		tmp.delete();
		src.delete();
		res.delete();
	}

	/** Convert image to YUV (Luminance, Chroma) colorspace.
	 */
	function makeYUV() {
		var src = cv.matFromArray(self.getOriginalImage(), 24); // 24 for rgba
		var res = new cv.Mat();
		cv.cvtColor(src, res, cv.ColorConversionCodes.COLOR_RGB2YUV.value, 0 )
		self.setResult(res, self.resultCanvas);
		src.delete();
		res.delete();
	}
	
	/** Blur the image.
	 */

	function medianBlur(options){
		var src = cv.matFromArray(self.getOriginalImage(), cv.CV_8UC4);
		cv.cvtColor(src, src, cv.ColorConversionCodes.COLOR_RGBA2RGB.value, 0);
		var blurred = new cv.Mat();
		
		var blurSize = self.defaultOptions.blurSize;
		
		if (options !== null && typeof options !== 'undefined' &&
				options.blurSize !== null && 
				typeof options.blurSize !== 'undefined') {
			blurSize = options.blurSize;
		}

		cv.medianBlur(src, blurred, 2*blurSize+1);
		self.setResult(blurred, self.resultCanvas);
		src.delete();
		blurred.delete();
	}
	
	return { blur : blur,
			 dilate : dilate,
			 erode :  erode,
		     gaussianBlur : gaussianBlur,
		     histogram : histogram,
		     findContours : findContours,
		     findEdges : findEdges, 
			 makeBGRA : makeBGRA,
			 makeGray : makeGray,
			 makeHSV : makeYUV,
			 medianBlur : medianBlur};
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




