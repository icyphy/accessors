Terraswarm Accessors
===================

Accessors, described in the paper, [A Vision of Swarmlets](http://www.terraswarm.org/pubs/332.html)
are actors that provide access to a (typically remote) service, sensor, or actuator. An accessor is instantiated by an
**accessor host** or **swarmlet host**, which is a program or browser script. The host uses the accessor as if it were a local
source and/or sink for data and/or commands.
An accessor host is to the Internet of Things what a browser is to the Internet.
It renders a remote service by locally executing a proxy for that service.

This work was supported in part by the TerraSwarm Research Center, one
of six centers supported by the STARnet phase of the Focus Center
Research Program (FCRP) a Semiconductor Research Corporation program
sponsored by MARCO and DARPA.

See Also
--------
* [TerraSwarm Accessors Main Page](http://www.terraswarm.org/accessors)
* [Ptolemy JS Module Documentation](https://chess.eecs.berkeley.edu/ptexternal/src/ptII/doc/codeDoc/js/index.html)


How to update index.json
------------------------
index.json lists all of the accessors, which are all the files [A-Z]*.js [A-Z]*.xml.

To update index.json, run

./updateIndex


How to update the jsdoc output
------------------------------

The doc/jsdoc/ directory contains html created by jsdoc.

To update the docs by hand, run
  ant jsdoc

An automated build on terra.eecs.berkeley.edu updates the docs by checking the accessors repo every 5 minutes.

See [https://www.terraswarm.org/accessors/wiki/Main/JSDoc](https://www.terraswarm.org/accessors/wiki/Main/JSDoc).

This file may be found at accessors/web/README.md and is included in the JSDoc output automatically because accessors/web/build.xml is invoked with -R README.md

$Id$
