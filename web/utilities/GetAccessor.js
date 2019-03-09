// Accessor that gets an accessor's code and specifies parameter and default input settings
// for the retrieved accessor.
//
// Copyright (c) 2019 The Regents of the University of California.
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

/** Subclass of the GetResource accessor intended to obtain accessors for reification in a 
 *  mutable accessor. In addition to the GetResource accessor's functionality, this accessor produces a
 *  parameterMap and inputMap along with the accessor. It also ignores all triggers
 *  until after this accessor's "resource" input value has been changed from the default (an empty string).
 *  This feature is useful if the desired accessor resource is unknown until runtime.
 *
 *  Refer to utilities/GetResource for further documentation.
 
 *  @accessor utilities/GetAccessor
 *  @input options Options passed to the getResources() function, see utilities/GetResource.
 *  @input resource {string} The accessor to be read. Unlike superclass, defaults to an empty string.
 *  @input trigger {boolean} Send a token to this input to get the specified resource. 
 *  @input parameterMap {JSON} Parameter settings for the retrieved accessor to be provided along with that accessor.
 *  @input inputMap {JSON} Default input settings for the retrieved accessor to be provided along with that accessor.
 *  @parameter synchronous {boolean} Perform a synchronous or asynchronous call of getResource.
 *    Note some hosts do not currently implement both versions.
 *  @output output {JSON} An object with "accessor", "parameterMap", and "inputMap" properties.
 *    This format is compatible with Mutable accessors.
 *  @author Matt Weber
 *  @version $$Id$$
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*globals clearInterval, exports, require, setInterval */
/*jshint globalstrict: true*/
"use strict";

exports.setup = function () {
    this.extend("utilities/GetResource");
    this.input("parameterMap", {
        "type": "JSON",
        "value": {}
    });
    this.input("inputMap", {
        "type": "JSON",
        "value": {}
    });

    //Override base class
    this.input('resource', {
        'type': 'string',
        'value': ''
    });
};

//Prevent triggering for default input
exports.initialize = function(){
    var thiz = this;
    exports.ssuper.initialize.call(this);

    //Override superclass input handler to first check if resource is an empty string.
    this.addInputHandler('trigger', function(){
        if(thiz.get('resource')){
            exports.ssuper.handleTrigger.bind(thiz);
        }
    });

};

//Override base class to produce parameterMap and inputMap along with the accessor. 
exports.filterResponse = function (response) {
    return {
        "accessor": response,
        "parameterMap": this.get("parameterMap"),
        "inputMap": this.get("inputMap")
    };
};


