// Accessor for generating and controlling a dashboard video component
//
// Copyright (c) 2015-2017 The Regents of the University of California.
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

/** 
 *
 *  Implements the UIComponent interface to produce and control a streaming video component.
 *  Refer to the documentation of dashboard/UIComponent for more detailed information.
 *
 *  Note the dashboard assumes web components are defined with the special name 
 *  '__componentName__'. It will replace this string before intialization.
 *
 *  @accessor dashboard/VideoComponent
 *  @author Matt Weber
 *  @version $$Id$$
 *  @input userInput A JSON message produced by the instantiated video web component
 *      in the dashboard.
 *  @parameter componentID A unique ID used for communication with the video component.
 *  @parameter videoSource URI of the video to be played. This accessor will replace all instances of
 *      the special string '__videoSource__' in the video component. Defaults to the URI of
 *      the (Creative Commons) Sintel movie trailer.
 *  @output componentUpdate A websocket message produced upon initialization to send the video component
 *      to the dashboard app.
 */

// Stop extra messages from jslint and jshint.  Note that there should
// be no space between the / and the * and global. See
// https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSHint */
/*globals addInputHandler, addInputParameter, console, error, exports, extend, input, get, getParameter, getResource, output, parameter, send */
/*jshint globalstrict: true*/
'use strict';
 
 /** Set up the accessor by defining the inputs and outputs.
 */
var videoComponentURI = "videoBundle.js";
var videoComponentTimeout = 5000; //milliseconds

exports.setup = function () {
    this.implement('dashboard/UIComponent');
    this.parameter('videoSource', {
        "type": 'string',
        "value": "../SAC_capital.mp4"
    });
};
//"../trailer_hd.mp4"
//DOESN'T WORK "https://streamable.com/s/qeecg/qwiazk"
//"https://media.w3.org/2010/05/sintel/trailer_hd.mp4"

exports.initialize = function(){
    var videoComponent = getResource(videoComponentURI, videoComponentTimeout);
    var replaceSource = videoComponent.replace("__videoSource__", this.getParameter('videoSource'));

    //FIXME I can't get the socketID selection to work with WebSocketServer.js.
    //The following should work...

    var message = {
        "id": "system",
        "component": replaceSource,
        "priority": 0
    };
    // var initMessage = {
    //     socketID: 0,
    //     message: JSON.stringify(message)
    // };

    //For now, just broadcast
    // var initMessage = {
    //     "id": "system",
    //     "component": replaceSource,
    // };

    this.send('componentUpdate',message);
};