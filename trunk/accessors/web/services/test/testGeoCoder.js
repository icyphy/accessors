// The problem was that if a top-level accessor sends itself an input, then
// no reaction was being triggered. This is because
// commonHost.provideInput() does not automatically trigger a reaction,
// because if it did, then it would be impossible for a script to provide
// multiple inputs to an accessor to have the accessor react to them all at
// once.
//
// This strategy worked fine as long as it wasn't a _top-level_ accessor
// sending itself an input.
//
// Run this in the node host, e.g., using:
//
//   cd accessors/web/hosts/node
//   node nodeHostInvoke.js -js test/testGeoCoder.js -timeout 2500
//
// The above script should produce the latitude and longitude of
// Berkeley on stdout:
//  { latitude: 37.8718992, longitude: -122.2585399 }
// Previously, it produced "undefined".

var assert = require('assert');

var testGeoCoder = instantiate('testGeoCoder', 'services/GeoCoder');
testGeoCoder.setParameter('key', 'AIzaSyBIu5hgbcSmP2f5frGdHpFNDJkDnTsFJyc');
testGeoCoder.initialize();
testGeoCoder.provideInput('address', 'berkeley');
testGeoCoder.react();
setTimeout(function() {
    //console.log(a.latestOutput('location'));
    var locationOutput = JSON.stringify(testGeoCoder.latestOutput('location'));
    assert.equal(locationOutput, '{"latitude":37.8718992,"longitude":-122.2585399}');
}, 2000);
