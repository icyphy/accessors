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

/**
    @overview Build xml suitable for the Ptolemy II doc system.
    @author Christopher Brooks
    @version $Id$
    @example
        jsdoc StockTick.js -t templates/ptdoc
 */
'use strict';

var fs = require('fs');
var util = require('util');

/** Escape html characters for use in XML.
 *  @param {string} bad Bad data
 *  @return text suitable for use in XML.
 */
function xmlEscape(bad) {
    if (bad === undefined) {
        return bad;
    }
    return bad.replace(/[\n<>&'"]/g,
                          function (c) {
                              switch (c) {
                              case '\n': return '&#10;';
                              case '<': return '&lt;';
                              case '>': return '&gt;';
                              case '&': return '&amp;';
                              case '\'': return '&apos;';
                              case '"': return '&quot;';
                              }
                          });
}

/** Process the JavaScript and generate ptdoc-compatible xml
 *  on stdout.
 *  @param {TAFFY} data
 *  @param {object} opts
 */
exports.publish = function(data, opts) {
    var root = {},
        docs;
    var fileName = '';
    var moml = '';

    var _debugging = false;
    data({undocumented: true}).remove();
    docs = data().get(); // <-- an array of Doclet objects

    //    console.log("ptdoc/public.js: docs: " + docs.toSource());
    docs
    .forEach(function (element, index) {

        if (element.meta !== undefined) {
            if (element.meta.filename != fileName) {
                if (fileName != '') {
                    var docFileName = fileName.substr(0, fileName.length - 3) + "Doc.xml";
                    console.log("Writing: " + docFileName);
                    fs.writeFileSync(docFileName, moml, 'utf8');
                    moml = '';
                }
                fileName = element.meta.filename;
            }
        }

        if (_debugging) {
            if (element.meta !== undefined) {
                console.log("ptdoc/public.js: docs.meta.filename: " + element.meta.filename);
            }
            console.log("ptdoc/public.js: element.kind: " + element.kind);
            //console.log("ptdoc/public.js: element:" + element.toSource());
            //console.log(element);
        }

        if (element.kind === 'module') {
            moml += '<property name="documentation" class="ptolemy.vergil.basic.DocAttribute">\n';

            if (element.description !== undefined) {
                    moml += '    <property name="description" class="ptolemy.kernel.util.StringAttribute" value="' + xmlEscape(element.description) + '">\n'
                    + '    </property>\n';
            }
            if (element.author !== undefined) {
                var author = element.author.toSource();
                // String off [" "]
                var shortAuthor = author.substring(2, author.length - 2);
                moml += '    <property name="author" class="ptolemy.kernel.util.StringAttribute" value="' + xmlEscape(shortAuthor) + '">\n'
                    + '    </property>\n';
            }
            if (element.version !== undefined) {
                    moml += '    <property name="version" class="ptolemy.kernel.util.StringAttribute" value="' + xmlEscape(element.version) + '">\n'
                    + '    </property>\n';
            }

            if (_debugging) {
                //console.error("ptdoc/public.js: element.tags:" + element.tags);
            }

            if (element.tags !== undefined) {
                element.tags
                .forEach(function (element, index) {
                    if (_debugging) {
                        //console.error("ptdoc/public.js: element.tags:");
                        //console.error(element);                
                    }

                    if (element.title === 'input' || element.title === 'output') {
                        // What we want:
                        // <property name="price (output, number)" class="ptolemy.kernel.util.StringAttribute" value="The most recent trade price for the stock.">
                        var index = element.text.indexOf('}');
                        var texts = element.text.split(" ");
                        var value = "";
                        for ( var i = 2; i < texts.length; i++) {
                            if (i > 2) {
                                value += ' ';
                            }
                            value += texts[i];
                        }
                        moml += '    <property name="' + xmlEscape(texts[1]) + ' (' + xmlEscape(element.title) + ', ' + xmlEscape(element.text.substr(1, index-1)) + ')" class="ptolemy.kernel.util.StringAttribute" value="' + xmlEscape(value) + '">\n'
                            + '    </property>\n'
                    }
                });
            }
            moml += '</property>'
        }
    });
    var docFileName = fileName.substr(0, fileName.length - 3) + "Doc.xml";
    console.log("Writing Last File: " + docFileName);
    fs.writeFileSync(docFileName, moml, 'utf8');
}
