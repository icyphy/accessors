// JavaScript functions for a browser swarmlet host.

// Copyright (c) 2014-2015 The Regents of the University of California.
// All rights reserved.

// Permission is hereby granted, without written agreement and without
// license or royalty fees, to use, copy, modify, and distribute this
// software and its documentation for any purpose, provided that the above
// copyright notice and the following two paragraphs appear in all copies
// of this software.

// IN NO EVENT SHALL THE UNIVERSITY OF CALIFORNIA BE LIABLE TO ANY PARTY
// FOR DIRECT, INDIRECT, SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES
// ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
// THE UNIVERSITY OF CALIFORNIA HAS BEEN ADVISED OF THE POSSIBILITY OF
// SUCH DAMAGE.

// THE UNIVERSITY OF CALIFORNIA SPECIFICALLY DISCLAIMS ANY WARRANTIES,
// INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE. THE SOFTWARE
// PROVIDED HEREUNDER IS ON AN "AS IS" BASIS, AND THE UNIVERSITY OF
// CALIFORNIA HAS NO OBLIGATION TO PROVIDE MAINTENANCE, SUPPORT, UPDATES,
// ENHANCEMENTS, OR MODIFICATIONS.
//

/*
 * JavaScript functions for a browser swarmlet host.
 * This file includes default accessor functions (initialize, fire, wrapup)
 * and functions for reading inputs and sending outputs.
 * 
 * @author Edward A. Lee and Chris Shaver
 * @version $$Id$$
 */
// Stop extra messages from jslint and jshint.  Note that there should be no
// space between the / and the * and global. See https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSHint */
/*globals console, XMLHttpRequest */
/*jslint browser:true */
/*jshint globalstrict: true*/
'use strict';

/* Initialize the accessor.
 * This implementation throws an exception.
 * The accessor may shadow this method.
 */
function initialize() {
    throw "No initialize() method defined.";
}

/* Fire the accessor.
 * This implementation throws an exception.
 * The accessor may shadow this method.
 */
function fire() {
    throw "No fire() method defined.";
}

/* Wrapup the accessor.
 * This implementation throws an exception.
 * The accessor may shadow this method.
 */
function wrapup() {
    throw "No wrapup() method defined.";
}

/* Retrieve an input.
 *  @param {string} input
 *  @return The elemeny in the document with the 
 *  Id input + "Input".
 */
function get(input) {
    return document.getElementById(input + "Input").value;
}

/* Set an output.
 *  @param output
 *  @param value.
 */
function send(output, value) {
    document.getElementById(output).innerHTML = JSON.stringify(value);
}
