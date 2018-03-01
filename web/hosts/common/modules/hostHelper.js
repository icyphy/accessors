// A module to provide host functions for mocha tests where the host may not
// be loaded yet (e.g. run with mocha testcase.js )
//Copyright (c) 2015-2017 The Regents of the University of California.
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

/**
 * A module to provide host functions for mocha tests where the host
 * may not be loaded yet (e.g. run with mocha testcase.js )
 *
 * @module @accessors-hosts/common/modules/hostHelper
 * @author Beth Osyk. Contributor: Christopher Brooks
 * @version $$Id$$   
 */

/*globals Packages, console, exception, exports, instantiate, process, require, window */
/*jshint globalstrict: true, multistr: true */
'use strict';

exports.HostHelper = function() {
    this.mochaListener = null;
    this.exception = null;
    this.exceptionHandler = null;
    this.exitHandler = null;
    this.hostname = "default";
    
    if (typeof window !== 'undefined' && window.hasOwnProperty('browserJSLoaded')) {
        exports.HostHelper.prototype.instantiate = instantiate;
        this.hostname = "BrowserHost";
    } else if (typeof actor !== 'undefined' && typeof Packages !== 'undefined' && typeof Packages.java.util.Vector === 'function') {
        exports.HostHelper.prototype.instantiate = function() {
            console.log('The hostHelper module is not yet supported on Cape Code.');
        };
        this.hostname = "CapeCodeHost";
    } else if (typeof Duktape === 'object') {
        exports.HostHelper.prototype.instantiate = function() {
            console.log('The hostHelper module is not yet supported on Duktape.');
        };
        this.hostname = "DuktapeHost";
    } else if (typeof Packages !== 'undefined' && typeof Packages.java.util.Vector === 'function') {
        exports.HostHelper.prototype.instantiate = function() {
            console.log('The hostHelper module is not yet supported on Nashorn.');
        };
        this.hostname = "NashornHost";
    } else if (typeof process !== 'undefined' && typeof process.version === 'string') {
        this.hostname = "NodeHost";
        var host = require('./../../node/nodeHost.js');
        exports.HostHelper.prototype.instantiate = host.instantiate;
        
        exports.HostHelper.prototype.before = function() {
            // Remove the mocha listener (restore later) and 
            // use our own handlers.
            this.mochaListener = process.listeners('uncaughtException').pop();
            
            process.removeAllListeners('exit');
            process.removeAllListeners('uncaughtException');
        };
        
        exports.HostHelper.prototype.eachTestStart = function(done) {
            this.exception = null;
            this.exceptionHandler = null;
            this.exitHandler = null;
            
            // Treat exceptions and calls to 'exit' as failures.
            process.once('uncaughtException', 
                         this.exceptionHandler = function(error) { 
                             this.exception = error;
                             done(error);
                         });
            
            process.once('exit', this.exitHandler = function(error) { 
                this.exception = error;
                done(error);
            });
        };
        
        exports.HostHelper.prototype.eachTestEnd = function() {
            process.removeListener('uncaughtException', this.exceptionHandler);
            process.removeListener('exit', this.exitHandler);
        };
        
        exports.HostHelper.prototype.after = function() {
            process.listeners('uncaughtException').push(this.mochaListener);
        };
        
    }
};

// In node, a custom uncaught exception handler must be used to avoid crashing 
// the build.  Add placeholders here.
exports.HostHelper.prototype.after = function() {};
exports.HostHelper.prototype.before = function() {};
exports.HostHelper.prototype.eachTestStart = function() {};
exports.HostHelper.prototype.eachTestEnd = function() {};

// Placeholder for proper instantiate function for each host.
exports.HostHelper.prototype.instantiate = function() {
    console.log('The hostHelper module is not yet supported on this host.');
};


