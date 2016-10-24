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

/** This accessor is used for publishing secure messages over MQTt protocol,
 *  using authorization service provided by a local authorization entity.
 *
 *  This accessor requires the 'iotAuth' and 'mqtt' modules.
 *
 *  @accessor net/SecurePublisher
 *
 *  @input toPublish The message to be published.
 *
 *  @output connection Output an object when a connection with a MQTT broker is established.
 *  @output ready Output an object when the secure publisher is ready to publish secure
 *      messages with a session key and connection with a MQTT broker.
 *
 *  @parameter {string} brokerHost The MQTT broker's IP address or domain name.
 *  @parameter {int} brokerPort The MQTT broker's port number.
 *  @parameter {string} topic The topic to publish.
 *  @parameter {int} qosLevel QoS level of MQTT for published messages
 *
 *  @parameter {string} publisherName The publisher's unique name in string.
 *  @parameter {string} authHost Auth's IP address or domain name.
 *  @parameter {int} authPort Auth's port number.
 *
 *  @parameter {string} authCertPath The path for the X.509 certificate file (in pem format)
 *   of Auth with which the publisher is registered.
 *  @parameter {string} publisherPrivateKeyPath The path for the pem format private key of
 *   the publisher.
 *
 *  @parameter {string} publicKeyCryptoSpec The specification for the public cryptography
 *   algorithms to be used for communication with Auth
 *  @parameter {string} distributionCryptoSpec The specification for the symmetric cryptography
 *   algorithms to be used for communication with Auth
 *  @parameter {string} sessionCryptoSpec The specification for the symmetric cryptography
 *   algorithms to be used for publishing messages to the subscribers
 *
 *  @parameter {int} numKeysPerRequest The number of session keys to be requested per
 *   session key request to Auth
 *
 *  @author Hokeun Kim
 *  @version $$Id$$
 */
 
"use strict";

var iotAuth = require('iotAuth');
var mqtt = require('mqtt');

exports.setup = function () {
    // Inputs and outputs
    this.input('toPublish');
    this.output('connection', {	
    	spontaneous: true
    });
    this.output('ready', {	
    	spontaneous: true
    });
    // MQTT information
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
    // Publisher information
    this.parameter('publisherName', {
        value: '',
        type: 'string'
    });
    // For communication with Auth
    this.parameter('authHost', {
        type : 'string',
        value : 'localhost'
    });
    this.parameter('authPort', {
        value: -1,
        type: 'int'
    });
    this.parameter('authCertPath', {
        value: '',
        type: 'string'
    });
    this.parameter('publisherPrivateKeyPath', {
        value: '',
        type: 'string'
    });
    // Spec for communication with Auth
    this.parameter('publicKeyCryptoSpec', {
        type: 'string',
        options: iotAuth.publicKeyCryptoSpecs,
        value: iotAuth.publicKeyCryptoSpecs[0]
    });
    this.parameter('distributionCryptoSpec', {
        type: 'string',
        options: iotAuth.symmetricCryptoSpecs,
        value: iotAuth.symmetricCryptoSpecs[0]
    });
    this.parameter('numKeysPerRequest', {
        value: 1,
        type: 'int'
    });
    // For communication with server
    this.parameter('sessionCryptoSpec', {
        type: 'string',
        options: iotAuth.symmetricCryptoSpecs,
        value: iotAuth.symmetricCryptoSpecs[0]
    });
}

var self;
var mqttClient;
var authPublicKey;
var publisherPrivateKey;
var currentDistributionKey = null;
var currentSessionKey = null;
var currentSessionKeyList = [];
var mqttConnected = false;
var publisherReady = false;
var publishSequenceNum = 0;

function onConnect() {
	mqttConnected = true;
	self.send('connection', 'connected to a broker');
	if (!publisherReady && mqttConnected && currentSessionKey != null) {
		publisherReady = true;
    	self.send('ready', 'publisher is ready');
	}
};

function sessionKeyResponseCallback(status, distributionKey, sessionKeyList) {
    if (status.error) {
        console.log(status.error);
        console.log('session key request failed...');
        return;
    }
    console.log('session key request succeeded');

    if (distributionKey) {
        console.log('Updating to a new distribution key key');
        currentDistributionKey = distributionKey;
    }

    console.log('received ' + sessionKeyList.length + ' session keys');
    for (var i = 0; i < sessionKeyList.length; i++) {
        currentSessionKeyList.push(sessionKeyList[i]);
    }
    if (currentSessionKeyList.length > 0) {
    	currentSessionKey = currentSessionKeyList.shift();
    }
	if (!publisherReady && mqttConnected && currentSessionKey != null) {
		publisherReady = true;
    	self.send('ready', 'publisher is ready');
	}
};

exports.toPublishInputHandler = function () {
    if (!mqttClient.connected) {
        console.log('MQTT client is not connected. Discarding data.');
        return;
    }
    if (currentSessionKey == null) {
        console.log('Session key is not available. Discarding data.');
        return;
    }
    
    var toPublish = this.get('toPublish');
    var encrypted = iotAuth.encryptSecureMessageToPublish(
    	{sequenceNum: publishSequenceNum, data: toPublish},
    	this.getParameter('sessionCryptoSpec'),
    	currentSessionKey);
    publishSequenceNum++;
    mqttClient.publish(this.getParameter('topic'), encrypted,
        {qos: this.getParameter('qosLevel')});
};

exports.initialize = function() {
    self = this;
    
    publishSequenceNum = 0;
    mqttConnected = false;
    publisherReady = false;
    currentSessionKey = null;
    currentSessionKeyList = [];
    authPublicKey = iotAuth.loadPublicKey(this.getParameter('authCertPath'));
    publisherPrivateKey = iotAuth.loadPrivateKey(this.getParameter('publisherPrivateKeyPath'));
    
    this.addInputHandler('toPublish', exports.toPublishInputHandler.bind(this));
    mqttClient = mqtt.createClient(
    	this.getParameter('brokerPort'), 
    	this.getParameter('brokerHost'),
    	{rawBytes: true});
	mqttClient.on('connect', onConnect);
    mqttClient.start();
    
    var options = {
        authHost: this.getParameter('authHost'),
        authPort: this.getParameter('authPort'),
        entityName: this.getParameter('publisherName'),
        numKeysPerRequest: this.getParameter('numKeysPerRequest'),
        purpose: {pubTopic: this.getParameter('topic')},
        distributionKey: currentDistributionKey,
        distributionCryptoSpec: this.getParameter('distributionCryptoSpec'),
        publicKeyCryptoSpec: this.getParameter('publicKeyCryptoSpec'),
        authPublicKey: authPublicKey,
        entityPrivateKey: publisherPrivateKey
    };
    iotAuth.sendSessionKeyRequest(options, sessionKeyResponseCallback);
};

exports.wrapup = function() {
    mqttClient.end();
};
