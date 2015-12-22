This directory contains an implementation of a Node.js swarmlet host.

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


To run a simple test, assuming you are in this test directory:

> node ../nodeHost.js < testNodeHost.js

The testNodeHost.js file just contains the above commands collected into a file.
You will see the following output:

   Welcome to the Node swarmlet host (nsh). Type exit to exit, help for help.
   nsh> var a = instantiate('hosts/common/test/TestAccessor');
   Instantiating accessor at: /ptII/org/terraswarm/accessor/accessors/web/hosts/common/test/TestAccessor.js
   undefined
   nsh> a.initialize();
   undefined
   nsh> a.fire();
   TestAccessor fired.
   undefined
   nsh> quit;
   exit

