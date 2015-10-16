/* Accessor for GDP Key-Value Store */

var httpClient = require('httpClient');

/** Define inputs and outputs. */
exports.setup = function () {
    input('trigger');
    input('write', {'type': 'boolean', 'value': false});
    input('key', {'type':'string'});
    input('ts', {'type':'string'});
    input('value', {'type': 'string'});
    output('output', {'type':'string'});
    parameter('url', {'type':'string', 'value':''});
};


// This is where we create the request that will be sent to httpClient
exports.makeRequest = function() {

    var ret = {};
    var ts = get('ts');
    var key = get('key');
    var url = get('url');
    console.log(get('write'));
    if (get('write') == true) {
        ret.method = "PUT";
        ret.body = get('value');
        ret.url = url + key;
    } else {
        ret.method = "GET";
        var tmp = url + "key=" + key;
        if (ts !== null) {
            var _ts = ts.replace("000000", "");
            var d = Date.parse(_ts)/1000.0;        //milliseconds
            tmp = tmp + "&ts=" + d;
        }
        ret.url = tmp;
    }

    return ret;
}


// Keep track of pending HTTP request so it can be stopped if the
// model stops executing.
var request;

// Based on the REST accessor.
exports.issueCommand = function(callback) {

    var req = this.makeRequest()
    
    // To ensure that the callback is called with the same context
    // as this function, create a new function.
    var thiz = this;
    var contextCallback = function() {
        callback.apply(thiz, arguments);
    }
    
    request = httpClient.request(req, contextCallback);
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
        send('output', JSON.parse(message.body).value);
    } else {
        send('output', null);
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
