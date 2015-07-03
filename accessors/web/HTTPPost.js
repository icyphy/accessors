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

/** Post the input to the given URL.  A wrapper for httpRequest for posting. 
 *  Does NOT handle multiple data types.  Only knows how to post JSON data. 
 * 
 *  @accessor HTTPPost
 *  @author Elizabeth Latronico (beth@berkeley.edu)
 *  @input {JSON} data The data to post.
 *  @input {String} url The url to post the data to.
 *  @output {string} response The server's response.
 */

/** Define inputs and outputs. */
exports.setup = function () {
    
    accessor.input('data', {
        type: 'JSON',
      });
    
    accessor.input('url', {
        type: 'string',
      });
    
    accessor.output('response', {
        type: 'string',
      });
};

var handle;
var timeout = 2000;    // The httpRequest method currently ignores the timeout

/** Post the received data to the specified url.  */
exports.initialize = function () {
	handle = addInputHandler('data', function() {
		var properties = {};
		properties["Content-Type"] = "application/json";
		var responseText = 
			httpRequest(get('url'), 'POST', properties, get('data'), 
					timeout);
		send('response', responseText);
	});
}

/** Upon wrapup, stop handling new inputs.  */
exports.wrapup = function () {
    removeInputHandler(handle);
};