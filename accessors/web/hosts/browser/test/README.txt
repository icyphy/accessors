This directory contains a test server and a test web page for the browser swarmlet host.

To run the test, first run the test server.
This test server will serve any files in the accessors repo that are referenced
using '/accessors/...'.

> node testServer.js &

Then, point your favorite browser to

  http://localhost:8080/hosts/browser/test/testWebPage.html

Comments and suggestions to eal@eecs.berkeley.edu.