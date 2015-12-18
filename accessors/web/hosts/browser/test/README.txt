This directory contains a test server and a test web page for the browser swarmlet host.

To run the test, first run the server from one directory up.
The directory from which the server runs determines what files it will serve.
It will serve files in the directory in which it runs and in any subdirectory.

> cd ..
> node test/testServer.js &

(e.g. cd $PTII/org/terraswarm/accessor/accessors/web/hosts/browser ).

Then, point your favorite browser to

  http://localhost:8080/test/testWebPage.html

Comments and suggestions to eal@eecs.berkeley.edu.