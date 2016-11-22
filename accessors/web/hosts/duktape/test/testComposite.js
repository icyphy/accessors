// Because of how Duktape handles require('../common/commonHost'), this
// file must be run from accessors/web/host, not accessors/web/host/duktape.
//
// To run this:
//   cd accessors/web/host/duktape/duktape
//   make
//   cd ../..
//   ./duktape/duktape/duk duktape/test/testComposite.js
//

var a = this.instantiate('TestComposite', 'test/TestComposite');
a.initialize();
a.provideInput('input', 10);
a.react();
var latestOutput = a.latestOutput('output');
if (latestOutput != 50) {
    throw new Error("duktape/test/testComposite.js: output was " + latestOutput + ", it should have been 50.");
} else {
    print("duktape/test/testComposite.js: OK: output was " + latestOutput + ", which is equal to 50.");
}
a.wrapup();
