"Duktape (http://duktape.org/) is an embeddable Javascript engine, with a focus on portability and compact footprint." 

See https://www.terraswarm.org/accessors/wiki/Main/DuktapeHost

Because of how Duktape handles require('../common/commonHost'), this
file must be run from accessors/web/host, not accessors/web/host/duktape.

To run this:
  cd duktape
  make
  cd ../..
  ./duktape/duktape/duk duktape/test/testComposite.js
  
