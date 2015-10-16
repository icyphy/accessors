/* Accessor for a log */

var GDP = require('GDP');
var log = null;
var handle = null;

exports.setup = function() {
    input('trigger');
    input('recno', {'type': 'int'});
    output('data', {'type': 'string'});
    parameter('logname', {'type': 'string'});
};


exports.read = function() {
    var recno = get('recno');
    var data = log.read(recno);
    send('data', data);
}


exports.initialize = function() {

    var logname = getParameter('logname');
    log = GDP.GDP(logname, 1);
    handle = addInputHandler('trigger', this.read);
}

exports.wrapup = function() {
    if (handle !== null) {
        removeInputHandler(handle);
    }
}
