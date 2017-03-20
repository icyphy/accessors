// A simple test for the mutable accessors.
// $Id: testSimpleMutable.js 1365 2017-03-01 00:44:19Z chadlia.jerad $
// See https://www.icyphy.org/accessors/wiki/Modules/Mutable

// To run this test:
//    ../../../../node_modules/.bin/mocha testSimpleMutable.js

var assert = require('assert');
var nodeHost = require('../../../../hosts/node/nodeHost.js');

// describe() is a mocha function.
// IMPORTANT: Don't change 'NodeHost', the Accessor Status page uses it.
// See https://www.icyphy.org/accessors/wiki/Notes/Status
describe('NodeHost' , function() {
    
    it ('NodeHost./accessors/web/mutable/test/auto/mocha/testSimpleMutable', function () {

		var spAcc1 = nodeHost.instantiate('spAcc1','./deterministicTemporalSemantics/SpontaneousAcc1.js');
		var spAcc2 = nodeHost.instantiate('spAcc1','./deterministicTemporalSemantics/SpontaneousAcc2.js');
		var spAcc3 = nodeHost.instantiate('spAcc1','./deterministicTemporalSemantics/SpontaneousAcc3.js');
		var spOnceAcc = nodeHost.instantiate('spAcc1','./deterministicTemporalSemantics/SpontaneousOnceAcc.js');
		
		var synchLabel = 'SL';
		
		spAcc1.setParameter('synchronizationLabel', synchLabel);
		spAcc2.setParameter('synchronizationLabel', synchLabel);
		spAcc3.setParameter('synchronizationLabel', synchLabel);
		spOnceAcc.setParameter('synchronizationLabel', synchLabel);
		
		spAcc1.initialize();
		spAcc2.initialize();
		spAcc3.initialize();
		spOnceAcc.initialize();
		
		//assert.equal(ma.latestOutput('scaled'), 44);

    });
});
