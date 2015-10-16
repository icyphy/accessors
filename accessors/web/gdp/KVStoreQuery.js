/* Accessor for GDP Key-Value Store */

var httpClient = require('httpClient');

/** Define inputs and outputs. */
exports.setup = function () {
    input('trigger');
    input('key', {'type':'string'});
    input('ts', {'type':'string'});
    output('value', {'type':'string'});
    parameter('url', {'type':'string', 'value':''});
};

exports.getRESTurl = function() {

    var url = get('url');
    var key = get('key');
    var ts = get('ts');
    if (ts !== null) {
        var _ts = ts.replace("000000","");
        var e = Date.parse(_ts)/1000.0;
        console.log(e);
        return url + "key=" + key + "&ts=" + e;
    } else {
        return url + "key=" + key;
    }
};

// Keep track of pending HTTP request so it can be stopped if the
// model stops executing.
var request;

// Based on the REST accessor.
exports.issueCommand = function(callback) {
    var url = this.getRESTurl()
    console.log("REST request to: " + url);
    
    // To ensure that the callback is called with the same context
    // as this function, create a new function.
    var thiz = this;
    var contextCallback = function() {
        callback.apply(thiz, arguments);
    }
    
    request = httpClient.request(url, contextCallback);
    request.on('error', function(message) {
        if (!message) {
            message = 'Request failed. No further information.';
        }
        error(message);
    });
    request.end();
};

exports.handleResponse = function(message) {
    if (message !== null && message !== undefined) {
        send('value', JSON.parse(message.body).value);
    } else {
        send('value', null);
    }
};

/** Register the input handler.  */
exports.initialize = function () {
    // Upon receiving a trigger input, issue a command.
	addInputHandler('trigger', this.issueCommand, this.handleResponse);
};

/** Upon wrapup, stop handling new inputs.  */
exports.wrapup = function () {
    // In case there is streaming data coming in, stop it.
    if (request) {
        request.stop();
        request = null;
    }
};
