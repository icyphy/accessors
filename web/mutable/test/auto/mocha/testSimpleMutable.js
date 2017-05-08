// A simple test for the mutable accessors.
// $Id$
// See https://www.icyphy.org/accessors/wiki/Modules/Mutable

// To run this test:
//    ../../../../node_modules/.bin/mocha testSimpleMutable.js

var assert = require('assert');
var nodeHost = require('@accessors-hosts/node');

// describe() is a mocha function.
// IMPORTANT: Don't change 'NodeHost', the Accessor Status page uses it.
// See https://www.icyphy.org/accessors/wiki/Notes/Status
describe('NodeHost' , function() {
    
    it ('NodeHost./accessors/web/mutable/test/auto/mocha/testSimpleMutable', function () {
        var ma = nodeHost.instantiate('ma','./mutable/MutableTestGain.js');

        // Two concretizations are tested
        var a1 = nodeHost.instantiate('a1','./mutable/TestGain1.js');
        var a2 = nodeHost.instantiate('a2','./mutable/TestGain2.js');

        var _input = 1;

        // First: use of a1
        if (ma.reifiableBy(a1)){
            // console.log('The mutableAccessor ' + ma.accessorName + ' can be reified by the accessor ' + a1.accessorName);
            assert.equal(ma.accessorName, "ma");
            assert.equal(a1.accessorName, "a1");

            if (ma.reify(a1)) {
                ma.initialize();
                
                ma.provideInput('input', _input);
                ma.react();

                // console.log('Latest output of ' + ma.accessorName + ' reified by ' + a1.accessorName +': ' + ma.latestOutput('scaled'));
                assert.equal(ma.latestOutput('scaled'), 2);
                
                _input += 5;
                ma.provideInput('input', _input);
                ma.react();
                // console.log('Latest output of ' + ma.accessorName + ' reified by ' + a1.accessorName +': ' + ma.latestOutput('scaled'));
                assert.equal(ma.latestOutput('scaled'), 12);
            };
        } else {
            throw new Error('Sorry, ' + ma.accessorName + ' cannot be reified by the accessor ' + a1.accessorName);
        }

        // Remove accessor a1 as reification.
        if (ma.removeReification()) {
            //console.log('Successfully removed previous reification. Go for substitution...');

            // Go and test for reification with a2.
            if (ma.reifiableBy(a2)){
                // console.log('The mutableAccessor ' + ma.accessorName + ' can be reified by the accessor ' + a2.accessorName);
                if (ma.reify()) {
                    ma.initialize();
                    ma.provideInput('input', _input);
                    ma.react();
                    // console.log('Latest output of ' + ma.accessorName + ' reified by ' + a2.accessorName +': ' + ma.latestOutput('scaled'));
                    assert.equal(ma.latestOutput('scaled'), 24);
                    

                    // At this point, ma is mutable, a1 is composite and a2 in top level.
                    //console.dir(nodeHost.getMonitoringInformation());
                    
                    _input += 5;
                    ma.provideInput('input', _input);
                    ma.react();
                    // console.log('Latest output of ' + ma.accessorName + ' reified by ' + a2.accessorName +': ' + ma.latestOutput('scaled'));
                    assert.equal(ma.latestOutput('scaled'), 44);
                }
            } else {
                new Error('Sorry, ' + ma.accessorName + ' cannot be reified by the accessor ' + a2.accessorName);
            }
        };
    });
});

