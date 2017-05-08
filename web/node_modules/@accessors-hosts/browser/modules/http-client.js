//Copyright (c) 2015 The Regents of the University of California.
//All rights reserved.

//Permission is hereby granted, without written agreement and without
//license or royalty fees, to use, copy, modify, and distribute this
//software and its documentation for any purpose, provided that the above
//copyright notice and the following two paragraphs appear in all copies
//of this software.

//IN NO EVENT SHALL THE UNIVERSITY OF CALIFORNIA BE LIABLE TO ANY PARTY
//FOR DIRECT, INDIRECT, SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES
//ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
//THE UNIVERSITY OF CALIFORNIA HAS BEEN ADVISED OF THE POSSIBILITY OF
//SUCH DAMAGE.

//THE UNIVERSITY OF CALIFORNIA SPECIFICALLY DISCLAIMS ANY WARRANTIES,
//INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
//MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE. THE SOFTWARE
//PROVIDED HEREUNDER IS ON AN "AS IS" BASIS, AND THE UNIVERSITY OF
//CALIFORNIA HAS NO OBLIGATION TO PROVIDE MAINTENANCE, SUPPORT, UPDATES,
//ENHANCEMENTS, OR MODIFICATIONS.

/**
 * Module for HTTP clients.
 * A simple use of this module is to request a web page and print its contents, as
 * illustrated by the following example:
 * <pre>
 *    var httpClient = require('@accessors-modules/http-client');
 *    httpClient.get('http://accessors.org', function(message) {
 *        print(message.body);
 *    });
 * </pre>
 * Both http and https are supported.
 *
 * @module httpClient
 * @author Marten Lohstroh, Edward A. Lee, Elizabeth Osyk
 * @version $$Id$$
 */

//Stop extra messages from jslint.  Note that there should be no
//space between the / and the * and global.
/*globals Java, actor, error, exports, IncomingMessage, require, util */

//FIXME: Setting "use strict" causes a warning about the IncomingMessage function declaration being Read Only
//and then opening the camera library fails.  The error is:
//Error: Error executing module net/REST line #237 : Error executing module httpClient line #356 : "IncomingMessage" is not defined
//In file: /Users/cxh/ptII/ptolemy/actor/lib/jjs/modules/httpClient/httpClient.js
//"use strict";

var EventEmitter = require('events').EventEmitter;
var jQuery = require('jquery');
var url = require('url');
var util = require('util');

/** Issue an HTTP request and provide a callback function for responses.
 *  The callback is a function that is passed an instance of IncomingMessage,
 *  defined here. This function returns an instance of ClientRequest, also defined here.
 *  The HTTP request will not actually be issued until you call the end() function on
 *  the returned ClientRequest.
 *  
 *  Note that accessors (as with other scripts) are subject to the same-origin
 *  policy in a browser host.  Therefore sites will be blocked unless the 
 *  server supports cross-origin requests or supports JSON with padding.
 *  For more details please see: 
 *  https://www.icyphy.org/accessors/wiki/Version0/HttpClient
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
 *  @param options The options or URL.
 *  @param responseCallback The callback function to call with an instance of IncomingMessage,
 *   or with a null argument to signal an error.
 *  @return An instance of ClientRequest.
 */

//TODO:  Request queueing is not implemented yet

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

/*
 *  *  This implementation ensures that for any accessor that calls this function,
 *  the callback functions are called in the same order as
 *  invocations of this request() function that triggered the request.
 *  If you call this function from the same accessor before the previous
 *  request has been completed (the callback function has been called or it has
 *  timed out), then the request will be queued to be issued only after the previous
 *  request has been satisfied.
 */

exports.request = function(options, responseCallback) {
        return new ClientRequest(options, responseCallback);
};

//TODO:  
// post, put methods

//NOTE: The following events are produced by ClientRequest in Node.js
//From: http.ClientRequest 
//Event: 'response'
//Event: 'socket'
//Event: 'connect'
//Event: 'upgrade'
//Event: 'continue'
//From stream.Writeable
//Event: 'finish'
//Event: 'pipe'
//Event: 'unpipe'
//Event: 'error'

//TODO:  Proper implementation of end()?  Here, creating request calls end()
//automatically.  Compare behavior with Java module.
//TODO:  Implement write().  Use case?  For streams?  POST uses options.body,
//there's no explicit write()
//TODO:  Implement stop().

