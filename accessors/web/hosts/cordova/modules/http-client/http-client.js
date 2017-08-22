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
 *  FIXME: it is likely sequential requests with an open socket are not queued
 *  and the responses may arrive out of order 
 *  
 *  Depends on cordova-plugin-advanced-http. To install run 
 *  <pre>
 *  cordova plugin add cordova-plugin-advanced-http
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
 *  FIXME: PUT and POST commands only accept stringified JSON objects as the body
 *  They are sent as json or url encoding depending on this implementation of http-client's
 *  special option: "encoding". Blame cordova-plugin-advanced-http.
 * 
 *  Both http and https are supported.
 *
 *  @module http-client
 *  @author Hokeun Kim, Matt Weber and Chadlia Jerad
 *  @version $$Id: http-client.js 75980 2017-04-23 00:19:25Z beth@berkeley.edu $$
 */

console.log("top of http-client.js");
// Needed plugins
exports.requiredPlugins = ['cordova-plugin-advanced-http'];

var EventEmitter = require('events').EventEmitter;
var util = require('util');
var cordovaHTTP = cordova.plugin.http;


/** Issue an HTTP request and provide a callback function for responses.
 *  The callback is a function that is passed an instance of IncomingMessage,
 *  defined here. This function returns an instance of ClientRequest, also defined here.
 *  The HTTP request will not actually be issued until you call the end() function on
 *  the returned ClientRequest.
 *
 *  This implementation ensures that for any accessor that calls this function,
 *  the callback functions are called in the same order as
 *  invocations of this request() function that triggered the request.
 *  If you call this function from the same accessor before the previous
 *  request has been completed (the callback function has been called or it has
 *  timed out), then the request will be queued to be issued only after the previous
 *  request has been satisfied.
 *
 *  The options argument can be a string URL
 *  or a map with the following fields (this helper class assumes
 *  all fields are present, so please be sure they are):
 *  <ul>
 *  <li> body: The request body, if any. FIXME: This should support all strings and image data
 *       but doesn't. It only supports stringified JSON objects (not stringified strings!).
 *       These are either url or json encoded in the body depending on this module implementation's
 *       special "encoding" option. Default is json encoding.
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
 *  @param options The options or URL.
 *  @param responseCallback The callback function to call with an instance of IncomingMessage,
 *   or with a null argument to signal an error.
 *  @return An instance of ClientRequest.
 */

exports.request = function (options, responseCallback) {
    return new ClientRequest(options, responseCallback);
};
console.log("line 113 of http-client.js");
function ClientRequest(options, responseCallback) {
    var self = this;

    var defaultOptions = {
        'headers': {},
        'keepAlive': false,
        'method': 'GET',
        'outputCompleteResponseOnly': true,
        'timeout': 5000,
        'trustAll': false,
        'encoding': 'json'
    };
    var defaultURL = {
        'host': 'localhost',
        'path': '/',
        'port': 80,
        'protocol': 'http',
        'query': ''
    };

    var urlSpec;
    if (util.isString(options)) {
        urlSpec = options;
        options = {}; // If only URL is passed in, create new options object
    } else if (util.isString(options.url)) {
        urlSpec = options.url;
    }
    if (urlSpec) {
        var url = new URL(urlSpec);
        var port = url.getPort();
        if (port < 0) {
            port = url.getDefaultPort();
            if (port < 0) {
                port = 80;
            }
        }

        options.url = {
            'host': url.getHost(),
            'path': url.getPath(),
            'port': port,
            'protocol': url.getProtocol(),
            'query': url.getQuery()
        };
    } else {
        options.url = util._extend(defaultURL, options.url);
    }
    // Fill in default values.
    options = util._extend(defaultOptions, options);

    // Attach the callback to be invoked when this object issues
    // a 'response' event.
    if (responseCallback) {
        if (options.outputCompleteResponseOnly) {
            self.once('response', responseCallback);
        } else {
            self.on('response', responseCallback);
        }
    }

    // Set the Content-Length header
    if (options.body !== null && options.body !== undefined) {
        var headers;
        if (typeof options.headers == "undefined") {
            headers = {};
        } else {
            headers = options.headers;
        }

        headers['Content-Length'] = options.body.length;
        options.headers = headers;
    }

    //this.helper = HttpClientHelper.getOrCreateHelper(actor, this);
    this.options = options;
    //console.log("this.options in request");
    //console.log(options.body);
    //console.log("options.body before this line");
}
console.log("before util.inherits http-clinet.js");
util.inherits(ClientRequest, EventEmitter);
exports.ClientRequest = ClientRequest;

