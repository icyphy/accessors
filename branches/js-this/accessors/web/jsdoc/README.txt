This directory contains files used by JSDoc, which generates documentation for JavaScript.

Updating The JSDoc output
-------------------------

The JSDoc output is in accessors/web/doc/jsdoc

Running "ant jsdoc" will clone the terraswarm fork of JSDoc.

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
* https://www.terraswarm.org/accessors/wiki/Main/JSDoc - Information for Accessor writers (TerraSwarm membership required)
