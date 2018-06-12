Accessors
===================

See [http://accessors.org](http://accessors.org) for more information. 

Below is a portion of that website.


<b>Accessors</b> are a technology for making the Internet of Things accessible
to a broader community of citizens, inventors, and service providers through open
interfaces, an open community of developers, and an open repository of technology.
Accessors enable composing heterogeneous devices and services in the Internet of Things (IoT).

Accessors, described in the paper, [A Vision of Swarmlets](http://www.terraswarm.org/pubs/332.html)
are actors that provide access to a (typically remote) service, sensor, or actuator. An accessor is instantiated by an
**accessor host** or **swarmlet host**, which is a program or browser script. The host uses the accessor as if it were a local
source and/or sink for data and/or commands.
An accessor host is to the Internet of Things what a browser is to the Internet.
It renders a remote service by locally executing a proxy for that service.

This work was supported in part by the [TerraSwarm Research Center](https://www.terraswarm.org),
one of six centers supported by the STARnet phase of the Focus Center
Research Program (FCRP) a Semiconductor Research Corporation program
sponsored by MARCO and DARPA.

This work is also supported by the [Industrial Cyber-Physical Systems (iCyPhy) Center](https://www.icyphy.org).

See the <a href="http://www.icyphy.org/pubs/73.html">overview presentation</a>.
for a quick start using Node.js as a host, see the
<a href="https://www.icyphy.org/accessors/wiki/Main/NodeHost">Node host</a>.
See also the <a href="https://www.icyphy.org/accessors/wiki/Main/Tutor2017Tutorial">tutorial on CapeCode</a>,
the development environment based on <a href="http://ptolemy.org/ptolemyII">Ptolemy II</a> that uses the Nashorn host.

See Also
--------
* [Accessors Main Page](http://accessors.org)
* [Contributing](CONTRIBUTING.md)
* [Ptolemy JS Module Documentation](https://chess.eecs.berkeley.edu/ptexternal/src/ptII/doc/codeDoc/js/index.html)
* [![Build Status](https://travis-ci.org/icyphy/accessors.svg?branch=master)](https://travis-ci.org/icyphy/accessors)

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

See [https://www.icyphy.org/accessors/wiki/Main/JSDoc).

This file may be found at accessors/web/README.md and is included in the JSDoc output automatically because accessors/web/build.xml is invoked with -R README.md

Install the npm @terraswarm/accessors package on the npm server.
========================================================
(This is for the use of maintainers of this node module.)

We are using an account named
'[terraswarm](https://www.npmjs.com/~terraswarm)' on the npmjs
repository to manage the @terraswarm/accessors package.

To update the @terraswarm/accessors package on npmjs:

1.  Update the patch number in package.json
2.  Login to npm
        npm login

        Username: terraswarm
        Password: See ~terra/.npmpass on terra
        Email: terraswarm-software@terraswarm.org 
3.  Publish:
        npm publish --access public

