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

/**
 *  @author Anne H. Ngu (angu@txstate.edu)
 *  @parameter {string} host is the ip address of the server hosting the service 
 *  @parameter {int} port is the port number of the host, default to 80. it is 443 for paraimpu
 *  @parameter {string} protocol is the communication protocol used (http or https) 
 *  @parameter {string} accessToken is the authentication information for this service
 *  @parameter {string} path is the command for invoking the service
 *  @parameter {string} method is the http request method (GET, POST)
 *  @version 
 */

//define the interface of Paraimpu service
exports.setup = function () {
    parameter('host', {'type': 'string', 'value': 'api.paraimpu.com'});
    parameter('port', {'type': 'int', 'value': 443});
    parameter('protocol',{'type':'string', 'value': 'https'});
    parameter('path', {'type':'string', 'value': 'v1/things/67de5874-33b1-48be-a99b-85ed5c55d7a4/data/last'});
    parameter('accessToken', {'type': 'string', 'value': '46e0ee55195c4dd9dca295a7ac8282d28f4a2259'});
    parameter('method', {'type': 'string', 'value': 'GET'});
    output('payload',{'type':'number'});
    output('producer', {'type':'string'});
    output('sensorId', {'type':'string'});
}
