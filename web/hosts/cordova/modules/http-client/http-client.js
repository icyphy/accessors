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
 *  Many of the features of http-client modules for Cape Code and Node hosts are not
 *  supported in this module due to limitiations in the plugin. Places in the documentation where
 *  this implementation cannot meet the API of the other versions are marked with FIXMEs 
 *
 *  FIXME: POST commands are implemented with XMLHttpRequest, which is inconsistent with all the
 *  other http commands. 
 *
 *  FIXME: PUT commands only accept stringified JSON objects as the body
 *  They are sent as json or url encoding depending on this implementation of http-client's
 *  special option: "encoding". Blame cordova-plugin-advanced-http.
 * 
 *  Both http and https are supported.
 *
 *  @module http-client
 *  @author  Matt Weber, Chadlia Jerad, and Hokeun Kim
 *  @version $$Id: http-client.js 75980 2017-04-23 00:19:25Z beth@berkeley.edu $$
 */

// Needed plugins
var cordovaHTTP = cordova.plugin.http;
exports.requiredPlugins = ['cordova-plugin-advanced-http'];

if(typeof cordova.plugin.http == "undefined"){
    console.log("WARNING: http-client.js module does not have cordova-plugin-advanced-http installed and will not work correctly.");
}

var EventEmitter = require('events').EventEmitter;
var util = require('util');
//FIXME: this full path require method is brittle. Ideally we would require these
//helper node modules with require('util') style.
var URL = require('./modules/url-parse/url-parse');
var required = require('./modules/requires-port/requires-port');



// Store if 'trust all certificates' and 'validate domain name' were already set
// to the desired value. This will avoid non useful repeated calls.
var trustAllStatus = false;
var validateDomainNameStatus = true;

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
 *  <li> trustAll: FIXME THIS IS A CORDOVA EXCLUSIVE OPTION.
 *       Accept all SSL certificates. Or disable accepting all certificates. Defaults to false.
 *  <li> validateDomainName: FIXME THIS IS A CORDOVA EXCLUSIVE OPTION.
 *       Whether or not to validate the domain name in the certificate. Defaults to true.
 *  <li> encoding: FIXME: THIS IS ONLY A CORDOVA ISSUE
 *       For put and post requests, cordova-plugin-advanced-http only supports
 *       JSON and url encodings. Possible values are "json" and "urlencoded". "json" is default. See. 
 *       https://www.npmjs.com/package/cordova-plugin-advanced-http-custom-error#setdataserializer
 *  <li> body: The request body, if any. FIXME: This should support all strings and image data
 *       but doesn't. It only supports stringified JSON objects (not stringified strings!).
 *       These are either url or json encoded in the body depending on the value of the Cordova-only
 *       special "encoding" option. Default is json encoding.
 *  <li> headers: An object containing request headers. By default this
 *       is an empty object. Items may have a value that is an array of values,
 *       for headers with more than one value.
 *  <li> keepAlive: FIXME: The value true is not supported by the cordova http plugin!
 *       In other hosts, this is a boolean
 *       that specifies whether to keep sockets around
 *       in a pool to be used by other requests in the future. This defaults to false.
 *  <li> method: FIXME: The only supported HTTP request methods in this module are 'GET', 'PUT', and 'POST'.
 *       Defaults to 'GET'. In other hosts more methods may be supported.
 *  <li> outputCompleteResponseOnly: FIXME: The value false is not supported by the cordova http plugin! 
 *       In other hosts, if false, then the multiple invocations of the
 *       callback may be invoked for each request. This defaults to true, in which case
 *       there will be only one invocation of the callback.
 *  <li> timeout: FIXME: This parameter is ignored by the cordova http plugin! 
 *       In other hosts, the amount of time (in milliseconds) to wait for a response
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
 *       <li> port: Port of remote server. This defaults to 80. Using the defaultwill probably yield
 *            undesired behavior if the specified protocol isn't http.
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

/** Constructor for the object type returned by the request() function.
 *  This object type provides the following functions:
 *  <ul>
 *  <li> end(): Call this to end the request. </li>
 *  <li> write(''data'', ''encoding''): FIXME: Not supported by this module!
 *  In other hosts, writes data (e.g. for a POST request). </li>
 *  </ul>
 *  The request will not be issued until you call end().
 *  See the documentation of the request function for an explanation of the arguments.
 *  This is an event emitter that emits the following events:
 *  <ul>
 *  <li> 'error': If an error occurs. The message is passed as an argument. </li>
 *  <li> 'response': A response is received from the server. This event is automatically
 *       handled by calling responseCallback, if responseCallback is not null.</li>
 *  </ul>
 *  @constructor
 *  @param options The options.
 *  @param responseCallback The callback function to call with an instance of IncomingMessage,
 *   or with a null argument to signal an error.
 */

