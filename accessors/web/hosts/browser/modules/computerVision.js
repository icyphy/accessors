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
 * To use, import the module:
 * var cv = require('computerVision');
 * 
 * To obtain a list of filters:
 * var filters = cv.filters;
 * 
 * Invoke a filter and handle the result.  For example, in an accessor with an 
 * input "image" and output "result", to run findEdges():
 * 
 * var self = this;
 * 
 * this.addinputHandler('input', function() {
 *         var image = this.get('input');
 *  var options = {};
 *  options.cannyThreshold = 20;
 *  
 *  cv.filter(image, 'findEdges', options, function(result) {
 *          self.send('output', result);
 *  });
 * });
 *
 * The module supports these transforms:
 * Filter.blur(options): Blur the image, optionally passing in options.blurSize (1-25).
 * Filter.dilate(options): Dilate the image, optionally passing in options.erosionSize (0-21).
 * Filter.erode(options): Erode the image, optionally passing in options.erosionSize (0-21).
 * Filter.findContours(options): Find contours of an image, optionally passing in options.cannyThreshold (10-150).
 * Filter.findEdges(options): Find edges of an image, optionally passing in options.cannyThreshold (10-150).
 * Filter.gaussianBlur(options): Blur the image, optionally passing in options.blurSize (1-25).
 * Filter.histogram(): Create a histogram from the image showing red, green and blue content.
 * Filter.makeBGRA(): Convert image to blue, green, red, alpha colorspace.
 * Filter.makeGray(): Convert image to grayscale.
 * Filter.makeHSV(): Convert image to hue, saturation, value colorspace.
 * Filter.makeYUV(): Convert image to luminance, chroma colorspace. 
 *
 * @module computerVision
 * @author Sajjad Taheri (CV code), Elizabeth Osyk (accesorization)  
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*globals Java, exports */
/*jshint globalstrict: true*/
"use strict";

var EventEmitter = require('events').EventEmitter;
var cv = require('cv.js');
var ImageProcessingDisplay = require('imageProcessingDisplay');

/** Construct a Filter object that creates a pair of displays and allows 
 * access to various image processing filters.
 * @returns A Filter object.
 */
function Filter() {
        var self = this;
        
        // Creates pair of canvases to display before and after images.
        this.display = new ImageProcessingDisplay.ImageProcessingDisplay();
        
        this.defaultOptions = {};
        this.defaultOptions.blurSize = 10;
        this.defaultOptions.cannyThreshold = 75;
        this.defaultOptions.erosionSize = 1;
        
        this.display.on('ready', function(data) {
                self.emit('ready', data);
        });
}

util.inherits(Filter, EventEmitter);

/** Blur the image.
 * From http://ucisysarch.github.io/opencvjs/examples/img_proc.html
 */
Filter.prototype.blur = function(options) {
        var raw = cv.matFromArray(this.display.getOriginal(), cv.CV_8UC4);
        var src = new cv.Mat();

        cv.cvtColor(raw, src, cv.ColorConversionCodes.COLOR_RGBA2RGB.value, 0);
        var blurred = new cv.Mat();
        var blurSize = this.defaultOptions.blurSize;
        
        if (options !== null && typeof options !== 'undefined' &&
                        options.blurSize !== null && 
                        typeof options.blurSize !== 'undefined') {
                blurSize = options.blurSize;
        }

        cv.blur(src, blurred, [blurSize, blurSize], [-1, -1], cv.BORDER_DEFAULT);
        this.display.setMatResult(blurred);
        raw.delete();
        src.delete();
        blurred.delete();
}

/** Dilate the image.
 * From http://ucisysarch.github.io/opencvjs/examples/img_proc.html
 * @param options The erosion size, as options.erosionSize .  Optional.
 */
Filter.prototype.dilate = function(options) {
        var src = cv.matFromArray(this.display.getOriginal(), cv.CV_8UC4);
        cv.cvtColor(src, src, cv.ColorConversionCodes.COLOR_RGBA2RGB.value, 0);

        var borderValue = cv.Scalar.all(Number.MIN_VALUE);

        var erosion_type = cv.MorphShapes.MORPH_RECT.value;
        var erosionOption = this.defaultOptions.erosionSize;

        if (options !== null && typeof options !== 'undefined' &&
                        options.erosionSize !== null && 
                        typeof options.erosionSize !== 'undefined') {
                erosionOption = options.erosionSize;
        }
        
    var erosion_size = [2*erosionOption+1, 2*erosionOption+1];
        var element = cv.getStructuringElement(erosion_type, erosion_size, [-1, -1]);
        var dst = new cv.Mat();
        cv.dilate(src, dst, element, [-1, -1], 1, cv.BORDER_CONSTANT, borderValue);
        this.display.setMatResult(dst);
        src.delete();
        dst.delete();
}

