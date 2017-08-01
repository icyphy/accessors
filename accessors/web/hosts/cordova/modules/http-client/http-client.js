// Below is the copyright agreement for the Ptolemy II system.
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
//
// Ptolemy II includes the work of others, to see those copyrights, follow
// the copyright link on the splash page or see copyright.htm.
/**
 * FIXME: This currently only supports a get request.
 *
 * Module for HTTP clients.
 * Depends on cordova-plugin-http. To install run 
 * <pre>
 * cordova plugin add cordova-plugin-http
 * </pre>
 *
 * Example usage below
 * <pre>
 * httpClient.get({
 *      trustAll: true,
 *      url: "https://www.google.com"
 *  },
 *  function(data) {
 *      MobileLog(data);
 *  }
 * );
 * </pre>
 * Both http and https are supported.
 *
 * @module http-client
 * @author Hokeun Kim and Matt Weber
 * @version $$Id: http-client.js 75980 2017-04-23 00:19:25Z beth@berkeley.edu $$
 */

var EventEmitter = require('events').EventEmitter;

/** Issue an HTTP get request
 *  The options argument should be a map with the following fields
 *  <ul>
 *  <li> trustAll: Trust all certificates.
 *  <li> url: A string that can be parsed as a URL.
 *  </ul>
 */

exports.get = function (options, responseCallback) {
    if (options.trustAll === true) {
        cordovaHTTP.acceptAllCerts(true, function() {
            console.log('accepting all certs success!');
        }, function() {
            console.log('error :(');
        });

        cordovaHTTP.validateDomainName(false, function() {
            console.log('success!');
        }, function() {
            console.log('error :(');
        });
    }

    console.log('🔗Request to URL');
    cordovaHTTP.get(options.url, {}, {}, function(response) {
        responseCallback(response.data);
        // console.log('Status: ' + response.status);
        // console.log('Data: ' + response.data);
    }, function(response) {
        responseCallback(response.error);
        // console.log('Error: ' + response.error);
        // console.log('Status: ' + response.status);
        // console.log('Data: ' + response.data);
    });
};
