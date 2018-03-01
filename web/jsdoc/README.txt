This directory contains files used by JSDoc, which generates documentation for JavaScript.

Updating The JSDoc output
-------------------------

The JSDoc output is in accessors/web/doc/jsdoc

Running "ant jsdoc" will install the TerraSwarm-specific version of jsdoc using npm.

To build:

cd vendors/web
ant jsdoc

To update the JSDoc fork after running "ant jsdoc"

cd $PTII
ant vendors-jsdoc-pull
ant jsdoc

See Also
--------
* https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSDocSystems - Overview of JSDoc systems
** https://chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSDocSystems#JSDocCustomTagPlugin - How @accessor, @input etc. are supported.
* https://www.icyphy.org/accessors/wiki/Main/JSDoc - Information for Accessor writers
* https://www.npmjs.com/package/@terraswarm/jsdoc - The @terraswarm/jsdoc npm module
* https://github.com/terraswarm/jsdoc - sources for the @terraswarm/jsdoc npm module
