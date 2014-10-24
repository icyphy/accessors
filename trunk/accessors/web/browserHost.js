// JavaScript functions for a browser swarmlet host.
// Author: Edward A. Lee
//
// Default method definitions.
// These may be shadowed by methods provided by the accessor.
function initialize() {
    throw "No initialize() method defined.";
}
function fire() {
    throw "No fire() method defined.";
}
function wrapup() {
    throw "No wrapup() method defined.";
}
// Method for retrieving inputs.
function get(input) {
    return document.getElementById(input + "Input").value;
}
// Method for setting outputs.
function send(value, output) {
    document.getElementById(output).innerHTML = value;
}
// Method for synchronously reading a URL.
function readURL(url) {
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
// Method for performing an HTTP request.
function httpRequest(url, method, properties, body, timeout) {
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