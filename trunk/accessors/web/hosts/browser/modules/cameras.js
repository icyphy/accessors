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

/**
 * Module to access camera hardware on the browser host.
 *
 * Code from Mozilla Contributors:
 * https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
 * Available under MIT license:
 * https://developer.mozilla.org/en-US/docs/MDN/About#Copyrights_and_licenses
 * Please see cameraslicense.js for license text.
 * 
 * @module camera
 * @author Edward A. Lee, Elizabeth Osyk
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*globals Java, exports, require, util */
/*jshint globalstrict: true*/
"use strict";

var EventEmitter = require('events').EventEmitter;

////////////////////////////////////////////////////////////
//// Functions provided in this module.

/** Return an array of camera names for cameras currently available
 *  on the current host. This array includes a special name "default camera",
 *  which represents the system default camera, if there is one.
 *  @return An array of names, or null if there are no cameras.
 */
exports.cameras = function() {
	return 'default camera';
};

	//= function () {
	// TODO:  This returns a single camera for now.
	// Find list of multiple cameras.  E.g., front, rear, ...  
    // The Java.from() Nashorn extension converts a Java array into a JavaScript array.
    // return Java.from(CameraHelper.cameras());
//};

/** Return the name of the default camera on the current host, or null
 *  if there is none.
 *  @return A camera name.
 */
exports.defaultCamera = function () {
	
	// TODO:  Return what here?
	// Do we know what cameras are available?
	return 'default camera';
    //return CameraHelper.defaultCamera();
};

////////////////////////////////////////////////////////////
//// Classes provided in this module.

/** Construct an instance of an Camera object type. To capture an image from
 *  the default camera, you can do this:
 *  <pre>
 *     var cameras = require("cameras");
 *     var camera = new cameras.Camera();
 *     camera.open();
 *     var image = camera.snapshot();
 *     camera.close();
 *  </pre>
 *  The image will be a binary object. This object can be sent to an output
 *  port displayed or otherwise further processed. To capture every image
 *  from the camera, you can do this:
 *  <pre>
 *     var cameras = require("cameras");
 *     var camera = new cameras.Camera();
 *     camera.on('image', function(image) { ... handle the image ... });
 *     camera.open();
 *     ...
 *     camera.close();
 *  </pre>
 *  An instance of this object type implements the following functions:
 *  <ul>
 *  <li> close(): Close the camera.
 *  <li> getViewSize(): Return the current view size for this camera as a JSON string, as in {"width":176, "height":144}.
 *  <li> on(event, handler): Specify an event handler for the camera.
 *  <li> open(): Open the camera.
 *  <li> setViewSize(size): Set the current view size for this camera. The argument can either be a JSON string or an object with a width and height field, as in for example {"width":176, "height":144}.
 *  <li> snapshot(): Return the last image recorded by the camera.
 *  <li> viewSizes(): Return an array of view sizes supported by this camera, each given as a JSON string of the form '{"width":176, "height":144}', for example.
 *  </ul>
 *  An instance of this object emits the following events:
 *  <ul>
 *  <li> "opened": The camera has been opened.
 *  <li> "image": A new image has been obtained.
 *  <li> "closed": The camera has been closed.
 *  </ul>
 *  @param name The camera name, or null to use the default camera.
 */
