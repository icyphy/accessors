// Accessor for  Representational State Transfer (RESTful) interfaces.

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

/** Accessor for RESTful interfaces.
 *  Upon receipt of a trigger input, this accessor will issue an HTTP request
 *  specified by the inputs. Some time later, the accessor will receive a response
 *  from the server or a timeout. In the first case, the accessor will produce
 *  the response (body, status code, and headers) on output ports.
 *  In the second case, it will produce a nil output on the response port
 *  and an error.
 *
 *  The accessor does not block waiting for the response, but any additional
 *  triggered requests will be queued to be issued only after the pending request
 *  has received either a response or a timeout. This strategy ensures that outputs
 *  from this accessor are produced in the same order as the inputs that trigger the
 *  HTTP requests.
 *
 *  The <i>options</i> input can be a string URL (with surrounding quotation marks)
 *  or an object with the following fields:
 *  <ul>
 *  <li> headers: An object containing request headers. By default this
 *       is an empty object. Items may have a value that is an array of values,
 *       for headers with more than one value.
 *  <li> keepAlive: A boolean that specified whether to keep sockets around
 *       in a pool to be used by other requests in the future. This defaults to false.
 *  <li> method: A string specifying the HTTP request method.
 *       This defaults to 'GET', but can also be 'PUT', 'POST', 'DELETE', etc.
 *  <li> url: A string that can be parsed as a URL, or an object containing
 *       the following fields:
 *       <ul>
 *       <li> host: A string giving the domain name or IP address of
 *            the server to issue the request to. This defaults to 'localhost'.
 *       <li> protocol: The protocol. This is a string that defaults to 'http'.
 *       <li> port: Port of remote server. This defaults to 80.
 *       </ul>
 *  </ul>
 *
 *  For example, the <i>options</i> parameter could be set to
 *  <code>
 *  {"headers":{"Content-Type":"application/x-www-form-urlencoded"}, "method":"POST", "url":"..."}
 *  </code>
 *
 *  In addition, there is a <i>command</i> input that is a string that is appended
 *  as a path to the URL constructed from the <i>options</i> input. This defaults
 *  to the empty string.
 *
 *  The <i>arguments</i> input an object with fields that are converted to a query
 *  string to append to the url, for example '?arg=value'. If the value contains
 *  characters that are not allowed in a URL, such as spaces, they will encoded
 *  according to the ASCII standard, see http://www.w3schools.com/tags/ref_urlencode.asp .
 *
 *  A <i>trigger</i> input triggers invocation of the current command. Any value provided
 *  on the trigger input is ignored.
 *
 *  The output response will be a string if the MIME type of the accessed page
 *  begins with "text". If the MIME type begins with anything else, then the
 *  binary data will be produced. It is up to the host implementation to ensure
 *  that the data is given in some form that is usable by downstream accessors
 *  or actors.
 *
 *  The parameter 'timeout' specifies how long this accessor will wait for response.
 *  If it does not receive the response by the specified time, then it will issue
 *  a null response output and an error event (calling the error() function of the host).
 *
 *  If the parameter 'outputCompleteResponseOnly' is true (the default), then this
 *  accessor will produce a 'response' output only upon receiving a complete response.
 *  If it is false, then multiple outputs may result from a single input or trigger.
 *
 *  @accessor net/REST
 *  @author Edward A. Lee (eal@eecs.berkeley.edu)
 *  @input {JSON} options The url for the command or an object specifying options.
 *  @input {string} command The command.
 *  @input {JSON} arguments Arguments to the command.
 *  @input body The request body, if any.  This supports at least strings and image data.
 *  @input trigger An input to trigger the command.
 *  @output {string} response The server's response.
 *  @output {string} status The status code and message of the response.
 *  @output headers The headers sent with the response.
 *  @parameter {int} timeout The amount of time (in milliseconds) to wait for a response
 *   before triggering a null response and an error. This defaults to 5000.
 *  @parameter {boolean} outputCompleteResponseOnly If true (the default), the produce a
 *   'response' output only upon receiving the entire response.
 *  @version $$Id$$
 */

// Stop extra messages from jslint and jshint.  Note that there should
// be no space between the / and the * and global. See
// https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSHint */
/*globals addInputHandler, error, exports, get, input, output, parameter, require, send */
/*jshint globalstrict: true*/
'use strict';

var httpClient = require('httpClient');
var querystring = require('querystring');

