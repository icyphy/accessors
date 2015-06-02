See [http://www.terraswarm.org/accessors](http://www.terraswarm.org/accessors)

Terraswarm Accessors
===================

Accessors, described in the paper, [A Vision of Swarmlets](http://www.terraswarm.org/pubs/332.html)
are actors that provide access to a (typically remote) service, sensor, or actuator. An accessor is instantiated by an
**accessor host** or **swarmlet host**, which is a program or browser script. The host uses the accessor as if it were a local
source and/or sink for data and/or commands.
An accessor host is to the Internet of Things what a browser is to the Internet.
It renders a remote service by locally executing a proxy for that service.

doc/jsdoc
---------
The doc/jsdoc/ directory contains html created by jsdoc.

To update the docs by hand, run
  ant jsdoc

An automated build on terra.eecs.berkeley.edu updates the docs as necessary.

This file may be found at accessors/web/README.md

$Id$
