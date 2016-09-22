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

/** This accessor is used for subscribing MQTT protocol messages.
 *
 *  This accessor requires the 'mqtt' module.
 *
 *  @accessor net/MqttSubscriber
 *  TODO: populate inputs/outputs/parameters
 *
 *  @author Hokeun Kim
 *  @version $$Id$$
 */
 
"use strict";

var mqtt = require('mqtt');
var client;

exports.setup = function () {
    // Inputs and outputs
    this.input('subscribe');
    this.input('unsubscribe');
    this.output('connection', {	
    	spontaneous: true
    });
    this.output('subscription');
    this.output('received', {
    	spontaneous: true
    });
    this.output('receivedTopic');
    this.parameter('brokerHost', {
        type: 'string',
        value: ''
    });
    this.parameter('brokerPort', {
        type : 'int',
        value : 1883
    });
    this.parameter('qosLevel', {
        type: 'int',
        value: 0
    });
}
var self;
var receivedCount = 0;
function onMessage(topic, data) {
    self.send('received', data);
    self.send('receivedTopic', topic);
}

function onConnect() {
    self.send('connection', 'connected to broker');
}

exports.subscribeInputHandler = function () {
    var topic = this.get('subscribe');
    if (client.connected) {
        client.subscribe(topic);
        self.send('subscription', 'Topic: ' + topic + ' - subscribed');
    }
    else {
        self.send('error', 'Client is not connected to broker, subscribe failed. Topic: ' + topic);
    }
};

exports.unsubscribeInputHandler = function () {
    var topic = this.get('unsubscribe');
    if (client.connected) {
        client.unsubscribe(topic);
        self.send('subscription', 'Topic: ' + topic + ' - unsubscribed');
    }
    else {
        self.send('error', 'Client is not connected to broker, unsubscribe failed. Topic: ' + topic);
    }
};

exports.initialize = function() {
    self = this;
    this.addInputHandler('subscribe', exports.subscribeInputHandler.bind(this));
    this.addInputHandler('unsubscribe', exports.unsubscribeInputHandler.bind(this));
    client = mqtt.createClient(self.getParameter('brokerPort'), self.getParameter('brokerHost'));
    client.on('connect', onConnect);
    client.on('message', onMessage);
    client.start();
}

exports.wrapup = function() {
    client.end();
}