/** Erode the image.
 * From http://ucisysarch.github.io/opencvjs/examples/img_proc.html
 * @param options The erosion size, as options.erosionSize .  Optional.
 */
Filter.prototype.erode = function(options) {
        var src = cv.matFromArray(this.display.getOriginal(), cv.CV_8UC4);
        cv.cvtColor(src, src, cv.ColorConversionCodes.COLOR_RGBA2RGB.value, 0);

    var borderValue = cv.Scalar.all(Number.MAX_VALUE);

        var erosion_type = cv.MorphShapes.MORPH_RECT.value;
        var erosionOption = this.defaultOptions.erosionSize;
        
        if (options !== null && typeof options !== 'undefined' &&
                        options.erosionSize !== null && 
                        typeof options.erosionSize !== 'undefined') {
                erosionOption = options.erosionSize;
        }
        
    var erosion_size = [2*erosionOption+1, 2*erosionOption+1];
        var element = cv.getStructuringElement(erosion_type, erosion_size, [-1, -1]);
        var dst = new cv.Mat();
        cv.erode(src, dst, element, [-1, -1], 1, cv.BORDER_CONSTANT, borderValue);
        this.display.setMatResult(dst);
        src.delete();
        dst.delete();
}

/** Find contours in the image.
 * From http://ucisysarch.github.io/opencvjs/examples/img_proc.html
 */
Filter.prototype.findContours = function(options) {
        var src = cv.matFromArray(this.display.getOriginal(), cv.CV_8UC4);
        cv.cvtColor(src, src, cv.ColorConversionCodes.COLOR_RGBA2RGB.value, 0);

        var canny_output = new cv.Mat();
        var blurred = new cv.Mat();
        var cthresh = this.defaultOptions.cannyThreshold;
        
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

        this.display.setMatResult(drawing);
        src.delete();
        blurred.delete();
        drawing.delete();
        hull.delete();
        contours.delete();
        hierarchy.delete();
        canny_output.delete();
}

/** Find edges.  
 * From http://ucisysarch.github.io/opencvjs/examples/img_proc.html
 *  @param options The threshold for the canny edge detector, as 
 *          options.cannyThreshold.  Optional.
 */
Filter.prototype.findEdges = function(options) {
        var cthresh = this.defaultOptions.cannyThreshold;
        
        if (options !== null && typeof options !== 'undefined' &&
                        options.cannyThreshold !== null && 
                        typeof options.cannyThreshold !== 'undefined') {
                cthresh = options.cannyThreshold;
        }
        
        var data = this.display.getOriginal();
        
        var src = cv.matFromArray(data, cv.CV_8UC4);
        cv.cvtColor(src, src, cv.ColorConversionCodes.COLOR_RGBA2RGB.value, 0);

        var canny_output = new cv.Mat();
        var blurred = new cv.Mat();
        
        cv.blur(src, blurred, [5, 5], [-1, -1], 4);
        cv.Canny(blurred, canny_output, cthresh, cthresh*2, 3, 0);
        this.display.setMatResult(canny_output);
        src.delete();
        blurred.delete();
        canny_output.delete();
}

/** Apply a gaussian blur to the original image.
 * From http://ucisysarch.github.io/opencvjs/examples/img_proc.html
 *  @param options The blur size, as options.blurSize.  Optional.
 */
Filter.prototype.gaussianBlur = function(options) {
        var src = cv.matFromArray(this.display.getOriginal(), cv.CV_8UC4);
        cv.cvtColor(src, src, cv.ColorConversionCodes.COLOR_RGBA2RGB.value, 0);

        var blurred = new cv.Mat();
        var blurSize = this.defaultOptions.blurSize;
        
        if (options !== null && typeof options !== 'undefined' &&
                        options.blurSize !== null && 
                        typeof options.blurSize !== 'undefined') {
                blurSize = options.blurSize;
        }
        var size = [2*blurSize+1, 2*blurSize+1];

        cv.GaussianBlur(src, blurred, size, 0, 0, cv.BORDER_DEFAULT);
        this.display.setMatResult(blurred);
        src.delete();
        blurred.delete();
}

/** Create a histogram from the image.
 * From http://ucisysarch.github.io/opencvjs/examples/img_proc.html
 */
// TODO:  Add a key for what the lines are.
Filter.prototype.histogram = function() {
        var numBins = 255 ;

        var src = cv.matFromArray(this.display.getOriginal(), cv.CV_8UC4); // 24 for rgba
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

        for(var i = 1; i < numBins         ; i++ )
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
        this.display.setMatResult(histImage);
}

/** Convert image to BGRA (Blue, Green, Red, Alpha) colorspace.
 * From http://ucisysarch.github.io/opencvjs/examples/img_proc.html
 */
