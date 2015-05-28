// This accessor requires the optional 'udpSocket' module, which may or may
// not be provided by an accessor host. Most hosts will provide this module.
var UDPSocket = require('udpSocket');

// Set up the accessor. In an XML specification, this information would
// be provided in XML syntax.
exports.setup = function() {
    accessor.author('Hokeun Kim');
    accessor.version('0.1 $Date$');
    accessor.input('port', {
        'value': 8084,
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
    socket = UDPSocket.createSocket();
    socket.on('message', onMessage);
    var port = get('port');
    socket.bind(port);
}

exports.wrapup = function() {
    socket.close();
}
