// Accessor to return an array of FFT coefficients, given an input array   

// Set up the accessor.
exports.setup = function() {
    accessor.author('FIXME');
    accessor.input('signalIn');
    accessor.output('fftOutput',{'type':'JSON'});
    accessor.version('0.1 $Date$');
    // FIXME: Define your inputs and outputs here.
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