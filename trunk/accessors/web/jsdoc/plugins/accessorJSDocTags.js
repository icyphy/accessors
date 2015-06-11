// JavaScript definition of accessor-specific JSDoc tags.
// Copyright (c) 2015 The Regents of the University of California.
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

/** JavaScript definition of accessor-specific JSDoc tags.
 *
 * See <a href="http://usejsdoc.org/about-plugins.html">http://usejsdoc.org/about-plugins.html</a>.
 *
 * @author Christopher Brooks
 * @version $Id$
 * @since Ptolemy II 11.0
 */
exports.defineTags = function(dictionary) {
    dictionary.defineTag("accessor", {
        mustHaveValue: true,
        onTagged: function(doclet, tag) {
            doclet.accessor = tag.name;
        }
    });
    dictionary.defineTag("input", {
        mustHaveValue: true,
        canHaveType: true,
        canHaveName: true,
        onTagged: function(doclet, tag) {
            if (!doclet.inputs) { doclet.inputs = []; }
            doclet.inputs.push(tag.value);
        }
    });
    dictionary.defineTag("output", {
        mustHaveValue: true,
        canHaveType: true,
        canHaveName: true,
        onTagged: function(doclet, tag) {
            if (!doclet.outputs) { doclet.outputs = []; }
            doclet.outputs.push(tag.value);
        }
    });
    dictionary.defineTag("parameter", {
        mustHaveValue: true,
        canHaveType: true,
        canHaveName: true,
        onTagged: function(doclet, tag) {
            if (!doclet.parameters) { doclet.parameters = []; }
            doclet.parameters.push(tag.value);
        }
    });
};
