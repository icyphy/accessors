// Test accessor that multiplies its input by a scale factor.
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

/** Hello accessor to say hello.
 *  Enter a custom name parameter.
 *   
 *  @accessor Hello
 *  @param name The name of the user to say hello to.
 *  @input sayHello The trigger to say "Hello <name>"
 *  @output output The string containing "Hello <name>"
 *
 *  Example usage:
 *
 *  var helloAcc = instantiate('helloAcc','Hello');
 *  helloAcc.initialize();
 *  helloAcc.setParameter('name', 'Victor');
 *  helloAcc.provideInput('sayHello', true);
 *  helloAcc.react();
 *  latestOutput('output');
 *
 *  @author Victor Nouvellet
 *  @version $$Id: Hello.js 1137 2016-12-06 22:13:55Z cxh $$
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*globals console, error, exports, require */
/*jshint globalstrict: true*/
"use strict";

exports.setup = function () {
    this.input('sayHello');
    this.parameter('name', {
        'value': 'new Accessor user',
        'type': 'string'
    });
    this.output('output');
};

function triggerInputHandler() {
    // var thiz = this; // Use 'thiz' if you plan to use 'this' inside a callback
    var greeting = 'Hello ' + this.getParameter('name') + '!';
    console.log(greeting);
    this.send('output', greeting);
};

exports.initialize = function () {
    this.addInputHandler('sayHello', triggerInputHandler);
};
