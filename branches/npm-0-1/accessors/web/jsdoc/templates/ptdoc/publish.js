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

/**
 * @overview Build xml suitable for the Ptolemy II doc system.
 *
 * The .js files are read and PtDoc.xml files are created.
 *
 * The ../plugins/accessorJSDocTags.js plugin is used to create the
 * inputs, outputs and parameters arrays.
 *
 * The ../../jsdoc.json file is what adds the plugin, it contains something like:
 *
 * "plugins": ["jsdoc/plugins/accessorJSDocTags"]
 *
 * For more information, see
 * https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSDocSystems#ModifyJSDocsTemplateFiles
 *
 *   @author Christopher Brooks
 *   @version $$Id$$
 *   @example
 *       jsdoc StockTick.js -t templates/ptdoc
 */
/*global console, exports, require, writePtDoc, xmlEscape */
/*jshint globalstrict: true, multistr: true */
/*jslint nomen: true */
'use strict';

var fs = require('fs');
var util = require('util');

/** Parse the input, output, or parameter accessor xml and generate MoML.
 *  @param {String} propertyName Either 'port' or 'parameter'
 *  @param elements Array of elements consisting of name, type and description fields.
 *  The type field is expected to be an object.
 *  @return MoML representation of the accessor xml.
 */
function accessorPropertiesToMoML(propertyName, elements) {
    var moml = '',
        debugging = false;
    elements
        .forEach(function (element) {
            var name = element.name,
                type = element.type,
                description = element.description;
            // if (type !== undefined) {
            //     type = type.toSource();
            // }
            if (debugging) {
                console.error(propertyName + " name: " + name);
                console.error(propertyName + " type: " + type);
                console.error(propertyName + " description: " + description);
            }
            // What we want:
            // <property name="price (output, number)" class="ptolemy.kernel.util.StringAttribute" type="int" value="The most recent trade price for the stock.">

            var simplerType = xmlEscape(type);
            if (type !== undefined) {
                simplerType = simplerType.replace(/^\(\{names:\[&quot;/g, '').replace(/&quot;\]}\)$/g, '');
                //console.error("simplerType: type: " + type + ", new simpleType: " + simplerType);
            }
            moml += '    <property name="' + xmlEscape(name) + " (" + propertyName + ")" +
                '" class="ptolemy.kernel.util.StringAttribute" type="' +
                simplerType + '" value="' +
                xmlEscape(description) + '">\n' +
                '    </property>\n';
        });
    return moml;
}

/** Process the JavaScript and generate ptdoc-compatible xml files.
 *
 *  This is the main entry point for JSDoc.  See
 *  https://github.com/jsdoc3/jsdoc/blob/master/templates/README.md
 *
 *  The file names will be the basename of the .js file with PtDoc.xml
 *  appended.  So, if the input is Foo.js, then the output will be
 *  FooPtDoc.xml.
 *
 *  @param {TAFFY} data
 */
