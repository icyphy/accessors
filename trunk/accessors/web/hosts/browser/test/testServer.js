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
// This is a simple Node.js server that you can run.
// Then point your browser to http://localhost:8080/hosts/browser/test/testWebPage.html
// to open the test file.

// This server will serve files from a base directory three
// levels up from the directory in which this script is located.
// Specifically, the base directory is __dirname/../..,
// where __dirname is the directory where this script is located.

// Only utf-8 encoded files will be served.

// Optionally, specify a port number, for example:
// node testServer.js 8082

var http = require('http');
var fs = require('fs');
var path = require('path');

// Create an object to hold {path : value} pairs from put requests
var putTable = {};

var port = 8089;

//Check for an optional port number.
//The first element will be 'node', the second element will be the name of the JavaScript file.
//The third element (if present) will be the port number.
if (process.argv.length > 2) {
    port = process.argv[2];
}

var server = http.createServer();
server.on('request', function (request, response) {

    var url = request.url;
    var querystring = "";
    // Strip any leading slashes.
    while (url.substring(0, 1) == '/') {
        url = url.substring(1);
    }

    var index = url.lastIndexOf('?');

    // Extract any querystring parameters
    if (index >= 0) {
        querystring = url.substring(index, url.length);
        url = url.substring(0, index);
    }

    if (request.method === 'GET') {
        // First, check if this url path has an entry in the put table
        // If so, return the contents
        if (putTable.hasOwnProperty(url)) {
            response.statusCode = 200;
            response.write(putTable[url]);
            response.end();
        } else {
            // Otherwise, look for a file

            // This test server may be used to test pages for terraswarm.org.
            // The URLS for these pages have a leading 'accessors/'. Remove it.
            if (url.indexOf('accessors/') === 0) {
                url = url.substring(10);
            }

            // Disallow any ..
            if (url.indexOf('..') < 0) {
                var base = path.join(__dirname, '..', '..', '..');
                var location = path.join(base, url);

                // Check for images.  Used for testing accessors splash screen.
                if (location.indexOf('.jpg') >= 0) {
                    fs.readFile(location, function (error, image) {
                        if (error) {
                            response.statusCode = 404;
                            response.end(error.message);
                            return;
                        }

                        // TODO:  Generalize this.
                        response.writeHead(200, {
                            'Content-Type': 'image/jpg'
                        });
                        response.end(image, 'binary');
                    });
                } else {
                    fs.readFile(location, function (error, data) {
                    	var contentType = 'text/plain; charset=UTF-8';
                    	var periodIndex = location.lastIndexOf('.');
                    	
                    	var extension = "";
                    	
                    	if (periodIndex !== -1) {
                    		extension = location.substring(periodIndex + 1);
                    	}
                    	
                    	if (extension === 'css') {
                    		contentType = 'text/css';
                    	} else if (extension === 'html') {
                    		contentType = 'text/html;charset=UTF-8'
                    	} else if (extension === 'js') {
                    		contentType = 'text/javascript';
                    	} else if (extension === 'xml') {
                    		contentType = 'text/xml';
                    	}
                    	
                        if (error) {
                            response.statusCode = 404;
                            response.end(error.message);
                            return;
                        }
                        
                    	response.writeHead(200, {
                    		'Content-Type': contentType,
                    		'Content-Length': data.length
                    	});
                        response.write(data);
                        response.end();
                    });
                }

            } else {
                response.statusCode = 400;
                response.end('File names with .. are not permitted by this server.');
            }
        }


    } else {
        // POST and PUT echo the request body.
        // POSTs to /regressiontest will write contents to ../../../reports/junit/
        // TODO:  Add support for JSONP
        response.statusCode = 200;
        var data = "";

        request.on('data', function (chunk) {
            data = data + chunk;
        });

        request.on('end', function () {
            // For PUT, save body so that future GET requests will get body contents
            // jQuery sends method as uppercase
            if (request.method === 'PUT') {
                putTable[url] = data;
            }

            var info = {
                method: request.method
            };
            response.write("Request info: " + JSON.stringify(info) + ", ");
            response.write("Request body: " + data);
            response.end();
        });
    }
});

server.on('error', function (message) {
    console.error(message);
    // Signal a port error to the parent process (if any).
    // Used in regressionTestScript.
    if (process.hasOwnProperty('send')) {
        process.send('portError');
    }
});

console.log('Starting server on port ' + port + '.');
server.listen(port, function () {
    console.log('Server listening.');
    if (process.hasOwnProperty('send')) {
        process.send('listening');
    }
});
