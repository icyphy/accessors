// This accessor requires the optional 'udpSocket' module, which may or may
// not be provided by an accessor host. Most hosts will provide this module.
var UDPSocket = require('udpSocket');

// Set up the accessor. In an XML specification, this information would
// be provided in XML syntax.
exports.setup = function() {
    accessor.author('Hokeun Kim');
    accessor.version('0.1 $Date$');
    accessor.input('port', {
        'value': 22000,
        'type':'number',
        'description':'The port number.'
    });
    accessor.output('received', {
        'type':'string',
        'description':'The received string.'
    });
    accessor.description(
        'This accessor listens to the UDP port.',
        'text/html'
    );
};

// Define the functionality.
function onMessage(message) {
    console.log('Received from web socket: ' + message);
    send(message, 'received');
}

var socket = null;

exports.initialize = function() {
    // Invoke the getPrice function each time a 'symbol' input arrives.
    socket = UDPSocket.createSocket();
    socket.on('message', onMessage);
    var port = get('port');
    socket.bind(port);
}

exports.wrapup = function() {
    // Failing to do this will likely trigger an exception when the model stops running,
    // because the getPrice() function will attempt to send an output after the model
    // has stopped.
    socket.close();
}
