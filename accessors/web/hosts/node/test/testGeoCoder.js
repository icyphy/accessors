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

var a = instantiate('a', 'services/GeoCoder');
a.setParameter('key', 'AIzaSyBIu5hgbcSmP2f5frGdHpFNDJkDnTsFJyc');
a.initialize();
a.provideInput('address', 'berkeley');
a.react();
setTimeout(function() {
        console.log(a.latestOutput('location'));
    }, 2000);