function ClientRequest(options, responseCallback) {
    var self = this;

    var defaultOptions = {
        'headers': {},
        'keepAlive': false,
        'method': 'GET',
        'outputCompleteResponseOnly': true,
        'timeout': 5000,
        'trustAll': false,
        'validateDomainName': true,
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
        //The entire options input is given as just a string
        urlSpec = options;
        options = {}; // If only URL is passed in, create new options object
    } else if (util.isString(options.url)) {
        //Options is an object with a url field that is just a string
        urlSpec = options.url;
    }
    if (urlSpec) {
        //Either options is a string or an object with a string url field.
        var url = new URL(urlSpec);
        //var url = new URL('https://github.com/foo/bar');
        var port = url.port;
        if (!port || port < 0) {
            port = false; //indicates port should be omited from url
        }
        options.url = {
            'host': url.hostname,
            'path': url.pathname,
            'port': port,
            'protocol': url.protocol.split(':')[0],
            'query': url.query
        };
    } else {
        //Options is an object with its URL field set to an object
        options.url = util._extend(defaultURL, options.url);
    }
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

    this.options = options;
}
util.inherits(ClientRequest, EventEmitter);
exports.ClientRequest = ClientRequest;

/** Issue the request. */
ClientRequest.prototype.end = function () {
    var that = this;
    //trustall and validate domain name options can only be set asynchronously
    //by the http plugin. To ensure the plugin is in the correct state before
    //issuing the request we have to chain callbacks.

    //setTrustAll is a helper function which upon success calls
    //setValidateDomainName which upon success calls the main body of this function (below)
    setTrustAll(this, setValidateDomainName, function() {
        //Call the apropriate wrapper for the cordova http plugin method.
        if(that.options.method){
            switch(that.options.method) {
                case "GET":
                    cordovaGet(that);
                    break;
                case "PUT":
                    cordovaPut(that);
                    break;
                case "POST":
                    cordovaPost(that);
                    break;
                default:
                    that._handleError("http-client: invalid HTTP command specified");
                    break;
            }
        } else{
            that._handleError("http-client: No HTTP command specified");
        }
    });
};

//Helper function for ClientRequest.prototype.end. See the comment in that function
var setTrustAll = function(request, setValidateCallback, endCallback){
    if(request.options.trustAll == trustAllStatus){
        //no need to set anything
        setValidateCallback(request, endCallback);
    } else {
        cordovaHTTP.acceptAllCerts(request.options.trustAll, function() {
            //If successfully set
            trustAllStatus = request.options.trustAll;
            console.log('trustAllStatus changed to ' + request.options.trustAll);
            setValidateCallback(request, endCallback);
        }, function() {
            //If not successfully set
            request._handleError('Unable to set trustAll status for cordova plugin!');
        });
    }
};

