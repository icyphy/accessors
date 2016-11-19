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

/** This accessor is used for accessing authorization service provided by
 *  a local authorization entity, Auth (https://github.com/iotauth/iotauth),
 *  and for secure communication with a SecureCommClient.
 *
 *  Specifically, this access listens to secure communication requests from
 *  clients and handles the client requests. 
 *
 *  This accessor internally manages the credentials (cryptographic keys)
 *  for communication with remote Auth and remote client.
 *
 *  All the messages to/from remote Auth and client are protected using
 *  the credentials, while input/output data of this accessor is in plain text.
 *
 *  This accessor requires the 'iotAuth', and 'dataConverter' modules.
 *
 *  @accessor net/SecureCommServer
 *
 *  @input toSend
 *  @input {int} toSendID
 *
 *  @output {int} listening
 *  @output connection Includes information of the remote client
 *  @output received
 *  @output receivedID
 *
 *  @parameter {string} serverName The server's unique name in string.
 *  @parameter {int} serverPort Server's port number.
 *  @parameter {string} authHost Auth's IP address or domain name.
 *  @parameter {int} authPort Auth's port number.
 *
 *  @parameter {string} authCertPath The path for the X.509 certificate file (in pem format)
 *   of Auth with which the server is registered.
 *  @parameter {string} serverPrivateKeyPath The path for the pem format private key of
 *   the server.
 *
 *  @parameter {string} publicKeyCryptoSpec The specification for the public cryptography
 *   algorithms to be used for communication with Auth
 *  @parameter {string} distributionCryptoSpec The specification for the symmetric cryptography
 *   algorithms to be used for communication with Auth
 *  @parameter {string} sessionCryptoSpec The specification for the symmetric cryptography
 *   algorithms to be used for communication with the client
 *
 *  @parameter {string} receiveType Data type of the received data from client.
 *  @parameter {string} sendType Data type of the sent data to client.
 *
 *  @author Hokeun Kim
 *  @version $$Id$$
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*global console, exports, idToSendTo, require */
/*jshint globalstrict: true */
"use strict";

var iotAuth = require('iotAuth');
var dataConverter = require('dataConverter');
var msgType = iotAuth.msgType;

