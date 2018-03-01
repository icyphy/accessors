// Mocha test for the Node Accessor Serial module.
// To run:
//    npm install mocha chai
//    mocha test.js

var serial = require('serial');
var assert = require('chai').assert;
describe('serial', function () {

    it('ports should include loopback', function () {
        serial.hostSerialPorts(function(serialPorts) {
            assert.include(serialPorts, 'loopback', 'The list of serial ports should include \'loopback\'');
        });
    });

    it('send and receive data', function (done) {
        var port = new serial.SerialPort(
            'loopback',
            'serial/test.js-1',
            2000,
            {        // Options.
                'baudRate': 9600,
                'receiveType': 'number',
                'sendType': 'number'
            });

        port.open( function () {
            port.send(1);
            port.send(2);
            port.send(3);
        });


        // Register event listeners.
        // In alphabetic order.

        // Close if data is 3.
        port.on("data", function(data) {
            if (data === 3) {
                port.close();
                done();
            }
        });

    });

});

