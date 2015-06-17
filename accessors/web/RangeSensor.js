// Copyright (c) 2014-2015 The Regents of the University of California.
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

/** Return the range to an intruder
 *
 * @author: Ilge Akkya, Contributor: Christopher Brooks
 * @version $Id$
 *
 * @accessor RangeSensor
 * @input {JSON} currentPosition The current position of the robot
 * that is searching, typically { "x": 0, "y": 0}.
 *
 * @output {number} rangeMeasurement The range to the intruder.
 * @parameter {number} noiseSigma A measurement of how noisy the signal is (?).  Default is 2.0.
 * @parameter {string} intruderKey The key of the intruder in the key/value store.
 *
 * @parameter storeLocation The URL of the key/value store.  The type
 * of this parameter is general so that in Ptolemy the value can be a
 * Ptolemy parameter so that multiple instances of the actor can be
 * easily configured.
 */
exports.setup = function() {

    accessor.input('currentPosition', {
        'type':'JSON',
	    'value': { "x": 0, "y": 0},
    });
    accessor.output('rangeMeasurement', {
        'type':'number',
    });
    accessor.parameter('noiseSigma', {
        'type':'number',
        'value': 2.0,
    });
    accessor.parameter('intruderKey', {
        'type':'string',
        'value':'intruder',
    });
    accessor.parameter('storeLocation', {
    });
};

/** Get the range to the intruder
 *
 *  The intruder position is obtained by getting the JSON from the URL
 *  named by storeLocation + "/get?id=" + intruder
 *  The range is then adjusted by a noise sample.
 */
exports.fire = function () {
    var sigma = get('noiseSigma');
    var store = get('storeLocation');
    var intruder = get('intruderKey');
    var url = store + '/get?id=' + intruder;
    var intruderPosition = JSON.parse(readURL(url));

    var intruderX = intruderPosition[0];
    var intruderY = intruderPosition[1];
    var robotPosition = JSON.parse(get('currentPosition'));
    var robotX = robotPosition[0];
    var robotY = robotPosition[1];

    var gaussianEstimate = ((Math.random()-0.5)*2.0)+((Math.random()-0.5)*2.0)+((Math.random()-0.5)*2.0);
    var noiseSample = gaussianEstimate*Math.sqrt(sigma);

    var result = Math.sqrt((intruderX - robotX)*(intruderX - robotX) + (intruderY - robotY)*(intruderY - robotY)) + noiseSample;
    send('rangeMeasurement', result);

}
  
