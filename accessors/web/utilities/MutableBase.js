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
 *  produce outputs. The reifying accessor is required to be compatible with
 *  this instance of mutable. To be compatible, every input of the reifying
 *  accessor must have a matching input in this instance of mutable, and
 *  every output of this instance of mutable must have a matching output
 *  in the reifying accessor.
 * 
 *  This base class defines an *accessor* input that accepts code for
 *  an accessor and reifies itself with an instance of that accessor if
 *  that accessor is compatible with this instance.  To use this,
 *  extend it as follows:
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
 *      this.realize('MyOntologyConcept');
 *      this.input('in');
 *      this.output('out');
 *   };
 *  ```
 *  
 *  This should be put into a file named MyInterfaceDefinition.js. If that
 *  file is in the same directory as the swarmlet that uses this Mutable, then
 *  the host will be able to find the file.
 *  
 *  The call to realize() associates with the interface an ontology concept,
 *  which as of this writing is just an arbitrary string. Any accessor provided
 *  at the *accessor* input must also realize this same ontology concept in order
 *  to be able to reify the mutable.  It must also have an input named 'in'
 *  and an output named 'out', since those are the inputs and outputs defined
 *  in this interface.  The accessor provided at the *accessor* input could
 *  simply realize this same interface.
 *  
 *  If a null or empty string input is provided on *accessor* and this mutable
 *  has been reified, then it will be unreified.
 *
 *  @accessor utilities/Mutable
 *  @input accessor Accessor code to reify.
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
    this.input('accessor', {
        'type': 'string',
        'value': ''
    });
};

exports.initialize = function() {
    var thiz = this;

    this.addInputHandler('accessor', function() {
        var accessorCode = this.get('accessor');
        thiz.send('data', null);
        if (accessorCode && accessorCode.length > 0) {
            thiz.reify(accessorCode);
        } else {
            thiz.unreify();
        }
    });
};
