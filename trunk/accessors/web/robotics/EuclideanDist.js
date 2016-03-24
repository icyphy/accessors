// Copyright (c) 2015-2016 The Regents of the University of California.
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

/** This accessor takes two 3D locations and calculate the euclidean distance between them.
 * 
 * 
 *  @accessor robotics/Lla2Ecef.js
 *  @author Eloi T. Pereira (eloi@berkeley.edu)
 *  @version $$Id: Lla2Ecef.js 1 2016-03-06 16:00:00Z eloi $$
 *  @input {double} x1 x-coordinate of the first location
 *  @input {double} y1 y-coordinate of the first location
 *  @input {double} z1 z-coordinate of the first location
 *  @input {double} x2 x-coordinate of the second location
 *  @input {double} y2 y-coordinate of the second location
 *  @input {double} z2 z-coordinate of the second location
 *  @output {double} dist distance
 *  
 */

// Stop extra messages from jslint and jshint.  Note that there should
// be no space between the / and the * and global. See
// https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSHint */
/*globals addInputHandler, get, error, exports, extend, get, input, output, parameter, require, send */
/*jshint globalstrict: true*/
'use strict';

/** Set up the accessor by defining the inputs and outputs.
 */

exports.setup = function() {
    this.input('x1');
    this.input('y1');
    this.input('z1');
    this.input('x2');
    this.input('y2');
    this.input('z2');
    this.output('dist');
};

exports.initialize = function() {
    this.addInputHandler(function(){
	var x1 = this.get('x1');
	var x2 = this.get('x2');
	var y1 = this.get('y1');
	var y2 = this.get('y2');
	var z1 = this.get('z1');
	var z2 = this.get('z2');
	this.send('dist',Math.sqrt(Math.pow(x1-x2,2)+ Math.pow(y1-y2,2)+Math.pow(z1-z2,2)));
    });
};
    
