// Copyright (c) 2016-2017 The Regents of the University of California.
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

/** Obtain a labeled location from a WiFi fingerprint using a FIND server.
 *  
 *  Additional documentation for the FIND API is at https://www.internalpositioning.com/api/
 *  The basic unit in FIND for a map or a set of users is a group.
 *  This accessor will only work if the group is set to the same string as used
 *  in training.
 *  
 *  The username input provides a consistent label for a user who wishes to be
 *  tracked by the FIND server. If you don't care about tracking, the default value
 *  is fine.
 *  
 *  The wifi-fingerprint input should be a JSON array of the form
 *  "wifi-fingerprint":[
 *    {
 *       "mac":"AA:AA:AA:AA:AA:AA",
 *       "rssi":-45
 *    },
 *    {
 *       "mac":"BB:BB:BB:BB:BB:BB",
 *       "rssi":-55
 *   }
 *  ]
 *
 *  
 *  Documentation for setting up a FIND (FRAMEWORK FOR INTERNAL NAVIGATION AND DISCOVERY)
 *  server is available at https://www.internalpositioning.com/server/. The default parameters
 *  for this accessor connect to a server on terra.eecs.berkeley.edu. The developers for the
 *  FIND project also manage a publicly available server at https://ml.internalpositioning.com.
 *  
 *
 *  @accessor services/FINDLocation
 *  @input {JSON} wifiFingerprint An array of RSSI values for accesspoint mac addresses. Triggers a request to the FIND server.
 *  See format above.
 *  @input {string} server The address of the FIND server.
 *  @input {integer} port The port for the FIND server.
 *  @input {string} group The group corresponding to the set of users and training data to be used for localization.
 *  @input {string} username The username this user will have associated with the history of their positions on the
 *  server. This value only matters if you are interested in tracking users on the server.
 *  @output {string} location The location estimate corresponding to the wifiFingerprint, for example "Office 123".
 *  This value will be set to null if the location could not be found.
 *  @output {JSON} response An object containing the full response from the FIND server.
 *  @author Matt Weber
 *  @version $$Id: GeoCoder.js 1804 2017-06-02 19:23:00Z cxh $$
 */

// Stop extra messages from jslint and jshint.  Note that there should
// be no space between the / and the * and global. See
// https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSHint */
/*globals addInputHandler, console, get, getParameter, getResource, error, exports, extend, get, input, output, parameter, require, send */
/*jshint globalstrict: true*/
'use strict';

/** Set up the accessor by defining the inputs and outputs.
 */
exports.setup = function () {
    this.extend('net/REST');

    //inputs
    this.input('server', {
        "type": 'string',
        "value": 'terra.eecs.berkeley.edu'
    });
    this.input('port', {
        "type": 'int',
        "value": 8091
    });
    this.input('wifiFingerprint',{
        "type": 'JSON'
    });
    this.input('group', {
        "type": 'string',
    });
    this.input('username', {
        "type": 'string'
    });

    //outputs
    this.output('location',{
        "type": 'string'
    });


    // Change default values of the base class inputs.
    // Also, hide base class inputs, except trigger.
    // Note the need for quotation marks on the options parameter.
    this.input('options', {
        'visibility': 'expert',
    });
    this.input('command', {
        'visibility': 'expert',
        'value': 'track'
    });

    this.input('arguments', {
        'visibility': 'expert'
    });
    this.input('body', {
        'visibility': 'expert'
    });
    this.input('trigger', {
        'visibility': 'expert'
    });
    this.output('headers', {
        'visibility': 'expert'
    });
    this.output('status', {
        'visibility': 'expert'
    });
    this.parameter('outputCompleteResponseOnly', {
        'visibility': 'expert'
    });
};

exports.initialize = function () {
    // Be sure to call the superclass so that the trigger input handler gets registered.
    exports.ssuper.initialize.call(this);

    var self = this;

    // Handle location information.
    this.addInputHandler('wifiFingerprint', function () {
        var wifiFingerprint = this.get('wifiFingerprint');
        var group = this.get('group');
        var username = this.get('username');
        if (wifiFingerprint && group && username) {
            var options = {
                "method": "POST",
                "url": {
                    "host": self.get('server'),
                    "protocol": "http",  //FIXME, make https work
                    "port": self.get('port')
                }
            };

            var body = {
                "group": group,
                "username": username,
                "wifi-fingerprint": wifiFingerprint
            };

            self.send('options', JSON.stringify(options));
            self.send('body', JSON.stringify(body));
            self.send('trigger', true);
        } else {
            throw 'FINDLocation: At least one of {wifiFingerprint, group, username} has not been set.';
        }
    });
};


/** Filter the response, extracting the addresses 
 */
exports.filterResponse = function (response) {
    if (response) {
        // Note that for some hosts, the response is a string, needing to parsed,
        // and for some, its already been parsed.
        var parsed = response;
        if (typeof parsed === 'string') {
            try {
                parsed = JSON.parse(response);
            } catch (err) {
                error('FINDLocation: Unable to parse response: ' + err.message +
                    '\nResponse was: ' + response);
                // So that downstream actors don't just a previous location, send null.
                this.send('location', null);
            }
        }

        // NOTE: All of the following should be replaced with a generic
        // schema transformation utility.
        // FIXME: Just taking the first result if there are multiple matches.
        if (parsed.location && parsed.success)  {
            this.send('location', parsed.location);
        } else {
            error('FINDLocation: Could not determine location for wifiFingerprint.');
            // So that downstream actors don't just a previous location, send null.
            this.send('location', null);
        }
    }
    return response;
};
