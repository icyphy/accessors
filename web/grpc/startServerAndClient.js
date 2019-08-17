/** Launcher for gRPC Greeter example.
 *  This file creates and starts a server providing the service defined
 *  in the Greeter.proto file. The server listens on port 50051 of the local host.
 *  It then instantiates a composite accessor defined in the greeterTest.js
 *  file, which instantiates an accessor that is a Greeter service client.
 *
 *  @authors: Ravi Akella and Edward A. Lee
 */
var accessors = require('@terraswarm/accessors');
var grpc = require('grpc');
var protoLoader = require('@grpc/proto-loader');
var util = require('util');

var packageDefinition = protoLoader.loadSync(
    './Greeter.proto',
    {keepCase: true,
       longs: String,
       enums: String,
       defaults: true,
    });
var packageObject = grpc.loadPackageDefinition(packageDefinition);

// Start the server.
var server = new grpc.Server();
server.addService(packageObject.Greeter.service, {sayHello: sayHelloImplementation});
server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());
server.start();
console.log('gRPC server started.');

/** Implement the sayHello RPC method of the service. */
function sayHelloImplementation(call, callback) {
  console.log('Request from ' + call.getPeer() + ' for sayHello method ' + ' with args ' + util.inspect(call.request));
  callback(null, {message: 'Hello ' + call.request.name});
}

// Wait 2 seconds for server to start and then launch the client.
setTimeout(function() {
  accessors.processCommandLineArguments(['-timeout', '10000', 'greeterTest.js'], null, null, 
    function() {
      // This function will be invoked when the timeout expires.
      server.tryShutdown(function() {
        console.log('Server shutting down.');
      });
    })
}, 2000);

