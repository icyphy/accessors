This directory contains a test server and a test web page for the browser swarmlet host.

To run the test, first run the test server in the home directory of the accessors repo.
The directory from which the server runs determines what files it will serve.
This test server will serve any files in the accessors repo.

> cd ../../..
> node hosts/browser/test/testServer.js &

(e.g. cd $PTII/org/terraswarm/accessor/accessors/web/hosts/browser ).

Then, point your favorite browser to

  http://localhost:8080/hosts/browser/test/testWebPage.html

Comments and suggestions to eal@eecs.berkeley.edu.