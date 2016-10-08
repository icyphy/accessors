/// simple test of AudioIoWavFile Accessor:

var wav = instantiate('wav', './audioIo/AudioIoWavFile');
wav.initialize();
wav.provideInput('wavfile', './test/stereo.wav');
wav.react();
f = wav.latestOutput('wavdata');
console.log("-----------------------------------------------------");
console.log("file sample rate (expected 44100) : " + f.sampleRate);
console.log("file # channels  (expected 2)     : " + f.channels);
console.log("file # samples   (expected a lot) : " + f.data.length);
console.log("-----------------------------------------------------");
wav.wrapup();
