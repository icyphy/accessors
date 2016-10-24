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

/** This accessor is used for accessing authorization service provided by
 *  a local authorization entity, Auth (https://github.com/iotauth/iotauth),
 *  and for secure communication with a SecureCommserver.
 *
 *  Specifically, this accessor establishes a secure communication with server
 *  using session keys (symmetric cryptographic keys) and sends/receives 
 *  messages to/from the server. To obtain session keys, this accessor also
 *  communicates with the local authorization entity, Auth.
 *
 *  This accessor internally manages the credentials (cryptographic keys)
 *  for communication with remote Auth and remote server.
 *  All the messages to/from remote Auth and server are protected using
 *  the credentials, while input/output data of this accessor is in plain text.
 *
 *  This accessor requires the 'iotAuth', and 'dataConverter' modules.
 *
 *  @accessor net/SecureCommClient
 *
 *  @input serverHostPort Information of the destination server. This input triggers 
 *   a secure connection with a server (possibly using the SecureCommServer accessor).
 *   This input is specified as a JSON with two properties, 'host' and 'port'. The property
 *   'host' specifies the IP address or domain name of server in string and 'port' specifies
 *   the port number in integer. If a session key for communicating with a server is not
 *   available, the SecureCommClient communicates with Auth to request the session key(s)
 *   for secure communication, before establishing a secure connection with the server.
 *  @input toSend The data to be sent over the secure connection with the server.
 *
 *  @output {boolean} connected Output `true` on connected and `false` on disconnected with
 *   the server over a secure connection.
 *  @output received The data received from the server over a secure connection.
 *
 *  @parameter {string} clientName The client's unique name in string.
 *  @parameter {string} authHost Auth's IP address or domain name.
 *  @parameter {int} authPort Auth's port number.
 *
 *  @parameter {string} authCertPath The path for the X.509 certificate file (in pem format)
 *   of Auth with which the client is registered.
 *  @parameter {string} clientPrivateKeyPath The path for the pem format private key of
 *   the client.
 *
 *  @parameter {string} publicKeyCryptoSpec The specification for the public cryptography
 *   algorithms to be used for communication with Auth
 *  @parameter {string} distributionCryptoSpec The specification for the symmetric cryptography
 *   algorithms to be used for communication with Auth
 *  @parameter {string} sessionCryptoSpec The specification for the symmetric cryptography
 *   algorithms to be used for communication with the server
 *
 *  @parameter {int} numKeysPerRequest The number of session keys to be requested per
 *   session key request to Auth
 *  @parameter {string} targetServerGroup The communication policy group to which the
 *   target server belong.
 *
 *  @parameter {string} receiveType Data type of the received data from server.
 *  @parameter {string} sendType Data type of the sent data to server.
 *
 *  @author Hokeun Kim
 *  @version $$Id$$
 */

 "use strict";

var iotAuth = require('iotAuth');
var dataConverter = require('dataConverter');
var msgType = iotAuth.msgType;

