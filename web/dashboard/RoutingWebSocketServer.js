// Copyright (c) 2016-2017 The Regents of the University of California.
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
//

/** This accessor is an extension of the WebSocketServer, which wraps
 *  the functionality of the base class with the additional feature of
 *  tracking the ID attribute of JSON messages received from the network
 *  and automatically directing messages outgoing from the swarmlet with
 *  corresponding message ID parameters for the matching socketID number.
 *
 *  This accessor assumes messages sent over the web socket have the form
 *  of stringified JSON, where the JSON has a string attribute named "ID"
 *  (a message ID). When a message is received from the network, this 
 *  accessor updates an internal mapping of message IDs to socketIDs
 *  to reflect the socket on which the message ID was received. When a
 *  JSON message is received on this accessor's routingSend input,
 *  it will be stringified and sent over the web socket to the socketID
 *  matching the outgoing message's ID attribute. Note: Outgoing messages
 *  without an ID attribute or without an established mapping to a socketID
 *  will be treated as errors and discarded! 
 *
 *  To use this mode of communication, outgoing messages from the swarmlet
 *  should be directed to the "routingSend" input instead of the base class's
 *  "toSend" input.
 *
 *  Refer to the documentation of WebSocketServer for a more complete
 *  description of the extended accessor.
 *
 *  @accessor dashboard/RoutingWebSocketServer
 *  @parameter {string} hostInterface The IP address or domain name of the
 *    network interface to listen to.
 *  @parameter {int} port The port to listen to for connections.
 *  @parameter {string} pfxKeyCertPassword If sslTls is set to true, then this option needs
 *   to specify the password for the pfx key-cert file specified by pfxKeyCertPath.
 *  @parameter {string} pfxKeyCertPath If sslTls is set to true, then this option needs to
 *   specify the fully qualified filename for the file that stores the private key and certificate
 *   that this server will use to identify itself. This path can be any of those understood by the
 *   Ptolemy host, e.g. paths beginning with $CLASSPATH/.
 *  @parameter {string} receiveType The MIME type for incoming messages,
 *    which defaults to 'text/plain'.
 *  @parameter {string} sendType The MIME type for outgoing messages,
 *    which defaults to 'text/plain'.
 *  @parameter {boolean} sslTls Whether SSL/TLS is enabled. This defaults to false.
 *  @input routingSend JSON data with an 'ID' attribute to be stringified and sent
 *    over the open socket upon which this accessor has prior received a network message with a matching
 *    'ID' attribute.
 *  @input toSend The data to be sent to open sockets.
 *    If this is an object with 'socketID' field and a 'message' field,
 *    then send the value of the message field to the socket identified
 *    by the socketID field. If the input has any other form, then the
 *    message is broadcast to all open socket connections.
 *  @output {int} listening When the server is listening for connections, this output
 *    will produce the port number that the server is listening on
 *  @output connection An output produced when a connection opens or closes.
 *    The output is an object with two fields, a 'socketID',
 *    which is a unique ID for this client connection, and a 'status' field,
 *    which is the string 'open' or 'closed'.
 *  @output received A message received a client in the form of an object with two fields,
 *    a 'socketID', which is a unique ID for this client connection, and a 'message' field,
 *    which is the message received from the client.
 *  @author Hokeun Kim, Edward Lee
 *  @version $$Id$$
 */

// Stop extra messages from jslint and jshint.  Note that there should
// be no space between the / and the * and global. See
// https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSHint */
/*globals console, error, exports, require */
/*jshint globalstrict: true*/
'use strict';
/*jslint plusplus: true */

/** Sets up the accessor by defining inputs and outputs. */
exports.setup = function () {
    this.extend('net/WebSocketServer');
    this.parameter('receiveType', {
        value: 'text/plain'
    });
    this.parameter('sendType', {
        value: 'text/plain'
    });
    //Port defaults to 8095
    this.parameter('port',{
        value: 8095
    });
    this.input('routingSend');
};

/** Adds an input handler on routingSend that converts the input into a message delivered
 * to the toSend input of the superclass.
 */
exports.initialize = function () {
    this.routingTable = {};
    exports.ssuper.initialize.call(this);

    //Find the matching socketID for the messageID in the routing table, construct a toSend input
    //to WebSocketServer, and send it.
    this.addInputHandler('routingSend', function(){
        var routingIn = this.get('routingSend');
        if(routingIn && routingIn.id){
            var wrappedMsg = {
                "message": JSON.stringify(routingIn),
                "socketID": this.routingTable[routingIn.id]
            };
            this.send('toSend', wrappedMsg);
        } else {
            error('Input to RoutingSend must be JSON with an id property');
        }
    });
};

//Override
//Find the messageID corresponding to the closed socketID and delete it from the mapping 
exports.notifyClose = function(socketID){
    for(var messageID in this.routingTable){
        if(this.routingTable.hasOwnProperty(messageID) && this.routingTable[messageID] == socketID){
            delete this.routingTable[messageID];
        }
    }
    return;
};

//Override
//Establish a mapping between the received messageID and socketID.
//TODO Perhaps this function should close sockets when the messageID
//is reassigned to a new socket?
exports.filterReceived = function (message, socketID) {
    var messageID;
    try{
        var parsed = JSON.parse(message);
        if(parsed && parsed.id){
            this.routingTable[parsed.id] = socketID;
        } else {
            console.log("WARNING: RoutingWebSocketServer expects messages to be stringified JSON with an ID attribute.");
            console.log("The received message is stringified JSON but does not have an ID attribute.");
            return message;
        }
    } catch (err) {
        console.log("WARNING: RoutingWebSocketServer expects messages to be stringified JSON with an ID attribute.");
        console.log("The received message is not stringified JSON.");
        return message;
    }
    return message;
};

exports.wrapup = function() {
    exports.ssuper.wrapup.call(this);
};
