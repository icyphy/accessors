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

exports.setup = function() {
    accessor.author('Ilge Akkya, Contributor: Christopher Brooks');
    accessor.version('$Id$');
    accessor.input('currentPosition', {
        'type':'JSON',
    });
    accessor.output('rangeMeasurement', {
        'type':'number',
    });
    accessor.parameter('currentPosition', {
        'type':'number',
    });
    accessor.parameter('noiseSigma', {
        'type':'number',
    });
    accessor.parameter('intruderKey', {
        'type':'string',
    });
    accessor.parameter('storeLocation', {
        'type':'string',
    });
};

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
  
