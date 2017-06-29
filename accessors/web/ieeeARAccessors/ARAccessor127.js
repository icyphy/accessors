// Code for ARAccessor127
//
// Copyright (c) 2016-2017 The Regents of the University of California.
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

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*globals console, error, exports, require */
/*jshint globalstrict: true*/
"use strict";

// Code for ARAccessor127

exports.setup = function() {
	this.realize('controling');

	// Defining inputs
	this.input('control', {
		'type': 'int',
		'value': 0
	});

	// Defining outputs
	this.output('data', {
		'type': 'JSON',
		'value': null		
	});
	this.output('schema', {
		'type': 'JSON',
		'value': null
	});
};

var count = 0;

exports.initialize = function() {
	var thiz = this;

	// At initialize, send the schema;
	this.send('schema', schema);

	// Send data every 1000ms
	setInterval(function() {
		thiz.send('data', {
				'test': count++,
				'tag': 127,
		});
	}, 2000);

	this.addInputHandler('control', function() {
		var controlValue = thiz.get('control');
		// ...
	});
};

var schema = {
  "$schema": "http://json-schema.org/draft-03/schema#",
  "type": "object",
  "properties": {
    "s1": {
      "type": "string",
      "title": "A string",
      "description": "A string input"
    },
    "num1": {
      "type": "integer",
      "title": "A number",
      "minimum": 1,
      "maximum": 10,
      "multipleOf": 3,
      "description": "An integer multiple of `3`, between `1` and `10` (inclusive)"
    },
    "array1": {
      "type": "array",
      "title": "An array values",
      "items": {
        "type": "object",
        "properties": {
          "value": {
            "type": "string",
            "title": "Value"
          }
        }
      }
    }
  }
};
