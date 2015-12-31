$Id$

This directory contains a test server and a test web page for the browser swarmlet host.

To run the test, first run the test server.
This test server will serve any files in the accessors repo that are referenced
using '/accessors/...'.  You can also reference accessors by their standard names,
e.g. 'net/REST'.

> node testServer.js &

For a simple test web page, point your favorite browser to

  http://localhost:8080/hosts/browser/test/testWebPage.html
  
For a more elaborate page where you can instantiate all accessors in the library,
point your browser to:

  http://localhost:8080/hosts/browser/test/testAccessorDirectory.html
  
The test library there is particularly useful for testing.
  
Comments and suggestions to eal@eecs.berkeley.edu.