exports.Camera = function (name) {
	var self = this;
	
	this.isPlaying = false;
	
	// Create a hidden video element on the page.
	// FIXME:  Make sure to generate a unique name.  Right now name is hard-coded.
	// TODO:  For the browser, we may want to view the video element?
	// How to do this?  What does it mean for other hosts?
	// What to do for audio?  Audio would be sourced from the same element.
	// So we probably want to locate the element to see if it's already created.
	// This would imply a singleton class?
	this.video = document.createElement('video');
	this.video.style.width = '100%';
	this.video.style.height = 'auto';
	
	// Create a div to contain the live streaming video and the snapshot.
	var container = document.createElement('div');
	container.style.width = '95';
	container.style.margin = '1em';
	container.style.padding = '1em';
	
	var labels = document.createElement('div');
	labels.style.fontSize = '1.5em';
	labels.style.width = '100%';
	
	var videoLabel = document.createElement('div');
	videoLabel.innerHTML = "Live Video";
	videoLabel.style.width = '45%';
	videoLabel.style.float = 'left';
	videoLabel.style.textAlign = 'center';
	
	var snapshotLabel = document.createElement('div');
	snapshotLabel.innerHTML = "Snapshot";
	snapshotLabel.style.width = '45%';
	snapshotLabel.style.float = 'right';
	snapshotLabel.style.textAlign = 'center';
	snapshotLabel.style.verticalAlign = 'top';
	
	labels.appendChild(videoLabel);
	labels.appendChild(snapshotLabel);
	
	this.videoContainer = document.createElement('div');
	this.videoContainer.style.display = 'inline-block';
	this.videoContainer.style.width = '45%';
	var videoLabel = document.createElement('div');
	videoLabel.innerHTML = "Live Video";
	
	this.snapshotContainer = document.createElement('div');
	this.snapshotContainer.style.float = 'right';
	this.snapshotContainer.style.width = '45%';
	
	container.appendChild(this.videoContainer);
	this.videoContainer.appendChild(this.video);
	container.appendChild(this.snapshotContainer);
	container.appendChild(labels);
	
	// Place video and snapshot above Camera accessor.
	// If not found (e.g. a composite accessor), place above the first accessor.
	// If not found, insert at page top.
	// Currently only supports a single Camera accessor.
	
	var accessorDiv = document.getElementById('Camera');
	var parent;
	
	if (accessorDiv !== null && typeof accessorDiv !== 'undefined') {
		// Found Camera accessor.
		console.log('found camera accessor');
		parent = accessorDiv.parentNode;
		
		if (parent !== null && typeof parent !== 'undefined') {
			console.log('inserting before camera accessor');
			parent.insertBefore(container, accessorDiv);
		} else {
			console.log('inserting at top of body, not camera');
			document.body.insertBefore(container, accessorDiv);
		}
	} else {
		// Look for accessorDirectoryTarget, as in terraswarm library page.
		accessorDiv = document.getElementById('accessorDirectoryTarget');
		
		if (accessorDiv !== null && typeof accessorDiv !== 'undefined') {
			console.log('found accessor directory target');
			parent = accessorDiv.parentNode;
			
			if (parent !== null && typeof parent !== 'undefined') {
				console.log('inserting before target');
				parent.insertBefore(container, accessorDiv);
			} else {
				console.log('inserting at top of body, not target');
				document.body.insertBefore(container, accessorDiv);
			}
		} else {
			// No Camera accessor.  Find any accessor.  If none, use page top.
			accessorDiv = document.getElementsByClassName('accessor');
			if (accessorDiv !== null && typeof accessorDiv !== 'undefined' && 
					accessorDiv.length > 0) {
				console.log('found accessor');
				accessorDiv = accessorDiv[0];
				var parent = accessorDiv.parentNode;
				if (parent !== null && typeof parent !== 'undefined') {
					console.log('inserting before accessor');
					parent.insertBefore(container, accessorDiv);
				} else {
					console.log('inserting at top of body, not accessor');
					document.body.insertBefore(container, accessorDiv);
				}
			} else if (document.body.firstChild !== null && 
					typeof document.body.firstChild !== 'undefined') {
					console.log('no div found inserting at page top');
					document.body.insertBefore(container, document.body.firstChild);
			} else {
				console.log('no first child found appending at bottom');
				document.body.appendChild(container);
			}
		}
	}
	
	// FIXME:  Ideally, make canvas equal to smaller of video size or 
	// parent element size.
	// How does this affect the size of the image sent on output port?
	// The width-setting must go after the container is added to the body.
	
	this.canvas = document.createElement('canvas');
	this.canvas.width = this.snapshotContainer.clientWidth;
	
	this.snapshotContainer.appendChild(this.canvas);
	
	// Check for the mediaDevices.getUserMedia library.
	getUserMediaSetup();
};
util.inherits(exports.Camera, EventEmitter);


/** Close the camera, stopping any image acquisition.
 */
exports.Camera.prototype.close = function () {
	// Tracks must be stopped individually.
	// FIXME:  Do we want to stop audio tracks too?  
	// MediaStream.getTracks()
	// MediaStream.getVideoTracks()
	// MediaStream.getAudioTracks()
	this.stream.getTracks.forEach(function(track) {
		track.stop();
	});
	this.isPlaying = false;
};

/** Return the current view size for this camera, a JSON string
 *  as in {"width":176, "height":144}.
 *  @return A JSON string representing the current view size.
 */
// FIXME:  What to return if size is unknown?  for example if called on a closed camera?
exports.Camera.prototype.getViewSize = function () {
	// TODO:  Refresh parameters in browser view?
	var width = 0, height = 0;
	if (this.video.videoWidth !== null && typeof this.video.videoWidth !== 'undefined') {
		width = this.video.videoWidth;
	}
	
	if (this.video.videoHeight !== null && typeof this.video.videoHeight !== 'undefined') {
		height = this.video.videoHeight;
	}
	return {'width': width, 'height': height};
};

