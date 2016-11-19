// Run the tests in accessors/web/test/auto/
//
// To run this:
//   cd accessors/web/hosts
//   ./nashorn/nashornAccessorHost -js -timeout 5000 nashorn/test/testNashornAuto.js 
//
// Or, use ant!
//   cd accessors/web
//   ant tests.nashorn

// Generate a list of auto files in ../test/auto
var File = Java.type('java.io.File');
var directory = new File('../test/auto');
var directoryFiles = directory.listFiles();
var jsFiles = [];
var i;

for(i = 0; i < directoryFiles.length; i += 1) {
    var fileName = directoryFiles[i].getPath();
    if (fileName.endsWith('.js')) {
        jsFiles.push(fileName);
    }
}

instantiateAndInitialize(jsFiles);

console.log("nashorn/test/testNashornAuto.js: end");