/** Define inputs and outputs. */
exports.setup = function () {
    this.input('options', {'type':'JSON', 'value':''});
    this.input('command', {'type':'string', 'value':''});
    this.input('arguments', {'type':'JSON', 'value':''});
    this.input('trigger');
    this.input('body');
    this.output('response');
    this.output('status', {'type':'string'});
    this.output('headers');
    this.parameter('timeout', {'value': 5000, 'type': 'int'});
    this.parameter('outputCompleteResponseOnly', {'value':true, 'type':'boolean'});
};

/** Build the path from the command and arguments.
 *  This default implementation returns 'command?args', where
 *  args is an encoding of the arguments input for embedding in a URL.
 *  For example, if the arguments input is the object
 *     ```{ foo: 'bar', baz: ['qux', 'quux'], corge: '' }```
 *  then the returned string will be
 *     ```command?foo=bar&baz=qux&baz=quux&corge=```
 *  Derived accessors may override this function to customize
 *  the interaction. The returned string should not include a leading '/'.
 *  That will be added automatically.
 */
exports.encodePath = function() {
    // Remove any leading slash that might be present.
    var command = this.get('command').replace(/^\//, '');
    // Encode any characters that are not allowed in a URL.
    var encodedArgs = querystring.stringify(this.get('arguments'));
    if (encodedArgs) {
        return command + '?' + encodedArgs;
    }
    return command;
};

/** Filter the response. This base class just returns the argument
 *  unmodified, but derived classes can override this to extract
 *  a portion of the response, for example. Note that the response
 *  argument can be null, indicating that there was no response
 *  (e.g., a timeout or error occurred).
 *  @param response The response, or null if there is none.
 */
exports.filterResponse = function(response) {
    return response;
};

// Keep track of pending HTTP request so it can be stopped if the
// model stops executing.
var request;

/** Issue the command based on the current value of the inputs.
 *  This constructs a path using encodePath and combines it with the
 *  url input to construct the full command.
 *  @param callback The callback function that will be called with the
 *   response as an argument (an instance of IncomingMessage, defined in
 *   the httpClient module).
 */
exports.issueCommand = function(callback) {
    var encodedPath = this.exports.encodePath.call(this);
    var options = this.get('options');
    var body = this.get('body');
    var command = options;
    if (typeof options === 'string') {
        // In order to be able to include the outputCompleteResponseOnly
        // option, we have to switch styles here.
        command = {};
        if (encodedPath) {
            command.url = options + '/' + encodedPath;
        } else {
            command.url = options;
        }
    } else if (typeof options.url === 'string') {
        command.url = options.url + '/' + encodedPath;
    } else {
        command.url.path = '/' + encodedPath;
    }
    command.timeout = this.getParameter('timeout');

    if (this.getParameter('outputCompleteResponseOnly') === false) {
        command.outputCompleteResponseOnly = false;
    }

    if (typeof body !== 'undefined') {
            command.body = body;
    }

    // console.log("REST request to: " + JSON.stringify(command));

    request = httpClient.request(command, callback);
    request.on('error', function(message) {
        if (!message) {
            message = 'Request failed. No further information.';
        }
        error(message);
    });
    request.end();
};

/** Handle the response from the RESTful service. The argument
 *  is expected to be be an instance of IncomingMessage, defined
 *  in the httpClient module. This base class extracts the body
 *  field of the message, if there is one, and produces that on
 *  the 'response' output, and otherwise just produces the message
 *  on the output. If the argument is null or undefined, then do
 *  nothing.
 *  @param message An incoming message.
 */
exports.handleResponse = function(message) {
    // Assume that if the response is null, an error will be signaled.
    if (message !== null && typeof message !== 'undefined') {
        if (message.body) {
            this.send('response', this.exports.filterResponse.call(this, message.body));
        } else {
            this.send('response', this.exports.filterResponse.call(this, message));
        }
        if (message.statusCode) {
            this.send('status', message.statusCode + ': ' + message.statusMessage);
        }
        if (message.headers) {
            this.send('headers', message.headers);
        }
    }
};

/** Register the input handler.  */
exports.initialize = function () {
    // Upon receiving a trigger input, issue a command.
        this.addInputHandler('trigger',
                this.exports.issueCommand.bind(this),
                this.exports.handleResponse.bind(this));
};

/** Upon wrapup, stop handling new inputs.  */
exports.wrapup = function () {
    // In case there is streaming data coming in, stop it.
    if (request) {
        request.stop();
        request = null;
    }
};
