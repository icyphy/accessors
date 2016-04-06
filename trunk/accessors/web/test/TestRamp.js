// An acccessor that outputs a sequence with a given step in values.
//
// Copyright (c) 2015 The Regents of the University of California.
// All rights reserved.

// Permission is hereby granted, without written agreement and without
// license or royalty fees, to use, copy, modify, and distribute this
// software and its documentation for any purpose, provided that the above
// copyright notice and the following two paragraphs appear in all copies
// of this software.

// IN NO EVENT SHALL THE UNIVERSITY OF CALIFORNIA BE LIABLE TO ANY PARTY
// FOR DIRECT, INDIRECT, SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES
// ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
// THE UNIVERSITY OF CALIFORNIA HAS BEEN ADVISED OF THE POSSIBILITY OF
// SUCH DAMAGE.

// THE UNIVERSITY OF CALIFORNIA SPECIFICALLY DISCLAIMS ANY WARRANTIES,
// INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE. THE SOFTWARE
// PROVIDED HEREUNDER IS ON AN "AS IS" BASIS, AND THE UNIVERSITY OF
// CALIFORNIA HAS NO OBLIGATION TO PROVIDE MAINTENANCE, SUPPORT, UPDATES,
// ENHANCEMENTS, OR MODIFICATIONS.

/** Output a sequence with a given step in values.
 *
 *  @accessor test/TestRamp
 *  @param init The value produced on its first iteration.  The
 *  initial default is 0.
 *  @input trigger The trigger
 *  @output output The output
 *  @param step The amount by which the output is incremented. The
 *  default is 1.
 *  @author Christopher Brooks
 *  @version $$Id$$
 */

exports.setup = function() {
    // FIXME: this only supports numbers, unlike the Cape Code Ramp
    // actor, which supports many types.
    this.parameter('init', {'type':'number', 'value':0});
    this.input('trigger');
    this.output('output', {'type':'number'});
    this.parameter('step', {'type':'number', 'value':1});
    // FIXME: need to keep track of the last value.
    this.parameter('_lastValue', {'type':'number', 'value':0});
};

exports.fire = function() {
    this.setParameter('_lastValue', this.getParameter('init'));
}
exports.fire = function() {
    this.setParameter('_lastValue', this.getParameter('_lastValue') + this.getParameter('step'));
    this.send('output', this.getParameter('_lastValue'));
};

// exports.initialize = function() {
//     var self = this;
//     this.addInputHandler('trigger', function() {
//         self.setParameter('_lastValue', self.getParameter('_lastValue') + self.getParameter('step'));
//         console.log("trigger input handler: " + self.getParameter('_lastValue'));
//         self.send('output', (self.geParametert('_lastValue')));
//     });
// };