Filter.prototype.makeBGRA = function() {
        var src = cv.matFromArray(this.display.getOriginal(), 24); // 24 for rgba
        var res = new cv.Mat();
        cv.cvtColor(src, res, cv.ColorConversionCodes.COLOR_RGBA2BGRA.value, 0);
        this.display.setMatResult(res);
        src.delete();
        res.delete();
}

/** Convert image to grayscale.
 * From http://ucisysarch.github.io/opencvjs/examples/img_proc.html
 */
Filter.prototype.makeGray = function() {
        var src = cv.matFromArray(this.display.getOriginal(), 24); // 24 for rgba
        var res = new cv.Mat();
        cv.cvtColor(src, res, cv.ColorConversionCodes.COLOR_RGBA2GRAY.value, 0);
        this.display.setMatResult(res);
        src.delete();
        res.delete();
}

/** Convert image to HSV (Hue, Saturation, Value) colorspace.
 * From http://ucisysarch.github.io/opencvjs/examples/img_proc.html
 */
Filter.prototype.makeHSV = function() {
        var src = cv.matFromArray(this.display.getOriginal(), 24); // 24 for rgba
        var tmp = new cv.Mat();
        var res = new cv.Mat();
        cv.cvtColor(src, tmp, cv.ColorConversionCodes.COLOR_RGBA2RGB.value, 0);
        cv.cvtColor(tmp, res, cv.ColorConversionCodes.COLOR_RGB2HSV.value, 0);
        this.display.setMatResult(res);
        tmp.delete();
        src.delete();
        res.delete();
}

/** Convert image to YUV (Luminance, Chroma) colorspace.
 * From http://ucisysarch.github.io/opencvjs/examples/img_proc.html
 */
Filter.prototype.makeYUV = function() {
        var src = cv.matFromArray(this.display.getOriginal(), 24); // 24 for rgba
        var res = new cv.Mat();
        cv.cvtColor(src, res, cv.ColorConversionCodes.COLOR_RGB2YUV.value, 0 )
        this.display.setMatResult(res);
        src.delete();
        res.delete();
}

/** Blur the image.
 * From http://ucisysarch.github.io/opencvjs/examples/img_proc.html
 *  @param options The blur size, as options.blurSize.  Optional.
 */

Filter.prototype.medianBlur = function(options){
        var src = cv.matFromArray(this.display.getOriginal(), cv.CV_8UC4);
        cv.cvtColor(src, src, cv.ColorConversionCodes.COLOR_RGBA2RGB.value, 0);
        var blurred = new cv.Mat();
        
        var blurSize = this.defaultOptions.blurSize;
        
        if (options !== null && typeof options !== 'undefined' &&
                        options.blurSize !== null && 
                        typeof options.blurSize !== 'undefined') {
                blurSize = options.blurSize;
        }

        cv.medianBlur(src, blurred, 2*blurSize+1);
        this.display.setMatResult(blurred);
        src.delete();
        blurred.delete();
}

/** Get the result image.
 */
Filter.prototype.getResult = function() {
        return this.display.getResult();
};

/** Set the input image.
 * @parameter input The image or path to a local image.  Remote images are not
 * supported due to browser security restrictions - a browser will not allow a
 * remote image to be exported from a canvas.
 */
Filter.prototype.setOriginal = function(input) {
        this.display.setOriginal(input);
};

/** Create a new filter.  Declared here instead of at beginning so all prototype 
 * functions will be available.
 */
var theFilter = new Filter();

/** A list of available filters.
 */
exports.filters = ['blur', 'dilate', 'erode', 'findEdges', 'findContours', 
                'gaussianBlur', 'histogram', 'makeBGRA', 'makeGray', 'makeHSV',
                'makeYUV', 'medianBlur'];

/** Apply the specified filter and invoke the callback with the result.
 */

exports.filter = function (image, transform, options, callback) {
        theFilter.setOriginal(image);
        
        
        // Wait until the original image is ready (it might be loaded from a file).
        // Then execute transform.
        theFilter.on('ready', function(data) {
                switch(transform) {
                case 'blur' : theFilter.blur(options); break; 
                case 'dilate' : theFilter.dilate(options); break;
                case 'erode' : theFilter.erode(); break;
                case 'findEdges' : theFilter.findEdges(options); break;
                case 'findContours' : theFilter.findContours(options); break;
                case 'gaussianBlur' :  theFilter.gaussianBlur(options); break;
                case 'histogram' : theFilter.histogram(); break;
                case 'makeBGRA' : theFilter.makeBGRA(); break;
                case 'makeGray' : theFilter.makeGray(); break;
                case 'makeHSV' : theFilter.makeHSV(); break;
                case 'makeYUV' : theFilter.makeYUV(); break;
                case 'medianBlur' : theFilter.medianBlur(options); break;
                default : console.log('Unsupported transform ' + transform);
                }
                
                callback(theFilter.getResult());
        });
};












