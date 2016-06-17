// Monitoring accessor for the accessor host.
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

/** Monitoring accessor with sampling period input and sample output.
 *  This accessor is designed to periodically collect monitoring data that captures the 
 *  react() function execution times of different accessors running on the accessor host.
 *
 *  @accessor hosts/node/nodeMonitoringAccessor
 *  @input samplePeriodInMs A numeric input which provides sampling period for monitoring data.
 *  @output sample String which provides duration statistics for react() function execution on host.
 *  ************************FORMAT of output sample array***************************
 *  {<Accessor class> : [<count of sample>, <mean of react execution duration>, 
 *   <standard deviation of react execution duration>]}
 *  ********************************************************************************
 *  @author Atul Sandur
 *  @version $$Id: nodeMonitoringAccessor.js 546 2016-06-01 02:07:57Z cxh $$
 */

exports.setup = function() {
    this.input('samplePeriodInMs');                      // Input time period of sampling data.
    this.output('sample', {'type':'string'});            // Collected sample as a string.
};

exports.initialize = function() {
    var self = this;
    // Respond to input by updating sampling period for monitoring.
    this.addInputHandler('samplePeriodInMs', function() {
        clearInterval(this.exports.timer);
        this.exports.timer = setInterval(function() {
            self.send('sample', Accessor.queryActiveAccessors())
        }, this.get('samplePeriodInMs'));
    });
};

/** Create a dummy instance of timer to collect samples and initiliaze it 
 *  This is just for initialization and is overridden with the input handler for 
 *  sample collection once the first input is provided
*/
exports.timer = setInterval(function() { 
    console.log('[Monitoring] Initialized dummy input handler');
    return undefined; 
}, 5000);