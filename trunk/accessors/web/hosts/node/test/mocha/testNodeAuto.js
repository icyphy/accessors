// @version: $$Id$$
// Run the tests in accessors/web/test/auto.
// To run this test, do:
//   sudo npm install -g mocha
//   mocha testNodeAuto.js
// or
//   cd accessors/web; ant tests.mocha

var nodeHost = require('../../nodeHost.js');
var fs = require('fs');
describe('hosts/node/test/mocha/testNodeAuto.js: run auto tests', function () {
    var autos = ["test/auto", "net/test/auto"];
    autos.forEach(function(auto) {
        var accessors;
        try {
        // If run in accessors/web/hosts/node/test/mocha/
            accessors = fs.readdirSync('../../../../' + auto);
        } catch (e) {
            // If run in accessors/web/
            accessors = fs.readdirSync(auto);
        }

        describe('hosts/node/test/mocha/testNodeAuto.js: run ' + auto + ' tests', function () {
            accessors.forEach(function(accessor) {
                if (accessor.substring(0,4) != '.svn' &&
                    accessor.substring(0,4) != '.log') {
                    it('NodeHost run accessors/web/' + auto + '/' + accessor + '\n', function () {
                        var testAccessor = [ auto +'/' + accessor ];
                        instantiateAndInitialize(testAccessor);
                    });
                }
            });
        });
    });
});
