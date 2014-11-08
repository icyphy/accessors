// JavaScript functions for a browser swarmlet host.
// This file includes basic utility functions assumed by version 0 accessors.
//
// Author: Edward A. Lee and Chris Shaver
// Copyright: http://terraswarm.org/accessors/copyright.txt
//
// Set debug to true to see console outputs.
var debug = false;
//
////////////////////
// Pop up a dialog with the specified message.
// Method alert(message) is already built in to browsers.

////////////////////
// Clear a timeout with the specified handle.
// clearTimeout(timeout) is built in to the Window object.

////////////////////
// Method for handling an error. This just throws an exception.
function error(message) {
    throw message;
}

////////////////////
// Method for performing a synchronous HTTP request.
function httpRequest(url, method, properties, body, timeout) {
	if (debug) {
	    console.log("httpRequest("
	        + (function(obj) {
	            result=[];
	            for(p in obj) {
	                result.push(JSON.stringify(obj[p]));
	            };
	            return result;
	        })(arguments)
	        + ")");
	}
    var request = new XMLHttpRequest();
    // The third argument specifies a synchronous read.
    request.open(method, url, false);
    // Null argument says there is no body.
    request.send(body);
    // readyState === 4 is the same as readyState === request.DONE.
    if (request.readyState === request.DONE) {
        if (request.status <= 400) {
            return request.responseText;
        } else {
            throw "httpRequest failed with code " + request.status + " at URL: " + url;
        }
    } else {
        throw "httpRequest did not complete: " + url;
    }
}

////////////////////
// Print a message to the console.
function print(message) {
    console.log(message);
}

////////////////////
// Method for synchronously reading a URL.
function readURL(url) {
	if (debug) console.log("readURL(" + url + ")");
    var request = new XMLHttpRequest();
    // The third argument specifies a synchronous read.
    request.open("GET", url, false);
    // Null argument says there is no body.
    request.send(null);
    // readyState === 4 is the same as readyState === request.DONE.
    if (request.readyState === request.DONE) {
        if (request.status <= 400) {
            return request.responseText;
        } else {
            throw "readURL failed with code " + request.status + " at URL: " + url;
        }
    } else {
        throw "readURL did not complete: " + url;
    }
}

////////////////////
// Set a timeout to call the specified function after the specified time.
// Return a handle to use in clearTimeout().
// The setTimeout(callback, timeout) function is already built in to the Window object.
