// Below is the copyright agreement for the Ptolemy II system.
//
// Copyright (c) 2015-2016 The Regents of the University of California.
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

/** Module for HTTP clients. Supports get, put and post methods.
 *  FIXME: Add support for request
 *  
 *  Depends on cordova-plugin-http. To install run 
 *  <pre>
 *  cordova plugin add cordova-plugin-http
 *  </pre>
 *
 *  A nominal usage example is:
 *  <pre>
 *  httpClient.get({
 *  		trustAll: true,
 *      	url: "https://www.google.com"
 *   	},
 *   	function(response) {
 *      	console.log(response.body);
 *   	}
 *  );
 *  </pre>
 *  
 *  Both http and https are supported.
 *
 *  @module http-client
 *  @author Hokeun Kim, Matt Weber and Chadlia Jerad
 *  @version $$Id: http-client.js 75980 2017-04-23 00:19:25Z beth@berkeley.edu $$
 */

// Needed plugins
exports.requiredPlugins = ['cordova-plugin-http'];

var EventEmitter = require('events').EventEmitter;

// Store if 'trust all certificates' and 'validate domain name' were called.
// This will avoid non useful repeated calls.
var certificateAndDomainNameRequested = false;

/** Issue an HTTP get request.
 *
 *  In addition to the description of options parameter given in parseOptions(),
 *  this parameter can call accepting all, if trustAll attribute in options is set
 *  to true.
 *  
 *  @param options The options.
 *  @param responseCallback The callback function to call with an instance of IncomingMessage,
 *   or with a null argument to signal an error.
 */
exports.get = function (options, responseCallback) {
	var parsedOptions = parseOptions(options);

    console.log('Get Request to URL...');
    
    // Call cordovaHTTP get
    cordovaHTTP.get(parsedOptions.url, 
    		parsedOptions.parameters, 
    		parsedOptions.headers, 
    		function(response) {
    			// Support of more convenience handling the response.
    			// In case the response is stored in response.data, then copy
    			// the contents in response.body (if not defined already).
    			// FIXME: Make sure that this not harmful 
    			// console.log('response body: '+ response.body);
    			// console.log('response response: '+ response.response);
    			if (!response.body && response.data) {
    				response.body = response.data;
    			}
    			responseCallback.call(this, response);
    		}, 
    		function(response) {
    			responseCallback.call(this, null);
    			console.log('Error: ' + response.error);
    			// console.log('get(): the response status was: ' + response.status);
    		}
    );
};

/** Issue an HTTP post request.
 *  
 *  @param options The options.
 *  @param responseCallback The callback function to call with an instance of IncomingMessage,
 *   or with a null argument to signal an error.
 */
exports.post = function (options, responseCallback) {
	var parsedOptions = parseOptions(options);

    console.log('Post Request to URL...');
   
    // Call cordovaHTTP post. It takes the url, data, headers and two callback functions
    cordovaHTTP.post(parsedOptions.url, 
    		parsedOptions.data, 
    		parsedOptions.headers, 
    		function(response) {
   				responseCallback.call(this, response);
    		}, 
    		function(response) {
    			responseCallback.call(this, null);
    			console.log('Error: ' + response.error);
    			// console.log('post(): the response status was: ' + response.status);
    		}	
    );
};

/** Issue an HTTP put request.
 *
 *  @param options The options, see parseOptions for more details.
 *  @param responseCallback The callback function to call with an instance of IncomingMessage,
 *   or with a null argument to signal an error.
 */
exports.put = function (options, responseCallback) {
	var parsedOptions = parseOptions(options);

    console.log('Put Request to URL...');
   
    // Call cordovaHTTP post. It takes the url, data, headers and two callback functions
    cordovaHTTP.put(parsedOptions.url, 
    		parsedOptions.data, 
    		parsedOptions.headers, 
    		function(response) {
   				responseCallback.call(this, response);
    		}, 
    		function(response) {
    			responseCallback.call(this, null);
    			console.log('Error: ' + response.error);
    			// console.log('put(): the response status was: ' + response.status);
    		}	
    );
};

