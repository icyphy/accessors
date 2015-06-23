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

/** This accessor returns an array of FFT coefficients, corresponding to the input signal.
 *
 *  @accessor FFT
 *  @author Ilge Akkaya 
 *  @version $Id$
 *  @input {array<number>} signalIn Input signal array
 *  @output {array<{'real':'number', 'imag': 'number'}>} fftOutput An array of FFT coefficients, each being a record with real and imaginary parts.
 */
exports.setup = function() {
    input('signalIn');
    output('fftOutput',{'type':'JSON'});
};
 
var dspEngine = null; 
var dsp = require("dsp");   
var handle = null;

exports.initialize = function() { 
    handle = addInputHandler('signalIn',processSignal); 
    var n = 0; 
    dspEngine = new dsp.Signal();   
}

function processSignal() {
    var signalValue = get('signalIn');  
    var fftLength = signalValue.length; 
    var fftResult = dspEngine.fft(signalValue); 
    
    var outputArray = [];
    // parse the fft coefficients as record tokens with
    // real and imaginary parts
    for (var j = 0; j < fftLength; j++) { 
        print(fftResult[j]);  
        var trial = {"real":'number', "imag": 'number'};
        trial.real = fftResult.real[j];
        trial.imag = fftResult.imag[j];
        outputArray[j] = trial; 
    }
    

    send('fftOutput',outputArray); 
}

exports.wrapup = function() { 
    removeInputHandler('signalIn',handle); 
}
