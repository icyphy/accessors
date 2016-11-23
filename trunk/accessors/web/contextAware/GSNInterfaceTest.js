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

/** The interface specification of a global sensor network service (GSN).
 *
 *  @author Anne H. Ngu (angu@btxstate.edu)
 *  @parameter {string} ipAddress The host url, ex: 'http://localhost'
 *  @parameter {port} port The port of host url, ex: 80
 *  @parameter {string} username The login account name for the service.
 *  @parameter {string} password  The password for the login account.
 *  @version $$Id$$
 */
// Stop extra messages from jslint and jshint.  Note that there should be no
// space between the / and the * and global. See https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSHint */
/*global exports, parameter*/
/*jshint globalstrict: true*/
"use strict";

exports.setup = function () {
    this.parameter('host', {
        'type': 'string',
        'value': 'localhost'
    });
    this.parameter('port', {
        'type': 'int',
        'value': 80
    });
    this.parameter('protocol', {
        'type': 'string',
        'value': 'http'
    });
    this.parameter('path', {
        'type': 'string',
        'value': 'gsn'
    });
    this.parameter('username', {
        'type': 'string',
        'value': 'admin'
    });
    this.parameter('password', {
        'type': 'string',
        'value': ''
    });
    this.parameter('method', {
        'type': 'string',
        'value': 'GET'
    });
};
