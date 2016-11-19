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

/** An accessor for a Foscam camera. The commands that this accessor supports are:
 *  1.  *snapshot*: Take a picture and produce it on the '''response''' output.
 *  1.  *videostream*: Output a video stream.
 *  1.  *center*: Center the camera. This will pan to find the center.
 *  1.  *down*: Move the camera down.
 *  1.  *left*: Move the camera left.
 *  1.  *right*: Move the camera left.
 *  1.  *up*: Move the camera left.
 *  For the last four motion command commands, you can specify an argument
 *  'degree' in the arguments object to move a specified number of degrees.
 *  If no degree argument is given, the camera will move as far as it can in
 *  the specified direction, or until you give it a stop command:
 *  1.  *stop down*
 *  1.  *stop left*
 *  1.  *stop right*
 *  1.  *stop up*
 *  The following commands start and stop continual panning of the camera:
 *  1.  *horizontal patrol*
 *  1.  *vertical patrol*
 *  1.  *stop horizontal patrol*
 *  1.  *stop vertical patrol*
 *
 *
 *  If you select *videostream* then you can specify 'resolution' and 'rate'
 *  options.  FIXME: Make more user friendly versions of these.
 *  resolution = 8 specifies 320*240. rate=15 specifies 1fps.
 *  NOTE: The videostream selection appears to not actually work.
 *  It has been known to produce a frame or two, but it needs further work.
 *
 *  The <i>options</i> input can be a string URL
 *  or an object with the following fields:
 *
 *  1. '''headers''': An object containing request headers. By default this
 *    is an empty object. Items may have a value that is an array of values,
 *    for headers with more than one value.
 *  1. '''keepAlive''': A boolean that specified whether to keep sockets around
 *    in a pool to be used by other requests in the future. This defaults to false.
 *  1. '''method''': A string specifying the HTTP request method.
 *    This defaults to 'GET', but can also be 'PUT', 'POST', 'DELETE', etc.
 *  1. '''url''': A string that can be parsed as a URL, or an object containing
 *    the following fields:
 *    * '''host''': A string giving the domain name or IP address of
 *    the server to issue the request to. This defaults to 'localhost'.
 *    * '''protocol''': The protocol. This is a string that defaults to 'http'.
 *    * '''port''': Port of remote server. This defaults to 80. 
 *
 *
 *  This accessor has been tested with a Foscam NVision F18910W only.
 *  The (rather poor) documentation for the camera API can be found here:
 *  http://www.foscam.es/descarga/ipcam_cgi_sdk.pdf.
 *  The design of this accessor is inspired by the "foscam" module for
 *  Node.js, found at https://github.com/fvdm/nodejs-foscam.
 * 
 *  @accessor cameras/Foscam
 *  @author Edward A. Lee (eal@eecs.berkeley.edu)
 *  @input {JSON} options The specification for the URL, as defined above.
 *  @input {string} command The command.
 *  @input {JSON} arguments Arguments to the command.
 *  @input trigger An input to trigger the command.
 *  @output {string} response The server's response.
 *  @output {int} status The status code of the response.
 *  @output {JSON} headers The headers sent with the response.
 *  @extends net.REST
 *  @version $$Id$$ 
 */

// Stop extra messages from jslint and jshint.  Note that there should be no
// space between the / and the * and global. See https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSHint */
/*global console, exports, extend, get, input, parameter, require */
/*jshint globalstrict: true*/
"use strict";

var querystring = require('querystring');

/** Define inputs and outputs. */
exports.setup = function () {
    this.extend('net/REST');
    this.input('command', {
        'type':'string',
        'value':'snapshot',
        'options':[
            'snapshot',
            'videostream',
            'center',
            'down',
            'left',
            'right',
            'up',
                    'stop down',
                    'stop left',
                    'stop right',
            'stop up',
            'horizontal patrol',
                    'vertical patrol',
                    'stop vertical patrol',
                    'stop horizontal patrol'
        ]});
    // Provide parameters for username and password.
    this.parameter('username', {'value':'admin', 'type':'string'});
    this.parameter('password', {'value':'', 'type':'string'});
};

// Alternate command to use, for example to stop the camera.
var alternateCommand;

/** Override the base class to construct the path for the URL from.
 *  more user-friendly descriptions of the command.
 */
exports.encodePath = function() {
    var command;
    if (!alternateCommand) {
        command = this.get('command');
    }
    var code = -1;
    switch(command) {
                case 'up':                      code = 0; break;
                case 'stop up':                 code = 1; break;
                case 'down':                    code = 2; break;
                case 'stop down':               code = 3; break;
                case 'left':                    code = 4; break;
                case 'stop left':               code = 5; break;
                case 'right':                   code = 6; break;
                case 'stop right':              code = 7; break;
                case 'center':                  code = 25; break;
                case 'vertical patrol':         code = 26; break;
                case 'stop vertical patrol':    code = 27; break;
                case 'horizontal patrol':       code = 28; break;
                case 'stop horizontal patrol':  code = 29; break;
                // FIXME: No idea what the following mean, so not offerred above.
                case 'io output high':          code = 94; break;
        case 'io output low':           code = 95; break;
        }
        var encodedArgs = 'user=' + this.get('username') + '&pwd=' + this.get('password');
        if (code >= 0) {
            command = 'decoder_control';
            encodedArgs += '&command=' + code;
        }
    var additionalArgs = querystring.stringify(this.get('arguments')).trim();
    if (additionalArgs !== "") {
        encodedArgs += '&' + additionalArgs;
    }
    var result = command + '.cgi?' + encodedArgs;
    console.log(result);
    return result;
};

/** Upon wrapup, attempt to stop the camera videostream.  */
exports.wrapup = function () {
    exports.ssuper.wrapup.call(this);
    // Assume any command will work to stop the stream.
    alternateCommand = 'stop up';
    // No need to specify a callback.
    this.exports.issueCommand.call(this);
};
