$Id$

This directory contains a test server and a test web page for the browser swarmlet host.

To run the test, first run the test server.
This test server will serve any files in the accessors repo that are referenced
using '/accessors/...'.  You can also reference accessors by their standard names,
e.g. 'net/REST'. Start the server in this directory, so that it can find the root
accessors directory at ../../../

> node testServer.js &

For a simple test web page, point your favorite browser to

  http://localhost:8088/hosts/browser/test/testWebPage.html
  
For a more elaborate page where you can instantiate all accessors in the library,
point your browser to:

  http://localhost:8088/hosts/browser/test/testAccessorDirectory.html
  
The test library there is particularly useful for testing.

To get the documentation for the accessors, you may need to generate the documentation
in your local copy of the accessors repo:

> cd ../../..
> ant

If you don't have a copy of the accessors repo (then you probably can't see this file),
you can get it using:

> svn co https://repo.eecs.berkeley.edu/svn/projects/terraswarm/accessors/trunk/accessors
  
Comments and suggestions to eal@eecs.berkeley.edu.
