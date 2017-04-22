// Copyright (c) 2017 The Regents of the University of California.
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

/** This accessor starts a server that listens for HTTP requests
 *  on the specified hostInterface and port and issues responses.
 *  The hostInterface specifies what network interface (e.g. Ethernet,
 *  WiFi, or localhost) to use. The default is 'localhost', which (usually)
 *  means that the server listens only for requests coming from the local machine.
 *  This is useful for testing. To listen for requests on all IPv4 addresses on
 *  the local machine, specify '0.0.0.0'. This will make the server accessible
 *  to any machine that has access to an IP address for the local machine.
 *
 *  When this server receives an http requests from the network (or from
 *  the local machine), it produces a JavaScript object on the output that
 *  includes at least the following properties:
 *  
 *  * body: The body of the request, or null if there is no body.
 *  * method: A string that describes the HTTP method of the request, which
 *    may be "GET", "PUT", etc.
 *  * path: The path in the URL of the request, such as "/" when there is no
 *    path.
 *  * requestID: An identifier for the request.
 *  
 *  To produce a response, this accessor waits for an input on its *response*
 *  port that is a JavaScript object containing the following properties:
 *  
 *  * requestID: An identifier matching a request for which a response has not
 *    already been issued.
 *  * response: The body of the response, such as HTML to display to the
 *    requester or a JavaScript object with a JSON representation (the JSON
 *    representation will be sent back as the response). If this property is
 *    not included in the input, then the input will be stringified as a JSON
 *    object and sent. This will include the requestID property.
 *    
 *  If there is no pending request with a matching ID, then an error will be
 *  issued.
 *  
 *  A simple use case is to connect the *request* output to some other actor
 *  that generates a response, and then to feed that response back to the
 *  *response* input. Be sure to include the requestID property in the response.
 *
 *  When `wrapup()` is invoked, this accessor closes the  server.
 *
 *  This accessor requires the module httpServer.
 *
 *  @accessor net/WebServer
 *  @parameter {string} hostInterface The IP address or domain name of the
 *    network interface to listen to.
 *  @parameter {int} port The port to listen on.
 *
 *  @input response The response to issue to a request. 
 *  @output {int} listening When the server is listening for connections, this output
 *    will produce the port number that the server is listening on
 *  @output request The request that came into the server.
 *  
 *  @author Edward A. Lee amd Elizabeth Osyk
 *  @version $$Id$$
 */

// Stop extra messages from jslint and jshint.  Note that there should
// be no space between the / and the * and global. See
// https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSHint */
/*globals console, error, exports, require, util */
/*jshint globalstrict: true*/
'use strict';

var httpServer = require('httpServer');

/** Sets up the accessor by defining inputs and outputs. */
exports.setup = function() {
    this.parameter('hostInterface', {
        value: "localhost",
        type: "string"
    });
    this.parameter('port', {
        value: 80,
        type: "int"
    });
    this.input('response');
    this.output('listening', {'type':'int'});
    this.output('request', {'spontaneous': true});
};

/** Starts the server.
 */
exports.initialize = function() {
    var self = this;
    
    if (!self.server) {
        console.log('WebServer: Creating new server.');
        self.server = new httpServer.HttpServer({
                'port': self.getParameter('port'),
                'hostInterface': self.getParameter('hostInterface')
        });
        // Using 'self.exports' rather than just 'exports' in the following allows
        // these functions to be overridden in derived accessors.
        self.server.on('listening', self.exports.onListening.bind(self));
        self.server.on('request', self.exports.request.bind(self));
        self.server.on('error', function (message) {
            self.error(message);
        });
        self.server.start();
    }

    self.addInputHandler('response', function() {
        var response = self.get('response');
        if (!response.hasOwnProperty('requestID')) {
            error('Response has no requestID property.');
            return;
        }
        var id = response.requestID;
        if (!self.pendingRequests.hasOwnProperty(id)) {
            error('No pending request with ID ' + id);
            return;
        }
        delete self.pendingRequests[id];
        // Default body of the response is the whole response object.
        var body = response;
        if (response.hasOwnProperty('response')) {
            body = response.response;
        }
        if (typeof body !== 'string') {
            body = JSON.stringify(body);
        }
        this.server.respond(response.requestID, body);
    });
    
    // Initialize pendingRequests to an empty object.
    self.pendingRequests = {};
};

exports.onListening = function() {
    console.log('WebServer: Listening for requests.');
    this.send('listening', this.getParameter('port'));
};

exports.request = function(request) {
    console.log('Server received request: ' + util.inspect(request));
    if (this.server) {
        this.send('request', request);
        this.pendingRequests[request.requestID] = request;
    } else {
        console.log('WARNING: server does not exist.');
    }
};

/** Removes all inputHandlers from sockets.<br>
 * Unregisters event listeners from sockets.<br>
 * Closes server.
 */
exports.wrapup = function(){
    if (this.server !== null && typeof this.server !== 'undefined') {
        console.log('WebServer: Stopping the server.');
        this.server.removeAllListeners();
        this.server.stop();
        this.server = null;
    }
};