/** Parses the request options and returns the appropriate object according to 
 *  cordovaHTTP.
 *  
 *  --- The description below is copied from CapeCode's httpClient module.
 *  The options argument can be a string URL
 *  or a map with the following fields (this helper class assumes
 *  all fields are present, so please be suandre they are):
 *  <ul>
 *  <li> body: The request body, if any.  This supports at least strings and image data.
 *  <li> headers: An object containing request headers. By default this
 *       is an empty object. Items may have a value that is an array of values,
 *       for headers with more than one value.
 *  <li> keepAlive: A boolean that specified whether to keep sockets around
 *       in a pool to be used by other requests in the future. This defaults to false.
 *  <li> method: A string specifying the HTTP request method.
 *       This defaults to 'GET', but can also be 'PUT', 'POST', 'DELETE', etc.
 *  <li> outputCompleteResponseOnly: If false, then the multiple invocations of the
 *       callback may be invoked for each request. This defaults to true, in which case
 *       there will be only one invocation of the callback.
 *  <li> timeout: The amount of time (in milliseconds) to wait for a response
 *       before triggering a null response and an error. This defaults to 5000.
 *  <li> url: A string that can be parsed as a URL, or an object containing
 *       the following fields:
 *       <ul>
 *       <li> host: A string giving the domain name or IP address of
 *            the server to issue the request to. This defaults to 'localhost'.
 *       <li> path: Request path as a string. This defaults to '/'. This can
 *            include a query string, e.g. '/index.html?page=12', or the query
 *            string can be specified as a separate field (see below).
 *            An exception is thrown if the request path contains illegal characters.
 *       <li> protocol: The protocol. This is a string that defaults to 'http'.
 *       <li> port: Port of remote server. This defaults to 80.
 *       <li> query: A query string to be appended to the path, such as '?page=12'.
 *       </ul>
 *  </ul>
 *  
 *  In addition, options can call accepting all certificates, if trustAll attribute
 *  is set to true.
 *  
 *  @param options argument
 *  @returns an object with the attributes url, parameters and headers
 */
function parseOptions (options) {
	var url = '', parameters = {}, data = {}, headers = {};
	
	// Call accept all certificates if trustAll is set	
    if (options.trustAll && !certificateAndDomainNameRequested) {
    	// console.log('Request for accepting all certificates...');
    	certificateAndDomainNameRequested = true;
    	cordovaHTTP.acceptAllCerts(true, function() {
    		console.log('All certificates are trusted.');
    	}, function() {
    		console.log('Cannot trust all certificates!');
    	});
       
    	cordovaHTTP.validateDomainName(false, function() {
    		console.log('Domain name successfully validated!');
    	}, function() {
    		console.log('Error validating domain name.');
    	});
    }
    
    // Extract URL from options, if any
	if (typeof options === 'string') {
		url = options;
	} else if (options.url) {
		if (typeof options.url === 'string') {
			url = options.url;
		} else {
			var host = 'localhost';
			var path = '/';
			var protocol = 'http';
			var port = '80';
			var query = '';
			console.log("typeof options.urlk != 'string'");
			if (typeof options.url.host !== 'undefined' && options.url) {
				host = options.url.host; 
			};
			if (typeof options.url.path !== 'undefined' && options.url.path) {
				path = options.url.path; 
			};
			if (typeof options.url.protocol !== 'undefined' && options.url.protocol) {
				protocol = options.url.protocol; 
			};
			if (typeof options.url.port !== 'undefined' && options.url.port) {
				port = options.url.port; 
			};
			if (typeof options.url.query !== 'undefined' && options.url.query) {
				query = options.url.query; 
			};
			url = protocol + '://' + host + path + ':' + port + query;
		};
	};
		
	// Construct headers from options, if any
	if (options.headers) {
		headers = options.headers;
	};
	
	// Construct parameters from options, if any
	if (options.parameters) {
		parameters = options.parameters;
	};
	
	// Construct data from options, if any
	// FIXME: is query the data of a post request???
	if (options.query) {
		data = options.query;
	};
	
	return {'url': url, 'headers': headers, 'parameters': parameters, 'data': data};
}