console.log("line 192 http-clinet.js");

/** Issue the request. */
ClientRequest.prototype.end = function () {
    //console.log("options in end:");
   // console.log(JSON.stringify(this.options));
    //console.log("options.body in end");
    //console.log(this.options.body);
    //console.log("curious");
    //console.log(JSON.stringify(this.options.body));
    if(this.options.method){
        switch(this.options.method) {
            case "GET":
                cordovaGet(this);
                break;
            case "PUT":
                cordovaPut(this);
                break;
            case "POST":
                cordovaPost(this);
                break;
            default:
                this._handleError("http-client: invalid HTTP command specified");
                break;
        }
    } else{
        this._handleError("http-client: invalid HTTP command specified");
    }
};


/** Internal function used to handle an error.
 *  @param message The error message.
 */
ClientRequest.prototype._handleError = function (message) {
    // There may be no registered error event handler.
    try {
        this.emit('error', message);
    } catch (err) {
        error(message);
    }
};

/** Convenience method to issue an HTTP GET.  This just calls request() and then
 *  calls end() on the object returned by request(). It returns the object returned
 *  by request() (an instance of ClientRequest). See request() for documentation of
 *  the arguments.
 *
 *  This implementation ensures that for any accessor that calls this function,
 *  the callback functions are called in the same order as
 *  invocations of this request() function that triggered the request.
 *  If you call this function from the same accessor before the previous
 *  request has been completed (the callback function has been called or it has
 *  timed out), then the request will be queued to be issued only after the previous
 *  request has been satisfied.
 *
 *  @param options The options.
 *  @param responseCallback The callback function to call with an instance of IncomingMessage,
 *   or with a null argument to signal an error.
 */
exports.get = function (options, responseCallback) {
    var request = exports.request(options, responseCallback);
    request.end();
    return request;
};

/** Convenience method to issue an HTTP POST.  This just calls request() and then
 *  calls end() on the object returned by request(). It returns the object returned
 *  by request() (an instance of ClientRequest). See request() for documentation of
 *  the arguments.
 *
 *  This implementation ensures that for any accessor that calls this function,
 *  the callback functions are called in the same order as
 *  invocations of this request() function that triggered the request.
 *  If you call this function from the same accessor before the previous
 *  request has been completed (the callback function has been called or it has
 *  timed out), then the request will be queued to be issued only after the previous
 *  request has been satisfied.
 *
 *  @param options The options.
 *  @param responseCallback The callback function to call with an instance of IncomingMessage,
 *   or with a null argument to signal an error.
 */
exports.post = function (options, responseCallback) {
    options.method = "POST";
    var request = exports.request(options, responseCallback);
    request.end();
    return request;
};

console.log("line 276 http-clinet.js");

/** Convenience method to issue an HTTP PUT.  This just calls request() and then
 *  calls end() on the object returned by request(). It returns the object returned
 *  by request() (an instance of ClientRequest). See request() for documentation of
 *  the arguments.
 *
 *  This implementation ensures that for any accessor that calls this function,
 *  the callback functions are called in the same order as
 *  invocations of this request() function that triggered the request.
 *  If you call this function from the same accessor before the previous
 *  request has been completed (the callback function has been called or it has
 *  timed out), then the request will be queued to be issued only after the previous
 *  request has been satisfied.
 *
 *  @param options The options.
 *  @param responseCallback The callback function to call with an instance of IncomingMessage,
 *   or with a null argument to signal an error.
 */
exports.put = function (options, responseCallback) {
    options.method = "PUT";
    var request = exports.request(options, responseCallback);
    request.end();
    return request;
};

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
var cordovaGet = function (request) {
	var parsedOptions = parseOptions(request);
    if(parsedOptions){
         console.log('Get Request to URL...');
    
        // Call cordovaHTTP get
        cordovaHTTP.get(parsedOptions.url, 
                parsedOptions.parameters, 
                parsedOptions.headers, 
                function(response) {
                    var receivedMessage = new IncomingMessage(response);
                    request.emit('response', receivedMessage);
                },
                function(response) {
                    request.emit('response', null);
                    request._handleError('cordovaGet error in http-client: ' + response.error);
                }
        );
    } else {
        request.emit('response', null);
        request._handleError('cordovaPut error in http-client: unable to parse options');
    }


   
};

