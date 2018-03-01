/// simple test of AudioIoCapture Accessor:

var capture = instantiate('capture', './audioIo/AudioIoCapture');
capture.initialize();
capture.provideInput('trigger');
capture.react();

setTimeout(function(){ var got = capture.latestOutput('signal'); console.log("accessor produced " + got.length + " samples"); capture.wrapup(); }, 1000);
