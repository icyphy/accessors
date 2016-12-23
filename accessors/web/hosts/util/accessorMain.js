// JavaScript functions to be shared among accessor hosts.
//
// Copyright (c) 2015-2016 The Regents of the University of California.
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
/**
 *  @author Christopher Brooks
 *  @version $$Id$$
 */

// Stop extra messages from jslint and jshint.
// See https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSHint
/*globals accessorMain*/
/*jshint globalstrict: true, multistr: true */
'use strict';

/** Process command line arguments to evaluate accessors or plain JavaScript.
 *  The command-line arguments can be:
 *
 *  -accessor|--accessor: If present, then the files named as command
 *  line arguments are Composite Accessors to be instantiated an initialized.
 *  If not present, then the files named
 *  as command line arguments are to be interpreted as regular
 *  JavaScript files.
 * 
 *  -e|--e|-echo|--echo: Echo the command that would be run by hand to
 *  replicate the test. This is helpful for use under Ant apply.
 *  
 *  -h|--h|-help|--help: Print a usage message 
 *
 *  -timeout|--timeout milliseconds: The maximum amount of time the
 *  script can run. When this time is reached, stop() is called.
 *
 *  -v|--v|-version|--version: Print out the version number
 *
 *  The flags are followed by one or more filenames that are either
 *  composite accessors or plain JavaScript.  If --accessors is
 *  present, then the argument(s) are assumed to be composite
 *  accessors.  If it --accessors is not present, then the arguments
 *  are passed to getAccessor(), which looks for the file and returns
 *  the content.
 *
 *  @param argv An array of arguments, see above.
 *  @return 0 if there were no problems, 3 if there was a command line argument issue.
 */
function accessorMain(argv) {

    // accessorMain() is not in commonHost.js because we want to
    // ensure that commonHost cannot read arbitrary files from the
    // file system.
    
    var usage = "Usage: [-accessor|--accessor] [-h|--h|-help|--help] [-e|--e|-echo|--echo] [-timeout|--timeout milliseconds] [-v|--v|-version|--version]  accessorOrRegularJavaScriptFile1.js [accessorOrRegularJavaScriptFile2.js ...]",
	i,
	sawAccessor = false,
	sawFiles = false,
	timeout = -1;

    try {
	// Under Nashorn, argv is a Java Array of Strings, so
	// we use the Nashorn Java.from().
	argv = Java.from(argv);
    } catch (error) {
	// Ignore
    }

    if (argv.length === 0) {
        console.error(usage);
        return 3;
    }

    for (i = 0; i < argv.length; i++) {
    	switch (argv[i]) {
    	case '-accessor':
    	case '--accessor':
    	case '-accessors':
    	case '--accessors':
    	    sawAccessor = true;
    	    break;

    	case '-e':
    	case '--e':
    	case '-echo':
    	case '--echo':
    	    console.log(argv)
    	    break;

    	case '-h':
    	case '--h':
    	case '-help':
    	case '--help':
    	    console.log(usage);
    	    return 0;

    	case '-timeout':
    	case '--timeout':
    	    i += 1;
    	    if (i >= argv.length) {
    		console.error("Argument " + i + "  was " + argv[i] + " but there is no argument for milliseconds.  Args were: " + argv);
    		return 3;
    	    }
    	    timeout = argv[i];

    	    console.log("accessorMain.js: main(): Setting timout to stop after " + timeout + " ms.");
    	    setTimeout(function () {
    	        // Under node, process.exit gets caught by exitHandler() in
    	        // nodeHost.js and invokes wrapup().
    	        console.log("accessorMain.js: main(): Maximum time reached. Calling stop().");
    	        commonHost.stopAllAccessors();
    	    }, timeout);
    	    break;

    	case '-v':
    	case '--v':
    	case '-version':
    	case '--version':
    	    console.log("Accessors 1.0, accessorMain.js: $Id$");
    	    return 0;

    	default:
    	    sawFiles = true;
    	    if (timeout === -1) {
    	        // Prevent the script from exiting by repeating the empty function
    	        // every ~25 days.
    	        setInterval(function () {}, 2147483647);
    	    }
    	    if (sawAccessor) {
    	        commonHost.topLevelAccessors = instantiateAndInitialize(argv.slice(i));
    	        return 0;
    	    } else {
    	        try {
    	            // FIXME: Using getAccessorCode here is wrong.
    	            // That will search a library of accessors.
    	            // We want to read a regular file.
    	            // FIXME: Rather than just eval, shouldn't this specify a context?
    	            eval(getAccessorCode(argv[i]));
    	        } catch (error) {
    	            throw new Error('Failed to eval "' + argv[i] + '": ' + error);
    	        }
    	    }
    	}
    }
    if ( !sawFiles) {
        throw new Error("No file arguments were present?  Args were: " + argv);
    }
    return 0;
}

exports.accessorMain = accessorMain;