/** Issue an HTTP post request.
 *  
 *  @param options The options.
 *  @param responseCallback The callback function to call with an instance of IncomingMessage,
 *   or with a null argument to signal an error.
 */
 
var cordovaPost = function (request) {
	var parsedOptions = parseOptions(request);
    if(parsedOptions){
            /*
            cordovaHTTP.acceptAllCerts(true, function() {
                console.log('accepting all certs success!');
            }, function() {
                console.log('error :(');
            });

            cordovaHTTP.validateDomainName(false, function() {
                console.log('success!');
            }, function() {
                console.log('error :(');
            });
    */

        //console.log('Post Request to URL...');
        //console.log(JSON.stringify(parsedOptions));
        //console.log("url");
        //console.log(parsedOptions.url);
        //console.log("data");
        //console.log(JSON.stringify(parsedOptions.data));
        //console.log("headers");
        //console.log(JSON.stringify(parsedOptions.headers));
        //console.log("end test");
        // Call cordovaHTTP post. It takes the url, data, headers and two callback functions
        cordovaHTTP.post(parsedOptions.url, 
            parsedOptions.data, 
                 parsedOptions.headers,
                function(response) {
                                    console.log("in post success callback");
                    var receivedMessage = new IncomingMessage(response);
                    request.emit('response', receivedMessage);
                },
                function(response) {
                                    console.log("in post failure callback" + response.error);
                    request.emit('response', null);
                    request._handleError('cordovaPost error in http-client: ' + response.error);
                }
        );
    } else {
        request.emit('response', null);
        request._handleError('cordovaPut error in http-client: unable to parse options');
    }

};

/*
var cordovaPost = function(request){
    var testmessage = {"group":'mutemandrill'};
    console.log(JSON.stringify(testmessage));
    console.log(cordovaHTTP);
    console.log("after print");

    cordovaHTTP.post("http://terra.eecs.berkeley.edu:8091",  {
    "id": 12,
    "message": "test",
    "cant": "beat",
    "join": "em"
} , { Authorization: "OAuth2: token" }, function(response) {
    console.log("success with post");
   // console.log(response.data);
}, function(response) {
    console.log("failure with post");
   // console.log(response.data);
   // console.log(response.error);
   // console.error(response.error);

});
};
*/
/*
var cordovaPost = function(request){
console.log("in cordovaPost");
cordovaHTTP.acceptAllCerts(false, function(){

    console.log("now accepting certs");
    cordovaHTTP.validateDomainName(false, function(){
        console.log("now not validating");
        cordovaHTTP.post("https://google.com/", {
    id: 12,
    message: "test"
}, { Authorization: "OAuth2: token" }, function(response) {
    // prints 200
    console.log(response.status);
    try {
        response.data = JSON.parse(response.data);
        // prints test
        console.log(response.data.message);
    } catch(e) {
        console.error("JSON parsing error");
    }
}, function(response) {
    // prints 403
    console.log(response.status);
    
    //prints Permission denied 
    console.log(response.error);
});


    }, function(){

        console.log("failed to turn off validateDomainName");
    });


},
function(){
    console.log("failed to accept certs");
}
);

};
*/

/** Issue an HTTP put request.
 *
 *  @param options The options, see parseOptions for more details.
 *  @param responseCallback The callback function to call with an instance of IncomingMessage,
 *   or with a null argument to signal an error.
 */
var cordovaPut = function (request) {
	var parsedOptions = parseOptions(request);

    if(parsedOptions){
        console.log('Put Request to URL...');
   
    // Call cordovaHTTP post. It takes the url, data, headers and two callback functions
        cordovaHTTP.put(parsedOptions.url, 
            parsedOptions.data, 
            parsedOptions.headers, 
            function(response) {

                var receivedMessage = new IncomingMessage(response);
                request.emit('response', receivedMessage);
            },
            function(response) {

                request.emit('response', null);
                request._handleError('cordovaPut error in http-client: ' + response.error);
            }
        );
    } else {
        request.emit('response', null);
        request._handleError('cordovaPut error in http-client: unable to parse options');
    }

    
};

