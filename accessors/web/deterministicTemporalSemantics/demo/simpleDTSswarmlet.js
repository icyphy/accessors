// Test accessor that multiplies its input by a scale factor.
//
// Copyright (c) 2016-2017 The Regents of the University of California.
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
 * This "swarmlet" example, running on node Host, illustrates the deterministric
 * temporal semantics implementation
 * See https://www.icyphy.org/accessors/wiki/Modules/Mutable
 */


var nodeHost = require('../../hosts/node/nodeHost.js');

var spAcc1 = nodeHost.instantiate('spAcc1','./deterministicTemporalSemantics/SpantaneousAcc1.js');
var spAcc2 = nodeHost.instantiate('spAcc1','./deterministicTemporalSemantics/SpantaneousAcc2.js');
var spAcc3 = nodeHost.instantiate('spAcc1','./deterministicTemporalSemantics/SpantaneousAcc3.js');
var spOnceAcc = nodeHost.instantiate('spAcc1','./deterministicTemporalSemantics/SpantaneousOnceAcc.js');

spAcc1.initialize();
spAcc2.initialize();
spAcc3.initialize();
spOnceAcc.initialize();

