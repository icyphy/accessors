$Id$

This directory contains a test server and some test web pages for the browser
swarmlet host.

To run the test, first run the test server on your local host from
this directory (accessors/web/hosts/browser/test):

  node testServer.js &

Then point your browser to test HTML files on the localhost, as
detailed below.

1) For a simple test web page, point your favorite browser to

  http://localhost:8088/hosts/browser/test/testWebPage.html
  
2) For a more elaborate page where you can instantiate all accessors in the library,
point your browser to:

  http://localhost:8088/hosts/browser/test/testAccessorDirectory.html
  
The test library there is particularly useful for testing.

3) Other tests in this directory:

  http://localhost:8088/hosts/browser/test/httpClient/testCORS.html
  http://localhost:8088/hosts/browser/test/httpClient/testJSONP.html
  http://localhost:8088/hosts/browser/test/httpClient/testREST.html
  http://localhost:8088/hosts/browser/test/httpClient/testStockTick.html
  http://localhost:8088/hosts/browser/test/httpClient/testWeather.html
  
The testWeather.html page requires keys to access online geocoder and weather
services.  See keys.README.txt.

This test server will serve any files in the accessors repo that are referenced
using '/accessors/...'.  You can also reference accessors by their standard names,
e.g. 'net/REST'. Start the server in this directory, so that it can find the root
accessors directory at ../../../

Documentation
=============

To get the documentation for the accessors, you may need to generate the documentation
in your local copy of the accessors repo:

 cd ../../..
 ant

If you don't have a copy of the accessors repo (then you probably can't see this file),
you can get it using:

 svn co https://repo.eecs.berkeley.edu/svn/projects/terraswarm/accessors/trunk/accessors
  
Comments and suggestions to eal@eecs.berkeley.edu.
