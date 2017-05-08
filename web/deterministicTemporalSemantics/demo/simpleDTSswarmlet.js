// Swarmlet that instantiates, parameterizes and initializes 3 periodic
// accessors and one aperiodic accessor
//
// Copyright (c) 2017 The Regents of the University of California.
// All rights reserved.
//
// Permission is hereby granted, without written agreement and without
// license or royalty fees, to use, copy, modify, and distribute this
// software and its documentation for any purpose, provided that the above
// copyright notice and the following two paragraphs appear in all copies
// of this software.
//
// IN NO EVENT SHALL THE UNIVERSITY OF CALIFORNIA BE LIABLE TO ANY PARTY
// FOR DIRECT, INDIRECT, SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES
// ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
// THE UNIVERSITY OF CALIFORNIA HAS BEEN ADVISED OF THE POSSIBILITY OF
// SUCH DAMAGE.
//
// THE UNIVERSITY OF CALIFORNIA SPECIFICALLY DISCLAIMS ANY WARRANTIES,
// INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE. THE SOFTWARE
// PROVIDED HEREUNDER IS ON AN "AS IS" BASIS, AND THE UNIVERSITY OF
// CALIFORNIA HAS NO OBLIGATION TO PROVIDE MAINTENANCE, SUPPORT, UPDATES,
// ENHANCEMENTS, OR MODIFICATIONS.
//

/**
 *  This "swarmlet" example, running on node Host, illustrates the deterministric
 *  temporal semantics implementation
 *
 *  @author Chadlia Jerad
 *  @version $$Id$$
 */


var nodeHost = require('../../node_modules/@accessors-hosts/node/nodeHost.js');

// Instantiating the accessors
var spAcc1 = nodeHost.instantiate('spAcc1', './deterministicTemporalSemantics/SpontaneousPeriodic.js');
var spAcc2 = nodeHost.instantiate('spAcc2', './deterministicTemporalSemantics/SpontaneousPeriodic.js');
var spAcc3 = nodeHost.instantiate('spAcc3', './deterministicTemporalSemantics/SpontaneousPeriodic.js');
var spOnceAcc = nodeHost.instantiate('spOnce', './deterministicTemporalSemantics/SpontaneousAperiodic.js');

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
