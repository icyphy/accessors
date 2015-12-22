This directory contains an implementation of a Node.js swarmlet host.
To run a simple test, do this (assuming you are in this test directory):

> node ../nodeHost.js < test/testNodeHost.js

To start the interactive version of the Node.js host:

> node nodeHost.js
Welcome to the Node swarmlet host (nsh). Type exit to exit, help for help.
nsh> 

At the prompt (nsh>), you can enter JavaScript statements or expressions.

To instantiate and run a test accessor, do this:

nsh> var a = instantiate('hosts/common/test/TestAccessor');
undefined
nsh> a.initialize();
undefined
nsh> a.fire();
TestAccessor fired.
undefined
nsh> quit
exit