/** Open the camera, initiating emission of the 'image' event each
 *  time the camera obtains a new image.
 *
 *  Code from Mozilla Contributors:
 *  https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
 *  Available under MIT license:
 *  https://developer.mozilla.org/en-US/docs/MDN/About#Copyrights_and_licenses
 *  Please see cameraslicense.js for license text.
 */
exports.Camera.prototype.open = function () {
	var self = this;
	
	// TODO:  Audio module can share video source?
	navigator.mediaDevices.getUserMedia({ audio: false, video: true })
		.then(function(stream) {
			self.stream = stream;
		  // Older browsers may not have srcObject
		  self.video.src = window.URL.createObjectURL(stream);
		  self.video.onloadedmetadata = function(e) {
		    self.video.play();
		  };
	})
	.catch(function(err) {
	  console.log(err.name + ": " + err.message);
	});
};

/** Set the current view size for this camera.
 *  The argument can either be a JSON string or an object with a width and
 *  height field, as in for example {"width":176, "height":144}.
 *  @param size A view size.
 */
exports.Camera.prototype.setViewSize = function (size) {
	// TODO:  Have to reset <video> element somehow?
    //if (typeof size === 'string') {
    //    size = JSON.parse(size);
    //}
    //this.helper.setViewSize(size);
};

exports.Camera.prototype.snapshot = function () {
	var self = this;
	
	var playingHandler = function() {
		self.isPlaying = true;
		// This listener removes itself since we only want one snapshot returned
		// per request.
		self.video.removeEventListener('playing', playingHandler);
		
		self.canvas.height = self.videoContainer.clientHeight;
		var context = self.canvas.getContext('2d');
		
		// FIXME:  Should use ratio of video container to canvas container.
		// They're equal in this example, but that isn't necessarily always the case.
		context.drawImage(self.video, 0, 0, self.canvas.width, self.videoContainer.clientHeight);
		self.emit('snapshot', context.getImageData(0, 0, self.canvas.width, self.videoContainer.clientHeight));
	}
	
	if (!this.isPlaying) {
		this.video.addEventListener('playing', playingHandler);
	} else {
		// FIXME:  Doesn't work if snapshotted before initialize. 
		// (I.e. if you enter 'true' for triggered input before clicking
		// react to inputs first time.
		this.canvas.height = this.videoContainer.clientHeight;
		var context = this.canvas.getContext('2d');
		
		// FIXME:  Should use ratio of video container to canvas container.
		// They're equal in this example, but that isn't necessarily always the case.
		context.drawImage(this.video, 0, 0, this.canvas.width, this.videoContainer.clientHeight);
		this.emit('snapshot', context.getImageData(0, 0, this.canvas.width, this.videoContainer.clientHeight));
	}
};

/** Return an array of view sizes supported by this camera,
 *  each given as a JSON string of the form '{"width":176, "height":144}', for example.
 *  @return An array of strings representing available view sizes.
 */
exports.Camera.prototype.viewSizes = function () {
	// TODO:  Is this available in browser?
    // The Java.from() Nashorn extension converts a Java array into a JavaScript array.
    //return Java.from(this.helper.viewSizes());
};

/** Determine if getUserMedia functions are available.  Set placeholders if not.
 * 	Code from Mozilla Contributors:
 *  https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
 *  Available under MIT license:
 *  https://developer.mozilla.org/en-US/docs/MDN/About#Copyrights_and_licenses
 *  Please see cameraslicense.js for license text.
 */
function getUserMediaSetup() {
	//Older browsers might not implement mediaDevices at all, so we set an empty object first
	if (navigator.mediaDevices === undefined) {
	  navigator.mediaDevices = {};
	}
	
	// Some browsers partially implement mediaDevices. We can't just assign an object
	// with getUserMedia as it would overwrite existing properties.
	// Here, we will just add the getUserMedia property if it's missing.
	if (navigator.mediaDevices.getUserMedia === undefined) {
	  navigator.mediaDevices.getUserMedia = function(constraints) {
	
	    // First get ahold of the legacy getUserMedia, if present
	    var getUserMedia = (navigator.getUserMedia ||
	      navigator.webkitGetUserMedia ||
	      navigator.mozGetUserMedia);
	
	    // Some browsers just don't implement it - return a rejected promise with an error
	    // to keep a consistent interface
	    if (!getUserMedia) {
	      return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
	    }
	
	    // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
	    return new Promise(function(resolve, reject) {
	      getUserMedia.call(navigator, constraints, resolve, reject);
	    });
	  }
	}
}
