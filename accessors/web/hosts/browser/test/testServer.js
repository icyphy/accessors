
// This is a simple Node.js server that you can run.
// Then point your browser to http://localhost:8080/test.html
// to open the test file.

// This server will serve files in the same directory or
// any subdirectory from which it is started.
// Only utf-8 encoded files will be served.

var http = require('http');
var fs = require('fs');

var server = http.createServer();
server.on('request', function(request, response) {
    console.log('Received request: ' + request.url);
    if (request.method === 'GET') {
        var url = request.url;
        // Strip any leading slashes.
        while (url.substring(0,1) == '/') {
            url = url.substring(1);
        }
        // Disallow any ..
        if (url.indexOf('..') < 0) {
            fs.readFile(url, 'utf-8', function(error, data) {
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
    } else {
        response.statusCode = 400;
        response.end('This server only honors GET requests.');
    }
});

server.on('error', function(message) {
    console.error(message);
});

console.log('Starting server.');
server.listen(8080, function() {
    console.log('Server listening.');
});

