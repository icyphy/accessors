// A module to provide host functions for mocha tests where the host may not
// be loaded yet (e.g. run with mocha testcase.js )
//Copyright (c) 2015 The Regents of the University of California.
//All rights reserved.

//Permission is hereby granted, without written agreement and without
//license or royalty fees, to use, copy, modify, and distribute this
//software and its documentation for any purpose, provided that the above
//copyright notice and the following two paragraphs appear in all copies
//of this software.

//IN NO EVENT SHALL THE UNIVERSITY OF CALIFORNIA BE LIABLE TO ANY PARTY
//FOR DIRECT, INDIRECT, SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES
//ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
//THE UNIVERSITY OF CALIFORNIA HAS BEEN ADVISED OF THE POSSIBILITY OF
//SUCH DAMAGE.

//THE UNIVERSITY OF CALIFORNIA SPECIFICALLY DISCLAIMS ANY WARRANTIES,
//INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
//MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE. THE SOFTWARE
//PROVIDED HEREUNDER IS ON AN "AS IS" BASIS, AND THE UNIVERSITY OF
//CALIFORNIA HAS NO OBLIGATION TO PROVIDE MAINTENANCE, SUPPORT, UPDATES,
//ENHANCEMENTS, OR MODIFICATIONS.

exports.instantiate = function() {
	console.log('The hostHelper module is not yet supported on this host.');
}

if (typeof window !== 'undefined' && window.hasOwnProperty('browserJSLoaded')) {
    exports.instantiate = instantiate;
} else if (typeof actor !== 'undefined' && typeof Packages !== 'undefined' && typeof Packages.java.util.Vector === 'function') {
	exports.instantiate = function() {
		console.log('The hostHelper module is not yet supported on Cape Code.');
	}
} else if (typeof Duktape === 'object') {
	exports.instantiate = function() {
		console.log('The hostHelper module is not yet supported on Duktape.');
	}
} else if (typeof Packages !== 'undefined' && typeof Packages.java.util.Vector === 'function') {
	exports.instantiate = function() {
		console.log('The hostHelper module is not yet supported on Nashorn.');
	}
    accessorHost = accessorHostsEnum.NASHORN;
} else if (typeof process !== 'undefined' && typeof process.version === 'string') {
	var host = require('./../../node/nodeHost.js');
	exports.instantiate = host.instantiate;
}