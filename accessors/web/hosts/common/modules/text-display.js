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
//
// Ptolemy II includes the work of others, to see those copyrights, follow
// the copyright link on the splash page or see copyright.htm.

/**
 * Module to display text.
 * This basic implementation just prints to the console.
 * Each line is prefixed with the title and a colon, space.
 *
 * @module @accessors-modules/text-display
 * @author Edward A. Lee
 * @version $$Id$$
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*globals actor, Java, exports, require, util */
/*jshint globalstrict: true*/
"use strict";

// Note that the text-display module is common to all hosts, so it is
// found at accessors/web/hosts/common/modules/text-display.js.

// For example, the Node host has a symbolic link:The

// bash-3.2$ ls -ld ./web/node_modules/@accessors-modules
// lrwxr-xr-x  1 cxh  staff  23 Dec 13 17:38 ./web/node_modules/@accessors-modules -> ../hosts/common/modules

// The AccessorSSHCodeGenerator may expect to install
// the @accessor-modules/text-display module.  This module was
// uploaded to npm by creating a text-display subdirectory, creating
// the package.json file with

// accessors/web/hosts/node/bin/mkPackageJson hosts/common/modules/text-display 

// editing the hosts/common/modules/text-display/package.json and then
// uploading to npm as per accessors/web/README.md.

exports.TextDisplay = function (title) {
    this.title = title;
};

/** Display text.
 *  @param text The text.
 */
exports.TextDisplay.prototype.displayText = function (text) {
    console.log(this.title + ': ' + text);
};

/** Append text to any text already displayed starting on a new line.
 *  @param text The text.
 */
exports.TextDisplay.prototype.appendText = function (text) {
    console.log(this.title + ': ' + text);
};
