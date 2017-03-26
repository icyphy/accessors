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

/**
 * A module for computer vision.  This module offers functionality from the 
 * OpenCV computer vision framework.
 * 
 *  To run, please point your browser to:
 *  <a href="https://accessors.org/hosts/browser/demo/computerVision/computerVision.html#in_browser">https://accessors.org/hosts/browser/demo/computerVision/computerVision.html</a>
 *  
 *  This module uses the UC Irvine computer vision library; see <a href="https://accessors.org/hosts/browser/modules/cvlicense.txt#in_browser">https://accessors.org/hosts/browser/modules/cvlicense.txt#in_browser"></a>
 *
 *  Based on code from examples in:  <a href="https://github.com/ucisysarch/opencvjs#in_browser">https://github.com/ucisysarch/opencvjs</a>
 *
 *  The API follows the OpenCV API:
 *  <a href="http://docs.opencv.org/3.0-beta/modules/refman.html#in_browser">/hosts/browser/demo/computerVision/computerVision.html</a>
 *
re * @module computerVision
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
var ImageProcessingDisplay = require('imageProcessingDisplay');

exports.CV = function () {
	var self = this;
	
	// Creates pair of canvases to display before and after images.
	this.display = new ImageProcessingDisplay.ImageProcessingDisplay();
	
	this.defaultOptions = {};
	this.defaultOptions.blurSize = 10;
	this.defaultOptions.cannyThreshold = 75;
	this.defaultOptions.erosionSize = 1;
		
	this.display.on('ready', function(data) {
		self.emit('ready', data);
	})
};

util.inherits(exports.CV, EventEmitter);

/** Set class variables to none so that garbage collector may activate.
 *  Note that garbage collection might NOT occur otherwise.
 */
// FIXME:  What needs to be done here?
exports.CV.prototype.done = function() {
	
};

/** Image processing functions.  Functions are categorized according to OpenCV
 *  API, http://docs.opencv.org/3.0-beta/modules/refman.html .
 *  Functions from http://ucisysarch.github.io/opencvjs/examples/img_proc.html
 */

exports.CV.prototype.imgproc = function() {
	var self = this;
	
	/** Blur the original image.
	 */
	function blur(options) {
		var raw = cv.matFromArray(self.display.getOriginal(), cv.CV_8UC4);
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
		self.display.setMatResult(blurred);
		raw.delete();
		src.delete();
		blurred.delete();
	}
	
	/** Dilate the image.
	 */
	function dilate(options) {
		//var src = cv.matFromArray(self.display.getOriginal(), cv.CV_8UC4);
		var src = cv.matFromArray(self.display.getOriginal(), cv.CV_8UC4);
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
		self.display.setMatResult(dst);
		src.delete();
		dst.delete();
	}
	
	/** Erode the image.
	 */
	function erode(options) {
		var src = cv.matFromArray(self.display.getOriginal(), cv.CV_8UC4);
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
		self.display.setMatResult(dst);
		src.delete();
		dst.delete();
	}
	
	/** Find contours in the image.
	 */
	function findContours(options) {
		var src = cv.matFromArray(self.display.getOriginal(), cv.CV_8UC4);
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

		self.display.setMatResult(canny_output);
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
		
		var data = self.display.getOriginal();
		
		var src = cv.matFromArray(data, cv.CV_8UC4);
		cv.cvtColor(src, src, cv.ColorConversionCodes.COLOR_RGBA2RGB.value, 0);

		var canny_output = new cv.Mat();
		var blurred = new cv.Mat();
		
		cv.blur(src, blurred, [5, 5], [-1, -1], 4);
		cv.Canny(blurred, canny_output, cthresh, cthresh*2, 3, 0);
		self.display.setMatResult(canny_output);
		src.delete();
		blurred.delete();
		canny_output.delete();
	}
	
	/** Apply a gaussian blur to the original image.
	 */
	function gaussianBlur(options) {
		var src = cv.matFromArray(self.display.getOriginal(), cv.CV_8UC4);
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
		self.display.setMatResult(blurred);
		src.delete();
		blurred.delete();
	}
	
	/** Create a histogram from the image.
	 */
	// TODO:  Add a key for what the lines are.
	function histogram() {
		var numBins = 255 ;

		var src = cv.matFromArray(self.display.getOriginal(), cv.CV_8UC4); // 24 for rgba
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
		self.display.setMatResult(histImage);
	}
	
	/** Convert image to BGRA (Blue, Green, Red, Alpha) colorspace.
	 */
	function makeBGRA() {
		var src = cv.matFromArray(self.display.getOriginal(), 24); // 24 for rgba
		var res = new cv.Mat();
		cv.cvtColor(src, res, cv.ColorConversionCodes.COLOR_RGBA2BGRA.value, 0);
		self.display.setMatResult(res);
		src.delete();
		res.delete();
	}
	
	/** Convert image to grayscale.
	 */
	function makeGray() {
		var src = cv.matFromArray(self.display.getOriginal(), 24); // 24 for rgba
		var res = new cv.Mat();
		cv.cvtColor(src, res, cv.ColorConversionCodes.COLOR_RGBA2GRAY.value, 0);
		self.display.setMatResult(res);
		src.delete();
		res.delete();
	}

	/** Convert image to HSV (Hue, Saturation, Value) colorspace.
	 */
	function makeHSV() {
		var src = cv.matFromArray(self.display.getOriginal(), 24); // 24 for rgba
		var tmp = new cv.Mat();
		var res = new cv.Mat();
		cv.cvtColor(src, tmp, cv.ColorConversionCodes.COLOR_RGBA2RGB.value, 0);
		cv.cvtColor(tmp, res, cv.ColorConversionCodes.COLOR_RGB2HSV.value, 0);
		self.display.setMatResult(res);
		tmp.delete();
		src.delete();
		res.delete();
	}

	/** Convert image to YUV (Luminance, Chroma) colorspace.
	 */
	function makeYUV() {
		var src = cv.matFromArray(self.display.getOriginal(), 24); // 24 for rgba
		var res = new cv.Mat();
		cv.cvtColor(src, res, cv.ColorConversionCodes.COLOR_RGB2YUV.value, 0 )
		self.display.setMatResult(res);
		src.delete();
		res.delete();
	}
	
	/** Blur the image.
	 */

	function medianBlur(options){
		var src = cv.matFromArray(self.display.getOriginal(), cv.CV_8UC4);
		cv.cvtColor(src, src, cv.ColorConversionCodes.COLOR_RGBA2RGB.value, 0);
		var blurred = new cv.Mat();
		
		var blurSize = self.defaultOptions.blurSize;
		
		if (options !== null && typeof options !== 'undefined' &&
				options.blurSize !== null && 
				typeof options.blurSize !== 'undefined') {
			blurSize = options.blurSize;
		}

		cv.medianBlur(src, blurred, 2*blurSize+1);
		self.display.setMatResult(blurred);
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

/** Get the result image.
 */
exports.CV.prototype.getResult = function () {
	return this.display.getResult();
};

/** Set the input image.
 * @parameter input The image or path to a local image.  Remote images are not
 * supported due to browser security restrictions - a browser will not allow a
 * remote image to be exported from a canvas.
 */
// TODO:  Rename to setOriginal
exports.CV.prototype.setInput = function(input) {
	this.display.setOriginal(input);
};




