// Accessor that gets a resource
//
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

/** Get a resource, which may be a relative file name or a URL, and return the
 *  value of the resource as a string.
 *
 *  Implementations of this function may restrict the locations from which
 *  resources can be retrieved. This implementation restricts relative file
 *  names to be in the same directory where the swarmlet model is located or
 *  in a subdirectory, or if the resource begins with "$CLASSPATH/", to the
 *  classpath of the current Java process.
 *
 *  If the accessor is not restricted, the $KEYSTORE is resolved to
 *  $HOME/.ptKeystore.
 *
 *  The options parameter may have the following values:
 *  * If the type of the options parameter is a Number, then it is assumed
 *    to be the timeout in milliseconds.
 *  * If the type of the options parameter is a String, then it is assumed
 *    to be the encoding, for example "UTF-8".  If the value is "Raw" or "raw"
 *    then the data is returned as an unsigned array of bytes.
 *    The default encoding is the default encoding of the system.
 *    In CapeCode, the default encoding is returned by Charset.defaultCharset().
 *  * If the type of the options parameter is an Object, then it may
 *    have the following fields:
 *  ** encoding {string} The encoding of the file, see above for values.
 *  ** timeout {number} The timeout in milliseconds.
 *
 *  If the callback parameter is not present, then getResource() will
 *  be synchronous read like Node.js's
 *  {@link https://nodejs.org/api/fs.html#fs_fs_readfilesync_path_options|fs.readFileSync()}.
 *  If the callback argument is present, then getResource() will be asynchronous like
 *  {@link https://nodejs.org/api/fs.html#fs_fs_readfile_path_options_callback|fs.readFile()}.

 *  @accessor util/GetResource
 *  @input options Options passed to the getResources() function, see above
 *  for details.
 *  @input resource {string} The file or URL to be read.  Defaults to
 *  the Accessors home page (http://accessors.org).
 *  @input trigger {boolean} Send a token to this input to read the
 *  file or URL.
 *  @parameter synchronous {boolean} Perform a synchronous or asynchronous call of getResource.
 *  Note some hosts do not currently implement both versions.
 *  @output output The contents of the file or URL.
 *  @author Edward A. Lee, Matt Weber
 *  @version $$Id$$
 */

// Stop extra messages from jslint.  Note that there should be no
// space between the / and the * and global.
/*globals clearInterval, exports, require, setInterval */
/*jshint globalstrict: true*/
"use strict";

exports.setup = function () {
    this.input('options', {
        'type': 'JSON',
        'value': ''
    });
    this.input('resource', {
        'type': 'string',
        'value': ''
    });
    this.input('trigger');
    this.parameter('synchronous', {
        'type': 'boolean',
        'value': true
    });

    this.output('output');
};
exports.initialize = function () {
    var self = this;
    this.setDefault('resource', '');

    //To prevent out of order responses for asynchronous getResource calls,
    //maintain a queue of requests.

    //The idea is each new (asynchronous) input to this accessor produces a Request which gets
    //inserted into the requests queue and started. When a request anywhere in the
    //queue is completed, it marks itself as complete and attempts to dequque all
    //complete requests from the front of the queue in order.
    var requests = [];

    this.addInputHandler('trigger', function () {
        console.log('*******PARAMETERIZED BLOCKING is triggered!');
        var resourceValue = this.get('resource');
        if(resourceValue){
            if(this.getParameter('synchronous')){
                //FIXME: Not every host has both an asynchronous or synchronous implementation
                var resourceContents = getResource(this.get('resource'), this.get('options'), null);
                var paramaterizedAccessor = { "accessor": resourceContents,
                    "parameterMap": { "componentID": "parkingComponent" },
                    "inputMap": {}
                };
                self.send('output', paramaterizedAccessor);
            } else {
                var incomingRequest = new Request(this.get('resource'), this.get('options'));
                requests.push(incomingRequest);
                incomingRequest.start();
            }
        }    
    });

    function Request(resource, options){
        var thiz = this;

        //Initially false, but set to true when status and value are available
        this.complete = false;
        this.produceOutput = function(){
            if(thiz.status != null){
                error(thiz.status);
            } else {
                var paramaterizedAccessor = { "accessor": thiz.value,
                    "parameterMap": { "componentID": "parkingComponent" },
                    "inputMap": {}
                };
                self.send('output', paramaterizedAccessor);
            }
    };
    this.start = function(){
        getResource(resource, options,
            function(status, value){
                thiz.status = status;
                thiz.value = value;
                thiz.complete = true;

                //Dequeue all complete requests from the front of the queue
                while(requests.length > 0 && requests[0].complete){
                    requests.shift().produceOutput();
                }
            });
        };
    }
};

