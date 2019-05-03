// Base class for accessors that use ontology matching to translate between ontologies.
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

/** 
 * 
 *  Upon receiving an input on "in", an accessor extending this accessor
 *  should implement a transformation to convert that value from a concept in
 *  the input ontology to a matching concept in the output ontology produced
 *  as output on "out".
 *
 *  An extending accessor must override the "exports.matching" function. This
 *  accessor's fire function ensures the special string "$?" will be passed
 *  directly through any extending adapters.
 *
 *  @accessor adapters/Adapter
 *  @input in A value from the input ontology. 
 *  @output out A value from the output ontology matching the input ontology value
 *    which triggered its production.
 *  @author Matt Weber
 *  @version $$Id$$
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*globals clearInterval, exports, require, setInterval */
/*jshint globalstrict: true*/
"use strict";


exports.setup = function(){
    this.input("in");
    this.output("out");
}

//This implementation of fire **should not** be overriden by an extending accessor.
//It guarantees the special value "$?", signifying unknown will be passed directly
//from input to output.
exports.fire = function(){
    var inValue = this.get("in");
    var outValue;
    this.exports.beforeMatching(inValue);
    if(inValue == "$?"){
        outValue = "$?";
    } else {
        outValue = this.exports.matching(inValue);
    }
    this.send("out", outValue);
}


//This function **must** be overriden by an extending accessor,
//to implement the functionality of the adapter for all values which are not
//the special value "$?". This function should return the result of the matching.
exports.matching = function(inValue){
    error("The base class matching function in adapters/Adapter.js has not been overriden. This adapter will produce: null")
    return null;
}

//This function may be overriden by an extending accessor. Currently it
//does nothing, and should only be overriden in the special case 
//when the implementation of a matching
//needs to know the adapter has received the special value "$?", when exports.matching
//will not be called. While this is more complicated, it simplifies the
//common case where exports.matching doesn't need to implement a test for "$?".
exports.beforeMatching = function(inValue){
    return;
}