/** Parses the request options and returns the appropriate object according to 
 *  the documentation above for exports.request()
 *  
 *  --- The description below HAS A MAJOR ADDITION (encoding) FROM CapeCode's httpClient module.
 *  The options argument can be a string URL
 *  or a map with the following fields (this helper class assumes
 *  all fields are present, so please be sure they are):
 *  <ul>
 *  <li> encoding: FIXME: THIS IS ONLY A CORDOVA ISSUE
 *       For put and post requests, cordova-plugin-advanced-http only supports
 *       JSON and url encodings. Possible values are "json" and "urlencoded". "json" is default. See. 
 *       https://www.npmjs.com/package/cordova-plugin-advanced-http-custom-error#setdataserializer
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
 *  @param request argument containing options at request.options.
 *  @returns an object with cordova-plugin-advanced-http compatible attributes: url, parameters and headers.
 *  returns null if unable to parse the options.
 */
function parseOptions (request) {
    var options = request.options;
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
			//console.log("typeof options.url != 'string'");
			if (typeof options.url.host !== 'undefined' && options.url) {
				host = options.url.host; 
			}
			if (typeof options.url.path !== 'undefined' && options.url.path) {
				path = options.url.path; 
			}
			if (typeof options.url.protocol !== 'undefined' && options.url.protocol) {
				protocol = options.url.protocol; 
			}
			if (typeof options.url.port !== 'undefined' && options.url.port) {
				port = options.url.port; 
			}
			if (typeof options.url.query !== 'undefined' && options.url.query) {
				query = options.url.query; 
			}
			url = protocol + '://' + host + ':' + port + path + query;
		}
	}
		
	// Construct headers from options, if any
	if (options.headers) {
		headers = options.headers;
	}
	
	// Construct parameters from options, if any
	if (options.parameters) {
		parameters = options.parameters;
	}
	
	// Construct data from options, if any
	// In a GET request, arguments should already be encoded in the url.
    //console.log("options.body in parse");
    //console.log(options.body)
	if (options.body) {
        //FIXME: cordova-plugin-advanced-http accepts only JSON objects as the body
		try{
            data = JSON.parse(options.body);
        } catch (error) {
            if( options.method == "POST" || options.method == "PUT"){
                return null;
            }
        }
	}
    //    console.log("data in parse");
    //console.log(options.body)

    // FIXME encodings are not a problem on the other hosts!
    if (options.encoding){
        if(options.encoding == "urlencoded"){
            cordovaHTTP.setDataSerializer("urlencoded");
        } else {
            cordovaHTTP.setDataSerializer("json");
        }
    }
	
	return {'url': url, 'headers': headers, 'parameters': parameters, 'data': data};
}


/** Incoming message object type.  Used by cordovaGet, cordovaPut, and cordovaPost
 *
 *  An instance of this object type will be passed to the callback passed to the
 *  request() or this.get() functions. The instance contains:
 *  <ul>
 *  <li> body: a string with the body of the response. </li>
 *  <li> headers: message header names and values. Names are lower case. </li>
 *  <li> statusCode: an integer indicating the status of the response. </li>
 *  <li> cookies: an array of strings with cookies returned. </li>
 *  <li> statusMessage: a string with the status message of the response. </li>
 *  </ul>
 *
 *  FIXME: the fields cookies and statusMessage are not returned by the cordova-plugin-advanced-http.
 *  Therefore they are written to be an empty array and empty string respectively.
 *
 *  This object should match the interface of the Node 
 *  [http.IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage).
 *  Do not add fields here, otherwise the node host will fail.
 *
 *  @constructor
 *  @param response A response from the cordova-plugin-advanced-http, as given to a callback for an http
 *  command such as cordovaHTTP.get
 */
// IncomingMessage = function(response, body) {
function IncomingMessage(response) {
    this.body = response.data;
    this.statusCode = status;
    this.cookies = [];
    this.statusMessage = "";
    this.headers = {};

    for (var name in response.headers) {
            // Vert.x header keys are in lowercase.
        if(response.headers.hasOwnProperty(name)){
            this.headers[name.toLowerCase()] = response.headers.name;
        }
    }
}
console.log("bottom of http-client.js");
