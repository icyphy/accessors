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
 *  Upon receipt of any input, this accessor will issue an HTTP request
 *  specified by the inputs.
 *  The ```url``` input is either a URL (a string) or a JSON object with
 *  the following optional fields:
 *  <ul>
 *  <li> headers: An object containing request headers. By default this is an empty object.
 *       Items may have a value that is an array of values, for headers with more than one value.
 *  <li> host: A string giving the domain name or IP address of the server to issue the request to.
 *       This defaults to 'localhost'.</li>
 *  <li> keepAlive: A boolean that specified whether to keep sockets around in a pool
 *       to be used by other requests in the future. This defaults to false.
 *  <li> method: A string specifying the HTTP request method. This defaults to 'GET', but can
 *       also be 'PUT', 'POST', 'DELETE', etc.
 *  <li> path: Request path as a string (see command below). This defaults to '/'.
 *  <li> port: Port of remote server. Defaults to 80.
 *  <li> protocol: The protocol. This is a string that defaults to 'http'.
 *  <li> query: A query string to be appended to the path, such as '?page=12'. See arguments below.
 *  </ul>
 *  The path may optionally be specified by the separate input ```command```, which accepts
 *  any string, and the query may optionally be given by the ```arguments``` input, which
 *  accepts any JSON object.  The fields in that object will be encoded into a query string
 *  to be sent along with the request.
 *
 *  The output response will be a string if the MIME type of the accessed page
 *  begins with "text". If the MIME type begins with anything else, then the
 *  binary data will be produced. It is up to the host implementation to ensure
 *  that the data is given in some form that is usable by downstream accessors
 *  or actors.
 *
 *  If the same command is to be executed repeatedly, then a trigger input
 *  may be provided to trigger invocation of the command
 * 
 *  @accessor REST
 *  @author Edward A. Lee (eal@eecs.berkeley.edu)
 *  @input {JSON} url The url for the command or an object specifying options.
 *  @input {string} command The command.
 *  @input {JSON} arguments Arguments to the command.
 *  @input trigger An input to trigger the command.
 *  @output {string} response The server's response.
 *  @output {int} status The status code of the response.
 *  @output {JSON} headers The headers sent with the response.
 */

var httpClient = require('httpClient');
var querystring = require('querystring');

/** Define inputs and outputs. */
exports.setup = function () {
    input('url', {'value':''});
    input('command', {'type':'string', 'value':''});
    input('arguments', {'value':''});
    input('trigger');
    output('response');
    output('status', {'type':'int'});
    output('headers');
};

/** Build the path from the command and arguments.
 *  This default implementation returns 'command?args', where
 *  args is an encoding of the arguments input for embedding in a URL.
 *  For example, if the arguments input is the object
 *     ```{ foo: 'bar', baz: ['qux', 'quux'], corge: '' }```
 *  then the returned string will be
 *     ```command?foo=bar&baz=qux&baz=quux&corge=```
 *  Derived accessors may override this function to customize
 *  the interaction.
 */
exports.encodePath = function() {
    var command = get('command');
    var encodedArgs = querystring.stringify(get('arguments'));
    return command + '?' + encodedArgs;
}

/** Issue the command based on the current value of the inputs.
 *  This constructs a path using encodePath and combines it with the
 *  url input to construct the full command.
 *  @param callback The callback function that will be called with the
 *   response as an argument (an instance of IncomingMessage, defined in
 *   the httpClient module).
 */
exports.issueCommand = function(callback) {
    var encodedPath = this.encodePath();
    var url = get('url');
    var command = url;
    if (typeof url === 'string') {
        command = url + '/' + encodedPath;
    } else {
        command.path = encodedPath;
    }
    var request = httpClient.request(command, callback);
    request.on('error', function(message) {
        if (!message) {
            message = 'Request failed. No further information.';
        }
        error(message);
    });
    request.end();
}

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
    if (message !== null && message !== undefined) {
        if (message.body) {
            send('response', message.body);
        } else {
            send('response', message);
        }
        if (message.status) {
            send('status', message.status);
        }
        if (message.headers) {
            send('headers', message.headers);
        }
    }
}

var handle;
// FIXME: Need a timeout.

/** Register the input handler.  */
exports.initialize = function () {
    // Upon receiving _any_ input, issue a command.
	handle = addInputHandler(null, this.issueCommand, this.handleResponse);
}

/** Upon wrapup, stop handling new inputs.  */
exports.wrapup = function () {
    removeInputHandler(handle);
};