exports.setup = function () {
    // Inputs and outputs
    this.input('toSend');
    this.input('toSendID', {
        type: 'int',
        value: -1
    });
    this.output('listening', {
        type: 'int'
    });
    this.output('connection');
    this.output('received', {
        spontaneous: true
    });
    this.output('receivedID', {
        type: 'int',
        spontaneous: true
    });
    // Server information
    this.parameter('serverName', {
        value: '',
        type: 'string'
    });
    this.parameter('serverPort', {
        type : 'int',
        value : 4000
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
    this.parameter('serverPrivateKeyPath', {
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
    // For communication with client
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


// local variables
var self;
var receiveType;
var sendType;
var authPublicKey;
var serverPrivateKey;
var currentDistributionKey = null;
var server = null;
var sockets = [];
var currentSessionKey = null;

function outputError(errorMessage) {
    console.log(errorMessage);
    self.error(errorMessage);
}

/*
  callbackParameters = {
  keyId,
  sendHandshake2Callback,
  handshake1Payload,
  serverSocket
  }
*/
function sessionKeyResponseCallback(status, distributionKey, sessionKeyList, callbackParameters) {
    if (status.error) {
        console.log('session key request failed: ' + status.error);
        return;
    }
    console.log('session key request succeeded');

    if (distributionKey) {
        console.log('Updating to a new distribution key key');
        currentDistributionKey = distributionKey;
    }

    console.log('received ' + sessionKeyList.length + ' session keys');
    var receivedSessionKey;
    for (var i = 0; i < sessionKeyList.length; i++) {
        receivedSessionKey = sessionKeyList[i];
    }
    console.log('Session key arrived');    
    if (receivedSessionKey.id == callbackParameters.keyId) {
        console.log('Session key id is as expected');
        currentSessionKey = receivedSessionKey;
        callbackParameters.sendHandshake2Callback(callbackParameters.handshake1Payload,
						  callbackParameters.serverSocket, receivedSessionKey);
    }
    else {
        outputError('Session key id is NOT as expected');
    }
}

// event handlers for the listening server
function onServerListening(listeningPort) {
    console.log('Server: Listening for socket connection requests on port ' + listeningPort);
    self.send('listening', listeningPort);
}

function onServerError(message) {
    outputError('Error in server - details: ' + message);
}

function onClientRequest(handshake1Payload, serverSocket, sendHandshake2Callback) {
    var keyId = handshake1Payload.readUIntBE(0, iotAuth.SESSION_KEY_ID_SIZE);
    if (currentSessionKey !== null && currentSessionKey.id === keyId) {
        sendHandshake2Callback(handshake1Payload, serverSocket, currentSessionKey);
    } else {
        console.log('session key NOT found! sending session key id to AuthService');
        var options = {
            authHost: self.getParameter('authHost'),
            authPort: self.getParameter('authPort'),
            entityName: self.getParameter('serverName'),
            numKeysPerRequest: 1,
            purpose: {keyId: keyId},
            distributionKey: currentDistributionKey,
            distributionCryptoSpec: self.getParameter('distributionCryptoSpec'),
            publicKeyCryptoSpec: self.getParameter('publicKeyCryptoSpec'),
            authPublicKey: authPublicKey,
            entityPrivateKey: serverPrivateKey
        };
        var callbackParameters = {
            keyId: keyId,
            sendHandshake2Callback: sendHandshake2Callback,
            handshake1Payload: handshake1Payload,
            serverSocket: serverSocket
        };
        iotAuth.sendSessionKeyRequest(options, sessionKeyResponseCallback, callbackParameters);
    }
}

// Event handlers for individual sockets.
function onClose(socketID) {
    console.log('secure connection with the client closed.');
    sockets[socketID] = null;
    self.send('connection', 'socket #' + socketID + ' closed');
}

function onError(message, socketID) {
    outputError('Error in secure server socket #' + socketID +
		' details: ' + message);
}

function onConnection(socketInstance, entityServerSocket) {
    console.log('secure connection with the client established.');
    self.send('connection', socketInstance);
    sockets[socketInstance.id] = entityServerSocket;
}

function onData(data, socketID) {
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
    self.send('receivedID', socketID);
}

exports.toSendInputHandler = function () {
    var toSend = this.get('toSend');
    if (sendType == 'image') {
        toSend = dataConverter.imageToJSArray(toSend);
    }

    var toSendID = this.get('toSendID');
    // broadcasting
    if (toSendID < 0) {
        for (var i = 0; i < sockets.length; i++) {
            if (!sockets[i]) {
                continue;
            }
            if (!sockets[i].checkSessionKeyValidity()) {
                outputError('session key expired!');
            }
            else if (!sockets[i].send(toSend)) {
                outputError('Error in sending data');
            }
        }
    }
    else if (sockets[toSendID]) {
        sockets[toSendID].send(toSend);
    } else {
        console.log('Socket with ID ' + idToSendTo + ' is not open. Discarding data.');
    }
};

exports.initialize = function () {
    currentSessionKey = null;
    authPublicKey = iotAuth.loadPublicKey(this.getParameter('authCertPath'));
    serverPrivateKey = iotAuth.loadPrivateKey(this.getParameter('serverPrivateKeyPath'));
    receiveType = this.getParameter('receiveType');
    sendType = this.getParameter('sendType');

    self = this;
    var options = {
        serverPort: this.getParameter('serverPort'),
        sessionCryptoSpec: this.getParameter('sessionCryptoSpec')
    };
    var eventHandlers = {
        onServerError: onServerError,
        onServerListening: onServerListening,
        onClientRequest: onClientRequest,

        onData: onData,
        onClose: onClose,
        onError: onError,
        onConnection: onConnection
    };
    server = iotAuth.initializeSecureServer(options, eventHandlers);
    
    this.addInputHandler('toSend', exports.toSendInputHandler.bind(this));
};

exports.wrapup = function() {
    sockets = [];
    if (server !== null) {
        server.stop();
        server = null;
    }
};
