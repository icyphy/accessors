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

// The modSearch function is based on code from http://wiki.duktape.org/HowtoModules.html
// The license is at https://github.com/svaarala/duktape-wiki, which refers to
// https://github.com/svaarala/duktape/blob/master/LICENSE.txt, which is reproduced below

//    ===============
//    Duktape license
//    ===============

// (http://opensource.org/licenses/MIT)
// Copyright (c) 2013-2016 by Duktape authors (see AUTHORS.rst)
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE
 
// FIXME: Move the Duktape code elsewhere so as to avoid copyright issues.
Duktape.modSearch = function (id, require, exports, module) {
    /* readFile(): as above.
     * loadAndInitDll(): load DLL, call its init function, return true/false.
     */
    var name;
    var src;
    var found = false;

    var debug = false;
    if (debug === true) {
        print('duktape/test/testCommon.js: loading module:', id);
    }

    /* DLL check.  DLL init function is platform specific.  It gets 'exports'
     * but also 'require' so that it can require further modules if necessary.
     */
    // name = '/modules/' + id + '.so';
    // if (loadAndInitDll(name, require, exports, module)) {
    //     print('duktape/test/testCommon.js: loaded DLL:', name);
    //     found = true;
    // }

    /* Ecmascript check. */
    //name = 'modules/' + id + '.js';
    name = id + '.js';
    if (debug === true) {
        print('duktape/test/testCommon.js: loading module:', name);
    }
    src = FileIo.readfile(name);
    //print('duktape/test/testCommon.js:readFile returned', src);
    //print('duktape/test/testCommon.js:src is of type', typeof src);
    if (typeof src === 'string') {
        if (debug === true) {
            print('duktape/test/testCommon.js: loaded Ecmascript:', name);
        }
        return src;
    }

    if (typeof src === 'buffer') {
        if (debug === true) {
            print('duktape/test/testCommon.js: loaded Ecmascript:', name);
        }
        return src.toString();
    }

    /* Must find either a DLL or an Ecmascript file (or both) */
    if (!found) {
        throw new Error('module not found: ' + id);
    }

    /* For pure C modules, 'src' may be undefined which is OK. */
    return src;
}

var duktapeHost = require("duktape/duktapeHost");
var testCommon = require("common/test/testCommon");

console.log("duktape/test/testCommon.js: end");
