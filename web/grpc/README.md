# Demonstration of a gRPC Service with Accessors

This directory contains a demonstration that creates a gRPC (Google RPC)
service and then launches a swarmlet that uses the service. An accessors
defined in Greeter.js functions as a client to the service. It has one
input port and one output port for each RPC method provided by the service.

To run this, you need to use npm to install some modules. However, you
should not do this in this directory!!  Unfortunately, if you do it in this
directory, npm will remove a large number of files that are needed in the
directories containing this one.  Hence, you should create a working copy
somewhere else.  For example, assuming you start in this directory (the one
with this README file), you can do this:

    mkdir ~/grpcTest
    cp * ~/grpcTest
    cd ~/grpcTest
    npm install @terraswarm/accessors
    npm install @accessors-modules/text-display
    npm install grpc
    npm install @grpc/proto-loader

To run the example, do this:

    node ./startServerAndClient.js

The result should look something like this:

    gRPC server started.
    commonHost.js: processCommandLineArguments(): Setting timeout to stop after 10000 ms.
    gRPC Greeter client created.
    Request from ipv6:[::1]:59378 for sayHello method  with args { name: 'world0' }
    Received gRPC result: { message: 'Hello world0' }
    Request from ipv6:[::1]:59378 for sayHello method  with args { name: 'world1' }
    Received gRPC result: { message: 'Hello world1' }
    Request from ipv6:[::1]:59378 for sayHello method  with args { name: 'world2' }
    Received gRPC result: { message: 'Hello world2' }
    Request from ipv6:[::1]:59378 for sayHello method  with args { name: 'world3' }
    Received gRPC result: { message: 'Hello world3' }
    Request from ipv6:[::1]:59378 for sayHello method  with args { name: 'world4' }
    Received gRPC result: { message: 'Hello world4' }
    Request from ipv6:[::1]:59378 for sayHello method  with args { name: 'world5' }
    Received gRPC result: { message: 'Hello world5' }
    Request from ipv6:[::1]:59378 for sayHello method  with args { name: 'world6' }
    Received gRPC result: { message: 'Hello world6' }
    Request from ipv6:[::1]:59378 for sayHello method  with args { name: 'world7' }
    Received gRPC result: { message: 'Hello world7' }
    Request from ipv6:[::1]:59378 for sayHello method  with args { name: 'world8' }
    Received gRPC result: { message: 'Hello world8' }
    commonHost.js: processCommandLineArguments(): Maximum time reached. Calling stopAllAccessors().
    commonHost.js: invoking wrapup() for accessor: greeterTest
    closing gRPC client
    All initialized accessors have wrapped up. Terminating.
