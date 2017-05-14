/// simple test of AudioIoPlay Accessor:

var play = instantiate('play', './audioIo/AudioIoPlay');
play.initialize();

// a simple sinewave generator:
var genSine = function(duration, freq, sr) {
    var i, k, phase, ref, result, samps, t, two_pi;
    if (sr === null) {
        sr = 44100;
    }
    two_pi = 3.141592653589793 * 2;
    phase = 0;
    samps = duration * sr;
    t = 1.0 / sr;
    result = [];
    for (i = k = 0, ref = samps;
         0 <= ref ? k < ref : k > ref;
         i = 0 <= ref ? ++k : --k) {
        result.push(Math.sin(phase));
        phase += two_pi * freq * t;
    }
    return result;
};

var sineWave = genSine(3, 440);
play.provideInput('signal', sineWave);
play.react();

console.log("you should be hearing some sound...");
setTimeout(function(){ play.wrapup(); }, 3200);