/** Constructor for the object type returned by the request() function.
 *  This object type provides the following functions:
 *  <ul>
 *  <li> end(): Call this to end the request. </li>
 *  <li> write(''data'', ''encoding''): Write data (e.g. for a POST request). </li>
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
        EventEmitter.call(this);

        var defaultPort = 80;        // May differ from java.net.url calculation in Java module.

        var defaultOptions = {
                        'headers':{},
                        'keepAlive':false,
                        'method':'GET',
                        'outputCompleteResponseOnly':true,
                        'timeout':5000,
                        'trustAll':false,
        };

        var defaultUrl = "http://localhost:80"
                var urlSpec;
        if (util.isString(options)) {
                urlSpec = options;
                options = {};  // If only URL is passed in, create new options object 
        } else if (util.isString(options.url)) {
                urlSpec = options.url;
        }
        if (urlSpec) {
                options.url = url.parse(urlSpec);

        } else {
                options.url = url.parse(defaultUrl);
        }
        // Fill in default values.
        options = util._extend(defaultOptions, options);

        // Attach the callback to be invoked when this object issues
        // a 'response' event.  
        if (responseCallback) {
                if (options.outputCompleteResponseOnly) {
                        this.once('response', responseCallback);
                } else {
                        this.on('response', responseCallback);
                }
        }

        // Set the Content-Length header
        if (options.body !== null && options.body !== undefined && options.body != "") {
                var headers;
                if (typeof options.headers == "undefined") {
                        headers = {};
                } else {
                        headers = options.headers;
                }

                headers['Content-Length'] = options.body.length;
                options.headers = headers;
        }

        // console.log("Making an HTTP request: " + JSON.stringify(options));
        this.options = options;
}
util.inherits(ClientRequest, EventEmitter);
exports.ClientRequest = ClientRequest;

/** Issue the request. */
ClientRequest.prototype.end = function() {
        var self = this;
        // Remove trailing slash from URL, if any,  Trailing slash causes problems
        // for some sites.
        var urlString = this.options.url.href;
        if (urlString.substring(urlString.length - 1) === "/"){
                urlString = urlString.substring(0, urlString.length - 1);
        }

        // TODO:  Implement keep-alive and write a test case
        // This is sent as a header field in jQuery
        /*
        this.options.headers['Keep-Alive'] = this.options.keepAlive;
         */

        // Check for a JSONP request.  URL will end with ?callback=?
        // TODO:  Support named callbacks (e.g. ?callback=myMethod) if needed.
        if (this.options.method === "GET" && urlString.length > 11 
                        && urlString.substring(urlString.length - 11, urlString.length) === "?callback=?") {
                jQuery.getJSON(urlString, function(data, textStatus, xhr) {
                        self._response(xhr, data);
                });
        } else {
                // Define an object so that body can be optionally added in ajax call
                var ajaxObject = {
                                // Set properties provided by defaultOptions
                                headers : this.options.headers,
                                method : this.options.method,
                                timeout : this.options.timeout,
                                url : urlString,

                                // Set callbacks
                                success: function(data, status, xhr) {
                                        // Anything data, String textStatus, jqXHR jqXHR
                                        self._response(xhr, data);
                                },
                                error: function(xhr, textStatus, errorThrown) {
                                        self._handleError("Error issuing request to " + urlString);
                                }
                }

                if (typeof this.options.body != "undefined") {
                        ajaxObject.data = this.options.body;
                }

                jQuery.ajax(ajaxObject);
        }
};

/** Internal function used to handle an error.
 *  @param message The error message.
 */
ClientRequest.prototype._handleError = function(message) {
        // There may be no registered error event handler.
        try {
                this.emit('error', message);
        } catch(err) {
                console.log("handle error error: " + message);
                error(message);
        }
};

/** Internal method used to handle a response. 
 * This method should not be invoked if an error occurred.  Use _handleError().
 *  This method uses the data therein to construct an IncomingMessage object
 *  and pass that as an argument to the 'response' event of the ClientRequest.
 *  @param response The response (as an XMLHttpRequest) from the server.
 *  @param body The body of the response.
 */
ClientRequest.prototype._response = function(response, body) {
        if (response === null) {
                this.emit('response', null);
                this._handleError(body);
                return;
        }

        var message = new IncomingMessage(response, body);
        this.emit('response', message);

        var code = response.statusCode();
        if (code >= 400) {
                // An error occurred. Emit both an error event and a response event.
                this._handleError('Received response code ' + code + ". " + response.statusMessage());
        }
};

//NOTE: The following events are produce by IncomingMessage in Node.js
//From stream.Readable
//Event: 'readable'
//Event: 'data'
//Event: 'end'
//Event: 'close'
//Event: 'error'

/** Incoming message object type.  This should not be constructed by the user,
 *  but rather is constructed by the _response function above.
 *  An instance of this object type will be passed to the callback passed to the
 *  request() or this.get() functions. The instance contains:
 *  <ul>
 *  <li> body: a string with the body of the response. </li>
 *  <li> cookies: an array of strings with cookies returned. </li>
 *  <li> statusCode: an integer indicating the status of the response. </li>
 *  <li> statusMessage: a string with the status message of the response. </li>
 *  </ul>
 *  @constructor
 *  @param response The response (as an XMLHttpRequest) from the server.
 */
function IncomingMessage(response, body) {
        this.body = body;
//        TODO:  Implement cookies.  Use Set-Cookie header? (one for each cookie?)  
//        Formatting? An array of strings??  is each string a name value pair?
        this.cookies = response.getResponseHeader('Set-Cookie');
        this.statusCode = response.status;
        this.statusMessage = response.statusText;
};
