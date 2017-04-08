// Copyright (c) 2016 The Regents of the University of California.
// All rights reserved.
//
// Permission is hereby granted, without written agreement and without
// license or royalty fees, to use, copy, modify, and distribute this
// software and its documentation for any purpose, provided that the above
// copyright notice and the following two paragraphs appear in all copies
// of this software.
//
// IN NO EVENT SHALL THE UNIVERSITY OF CALIFORNIA BE LIABLE TO ANY PARTY
// FOR DIRECT, INDIRECT, SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES
// ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
// THE UNIVERSITY OF CALIFORNIA HAS BEEN ADVISED OF THE POSSIBILITY OF
// SUCH DAMAGE.
//
// THE UNIVERSITY OF CALIFORNIA SPECIFICALLY DISCLAIMS ANY WARRANTIES,
// INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE. THE SOFTWARE
// PROVIDED HEREUNDER IS ON AN "AS IS" BASIS, AND THE UNIVERSITY OF
// CALIFORNIA HAS NO OBLIGATION TO PROVIDE MAINTENANCE, SUPPORT, UPDATES,
// ENHANCEMENTS, OR MODIFICATIONS.
//
// Run the tests in accessors/web/test/auto/
//
// To run this:
//   cd accessors/web/hosts
//   ./nashorn/nashornAccessorHost  -timeout 5000 -js nashorn/test/testNashornAuto.js
//
// Or, use ant!
//   cd accessors/web
//   ant tests.nashorn

var nashornHost = require('nashornHost');

// Generate a list of auto files in ../test/auto
var File = Java.type('java.io.File');
var directory = new File('../test/auto');
var directoryFiles = directory.listFiles();
var jsFiles = [];
var i;

for (i = 0; i < directoryFiles.length; i += 1) {
    var fileName = directoryFiles[i].getPath();
    if (fileName.endsWith('.js')) {
         if (fileName.substring(fileName.length - 3, fileName.length) === ".js") {
            fileName = fileName.substring(0, fileName.length -3);
        }
        instantiate(fileName, fileName);
    }
}

console.log("nashorn/test/testNashornAuto.js: end");
