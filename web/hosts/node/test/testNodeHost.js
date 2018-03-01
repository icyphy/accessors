// This is just a simple smoke test for the Node.js host.
// To use it, run the node host:
//    cd ..
//    node nodeHostShell.js
// and copy and paste the following into it.
var a = instantiate('TestComposite', 'test/TestComposite');
a.initialize();
a.provideInput('input', 10);
a.react();
console.log(a.latestOutput('output'));  // Should return 50
a.wrapup();
// exit


