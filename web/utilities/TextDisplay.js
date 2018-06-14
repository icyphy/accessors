// Display text.
//
// Copyright (c) 2017 The Regents of the University of California.
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

/** Display data using util.inspect() to render a more human-readable form.
 *  Any data accepted by util.inspect() can be displayed.
 *  The title may be used by the host to label the output in some way, either
 *  by labeling a display window or prepending the printed text with the title.
 *  The resulting text is passed through to the output in case a model wishes to ensure
 *  that the image has been displayed before something else happens or the model
 *  wishes to use the rendered text in some way.
 *
 *  @accessor utilities/TextDisplay
 *  @input input The text to display.
 *  @output output The text to display.
 *  @author Edward A. Lee
 *  @version $$Id$$
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*globals console, error, exports, require */
/*jshint globalstrict: true*/
"use strict";

var textDisplay = require('@accessors-modules/text-display');
var util = require('util');
var display = null;

exports.setup = function () {
    this.input('input');
    this.output('output', {'type':'string'});
    this.parameter('title', {
        'type':'string',
        'value':'TextDisplay'
    });
};

exports.initialize = function () {
    var self = this;
    
    if (display === null) {
        display = new textDisplay.TextDisplay(this.getParameter('title'));
    }

    this.addInputHandler('input', function () {
        var inputValue = self.get('input');
        // The null argument is an undocumented feature indicating unbounded depth.
        var text = util.inspect(inputValue, {depth: null});
        display.appendText(text);
        this.send('output', text);
    });
};
