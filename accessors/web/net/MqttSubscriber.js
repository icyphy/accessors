// Copyright (c) 2016 The Regents of the University of California.
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
 *  TODO: populate inputs/outputs/parameters
 *
 *  @accessor net/MqttSubscriber
 *  @author Hokeun Kim
 *  @version $$Id$$
 */
 
// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*global console, exports, require */
/*jshint globalstrict: true */
"use strict";

var mqtt = require('mqtt');

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
};

var self;
var mqttClient;
function onMessage(topic, data) {
    self.send('received', data);
    self.send('receivedTopic', topic);
}

function onConnect() {
    self.send('connection', 'connected to broker');
}

exports.subscribeInputHandler = function () {
    var topic = this.get('subscribe');
    if (mqttClient.connected) {
        mqttClient.subscribe(topic);
        self.send('subscription', 'Topic: ' + topic + ' - subscribed');
    }
    else {
        self.error('Client is not connected to broker, subscribe failed. Topic: ' + topic);
    }
};

exports.unsubscribeInputHandler = function () {
    var topic = this.get('unsubscribe');
    if (mqttClient.connected) {
        mqttClient.unsubscribe(topic);
        self.send('subscription', 'Topic: ' + topic + ' - unsubscribed');
    }
    else {
        self.error('Client is not connected to broker, unsubscribe failed. Topic: ' + topic);
    }
};

exports.initialize = function() {
    self = this;
    this.addInputHandler('subscribe', exports.subscribeInputHandler.bind(this));
    this.addInputHandler('unsubscribe', exports.unsubscribeInputHandler.bind(this));
    mqttClient = mqtt.createClient(self.getParameter('brokerPort'), self.getParameter('brokerHost'));
    mqttClient.on('connect', onConnect);
    mqttClient.on('message', onMessage);
    mqttClient.start();
};

exports.wrapup = function() {
    mqttClient.end();
};
