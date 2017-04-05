// Without requiring a file system, given a file name, return the contents of the file.

// Copyright (c) 2016-2017 The Regents of the University of California.
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

/**
 * Given the name of a resource, look for the resource in a set of
 * prestored resources.
 *  
 * To add a resource:
 * 1. Create a .h file with the name of the resource by editing the makefile:
 * RampJSDisplay.h: ../../../test/auto/RampJSDisplay.js makefile
 *	xxd -i $< | sed -e 's/unsigned //' -e 's/^int/const int/' > $@
 *
 * 2. Add the .h file to the .h files below.
 *
 * 3. Add the file to the fileEntries struct.  Note that the file name
 * may vary from the name above because the accessor host is typically
 * run in accessors/web/hosts instead of
 * accessors/web/hosts/duktape/eduk.
 *
 * 4. Increment the value of the FILE_ENTRIES_SIZE #define.
 *
 * 5. Recompile using make
 *
 * 6. Run:
 *    cd accessors/web/hosts
 *    ./duktape/eduk/eduk --timeout 3000 ../test/auto/RampJSDisplay.js 
 *
 * 7. If you have errors, then uncomment DEBUG_NOFILEIO below
 *
 * @author Christopher Brooks
 * @version $Id$
 */

#ifndef EDUK_MIN
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

// If EDUK_FULL is defined, then the files used by the test harness are 
// included in the eduk binary.
// To create an eduk binary with only the necessary files, it would
// be necessary to move the declarations that set fileEntries[] out of the
// #ifdef EDUK_FULL section and update FILE_ENTRIES_SIZE

// For example, if we were going to create a version of eduk that
// included test/auto/RampJSDisplay.js, then we would include that file,
// TestSpontaneous.js and TrainableTest.js

// Undefine EDUK_RAMPJSDISPLAY to get just the Duktape accessor,
// RampJSTest.js and the two Accessors used by RampJSTest.js


// #define EDUK_RAMPJSDISPLAY

// To run RampJSDisplay.js:
//   ./hosts/duktape/eduk/eduk --timeout 4000 test/auto/RampJSDisplay.js

// Define EDUK_FULL to get the test harness.
// If EDUK_FULL is not defined, then the ../duktape/duk tests will fail.
//#define EDUK_FULL


#ifdef EDUK_FULL
#define FILE_ENTRIES_SIZE 20
#else 
#ifdef EDUK_RAMPJSDISPLAY 
#define FILE_ENTRIES_SIZE 7
#else // EDUK_RAMPJSDISPLAY 
#define FILE_ENTRIES_SIZE 4
#endif // EDUK_RAMPJSDISPLAY 
#endif //EDUK_FULL


// These are required for any duktape host.
#include "duktape.h"
#include "commonHost.h"
#include "events.h"
#include "util.h"
#include "deterministicTemporalSemantics.h"

#ifdef EDUK_RAMPJSDISPLAY
#include "RampJSDisplay.h"
#include "TestDisplay.h"
#include "TestSpontaneous.h"
#endif // EDUK_RAMPJSDISPLAY

#ifdef EDUK_FULL
// This is used by the duktape/duk binary, which uses the JavaScript eventloop code.
// For production use, this would not need to be shipped.
#include "ecma_eventloop.h"

#include "AccessorStatus.h"

// These are used by the tests and would not be needed in production.
#include "RampJSTest.h"
#include "RampJSTestDisplay.h"
#include "Stop.h"
#include "autoAccessorStatusTest.h"
#include "autoTestComposite.h"
#include "autoTestStop.h"
#include "testCommon.h"
#include "TestAdder.h"
#include "TestComposite.h"
#include "TestGain.h"
#include "TrainableTest.h"
#endif // EDUK_FULL

// Define DEBUG_NOFILEIO and recompile for more verbose debugging.
// #define DEBUG_NOFILEIO

struct fileEntry {
    char * name;
    const char * contents;
    int length;
};

struct fileEntry fileEntries [FILE_ENTRIES_SIZE];

