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
/** Exec starts a shell command and connects to the process' stdin and stdout.
 * This accessor implements an interface to the shell of the host. It takes a
 * command and starts it as a process. It connects the process' stdin and
 * stdout to the accessor ports with the same name.
 * FIXME: Provide a selection of shells (e.g., bash, awk, etc)
 *
 *  @accessor utilities/Exec
 *  @author Armin Wasicek (arminw@berkeley.edu)
 *  @input {string} stdin The stdin of the executing process. A token received on this
 *        port is interpreted as a line entered in stdin of the process.
 *  @output {string} stdout The stdout of the executing process. Each line read from the
 *        executing process is sent out as a token from this port.
 *  @parameter {string} command The command to be executed.
 *  @version $$Id$$
 */

// Stop extra messages from jslint and jshint.  Note that there should be no
// space between the / and the * and global. See https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSHint */
/*globals addInputHandler, exports, get, input, output, require, send */
/*jshint globalstrict: true*/
"use strict";

// This accessor requires the 'shell' module, which may or may
// not be provided by an accessor host. As this is a very powerful
// module, not all host may provide this module for security reasons.
var shell = require('shell/shell');

/** Global object to the shell module provided by the host. */
var sh = null;

/** Set up the accessor by defining the inputs and outputs.
 */
exports.setup = function () {
    this.input('stdin', {
        'type': 'string'
    });
    this.output('stdout', {
        'type': 'string'
    });
    this.input('command', {
        'value': 'ls',
        'type': 'string'
    });
};

/** Initialize the accessor and start the process subsequently.
 */
exports.initialize = function () {
    sh = new shell.Shell({
        'cmd': this.get('command')
    });

    var self = this;

    this.addInputHandler('stdin', function () {
        var data = self.get('stdin');
        if (data) {
            sh.write(data);
        }
    });

    sh.on('message', function (data) {
        if (data) {
            self.send('stdout', data.toString());
        }
    });

    sh.start();
};

/** Wrap up the execution of the accessor by stopping the process.
 */
exports.wrapup = function () {
    if (sh) {
        sh.wrapup();
    }
};
