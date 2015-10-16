/* Accessor for a log */

var GDP = require('gdp');
var log = null;
var handle = null;

exports.setup = function() {
    input('trigger');
    input('data', {'type': 'string'});
    parameter('logname', {'type': 'string'});
};


exports.append = function(data) {
    console.log("Okay, inside append");
    console.log(typeof(log));
    var data = get('data');
    log.append(data);
}


exports.initialize = function() {

    var logname = getParameter('logname');
    log = GDP.GDP(logname, 2);
    handle = addInputHandler('trigger', this.append);
}

exports.wrapup = function() {
    if (handle !== null) {
        removeInputHandler(handle);
    }
}