exports.setup = function() {
    // Inputs and outputs
    this.input('serverHostPort');
    this.input('toSend');
    this.output('connected', {
        type: 'boolean',
        spontaneous: true
    });
    this.output('received', {
        type : 'string'
    });
    // Client information
    this.parameter('clientName', {
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
    this.parameter('clientPrivateKeyPath', {
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
    this.parameter('numKeysPerRequest', {
        value: 1,
        type: 'int'
    });
    // For communication with server
    this.parameter('targetServerGroup', {
        value: '',
        type: 'string'
    });
    this.parameter('sessionCryptoSpec', {
        type: 'string',
        options: iotAuth.symmetricCryptoSpecs
    });
    // Send/receive type
    this.parameter('receiveType', {
        type : 'string',
        value : 'string',
        options : ['string', 'image', 'byteArray']
    });
    this.parameter('sendType', {
        type : 'string',
        value : 'string',
        options : ['string', 'image', 'byteArray']
    });
};

// client communication state
var clientCommState = {
    IDLE: 0,
    IN_COMM: 30                    // Session message
};

// local variables
var self;
var receiveType;
var sendType;
var authPublicKey;
var clientPrivateKey;
var currentSecureClient = null;
var currentDistributionKey = null;
var currentSessionKeyList = [];
var currentSessionKey = null;
var currentState = clientCommState.IDLE;

function outputError(errorMessage) {
    console.log(errorMessage);
    self.error(errorMessage);
};

// Event handlers for a secure client socket
function onConnection(entityClientSocket) {
    console.log('communication initialization succeeded');
    currentSecureClient = entityClientSocket;
    currentState = clientCommState.IN_COMM;
    self.send('connected', true);
};
function onClose() {
    console.log('secure connection with the server closed.');
    self.send('connected', false);
};
function onError(message) {
    outputError('Error in secure comm - details: ' + message);
};
function onData(data) {
    console.log('data received from server via secure communication');

    if (receiveType == 'string') {
        self.send('received', data.toString());
    }
    else if (receiveType == 'image') {
        self.send('received', dataConverter.jsArrayToImage(data.getArray()));
    }
    else if (receiveType == 'byteArray') {
        self.send('received', data.getArray());
    }
};

function initSecureCommWithSessionKey(sessionKey, serverHost, serverPort) {
    currentSessionKey = sessionKey;
    if (currentSecureClient) {
        currentSecureClient.close();
        console.log('Status: Secure connection closed before starting a new connection.');
        currentState = clientCommState.IDLE;
    }
    var options = {
        serverHost: serverHost,
        serverPort: serverPort,
        sessionKey: currentSessionKey,
        sessionCryptoSpec: self.getParameter('sessionCryptoSpec')
    };
    var eventHandlers = {
        onClose: onClose,
        onError: onError,
        onData: onData,
        onConnection: onConnection
    };
    iotAuth.initializeSecureCommunication(options, eventHandlers);
};

/*
callbackParameters = {
    host,
    port
}
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
        currentSessionKeyList.push(sessionKeyList[i]);
    }
    if (currentSessionKeyList.length > 0) {
        initSecureCommWithSessionKey(currentSessionKeyList.shift(),
            callbackParameters.host, callbackParameters.port);
    }
};

exports.serverHostPortInputHandler = function() {
    var serverHostPort = this.get('serverHostPort');
    if (currentSessionKeyList.length > 0) {
        initSecureCommWithSessionKey(currentSessionKeyList.shift(),
            serverHostPort.host, serverHostPort.port);
    }
    else {
        var options = {
            authHost: this.getParameter('authHost'),
            authPort: this.getParameter('authPort'),
            entityName: this.getParameter('clientName'),
            numKeysPerRequest: this.getParameter('numKeysPerRequest'),
            purpose: {group: this.getParameter('targetServerGroup')},
            distributionKey: currentDistributionKey,
            distributionCryptoSpec: this.getParameter('distributionCryptoSpec'),
            publicKeyCryptoSpec: this.getParameter('publicKeyCryptoSpec'),
            authPublicKey: authPublicKey,
            entityPrivateKey: clientPrivateKey
        };
        iotAuth.sendSessionKeyRequest(options, sessionKeyResponseCallback, serverHostPort);
    }
};

exports.toSendInputHandler = function () {
    var toSend = this.get('toSend');
    
    if (sendType == 'image') {
        toSend = dataConverter.imageToJSArray(toSend);
    }
    if (currentSecureClient && currentState == clientCommState.IN_COMM) {
        if (!currentSecureClient.checkSessionKeyValidity()) {
            outputError('session key expired!');
        }
        else if (!currentSecureClient.send(toSend)) {
            outputError('Error in sending data');
        }
    }
    else {
        console.log('Discarding data because socket is not open.');
    }
};

exports.initialize = function () {
    currentState = clientCommState.IDLE;
    currentSessionKeyList = [];
    currentSessionKey = null;
    
    authPublicKey = iotAuth.loadPublicKey(this.getParameter('authCertPath'));
    clientPrivateKey = iotAuth.loadPrivateKey(this.getParameter('clientPrivateKeyPath'));
    receiveType = this.getParameter('receiveType');
    sendType = this.getParameter('sendType');

    self = this;
    
    this.addInputHandler('serverHostPort',
        this.exports.serverHostPortInputHandler.bind(this));
    this.addInputHandler('toSend',
        this.exports.toSendInputHandler.bind(this));
};

exports.wrapup = function () {
    if (currentSecureClient) {
        currentSecureClient.close();
        console.log('Status: Connection closed in wrap-up.');
        currentState = clientCommState.IDLE;
    }
};
