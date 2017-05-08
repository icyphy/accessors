$Id$

This directory contains an implementation of a Node.js swarmlet host.

To start the interactive version of the Node.js host, invoke:

  node nodeHostShell.js

which should display:

  Welcome to the Node swarmlet host (nsh). Type exit to exit, help for help.
  nsh> 

At the prompt (nsh>), you can enter JavaScript statements or expressions.

To instantiate and run a test accessor, do this:

nsh> var a = instantiate('myAccessorName', 'test/TestAccessor');

Below is an example of a complete session, to give you an idea of what can be done:

---------------------start
> node nodeHostShell.js 
Welcome to the Node swarmlet host (nsh). Type exit to exit, help for help.

nsh> var a = instantiate('myAccessorName', 'test/TestAccessor');
Reading accessor at: /ptII/org/terraswarm/accessor/accessors/web/test/TestAccessor.js
Instantiated accessor myAccessorName with class test/TestAccessor
undefined

nsh> a.initialize();
undefined

nsh> a.inputList
[ 'untyped', 'numeric', 'boolean' ]
  
nsh> a.provideInput('untyped', 'hello world');
undefined

nsh> a.react();
TestAccessor.fire() invoked.


nsh> a.outputList
[ 'typeOfUntyped', 'jsonOfUntyped', 'numericPlusP', 'negation' ]
  
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
nsh> // This is just a simple smoke test for the Node.js host.
undefined
nsh> // To use it, run the node host and copy and paste the following into it.
undefined
nsh> var a = instantiate('TestComposite', 'test/TestComposite');
Reading accessor at: /ptII/org/terraswarm/accessor/accessors/web/test/TestComposite.js
Reading accessor at: /ptII/org/terraswarm/accessor/accessors/web/test/TestGain.js
Reading accessor at: /ptII/org/terraswarm/accessor/accessors/web/test/TestAdder.js
Instantiated accessor TestComposite with class test/TestComposite
undefined
nsh> a.initialize();
undefined
nsh> a.provideInput('input', 10);
undefined
nsh> a.react();
undefined
nsh> a.latestOutput('output');  // Should return 50
50
nsh> a.wrapup();
undefined
nsh> quit;
exit


