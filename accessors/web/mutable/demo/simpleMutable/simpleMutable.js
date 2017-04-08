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
 * This swarmlet example, running on node Host, illustrates the notion of 
 * mutableAccessor.
 * See https://www.icyphy.org/accessors/wiki/Modules/Mutable
 */


var nodeHost = require('../../../hosts/node/nodeHost.js');


var ma = nodeHost.instantiate('ma', './mutable/MutableTestGain.js');

// Two concretizations are tested
var a1 = nodeHost.instantiate('a1', './mutable/TestGain1.js');
var a2 = nodeHost.instantiate('a2', './mutable/TestGain2.js');

console.log('# In the above, we use node to run the example, which create the mutuableAccessor (ma) and the two different implementations (a1 and a2)');

var _input = 1;

// First: use of a1
if (ma.reifiableBy(a1)) {
    console.log('The mutableAccessor ' + ma.accessorName + ' can be reified by the accessor ' + a1.accessorName);
    if (ma.reify(a1)) {
        ma.initialize();

        ma.provideInput('input', _input);
        ma.react();
        console.log('Latest output of ' + ma.accessorName + ' reified by ' + a1.accessorName + ': ' + ma.latestOutput('scaled'));

        _input += 5;
        ma.provideInput('input', _input);
        ma.react();
        console.log('Latest output of ' + ma.accessorName + ' reified by ' + a1.accessorName + ': ' + ma.latestOutput('scaled'));
    }
} else {
    console.log('Sorry, ' + ma.accessorName + ' cannot be reified by the accessor ' + a1.accessorName);
}


// remove accessor a1 as reification
if (ma.removeReification()) {
    console.log('Successfully removed previous reification. Go for substitution...');

    // go and test for reification with a2
    if (ma.reifiableBy(a2)) {
        console.log('The mutableAccessor ' + ma.accessorName + ' can be reified by the accessor ' + a2.accessorName);
        if (ma.reify()) {
            ma.initialize();
            ma.provideInput('input', _input);
            ma.react();
            console.log('Latest output of ' + ma.accessorName + ' reified by ' + a2.accessorName + ': ' + ma.latestOutput('scaled'));

            // At this point, ma is mutable, a1 is composite and a2 in top level
            console.dir(nodeHost.getMonitoringInformation());

            _input += 5;
            ma.provideInput('input', _input);
            ma.react();
            console.log('Latest output of ' + ma.accessorName + ' reified by ' + a2.accessorName + ': ' + ma.latestOutput('scaled'));
        }
    } else {
        console.log('Sorry, ' + ma.accessorName + ' cannot be reified by the accessor ' + a2.accessorName);
    }
};

// Try to run with and without the following instruction
// You will notice how wrapping up in performed!
ma.removeReification();

//At this point, ma is mutable, a1 and a2 are both top level
console.dir(nodeHost.getMonitoringInformation());

console.log('That\'s all folks!');
