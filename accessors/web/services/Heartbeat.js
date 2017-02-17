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
 *  @accessor services/Heartbeat
 *  @author Christopher Brooks, based on heartbeat.js by Marten Lohstroh.
 *  @version $$Id$$
 *  @input {string} ipAddress The IP address of the host
 */

// Stop extra messages from jslint and jshint.  Note that there should
// be no space between the / and the * and global. See
// https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSHint */
/*globals addInputHandler, get, error, exports, extend, get, input, output, parameter, require, send */
/*jshint globalstrict: true*/
'use strict';

var http = require('httpClient');

// FIXME: We need to figure out how to access the key without checking
// it in to the public repo.

//var key = fs.readFileSync('key', 'utf8').trim();
// Get the key from swarmbox/heartbeat/key
// See https://www.terraswarm.org/testbeds/wiki/Main/SwarmboxGitRepo

// To download the repo using a repo.eecs.berkeley.edu username and
// password (possibly different than your terraswarm website username
// and password):
//
//   git clone https://repo.eecs.berkeley.edu/git/projects/terraswarm/swarmbox.git
// If you uploaded your SSH key to repo.eecs, then use:
//
//   git clone repoman@repo.eecs.berkeley.edu:projects/terraswarm/swarmbox.git

var key = "xxxxx";

function Heartbeat() {
    var heartbeat = {};
    heartbeat.pingMothership = function () {
        console.log("HeartBeat: pingMothership");
        var config = {};
        config.hostname = "moog.eecs.berkeley.edu";
        var configString = JSON.stringify(config);
        var headers = {
            'Content-Type' : 'application/json',
            'Content-Length' : configString.length
        };

        var url = {
            host : 'terra.eecs.berkeley.edu',
            port : 8088,
            path : '/check-in?key=' + key,
            protocol: 'https'
        }
        var options = {
            url : url,
            method : 'POST',
            headers : headers,
            rejectUnauthorized : false,
            body: configString
            // We're using a self-signed certificate at the moment.
        };

        // Prepare request handler.
        var req = http.request(options, function(res) {
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
        
        req.on('error', function(e) {
            console.log('Request problem: Unable to check in with server: ' + e);
        });

    }

    return heartbeat;
}

/** Set up the accessor by defining the inputs and outputs.
 */
exports.setup = function () {
    this.input('ipAddress', {type: "string"});
    this.input('trigger', {'type': 'number'});

};

/** Initialize the accessor by attaching an input handler to the *symbol* input. */
exports.initialize = function () {
    this.heartbeat = Heartbeat.call(this);
    this.addInputHandler('ipAddress', this.heartbeat.pingMothership);
};
