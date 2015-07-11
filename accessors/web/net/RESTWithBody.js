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

/** An accessor for RESTful requests that include a request body.  Designed 
 * for use with POST and PUT requests.
 * 
 * Please see REST.js for more details. 
 * 
 *  @accessor RESTWithBody
 *  @author Elizabeth Latronico (beth@berkeley.edu); extension of accessor by 
 *   Edward Lee
 *  @input {JSON} options The url for the command or an object specifying options.
 *  @input {string} command The command.
 *  @input {JSON} arguments Arguments to the command.
 *  @input {string} body The request body.
 *  @input trigger An input to trigger the command.
 *  @output {string} response The server's response.
 *  @output {string} status The status code and message of the response.
 *  @output {JSON} headers The headers sent with the response.
 *  @parameter {boolean} outputCompleteResponseOnly If true (the default), the produce a
 *   'response' output only upon receiving the entire response.
*/

/** Define inputs and outputs. */
exports.setup = function () {
    extend('net/REST');
 
    // Add an input for the body of the message
    input('body', {
        'type':'string',
    });
}

/** Override the base class to additionally send a body with the request.
 */
exports.issueCommand = function(callback) {
    var encodedPath = this.encodePath();
    var body = get('body');
    var options = get('options');
    var command = options;
    if (typeof options === 'string') {
        command = options + '/' + encodedPath;
    } else if (typeof command.url === 'string') {
        command.url += '/' + encodedPath;
    } else {
        command.url.path = '/' + encodedPath;
    }
    
    if (body != null) {
    	command.body = body; 
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