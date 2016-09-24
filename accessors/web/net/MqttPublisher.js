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

/** This accessor is used for publishing MQTT protocol messages.
 *
 *  This accessor requires the 'mqtt' module.
 *
 *  @accessor net/MqttPublisher
 *  TODO: populate inputs/outputs/parameters
 *
 *  @author Hokeun Kim
 *  @version $$Id$$
 */
 
"use strict";

var mqtt = require('mqtt');

exports.setup = function () {
    // Inputs and outputs
    this.input('toPublish');
    this.output('connection', { 
        spontaneous: true
    });
    // Server information
    this.parameter('brokerHost', {
        type: 'string',
        value: ''
    });
    this.parameter('brokerPort', {
        type : 'int',
        value : 1883
    });
    this.parameter('topic', {
        type: 'string',
        value: ''
    });
    this.parameter('qosLevel', {
        type: 'int',
        value: 2
    });
}
var self;
var mqttClient;

function onConnect() {
    self.send('connection', 'connected to broker');
}

exports.toPublishInputHandler = function () {
    var toPublish = this.get('toPublish');

    if (mqttClient.connected) {
        mqttClient.publish(this.getParameter('topic'), toPublish,
            {qos: this.getParameter('qosLevel')});
    } else {
        console.log('MQTT client is not connected. Discarding data.');
    }
};

exports.initialize = function() {
    self = this;
    this.addInputHandler('toPublish', exports.toPublishInputHandler.bind(this));
    mqttClient = mqtt.createClient(this.getParameter('brokerPort'), this.getParameter('brokerHost'));
    mqttClient.on('connect', onConnect);
    mqttClient.start();
}

exports.wrapup = function() {
    mqttClient.end();
}
