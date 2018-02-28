// Copyright (c) 2016-2017 The Regents of the University of California.
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

/** Subscribe to MQTT protocol messages.
 *  MQTT is a lightweight messaging protocol.
 *  The brokerHost and brokerPort parameters specify the IP address and port
 *  of an MQTT broker, such as Mosquito.
 *  When a connection to the broker is established, a message will be produced
 *  on the connection output.
 *  To subscribe to a topic, provide the topic name to the subscribe input.
 *  If you send multiple topics to this input, it will subscribe to all the specified
 *  topics. To subscribe to all topics provided by the broker, give # as the topic name.
 *  To unsubscribe to a topic, provide the topics name to the unsubscribe input.
 *  
 *  This accessor requires the 'mqtt' module.
 *
 *  @input subscribe The topic name to which to subscribe.
 *   Use # to subscribe to all topics.
 *  @input unsubscribe A topic to unsubscribe from.
 *  @output connection Output on which a string is sent when a
 *   connection to the broker has been established.
 *  @output subscription Output on which a string is sent when a
 *   subscription is initiated or terminated.
 *  @output received Output on which received data is produced.
 *  @output receivedTopic Output indicating the topic of received data.
 *  @param brokerHost The IP address or domain name of the MQTT broker.
 *   If you don't have a local MQTT Broker, then try 
 *   iot.eclipse.org.  If you use iot.eclipse.org, then avoid
 *   using "#" as a topic.
 *  @param brokerPort The port for the MQTT broker, which defaults
 *   to 1883.
 *
 *  @accessor net/MQTTSubscriber
 *  @author Hokeun Kim, contributor: Christopher Brooks
 *  @version $$Id$$
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*global console, exports, require */
/*jshint globalstrict: true */
"use strict";

var mqtt = require('@accessors-modules/mqtt');

exports.setup = function () {
    // Inputs and outputs
    this.input('subscribe', {
        'type': 'string',
        'value': ''
    });
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
        type: 'int',
        value: 1883
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
    // In case there is a topic, subscribe to it.
    exports.subscribeInputHandler.call(self);
}

exports.subscribeInputHandler = function () {
    var topic = this.get('subscribe');
    if (topic === '') {
        // No topic is given.
        return;
    }
    if (mqttClient.connected) {
        mqttClient.subscribe(topic);
        this.send('subscription', 'Topic: ' + topic + ' - subscribed');
    } else {
        this.error('Client is not connected to broker, subscribe failed. Topic: ' + topic);
    }
};

exports.unsubscribeInputHandler = function () {
    var topic = this.get('unsubscribe');
    if (mqttClient.connected) {
        mqttClient.unsubscribe(topic);
        this.send('subscription', 'Topic: ' + topic + ' - unsubscribed');
    } else {
        this.error('Client is not connected to broker, unsubscribe failed. Topic: ' + topic);
    }
};

exports.initialize = function () {
    self = this;
    this.addInputHandler('subscribe', exports.subscribeInputHandler.bind(this));
    this.addInputHandler('unsubscribe', exports.unsubscribeInputHandler.bind(this));
    mqttClient = mqtt.createClient(this.getParameter('brokerPort'), this.getParameter('brokerHost'));
    mqttClient.on('connect', onConnect.bind(this));
    mqttClient.on('message', onMessage.bind(this));
    mqttClient.start();
};

exports.wrapup = function () {
    if (mqttClient) {
        mqttClient.end();
    }
};
