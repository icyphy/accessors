
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

var server = http.createServer();
server.on('request', function(request, response) {
    console.log('Received request: ' + request.url);
    if (request.method === 'GET') {
        var url = request.url;
        // Strip any leading slashes.
        while (url.substring(0,1) == '/') {
            url = url.substring(1);
        }
        // Strip leading 'accessors/'.
        // This is because the terraswarm.org server serves pages with paths like:
        //    '/accessors/hosts/common/test/TestAccessor.js'
        // but the actual file location is:
        //    '/accessors/web/hosts/common/test/TestAccessor
        // and hence the path should not include any leading '/accessors/'.
        if (url.indexOf('accessors/') == 0) {
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

