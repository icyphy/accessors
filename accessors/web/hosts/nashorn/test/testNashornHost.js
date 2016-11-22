// This is just a simple smoke test for the Nashorn Accessor Host.
// To run it:
//    cd ..
//    ./nashorn/nashornAccessorHost -timeout 10000 hosts/nashorn/test/testNashornHost.js
//
// Or, use ant!
//    cd ../..
//    ant tests.nashorn
//
var a = this.instantiate('TestComposite', 'test/TestComposite');
a.initialize();
a.provideInput('input', 10);
a.react();
console.log(a.latestOutput('output')); // Should return 50
a.wrapup();
quit();
