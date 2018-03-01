// A simple test for illustrating the deterministic temporal semantics 
// $Id: testSimpleDTSswarmlet.js 1365 2017-04-06 00:44:19Z chadlia.jerad $
// See https://www.icyphy.org/accessors/wiki/...

// To run this test:
//    ../../../../node_modules/.bin/mocha testSimpleMutable.js

var assert = require('assert');
var nodeHost = require('../../../../hosts/node/nodeHost.js');

// describe() is a mocha function.
// IMPORTANT: Don't change 'NodeHost', the Accessor Status page uses it.
// See https://www.icyphy.org/accessors/wiki/Notes/Status
describe('NodeHost' , function() {
    
    it ('NodeHost./accessors/web/deterministicTemporalSemantics/test/auto/mocha/testSimpleDTSswarmlet', function () {

        // Instantiating the accessors
        var spAcc1 = nodeHost.instantiate('spAcc1','./deterministicTemporalSemantics/SpontaneousPeriodic.js');
        var spAcc2 = nodeHost.instantiate('spAcc2','./deterministicTemporalSemantics/SpontaneousPeriodic.js');
        var spAcc3 = nodeHost.instantiate('spAcc3','./deterministicTemporalSemantics/SpontaneousPeriodic.js');
        var spOnceAcc = nodeHost.instantiate('spOnce','./deterministicTemporalSemantics/SpontaneousAperiodic.js');

        // Setting the synchronization label
        var synchLabel = 'SL';
        spAcc1.setParameter('synchronizationLabel', synchLabel);
        spAcc2.setParameter('synchronizationLabel', synchLabel);
        spAcc3.setParameter('synchronizationLabel', synchLabel);
        spOnceAcc.setParameter('synchronizationLabel', synchLabel);

        // Setting the periods and timeouts
        spAcc1.setParameter('period', 2000);
        spAcc2.setParameter('period', 4000);
        spAcc3.setParameter('period', 1200);
        spOnceAcc.setParameter('timeout', 1500);

        // Initializing the spontaneous accessors
        spAcc1.initialize();
        spAcc2.initialize();
        spAcc3.initialize();
        spOnceAcc.initialize();

        // Note: The periodic accessors will stop at 12000 by clearing the timers.  


    });
});
