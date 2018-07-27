// Accessor that outputs the current status of all top-level accessors.
//
// Copyright (c) 2015-2017 The Regents of the University of California.
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

/** Accessor that outputs the current status of all top-level accessors.
 *
 *  Upon receiving a *query* input, this accessor outputs an array of objects,
 *  one for each top-level accessor. Each object has the following fields:
 *  * accessorName: The name of the accessor.
 *  * accessorClass: The class of the accessor, e.g. net/REST.
 *  * initialized: True if the accessor has been initialized and not wrapped up.
 *
 *
 *  If the *monitoringInterval* parameter has value greater than zero, then
 *  after initialization, this accessor turns on monitoring of the execution
 *  of top-level accessors. At the time interval specified by *monitoringInterval*
 *  it will output on the *monitor* port the current monitoring information.
 *  It will also send to the console the final monitoring information in
 *  wrapup. Note that this accessor is not able to measure the initialization
 *  time of other accessors because some will have already been initialized
 *  when this one is initialized and some will not have been. Hence, it turns
 *  on monitoring after initialization using a delayed execution.
 *  
 *  This accessor can only be used in a host that allows trusted accessors.
 *  Trusted accessors must have class names beginning with 'trusted/'
 *  and are allowed to invoke the function getTopLevelAccessors() to
 *  obtain access to peer accessors.
 *
 *  FIXME: This is really just a bare minimum starting point for monitoring.
 *
 *  @accessor trusted/AccessorStatus
 *  @input query FIXME
 *  @output status FIXME.
 *  @author Edward A. Lee
 *  @version $$Id$$
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*globals console, error, exports, require */
/*jshint globalstrict: true*/
"use strict";

var util = require('util');

exports.setup = function () {
    this.input('query');
    this.output('status');
    this.output('monitor', {
    	'type':'JSON'
    });
    this.parameter('monitoringInterval', {
        'type':'number',
        'value':1000
    });
    this.parameter('deepMonitoring', {
    	'type':'boolean',
    	'value':false
    });
};

var handle = null;

exports.initialize = function () {
    var self = this;
    this.addInputHandler('query', function () {
        var result = [];
        var accessors = getTopLevelAccessors();
        for (var i = 0; i < accessors.length; i += 1) {
            result.push({
                'accessorName': accessors[i].getName(),
                'accessorClass': accessors[i].getAccessorClass(),
                'initialized': accessors[i].isInitialized()
            });
        }
        self.send('status', result);
    });
    
    var monitoringInterval = this.getParameter('monitoringInterval');
    if (monitoringInterval > 0) {
    	var deep = self.getParameter('deepMonitoring');
    	// Defer this execution so it occurs after all accessors have been initialized.
    	setTimeout(function() {
            var accessors = getTopLevelAccessors();
            for (var i = 0; i < accessors.length; i += 1) {
                accessors[i].startMonitoring(deep);
            }
            handle = setInterval(function() {
                var result = [];
                for (var i = 0; i < accessors.length; i += 1) {
                    result.push(accessors[i].getMonitoring());
                }
                self.send('monitor', result);
            }, monitoringInterval);
    	}, 0);
    }
};

exports.wrapup = function() {
    if (handle !== null) {
        clearInterval(handle);
        console.log('*** Final monitoring information:');
        var accessors = getTopLevelAccessors();
        for (var i = 0; i < accessors.length; i += 1) {
            console.log(util.inspect(accessors[i].getMonitoring()));
            accessors[i].stopMonitoring();
        }
    }
}