exports.publish = function (data) {
    var docs, fileName = '',
        fullFileName = '',
        moml = '',
        debugging = false;
    data({
        undocumented: true
    }).remove();
    docs = data().get(); // <-- an array of Doclet objects

    // console.error("ptdoc/public.js: docs: " + util.inspect(docs));
    docs
        .forEach(function (element) {

            // If the filename changes, then write out the moml.
            if (element.meta !== undefined) {
                fullFileName = element.meta.path + "/" + element.meta.filename;
                if (fullFileName !== fileName) {
                    if (fileName !== '') {
                        writePtDoc(fileName, moml);
                        moml = '';
                    }
                    fileName = fullFileName;
                }
            }

            if (debugging) {
                if (element.meta !== undefined) {
                    console.error("ptdoc/public.js: docs.meta.path: " + element.meta.path);
                    console.error("ptdoc/public.js: docs.meta.filename: " + element.meta.filename);
                }
                console.error("ptdoc/public.js: element.kind: " + element.kind);
                var util = require('util');
                console.error("ptdoc/public.js: element: " + util.inspect(element));
                //console.error(element);
            }

            if (element.kind === 'accessor') {
                // The *PtDoc.xml files should have a well-formed
                // header that includes <?xml and the DOCTYPE so that
                // these can be parsed.  The Ptolemy doc files like
                // doc/codeDoc/ptolemy/actor/lib/Ramp.xml have a
                // similar structure.

                // However, if we start the *PtDoc.xml file with <!DOCTYPE, then in
                // JSAccessor, the '<input source="..."/>' will fail.

                // I believe we need the file to be well formed if the redirection
                // of accessors.org is going to work.

                // However, in the near term, we will try it without the header.

                // moml += '<?xml version="1.0" standalone="yes"?>\n' +
                //    '<!DOCTYPE doc PUBLIC "-//UC Berkeley//DTD DocML 1//EN"\n' +
                //    '    "http://ptolemy.eecs.berkeley.edu/xml/dtd/DocML_1.dtd">\n' +
                //    '<property name="documentation" class="ptolemy.vergil.basic.DocAttribute">\n';
                moml += '<property name="documentation" class="ptolemy.vergil.basic.DocAttribute">\n';

                // Alphabetical by tag.
                if (element.author !== undefined) {
                    // Strip off [" "]
                    var author = element.author[0];
                    //shortAuthor = author.substring(2, author.length - 2);
                    var shortAuthor = author;
                    moml += '    <property name="author" class="ptolemy.kernel.util.StringAttribute" value="' + xmlEscape(shortAuthor) + '">\n' +
                        '    </property>\n';
                }

                if (element.description !== undefined) {
                    moml += '    <property name="description" class="ptolemy.kernel.util.StringAttribute" value="' + xmlEscape(element.description) + '">\n' +
                        '    </property>\n';
                }

                // See ../plugins/accessorJSDocTags.js for how we create
                // the inputs, outputs and parameters arrays.
                // See https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSDocSystems#ModifyJSDocsTemplateFiles
                if (element.inputs !== undefined) {
                    moml += accessorPropertiesToMoML('port', element.inputs);
                }

                if (element.outputs !== undefined) {
                    moml += accessorPropertiesToMoML('port', element.outputs);
                }

                if (element.parameters !== undefined) {
                    moml += accessorPropertiesToMoML('parameter', element.parameters);
                }

                if (element.version !== undefined) {
                    moml += '    <property name="version" class="ptolemy.kernel.util.StringAttribute" value="' +
                        xmlEscape(element.version) + '">\n' +
                        '    </property>\n';
                }

                moml += '</property>';
            }
        });
    writePtDoc(fileName, moml);
};

/** Write moml to a PtDoc file.
 *  @param {string} jsFileName The name of the Javascript file, for
 *  example "Foo.js", which means that the file "FooPtDoc.xml" will be
 *  generated.
 *  @param {string} moml  The moml to be written.
 */
function writePtDoc(jsFileName, moml) {
    var ptDocFileName = jsFileName.substr(0, jsFileName.length - 3) + "PtDoc.xml";
    fs.writeFileSync(ptDocFileName, moml, 'utf8');
    console.log("Writing: " + ptDocFileName);
}


/** Escape html characters for use in XML.
 *  @param {string} bad Bad data
 *  @return text suitable for use in XML.
 */
function xmlEscape(bad) {
    if (bad === undefined) {
        return bad;
    }

    if (typeof bad === 'object') {
        bad = bad.toString();
    }

    return bad.replace(/[\n<>&'"]/g,
        function (c) {
            switch (c) {
            case '\n':
                return '&#10;';
            case '<':
                return '&lt;';
            case '>':
                return '&gt;';
            case '&':
                return '&amp;';
            case '\'':
                return '&apos;';
            case '"':
                return '&quot;';
            }
        });
}
