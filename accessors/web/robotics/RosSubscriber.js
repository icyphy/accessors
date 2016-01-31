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

/** This accessor subscribes to a pre-established ROS topic.<br>
 *  It communicates to ROS through the rosbridge web socket, and extends the 
 *  WebSocketClient accessor to do so. 
 *  It has a 'topic' parameter, that must be prefixed with a '/' eg: '/noise'.<br>. 
 *  The other parameters configure how the data is to be received according
 *  to the rosbridge specification:
 *  https://github.com/RobotWebTools/rosbridge_suite/blob/develop/ROSBRIDGE_PROTOCOL.md#344-subscribe
 *
 *  @accessor robotics/RosSubscriber
 *  @parameter {string} topic The ROS topic to subscribe to.
 *  @parameter {int} throttleRate The minimum amount of time (in ms)
 *   that must elapse between messages sent. Defaults to 0.
 *  @parameter {int} queueLength The ROS size of the queue to buffer messages.
 *   Messages are buffered as a result of the throttleRate. Defaults to 1.
 *  @parameter {int} fragment_size The maximum size that a message can take
 *   before it is to be fragmented. Defaults to 1000. Ptolemy will close the
 *   model if fragment size is too large (not sure what the maximum is).
 *  @parameter {string} compression A string to specify the compression
 *   scheme to be used on messages. Options are "none" (default) and "png". 
 *  @parameter {boolean} outputCompleteResponseOnly A flag which if set to true
 *   will cause the accessor to delay in sending messages on the "received" port
 *   until it has concatenated the data fields from message fragments back into
 *   the original unfragmented message. Otherwise it will send the message
 *   fragments as they come in.
 *  @output {boolean} connected The status of the web socket connection.
 *  @output {JSON} received The data received from the web socket server.
 *  @author Marcus Pan, Matt Weber
 *  @version $$Id$$ 
 */

// Stop extra messages from jslint and jshint.  Note that there should
// be no space between the / and the * and global. See
// https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSHint */
/*globals console, getParameter, exports, extend, parameter, send */
/*jshint globalstrict: true*/
'use strict';

/** Sets up by accessor by inheriting inputs, outputs and parameters from setup() in WebSocketClient.<br>
 *  Adds a 'topic' input which is the ROS topic to subscribe to. */
exports.setup = function() {

    this.extend('net/WebSocketClient');

    this.parameter('topic', {
        type: "string",
        value: ""
    });
    this.parameter('throttleRate', {
        type: "int",
        value: 0
    });
    this.parameter('queueLength', {
        type: "int",
        value: 10
    });
    this.parameter('fragmentSize', {
        type: "int",
        value: 10000
    });
    this.parameter('outputCompleteResponseOnly', {
        type: "boolean",
        value: true
    });
    this.parameter('compression', {
        type: "string",
        value: 'none'
    });
};

/** Overrides the toSendInputHandler to throw an error if called.
 *  A subscriber should not be publishing inputs.
 */
exports.toSendInputHandler = function() {
    console.error('This is a subscriber and does not take input to publish.');
};

/** Inherits initialize from webSocketClient.
 *  Sends a message to rosbridge to start subscribing to the topic on input 'topic'.
 */ 
exports.initialize = function() {
    this.exports.ssuper.initialize.call(this);

    this.exports.sendToWebSocket.call(this, {
        "op": "subscribe",
        "topic": this.getParameter('topic'),
        "throttle_rate": this.getParameter('throttleRate'),
        "queue_length": this.getParameter('queueLength'),
        "fragment_size": this.getParameter('fragmentSize'),
        "compression": this.getParameter('compression')
    });
};

/** Unsubscribe from the topic. Close websocket connections by calling wrapup of WebSocketClient */
exports.wrapup = function() {
    var unsubscribe = {
        "op": "unsubscribe",
        "topic": this.getParameter('topic')
    };
    this.exports.sendToWebSocket.call(this, unsubscribe);
    this.exports.ssuper.wrapup.call(this);
};

//Combines fragments into the original message. If the message is incomplete this function
//returns null. When the entire message has been received it returns the whole message.
exports.defragmentMessage = (function() {
    
    //This closure remembers the number and content of fragments already seen.
    var originalMessage = "";
    var fragmentCount = 0;
    
    var processMessage = function(message){

        //Check for missing fragment
        if (fragmentCount != message.num){
            console.error("Fragment "
                + fragmentCount
                + " of message is missing. Instead received fragment number "
                + message.num);
        }

        //Accumulate data from fragment.
        if (fragmentCount === 0){
            originalMessage = message.data;
            fragmentCount++;
            return null;
        } else if (fragmentCount < message.total - 1 ){
            originalMessage += message.data;
            fragmentCount++;
            return null;
        } else if (fragmentCount == message.total -1 ){
            originalMessage += message.data;
            fragmentCount = 0;
            return originalMessage;
        } else {
            console.error("Error in reconstructing fragments. Fragment count exceeds indicated total.");
            return null;
        }
    };
    return processMessage;
})();


exports.onMessage = function(message){
    
    var messageToSend;
    if (getParameter('outputCompleteResponseOnly') && message.op == "fragment"){
        messageToSend = this.defragmentMessage(message);
        if (messageToSend === null){
            return;
        }
    } else {
        messageToSend = message;
    }

    this.send('received', messageToSend);
};
