// Because of how Duktape handles require('../common/commonHost'), this
// file must be run from accessors/web/host, not accessors/web/host/duktape.
//
// To run this:
//   cd accessors/web/host/duktape/duktape
//   make
//   cd ../..
//   ./duktape/duktape/duk duktape/test/testCommon.js
//
// Or, use ant!
//   cd accessors/web
//   ant test.duktape

var testCommon = require("common/test/testCommon");

console.log("duktape/test/testCommon.js: end");
