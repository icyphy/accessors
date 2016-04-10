
// This is a simple Node.js server that you can run.
// Then point your browser to http://localhost:8080/hosts/browser/test/testWebPage.html
// to open the test file.

// This server will serve files from a base directory three
// levels up from the directory in which this script is located.
// Specifically, the base directory is __dirname/../..,
// where __dirname is the directory where this script is located.

// Only utf-8 encoded files will be served.

var http = require('http');
var fs = require('fs');
var path = require('path');

// Create an object to hold {path : value} pairs from put requests
var putTable = {};

var server = http.createServer();
server.on('request', function(request, response) {
    
    var url = request.url;
    var querystring = "";
    
    // Strip any leading slashes.
    while (url.substring(0,1) == '/') {
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
                fs.readFile(location, 'utf8', function(error, data) {
                    if (error) {
                        response.statusCode = 404;
                        response.end(error.message);
                        return;
                    }
                    response.write(data);
                    response.end();
                });
            } else {
                response.statusCode = 400;
                response.end('File names with .. are not permitted by this server.');
            }
        }
        

    } else {
    	// POST and PUT echo the request body
    	// TODO:  Add support for JSONP  
    	response.statusCode = 200;
    	var data = "";
    	
    	request.on('data', function(chunk) {
    		data = data + chunk;
    	});
    	
    	request.on('end', function () {
        	// For PUT, save body so that future GET requests will get body contents
    		// jQuery sends method as uppercase
        	if (request.method === 'PUT') {
        		putTable[url] = data;
        	}
    		
        	var info = {method : request.method};
        	response.write("Request info: " + JSON.stringify(info) + ", ");
        	response.write("Request body: " + data);
        	response.end();
        	
    	});
    }
});

server.on('error', function(message) {
    console.error(message);
});

console.log('Starting server.');
server.listen(8088, function() {
    console.log('Server listening.');
});

