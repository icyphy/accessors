// A module to detect faces.
//
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

/** A module to detect faces.
 *  
 *  This module provides an interface to OpenCV face detection.
 * 
 *  To run, please point your browser to:
 *  <a href="https://accessors.org/hosts/browser/demo/faceDetector/faceDetector.html#in_browser">https://accessors.org/hosts/browser/demo/faceDetector/faceDetector.html</a>
 *  
 *  This module uses the UC Irvine computer vision library; see <a href="https://accessors.org/hosts/browser/modules/cvlicense.txt#in_browser">https://accessors.org/hosts/browser/modules/cvlicense.txt#in_browser"></a>
 *
 *  Based on code from examples in:  <a href="http://ucisysarch.github.io/opencvjs/examples/face_detect.html#in_browser">http://ucisysarch.github.io/opencvjs/examples/face_detect.html</a>
 *    
 *  @module faceDetector
 *  @author Sajjad Taheri, Ilga Akkaya, Elizabeth Osyk
 *  @version $$Id$$
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*globals exports, Java */
/*jshint globalstrict: true */
"use strict";

var EventEmitter = require('events').EventEmitter;
var cv = require('cv.js');
var ImageProcessingDisplay = require('imageProcessingDisplay');

////////////////////////////////////////////////////////////
////Functions provided in this module.

/** Create a Filter object to instantiate a pair of canvases (before/after) and
 * to store the face detection classifier.
 */
var Filter = function() {
	EventEmitter.call(this);
	
	var self = this;
	
	// Creates pair of canvases to display before and after images.
	this.display = new ImageProcessingDisplay.ImageProcessingDisplay();
	
	this.defaultOptions = {};
	
	// Store the trained face detector.  Loaded when first called.
	this.faceCascade = null;
	this.faceCount = 0;
	this.image = null;
	
	this.display.on('ready', function(data) {
		self.emit('ready', data);
	})
};

util.inherits(Filter, EventEmitter);

/** Detect faces in the original image, draw squares around any faces,
 * and set and return the result image.
 * @param options TODO MinFaceSize and MaxFaceSize
 * @return The image with squares around any faces.
 */ 
Filter.prototype.filter = function() {
	var self = this;
	
	if(self.faceCascade == undefined ){
		self.faceCascade = new cv.CascadeClassifier();
		self.faceCascade.load('haarcascade_frontalface_default.xml');
	}
	
	var img = cv.matFromArray(self.display.getOriginal(), 24); // 24 for rgba
	var img_gray = new cv.Mat();
	var img_color = new cv.Mat(); // Opencv likes RGB
	
	
	cv.cvtColor(img, img_gray, cv.ColorConversionCodes.COLOR_RGBA2GRAY.value, 0);
	cv.cvtColor(img, img_color, cv.ColorConversionCodes.COLOR_RGBA2RGB.value, 0);
	
	var faces = new cv.RectVector();
	var s1 = [0, 0];
	var s2 = [0, 0];
	self.faceCascade.detectMultiScale(img_gray, faces, 1.1, 3, 0, s1, s2);
	self.faceCount = faces.size();
	
	for (var i = 0 ;i < faces.size(); i+=1 )
	{
		var faceRect = faces.get(i);
		x = faceRect.x ;
		y = faceRect.y ;
		w = faceRect.width ;
		h = faceRect.height;
		var p1 = [x, y];
		var p2 = [x+w, y+h];
		var color = new cv.Scalar(255,0,0);
		cv.rectangle(img_color, p1, p2, color, 2, 8, 0);
		faceRect.delete();
		color.delete();
	}
	self.display.setMatResult(img_color);
	img.delete();
	img_color.delete();
	faces.delete();
	img_gray.delete();
	
	return self.display.getResult();
};

var filter = new Filter();

/** Detect faces in an image and return the image with squares around the faces. 
 *  
 *  Options:
 *  MinFaceSize - The minimum face size.  (In pixels?)
 *  MaxFaceSize - The maximum face size.  (In pixels?)
 *  
 *  Any unrecognized options are ignored.
 *  Note that previously applied options for a given filter will still be
 *  used, even if they are not set in this call.
 *  @param image The image or path to image to detect faces in.
 *  @param options An object whose fields specify filter options.
 *  @param callback The callback to invoke when the result image is ready.  
 *   Needed since there may be a delay if the input image is loaded from a file.
 *  @return The image with blue squares around any faces.
 */
exports.filter = function (image, options, callback) {
	filter.display.setOriginal(image);

	// TODO: Implement options for MinFaceSize and MaxFaceSize.
	filter.on('ready', function() {
		filter.filter(options);
		callback(filter.display.getResult());
	});
};

/** Return number of detected faces
 *  @return The number of detected faces.
 */
exports.numberOfFaces = function () {
    return filter.faceCount;
};