static int nofileio_readfile(duk_context *ctx) {
    const char *filename = duk_to_string(ctx, 0);

    // Under Duktape 2.x, we started getting [object Uint8Array] back
    // from readFile() so we use strings here instead of fixed
    // buffers.
#ifdef NOFILEIO_USE_FIXED_BUFFER
    void *buf;
#endif


    if (!filename) {
        fprintf(stderr, "%s:%d filename was null?\n", __FILE__, __LINE__);
        goto error;
    }

#ifdef DEBUG_NOFILEIO
    fprintf(stderr, "%s:%d filename is %s\n", __FILE__, __LINE__, filename);
#endif
    
    // Loop through fileEntries and look for a match.
    for (int i = 0; i < FILE_ENTRIES_SIZE; i++) {
#ifdef DEBUG_NOFILEIO
        fprintf(stderr, "%s:%d filename: %s, name: %s\n", __FILE__, __LINE__, filename, fileEntries[i].name);
#endif
        if (strcmp(filename, fileEntries[i].name) == 0) {
            int length = fileEntries[i].length;
            // If the last character is a null, then decrement
            // the length.  Duktape does not expect buffers to be
            // null terminated.  If there is a null, then
            // the error message "invalid token" will result.
            if (fileEntries[i].contents[length - 1] == 0) {
                length--;
            }
#ifdef NOFILEIO_USE_FIXED_BUFFER
            buf = duk_push_fixed_buffer(ctx, (size_t) length);
            strncpy(buf, fileEntries[i].contents, length);
#else
	    // Duktape 2.x
	    duk_push_lstring(ctx, fileEntries[i].contents, length);
#endif // NOFILEIO_USE_FIXED_BUFFER

#ifdef NOFILEIO_USE_FIXED_BUFFER
#ifdef DEBUG_NOFILEIO
            fprintf(stderr, "%s:%d filename: %s, returning buf of size %lu\n", __FILE__, __LINE__, filename, strlen(buf));
#endif
#else
#ifdef DEBUG_NOFILEIO
            fprintf(stderr, "%s:%d filename: %s, returning 1\n", __FILE__, __LINE__, filename);
#endif
#endif
            return 1;
        }
    }

 error:
    fprintf(stderr, "%s:%d Could not find %s\n", __FILE__, __LINE__, filename);
    return DUK_RET_ERROR;
}

static duk_function_list_entry nofileio_funcs[] = {
    { "readfile", nofileio_readfile, 1 },
    { NULL, NULL, 0 }
};

