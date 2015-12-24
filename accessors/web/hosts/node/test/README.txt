$Id$

This directory contains an implementation of a Node.js swarmlet host.

To start the interactive version of the Node.js host:

> node nodeHost.js
Welcome to the Node swarmlet host (nsh). Type exit to exit, help for help.
nsh> 

At the prompt (nsh>), you can enter JavaScript statements or expressions.

To instantiate and run a test accessor, do this:

nsh> var a = instantiate('hosts/common/test/TestAccessor');
undefined

Below is an example of a complete session, to give you an idea of what can be done:

---------------------start
> node nodeHost.js 
Welcome to the Node swarmlet host (nsh). Type exit to exit, help for help.
nsh> var a = instantiate('hosts/common/test/TestAccessor');
Instantiating accessor at: /ptII/org/terraswarm/accessor/accessors/web/hosts/common/test/TestAccessor.js
undefined
nsh> a.initialize();
undefined
nsh> a.inputs
{ untyped: {},
  numeric: { type: 'number', value: 0 },
  boolean: { type: 'boolean' } }
nsh> a.provideInput('untyped', 'hello world');
undefined
nsh> a.invokeHandlers();
undefined
nsh> a.outputs
{ typeOfUntyped: { type: 'string', latestOutput: 'string' },
  jsonOfUntyped: 
   { type: 'string',
     latestOutput: 'JSON for untyped input: "hello world"' },
  numericPlusP: { type: 'number' },
  negation: { type: 'boolean' } }
nsh> a.latestOutput('typeOfUntyped');
string
nsh> a.latestOutput('jsonOfUntyped');
JSON for untyped input: "hello world"
nsh> quit
exit
-----------------------end



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


