// A module to display source and result images for image processing accessors.
// Copyright (c) 2017 The Regents of the University of California.
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

/**
 * A module to display source and result images for image processing accessors.
 * Used with computerVision, faceDetection and camera.
 * 
 *  To try out, please point your browser to the computer vision demo:
 *  <a href="https://accessors.org/hosts/browser/demo/computerVision/computerVision.html#in_browser">https://accessors.org/hosts/browser/demo/computerVision/computerVision.html</a>
 *  
 * @module imageProcessing
 * @author Elizabeth Osyk   
 * @version $$Id$$
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*globals Java, exports */
/*jshint globalstrict: true*/
"use strict";

/** Create a pair of displays for image processing.  This module sets up 
 * "before" and "after" canvases for showing the original and processed images.
 * The original canvas may optionally be a video.
 * 
 * This should be instantiated in your JavaScript code as:
 *  <pre>
 *     var ImageProcessingDisplay = require('image-processing-display');
 *     var display = ImageProcessingDisplay.ImageProcessingDisplay(options);
 *  </pre>
 *  
 *  where 'options' is optional and may contain:
 *  
 *  <ul> 
 *   <li> options.video True if the source is a video; false for still image. </li>
 *   <li> options.originalLabel Text of label for original image. </li>
 *   <li> options.resultLabel Text of label for result image.
 *  </ul> 
 */

var EventEmitter = require('events').EventEmitter;

exports.ImageProcessingDisplay = function (options) {
    // TODO:  Video.
    // Create a pair of canvases to show original image and result.
    this.originalCanvas = document.createElement('canvas');
    this.resultCanvas = document.createElement('canvas');
    this.image = null;
    
    // Create a div to contain the canvases.
    var container = document.createElement('div');
    container.style.width = '95%';
    container.style.margin = '1em';
    container.style.padding = '1em';
    
    var labels = document.createElement('div');
    labels.style.fontSize = '1.5em';
    labels.style.width = '100%';
    
    var originalLabel = document.createElement('div');
    originalLabel.style.width = '45%';
    originalLabel.style.float = 'left';
    originalLabel.style.textAlign = 'center';
    
    if (options !== null && typeof options !== 'undefined' && 
        options.originalLabel !== null && typeof options.originalLabel !== 'undefined') {
        originalLabel.innerHTML = options.originalLabel;
    } else {
        originalLabel.innerHTML = "Original Image";
    }
    
    var resultLabel = document.createElement('div');
    resultLabel.style.width = '45%';
    resultLabel.style.float = 'right';
    resultLabel.style.textAlign = 'center';
    resultLabel.style.verticalAlign = 'top';
    
    if (options !== null && typeof options !== 'undefined' && 
        options.resultLabel !== null && typeof options.resultLabel !== 'undefined') {
        resultLabel.innerHTML = options.resultLabel;
    } else {
        resultLabel.innerHTML = "Result";
    }
    
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
    
    // Search for Camera, ComputerVision, or FaceDetector
    var parent;
    var accessorDiv = document.getElementById('Camera');

    if (accessorDiv === null || typeof accessorDiv === 'undefined') {
        accessorDiv = document.getElementById('ComputerVision');
        if (accessorDiv === null || typeof accessorDiv === 'undefined') {
            accessorDiv = document.getElementById('FaceDetector');
        }
    }
    
    if (accessorDiv !== null && typeof accessorDiv !== 'undefined') {
        // Found Camera, ComputerVision or FaceDetector.
        parent = accessorDiv.parentNode;
        
        if (parent !== null && typeof parent !== 'undefined') {
            parent.insertBefore(container, accessorDiv);
        } else {
            document.body.insertBefore(container, accessorDiv);
        }
    } else {
        // Look for accessorDirectoryTarget, as in accessors library page.
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
};

util.inherits(exports.ImageProcessingDisplay, EventEmitter);

/** Get the original image.
 * @return The original image.
 */ 
exports.ImageProcessingDisplay.prototype.getOriginal = function(){
    var ctx = this.originalCanvas.getContext('2d');
    var image =  ctx.getImageData(0, 0, this.originalCanvas.width, 
                                  this.originalCanvas.height);
    return image;
}

/** Get the result image.
 * @return The result image.
 */
exports.ImageProcessingDisplay.prototype.getResult = function() {
    var ctx = this.resultCanvas.getContext('2d');
    var image =  ctx.getImageData(0, 0, this.resultCanvas.width, 
                                  this.resultCanvas.height);
    return image;
}

/** Set the original image.
 * @parameter input The image or path to a local image.  Remote images are not
 * supported due to browser security restrictions - a browser will not allow a
 * remote image to be exported from a canvas.
 */
exports.ImageProcessingDisplay.prototype.setOriginal = function(input) {
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

/** Set the image on the result canvas.  Height and width are optional. If 
 * height and width are provided the result image container will be resized.
 * @param image The image to display on the result canvas.
 * @param height The height of the image.
 * @param width The width of the image.
 */

exports.ImageProcessingDisplay.prototype.setResult = 
    function(image, height, width) {
        var ctx = this.resultCanvas.getContext("2d");
        
        if (height !== null && typeof height !== "undefined" 
            && width !== null && typeof width !== "undefined") {
            this.resultCanvas.height = height;
            this.resultCanvas.width = width;
        }
        ctx.clearRect(0, 0, this.resultCanvas.width, this.resultCanvas.height)
        ctx.putImageData(imdata, 0, 0);
    }

/** Set the image on the result canvas using OpenCV Mat format data.
 * @param mat The image data in Mat format.
 *  From https://github.com/ucisysarch/opencvjs
 */
exports.ImageProcessingDisplay.prototype.setMatResult = function(mat) {
    var data = mat.data();         // output is a Uint8Array that aliases directly into the Emscripten heap

    var channels = mat.channels();
    var channelSize = mat.elemSize1();

    var ctx = this.resultCanvas.getContext("2d");
    ctx.clearRect(0, 0, this.resultCanvas.width, this.resultCanvas.height);

    this.resultCanvas.width = mat.cols;
    this.resultCanvas.height = mat.rows;

    var imdata = ctx.createImageData(mat.cols, mat.rows);

    for (var i = 0,j=0; i < data.length; i += channels, j+=4) {
        imdata.data[j] = data[i];
        imdata.data[j + 1] = data[i+1%channels];
        imdata.data[j + 2] = data[i+2%channels];
        imdata.data[j + 3] = 255;
    }
    ctx.putImageData(imdata, 0, 0);
};
