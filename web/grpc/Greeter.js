/** Wrapper for a grpc service defined by the Greeter.proto file.
 *  This file can and should be generated automatically from the proto file.
 *  It defines an accessor that has one input port and one output port for
 *  each gRPC call defined in the Greeter service proto file.
 *  The name of the input is the name of the RPC call, and the name
 *  of the output is the same name with "Response" appended.
 *  The IP address and port of the service are given by a parameter.
 *
 *  FIXME: This is currently insecure, requiring no credentials.
 *
 *  @author: Ravi Akella and Edward A. Lee
 */
var grpc = require('grpc');
var protoLoader = require('@grpc/proto-loader');
var util = require('util');

var client_stub = null;
var PROTO_PATH = './Greeter.proto';

exports.setup = function () {
    this.parameter('serverAddress', {value: 'localhost:50051', type: 'string'});
    this.input('sayHello');
    this.output('sayHelloResponse');
}

exports.initialize = function () {
    var self = this;
    var packageDefinition = protoLoader.loadSync(PROTO_PATH);
    var client = grpc.loadPackageDefinition(packageDefinition);
    client_stub = new client.Greeter(self.getParameter('serverAddress'), grpc.credentials.createInsecure());
    console.log('gRPC Greeter client created.');

    // Invoke a gRPC call in response to an input.
    this.addInputHandler('sayHello', function(){
        // Make an asynchronous RPC call, providing a callback function for the response.
        client_stub.sayHello(this.get('sayHello'), function(err, response) {
            if (err) {
                console.log('Error:' + err.code + ' [' + err.details + ']');
                return;
            }
            self.send('sayHelloResponse', response);
        });
    })
};

exports.wrapup = function(){
    console.log('closing gRPC client');
    client_stub.close();
    client_stub = null;
};