//Helper function for ClientRequest.prototype.end. See the comment in that function.
var setValidateDomainName = function(request, endCallback){
    if(request.options.validateDomainName == validateDomainNameStatus ){
        //no need to set anything
        endCallback();
    } else {
        cordovaHTTP.validateDomainName(request.options.validateDomainName, function() {
            //If successfully set
            validateDomainNameStatus = request.options.validateDomainName;
            console.log('validateDomainNameStatus changed to ' + request.options.validateDomainName);
            endCallback();
        }, function() {
            //If not successfully set
            request._handleError('Unable to set validateDomainName status for cordova plugin!');
        });
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

// TODO: Implement stop.
/** Once request queueing is implemented, this method should discard any pending
 * submitted jobs and reset the sequence number to zero.
 */
ClientRequest.prototype.stop = function() {
	
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

/** Issue an HTTP get request. Initiated by calling end() on a ClientRequest with its method
 *  parameter set to GET
 *
 *  In addition to the description of options parameter given in parseOptions(),
 *  this parameter can call accepting all, if trustAll attribute in options is set
 *  to true.
 *  
 *  @param request The clientRequest object initiating the command.
 */
var cordovaGet = function (request) {
	var parsedOptions = parseOptions(request);
    if(parsedOptions){
         console.log('Get Request to URL...');
         console.log(JSON.stringify(parsedOptions));
    
        // Call cordovaHTTP get
        cordovaHTTP.get(parsedOptions.url, 
                parsedOptions.parameters, 
                parsedOptions.headers, 
                function(response) {
                    console.log('Get request successful!');
                    var receivedMessage = new IncomingMessage(response);
                    request.emit('response', receivedMessage);
                },
                function(response) {
                    console.log('Get request failed');
                    request.emit('response', null);
                    request._handleError('cordovaGet error in http-client: ' + response.error);
                }
        );
    } else {
        request.emit('response', null);
        request._handleError('cordovaGet error in http-client: unable to parse options');
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
         console.log('Post Request to URL...');
         console.log(JSON.stringify(parsedOptions));
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                console.log('Post request successful!');
                // I have not exhaustively searched all the response data available from xmlhttpreqest
                // Perhaps more response data can be extracted.

                var allResponseHeaders = this.getAllResponseHeaders();
                var arr = allResponseHeaders.split('\r\n');
                var headers = arr.reduce(function (acc, current, i){
                      var parts = current.split(': ');
                      acc[parts[0]] = parts[1];
                      return acc;
                }, {});

                var response = {
                    "status": this.status,
                    "data" : this.responseText,
                    "headers": headers
                };
                var receivedMessage = new IncomingMessage(response);
                console.log(JSON.stringify(receivedMessage));
                request.emit('response', receivedMessage);
            }
            else if(this.readyState == 4){
                console.log("Post request failed");
                request.emit('response', null);
                request._handleError('cordovaPost error in http-client: ' + this.status);
            }
        };
        xhttp.open("POST", parsedOptions.url, true);
        // Setting headers must come after open() but before send().
        // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/setRequestHeader
        // XMLHttpRequest.setRequestHeader(header, value)
        if (parsedOptions.hasOwnProperty('headers')) {
        	for (var header in parsedOptions.headers) {
        		console.log(header + ' ' + parsedOptions.headers[header]);
        		xhttp.setRequestHeader(header, parsedOptions.headers[header]);
        	}
        }
        
        xhttp.send(parsedOptions.data);        
    } else {
        request.emit('response', null);
        request._handleError('cordovaPost error in http-client: unable to parse options');
    }

};

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
        console.log(JSON.stringify(parsedOptions));     
    // Call cordovaHTTP post. It takes the url, data, headers and two callback functions
        cordovaHTTP.put(parsedOptions.url, 
            parsedOptions.data, 
            parsedOptions.headers, 
            function(response) {
                console.log('Put request successful!');
                var receivedMessage = new IncomingMessage(response);
                request.emit('response', receivedMessage);
            },
            function(response) {
                console.log('Put request failed');
                request.emit('response', null);
                request._handleError('cordovaPut error in http-client: ' + response.error);
            }
        );
    } else {
        request.emit('response', null);
        request._handleError('cordovaPut error in http-client: unable to parse options');
    }

    
};

/** Parses the request options and returns cordova plugin compatible attributes.
 *  
 *  @param request the clientRequest object containing options at request.options.
 *  @returns an object with cordova-plugin-advanced-http compatible attributes: url, parameters and headers.
 *  returns null if unable to parse the options.
 */
function parseOptions (request) {
    var options = request.options;
	var url = '', parameters = {}, data = {}, headers = {};
    
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

            //If port is set to false it should be omited from the url
            if(options.url.port){
                host = host + ':' + port;
            }
            url = protocol + '://' + host + path;
		}
	}
		
	// Construct headers from options, if any
	if (options.headers) {
		headers = options.headers;
	}
	
	// Construct parameters from options, if any
	if (options.url.query) {
		parameters = options.url.query;
	}
	
	// Construct data from options, if any
	// In a GET request, arguments should already be encoded in the url.
	if (options.body) {

        data = options.body;
/*
        //FIXME: cordova-plugin-advanced-http accepts only JSON objects as the body
		try{
            data = JSON.parse(options.body);
        } catch (error) {
            if( options.method == "POST" || options.method == "PUT"){
                return null;
            }
        }

*/
	}

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
 *  <li> cookies: FIXME: not returned in this module!
 *  On other hosts, an array of strings with cookies returned. </li>
 *  <li> statusMessage: FIXME: not returned in this module!
 *  On other hosts a string with the status message of the response. </li>
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
    this.statusCode = response.status;
    this.cookies = [];
    this.statusMessage = "";
    this.headers = {};

    for (var name in response.headers) {

            // Vert.x header keys are in lowercase.
        if(response.headers.hasOwnProperty(name)){
            this.headers[name.toLowerCase()] = response.headers[name];
        }
    }
}