void nofileio_register(duk_context *ctx) {
    // We initialize the fileEntries structure here, using an older 
    // method of initialization so that the code is more portable.
    // In theory, we could use fileEntries[] = {.name = "xx", .contents = yy...

    int n = 0;

    // Files necessary for the common host.  All Duktape accessors
    // will need these files.
    fileEntries[n].name = "common/commonHost.js"; 
    fileEntries[n].contents = ______common_commonHost_js;
    fileEntries[n].length = ______common_commonHost_js_len;

    fileEntries[++n].name = "common/modules/events.js";
    fileEntries[n].contents = ______common_modules_events_js;
    fileEntries[n].length = ______common_modules_events_js_len;

    fileEntries[++n].name = "common/modules/util.js";
    fileEntries[n].contents = ______common_modules_util_js;
    fileEntries[n].length = ______common_modules_util_js_len;

    fileEntries[++n].name = "common/modules/deterministicTemporalSemantics.js";
    fileEntries[n].contents = _________hosts_common_modules_deterministicTemporalSemantics_js;
    fileEntries[n].length = _________hosts_common_modules_deterministicTemporalSemantics_js_len;

#ifdef EDUK_RAMPJSDISPLAY
    fileEntries[++n].name = "./test/auto/RampJSDisplay.js";
    fileEntries[n].contents = _________test_auto_RampJSDisplay_js;
    fileEntries[n].length = _________test_auto_RampJSDisplay_js_len;

    // Accessors used by RampJSDisplay.js
    fileEntries[++n].name = "./test/TestDisplay.js";
    fileEntries[n].contents = _________test_TestDisplay_js;
    fileEntries[n].length = _________test_TestDisplay_js_len;

    fileEntries[++n].name = "./test/TestSpontaneous.js";
    fileEntries[n].contents = _________test_TestSpontaneous_js;
    fileEntries[n].length = _________test_TestSpontaneous_js_len;

#endif


#ifdef EDUK_FULL
    // The duktape binary needs this because it uses the JavaScript eventloop.
    // The eduk binary does not need this.
    fileEntries[++n].name = "duktape/duktape/examples/eventloop/ecma_eventloop.js";
    fileEntries[n].contents = ___duktape_examples_eventloop_ecma_eventloop_js;
    fileEntries[n].length = ___duktape_examples_eventloop_ecma_eventloop_js_len;

    // Composite accessors in test/auto/ that are used for testing
    fileEntries[++n].name = "./test/auto/AccessorStatusTest.js";
    fileEntries[n].contents = _________test_auto_AccessorStatusTest_js;
    fileEntries[n].length = _________test_auto_AccessorStatusTest_js_len;

    fileEntries[++n].name = "./test/auto/RampJSTest.js";
    fileEntries[n].contents = _________test_auto_RampJSTest_js;
    fileEntries[n].length = _________test_auto_RampJSTest_js_len;

    fileEntries[++n].name = "./test/auto/RampJSTestDisplay.js";
    fileEntries[n].contents = _________test_auto_RampJSTestDisplay_js;
    fileEntries[n].length = _________test_auto_RampJSTestDisplay_js_len;

    fileEntries[++n].name = "./utilities/Stop.js";
    fileEntries[n].contents = _________utilities_Stop_js;
    fileEntries[n].length = _________utilities_Stop_js_len;

    fileEntries[++n].name = "./test/auto/TestComposite.js";
    fileEntries[n].contents = _________test_auto_TestComposite_js;
    fileEntries[n].length = _________test_auto_TestComposite_js_len;

    fileEntries[++n].name = "./test/auto/Stop.js";
    fileEntries[n].contents = _________test_auto_Stop_js;
    fileEntries[n].length = _________test_auto_Stop_js_len;

    // Used by ../duktape/duktape tests.
    fileEntries[++n].name = "common/test/testCommon.js";
    fileEntries[n].contents = ______common_test_testCommon_js;
    fileEntries[n].length = ______common_test_testCommon_js_len;

    // Accessors in test/.  Note that the name is relative to
    // accessors/web/hosts, but the name of the array have more
    // underscores because xxd was run in
    // accessors/web/hosts/duktape/eduk.
    fileEntries[++n].name = "./test/TestAdder.js";
    fileEntries[n].contents = _________test_TestAdder_js;
    fileEntries[n].length = _________test_TestAdder_js_len;

    fileEntries[++n].name = "./test/TestComposite.js";
    fileEntries[n].contents = _________test_TestComposite_js;
    fileEntries[n].length = _________test_TestComposite_js_len;

    fileEntries[++n].name = "./test/TestGain.js";
    fileEntries[n].contents = _________test_TestGain_js;
    fileEntries[n].length = _________test_TestGain_js_len;

    fileEntries[++n].name = "./test/TrainableTest.js";
    fileEntries[n].contents = _________test_TrainableTest_js;
    fileEntries[n].length = _________test_TrainableTest_js_len;

    fileEntries[++n].name = "./trusted/AccessorStatus.js";
    fileEntries[n].contents = _________trusted_AccessorStatus_js;
    fileEntries[n].length = _________trusted_AccessorStatus_js_len;
#endif

    /* Set global 'NoFileIo'. */
    duk_push_global_object(ctx);
    duk_push_object(ctx);
    duk_put_function_list(ctx, -1, nofileio_funcs);
    duk_put_prop_string(ctx, -2, "NoFileIo");
    duk_pop(ctx);
}
#endif // EDUK_MIN
