// This is just a simple smoke test for the Node.js host.
// To use it, run the node host and copy and paste the following into it.
var a = instantiate('test/TestCompositeAccessor');
a.initialize();
a.provideInput('input', 10);
a.fire();  // Should show an output of 50.
a.wrapup();
quit;


