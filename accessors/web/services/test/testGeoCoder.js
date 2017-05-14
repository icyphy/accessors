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
//   (cd services/test/auto/mocha/; ../../../../node_modules/.bin/mocha testGeoCoder.js)
//
// The above script should produce the latitude and longitude of
// Berkeley on stdout:
//  { latitude: 37.8718992, longitude: -122.2585399 }
// Previously, it produced "undefined".

console.log('services/test/testGeoCoder.js');
var assert = require('assert');

var testGeoCoder = instantiate('testGeoCoder', 'services/GeoCoder');
testGeoCoder.setParameter('key', 'AIzaSyBIu5hgbcSmP2f5frGdHpFNDJkDnTsFJyc');
testGeoCoder.initialize();
testGeoCoder.provideInput('address', 'berkeley');
testGeoCoder.react();
setTimeout(function () {
    //console.log(a.latestOutput('location'));
    // var locationOutput = JSON.stringify(testGeoCoder.latestOutput('location'));
    // assert.equal(locationOutput, '{"latitude":37.8718992,"longitude":-122.2585399}');

    var locationOutput = testGeoCoder.latestOutput('location');
    assert.ok(locationOutput !== undefined, 'The location output of testGeoCoder was undefined?');
    var latitude = locationOutput.latitude;
    var longitude = locationOutput.longitude;

    // It is OK if we are within a degree.
    assert.ok(Math.abs(latitude - 37.8718992) < 1.0, 'latitude was ' + latitude + ', which is not close to Berkeley.');
    assert.ok(Math.abs(longitude - -122.2585399) < 1.0, 'longitude was ' + longitude + ', which is not close to Berkeley.');

}, 2000);
