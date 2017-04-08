// Accessor that outputs the current status of all top-level accessors.
//
// Copyright (c) 2015-2016 The Regents of the University of California.
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

/** Accessor that outputs the current status of all top-level accessors.
 *
 *  Upon receiving an input, this accessor outputs an array of objects,
 *  one for each top-level accessor. Each object has the following fields:
 *  * accessorName: The name of the accessor.
 *  * accessorClass: The class of the accessor, e.g. net/REST.
 *  * initialized: True if the accessor has been initialized and not wrapped up.
 *
 *  This accessor can only be used in a host that allows trusted accessors.
 *  Trusted accessors must have class names beginning with 'trusted/'
 *  and are allowed to invoke the function getTopLevelAccessors() to
 *  obtain access to peer accessors.
 *
 *  FIXME: This is really just a bare minimum starting point. The query
 *  input should be able to specify various operations, such as watching
 *  accessors for their event emissions, timing the execution of accessors,
 *  etc.
 *
 *  @accessor trusted/AccessorStatus
 *  @input query FIXME
 *  @output status FIXME.
 *  @author Edward A. Lee
 *  @version $$Id$$
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*globals console, error, exports, require */
/*jshint globalstrict: true*/
"use strict";

exports.setup = function () {
    this.input('query');
    this.output('status');
};

exports.initialize = function () {
    var self = this;
    this.addInputHandler('query', function () {
        var accessors = this.getTopLevelAccessors();
        var result = [];
        for (var i = 0; i < accessors.length; i++) {
            result.push({
                'accessorName': accessors[i].accessorName,
                'accessorClass': accessors[i].accessorClass,
                'initialized': accessors[i].initialized,
            });
        }

        console.log('FIXME ' + result);
        this.send('status', result);
    });
};
