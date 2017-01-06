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


exports.HostHelper = function() {
	this.mochaListener = null;
	this.exception = null;
	this.exceptionHandler = null;
	this.exitHandler = null;
	
	if (typeof window !== 'undefined' && window.hasOwnProperty('browserJSLoaded')) {
	    exports.HostHelper.prototype.instantiate = instantiate;
	} else if (typeof actor !== 'undefined' && typeof Packages !== 'undefined' && typeof Packages.java.util.Vector === 'function') {
		exports.HostHelper.prototype.instantiate = function() {
			console.log('The hostHelper module is not yet supported on Cape Code.');
		}
	} else if (typeof Duktape === 'object') {
		exports.HostHelper.prototype.instantiate = function() {
			console.log('The hostHelper module is not yet supported on Duktape.');
		}
	} else if (typeof Packages !== 'undefined' && typeof Packages.java.util.Vector === 'function') {
		exports.HostHelper.prototype.instantiate = function() {
			console.log('The hostHelper module is not yet supported on Nashorn.');
		}
	} else if (typeof process !== 'undefined' && typeof process.version === 'string') {
		var host = require('./../../node/nodeHost.js');
		exports.HostHelper.prototype.instantiate = host.instantiate;
		
		exports.HostHelper.prototype.before = function() {
            // Remove the mocha listener (restore later) and 
            // use our own handlers.
            this.mochaListener = process.listeners('uncaughtException').pop();
            
            process.removeAllListeners('exit');
            process.removeAllListeners('uncaughtException');
            
            // Treat exceptions and calls to 'exit' as failures.
            process.once('uncaughtException', this.exceptionHandler = function(error) { 
                exception = error;
                // FIXME:  What to do here?
                //done(error);
            });
            
            process.once('exit', this.exitHandler = function(error) { 
                exception = error;
                // FIXME:  What to do here?
                //done(error);
            });
		}
		
		exports.HostHelper.prototype.after = function() {
			 process.listeners('uncaughtException').push(this.mochaListener);
		}
		
		exports.HostHelper.prototype.wrapup = function() {
            // Wait to see if any exceptions occur in wrapup.
            setTimeout(function() {
                process.removeListener('uncaughtException', this.exceptionHandler);
                process.removeListener('exit', this.exitHandler);
                
                done();
            }, 500);
		}
	}
};

// In node, a custom uncaught exception handler must be used to avoid crashing 
// the build.
exports.HostHelper.prototype.after = function() {};
exports.HostHelper.prototype.before = function() {};
exports.HostHelper.prototype.wrapup = function() {};

// hostHelper provides the proper instantiate function for this host.
exports.HostHelper.prototype.instantiate = function() {
	console.log('The hostHelper module is not yet supported on this host.');
}


