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

/** This accessor is used for subscribing secure messages over MQTt protocol,
 *  using authorization service provided by a local authorization entity.
 *
 *  This accessor requires the 'iotAuth' and 'mqtt' modules.
 *
 *  @accessor net/SecureSubscriber
 *
 *  @input subscribe The topic to subscribe.
 *  @input unsubscribe The topic to unsubscribe.
 *
 *  @output connection Output an object when a connection with a MQTT broker is established.
 *  @output subscription When subscribed, includes subscription information.
 *  @output received The received message.
 *  @output receivedTopic The topic of received message
 *
 *  @parameter {string} brokerHost The MQTT broker's IP address or domain name.
 *  @parameter {int} brokerPort The MQTT broker's port number.
 *  @parameter {string} topic The topic to publish.
 *  @parameter {int} qosLevel The minimum QoS level of MQTT to be received by the subscriber.
 *
 *  @parameter {string} subscriberName The subscriber's unique name in string.
 *  @parameter {string} authHost Auth's IP address or domain name.
 *  @parameter {int} authPort Auth's port number.
 *
 *  @parameter {string} authCertPath The path for the X.509 certificate file (in pem format)
 *   of Auth with which the publisher is registered.
 *  @parameter {string} subscriberPrivateKeyPath The path for the pem format private key of
 *   the subscriber.
 *
 *  @parameter {string} publicKeyCryptoSpec The specification for the public cryptography
 *   algorithms to be used for communication with Auth
 *  @parameter {string} distributionCryptoSpec The specification for the symmetric cryptography
 *   algorithms to be used for communication with Auth
 *  @parameter {string} sessionCryptoSpec The specification for the symmetric cryptography
 *   algorithms to be used for publishing messages from the publishers
 *
 *  @author Hokeun Kim
 *  @version $$Id$$
 */
 
// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*global console, exports, require */
/*jshint globalstrict: true */
"use strict";

var iotAuth = require('iotAuth');
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
    // MQTT information
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
    
    // Subscriber information
    this.parameter('subscriberName', {
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
    this.parameter('subscriberPrivateKeyPath', {
        value: '',
        type: 'string'
    });
    // Spec for communication with Auth
    this.parameter('publicKeyCryptoSpec', {
        type: 'string',
        options: iotAuth.publicKeyCryptoSpecs
    });
    this.parameter('distributionCryptoSpec', {
        type: 'string',
        options: iotAuth.symmetricCryptoSpecs
    });
    // For communication with server
    this.parameter('sessionCryptoSpec', {
        type: 'string',
        options: iotAuth.symmetricCryptoSpecs
    });
};

var self;
var mqttClient;
var authPublicKey;
var subscriberPrivateKey;
var currentDistributionKey = null;
var currentSessionKeyList = [];
var subscribeSequenceNum = 0;

/*
callbackParameters = {
        keyId,
        topic,
        encryptedMessage
};
*/
function sessionKeyResponseCallback(status, distributionKey, sessionKeyList, callbackParameters) {
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
        if (sessionKeyList[i].id === callbackParameters.keyId) {
                console.log('key id is as expected!');
                currentSessionKeyList.push(sessionKeyList[i]);
                        var ret = iotAuth.decryptSecurePublishedMessage(callbackParameters.encryptedMessage,
                                self.getParameter('sessionCryptoSpec'), sessionKeyList[i]);
                        if (!ret.success) {
                                self.error('Error in decrypting published message - Details: ' + ret.error);
                                return;
                        }
                        console.log('Received sequence number: ' + ret.sequenceNum);
                    self.send('received', mqtt.byteArrayToString(ret.message));
                    self.send('receivedTopic', callbackParameters.topic);
        }
        else {
                self.error('key id is not as expected!');
                return;
        }
    }
}

function onMessage(topic, data) {
        var ret = iotAuth.getKeyIdOfSecurePublishedMessage(data);
        if (!ret.success) {
                self.error('Error in published message - Details: ' + ret.error);
                return;
        }
        for (var i = 0; i < currentSessionKeyList.length; i++) {
                if (currentSessionKeyList[i].id === ret.keyId) {
                        console.log('Session key is available!');
                        ret = iotAuth.decryptSecurePublishedMessage(ret.encryptedMessage,
                                self.getParameter('sessionCryptoSpec'), currentSessionKeyList[i]);
                        if (!ret.success) {
                                self.error('Error in decrypting published message - Details: ' + ret.error);
                                return;
                        }
                        console.log('Received sequence number: ' + ret.sequenceNum);
                    self.send('received', mqtt.byteArrayToString(ret.message));
                    self.send('receivedTopic', topic);
                        return;
                }
        }
        console.log('Session key for published message is not available, sending session key request..');
    var options = {
        authHost: self.getParameter('authHost'),
        authPort: self.getParameter('authPort'),
        entityName: self.getParameter('subscriberName'),
        numKeysPerRequest: 1,
        purpose: {keyId: ret.keyId},
        distributionKey: currentDistributionKey,
        distributionCryptoSpec: self.getParameter('distributionCryptoSpec'),
        publicKeyCryptoSpec: self.getParameter('publicKeyCryptoSpec'),
        authPublicKey: authPublicKey,
        entityPrivateKey: subscriberPrivateKey
    };
    var callbackParameters = {
            keyId: ret.keyId,
            topic: topic,
            encryptedMessage: ret.encryptedMessage
    };
    iotAuth.sendSessionKeyRequest(options, sessionKeyResponseCallback, callbackParameters);
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
    
    currentDistributionKey = null;
    currentSessionKeyList = [];
    subscribeSequenceNum = 0;
    authPublicKey = iotAuth.loadPublicKey(this.getParameter('authCertPath'));
    subscriberPrivateKey = iotAuth.loadPrivateKey(this.getParameter('subscriberPrivateKeyPath'));
    
    this.addInputHandler('subscribe', exports.subscribeInputHandler.bind(this));
    this.addInputHandler('unsubscribe', exports.unsubscribeInputHandler.bind(this));
    mqttClient = mqtt.createClient(
            self.getParameter('brokerPort'),
            self.getParameter('brokerHost'),
            {rawBytes: true});
    mqttClient.on('connect', onConnect);
    mqttClient.on('message', onMessage);
    mqttClient.start();
};

exports.wrapup = function() {
    mqttClient.end();
};
