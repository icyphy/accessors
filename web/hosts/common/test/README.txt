$Id$

This directory contains a test script for code that is common among
swarmlet hosts. This code should run in any JavaScript environment.
To run the test in Node.js, just do this:

  node testCommon.js

To run all the tests, first install mocha:

  sudo npm install -g mocha

The cd to the top level accessors directory and run:

  ant tests

Comments and suggestions to eal@eecs.berkeley.edu.
These tests use accessors in the test library only.
