// @version: $$Id$$
// Run the tests in accessors/web/test/auto.
// To run this test, do:
//   sudo npm install -g mocha
//   mocha testNodeAuto.js
// or
//   cd accessors/web; ant tests.mocha

var nodeHost = require('../../nodeHost.js');
var fs = require('fs');
describe('nodeHost run tests in accessors/web/test/auto', function () {
    var accessors;
    try {
        // If run in accessors/web/hosts/node/test/mocha/
        accessors = fs.readdirSync('../../../../test/auto');
    } catch (e) {
        // If run in accessors/web/
        accessors = fs.readdirSync('test/auto');
    }

    accessors.forEach(function(accessor) {
        if (accessor.substring(0,4) != '.svn') {
            it('NodeHost run accessors/web/test/auto/' + accessor + '\n', function () {
                var testAccessor = [ "test/auto/" + accessor ];
                instantiateAndInitialize(testAccessor);
            });
        }
    });
});
