// Base class for mutable accessors.
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

/** Base class for mutable accessors. A mutable accessor is an accessor
 *  that does nothing until it is 'reified' by another accessor. Once
 *  reified, the reifying accessor will react to inputs to this mutable and
 *  produce outputs. No particular combatibility rules are imposed to the
 *  reifying accessor. reify() will look for matching input and outputs 
 *  between the reifying accessor and the instance of mutable
 * 
 *  This base class defines an *accessor* input that accepts an accessor
 *  instance, an accessor code (as string) or a fully qulified accessor
 *  class. The mutable reifies itself with the instance of the accessor, 
 *  even no matching is found. This base class defines also a *state*
 *  output. The mutable will be sending on this output a boolean value, 
 *  that indicates if the reification succeeded or not. For example, if the 
 *  received accessor cannot be resolved to an accessor instance, then 
 *  false value will be sent on 'state' output. To use this, extend it as
 *  follows:
 *  
 *  ```javascript
 *  exports.setup = function() {
 *      this.extend('utilities/MutableBase');
 *      ... add your inputs, outputs, and parameters here ...
 *  };
 *  ```
 *  
 *  A good way to add your inputs, outputs, and parameters is to define
 *  an interface and then implement it as follows:
 *  
 *  ```javascript
 *  exports.setup = function() {
 *      this.extend('utilities/MutableBase');
 *      this.implement('MyInterfaceDefinition');
 *  };
 *  ```
 *  
 *  Your interface definition should look something like this:
 *  
 *  ```javascript
 *  exports.setup = function() {
 *      this.input('in');
 *      this.output('out');
 *   };
 *  ```
 *  
 *  This should be put into a file named MyInterfaceDefinition.js. If that
 *  file is in the same directory as the swarmlet that uses this Mutable, then
 *  the host will be able to find the file.
 *  
 *  If a null or empty string input is provided on *accessor* and this mutable
 *  has been reified, then it will be unreified.
 *
 *  @accessor utilities/MutableBase
 *  @input accessor Accessor instance, code or class to reify.
 *  @author Chadlia Jerad and Edward A. Lee
 *  @version $$Id$$
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*globals clearInterval, exports, require, setInterval */
/*jshint globalstrict: true*/
"use strict";

exports.setup = function() {
    this.mutable(true); 

    this.input('accessor');

	this.output('state', {
        'type': 'boolean',
        'value': false
    });
};

exports.initialize = function() {
    var thiz = this;

    this.addInputHandler('accessor', function() {
        var accessor = this.get('accessor');

        var state = thiz.reify(accessor);
        if (state) {
            thiz.send('state', true);
        } else {
            thiz.unreify();
            thiz.send('state', false);
        }
    });
};
