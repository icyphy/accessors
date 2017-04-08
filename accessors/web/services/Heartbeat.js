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

/** Send a heartbeat to a mothership monitoring web server.
 *
 * This accessor is not of much use because it requires the Mothership
 * server, which is not yet available.
 *
 * The Mothership server require a key string from the Heartbeat client.
 *
 * This accessor looks for key in $KEYSTORE/heartbeatKey, which
 * resolves to $HOME/.ptKeystore/heartbeatKey.
 *
 * The key is found in the swarmbox git repo, which not public.
 * Look for swarmbox/heartbeat/key
 * See https://www.terraswarm.org/testbeds/wiki/Main/SwarmboxGitRepo
 *
 * To download the repo using a repo.eecs.berkeley.edu username and
 * password (possibly different than your terraswarm website username
 * and password):
 *
 *   git clone https://repo.eecs.berkeley.edu/git/projects/terraswarm/swarmbox.git
 *
 * If you uploaded your SSH key to repo.eecs, then use:
 *
 *   git clone repoman@repo.eecs.berkeley.edu:projects/terraswarm/swarmbox.git
 *
 *  @accessor services/Heartbeat
 *  @author Christopher Brooks, based on heartbeat.js by Marten Lohstroh.
 *  @version $$Id$$
 *  @input {string} ipAddress The IP address of the host
 */

// Stop extra messages from jslint and jshint.  Note that there should
// be no space between the / and the * and global. See
// https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSHint */
/*globals addInputHandler, console, error, exports, extend, get, getResource, input, output, parameter, require, send */
/*jshint globalstrict: true*/
'use strict';

var http = require('httpClient');
var os = require('os');

// Mothership expects the Heartbeat clients to use a key.
var key = '';

function Heartbeat() {
    var heartbeat = {};
    heartbeat.pingMothership = function () {
        console.log("HeartBeat: pingMothership");
        var config = {};
        config.hostname = os.hostname();
        config.timestamp_sent = Math.floor(new Date()); // in ms
        var configString = JSON.stringify(config);
        var headers = {
            'Content-Type': 'application/json',
            'Content-Length': configString.length
        };

        var url = {
            host: 'terra.eecs.berkeley.edu',
            port: 8088,
            path: '/check-in?key=' + key,
            protocol: 'https'
        };
        var options = {
            url: url,
            method: 'POST',
            headers: headers,
            rejectUnauthorized: false,
            body: configString
                // We're using a self-signed certificate at the moment.
        };

        // Prepare request handler.
        var req = http.request(options, function (res) {
            if (res === null) {
                console.log("Heartbeat.pingMothership: request handler: res == null");
                return;
            }
            console.log("Heartbeat.pingMothership: request handler: res = " + res);
            // //res.setEncoding('utf-8');
            // var responseString = '';
            // // Receive a response.
            // res.on('data', function(data) {
            //     responseString += data;
            // });

            // res.on('end', function() {
            //     //console.log(responseString);
            //     //console.log('Checked in...');
            // });

            // res.on('error', function(e) {
            //     console.log('Unable to check in with server: ' + e);
            // });
        });

        // Issue request.
        // httpClient does this for us because the body is in the options.
        //req.write(configString);
        req.end();

        req.on('error', function (e) {
            console.log('Request problem: Unable to check in with server: ' + e);
        });

    };

    return heartbeat;
}

/** Set up the accessor by defining the inputs and outputs.
 */
exports.setup = function () {
    this.input('ipAddress', {
        type: "string"
    });

    // See the accessor comment for how to get the key.
    var keyFile = '$KEYSTORE/heartbeatKey';
    try {
        key = getResource('$KEYSTORE/heartbeatKey', 1000).trim();
    } catch (e) {
        console.log('Heartbeat: Could not get ' + keyFile + ":  " + e +
            '\nThe key is not public, so this accessor is only useful ' +
            'If you have the key.  See ' +
            'https://www.icyphy.org/accessors/library/index.html?accessor=services.Heartbeat');
        key = 'ThisIsNotAPipeNorIsItAWorkingKeySeeTheHeartbeatAccessorDocs';
    }
};

/** Initialize the accessor by attaching an input handler to the
 *  the *ipAddress* input.
 */
exports.initialize = function () {
    this.heartbeat = Heartbeat.call(this);
    this.addInputHandler('ipAddress', this.heartbeat.pingMothership);
};
