// Accessor to play an audio signal.
// FIXME: This accessor is a placeholder.
// It just plays 2 seconds of fixed audio in initialize().
// You should update it to accept an input and play that.

// Set up the accessor.
exports.setup = function() {
    accessor.author('FIXME');
    accessor.version('0.1 $Date$');
    // FIXME: Define your inputs and outputs here.
};

var player = null;
var audio = require("audio");

exports.initialize = function() {
    var sinusoid = new Array(128);
    // As a test, produce about 2 seconds of sound in 128-sample chunks.
    var n = 0;
    player = new audio.Player();
    for (var j = 0; j < 128; j++) {
        for (var i = 0; i < 128; i++) {
            sinusoid[i] = Math.sin(2 * Math.PI * 440 * n++/ 8000);
        }
        player.play(sinusoid);
    }
}

exports.wrapup = function() {
    if (player != null) {
        player.stop();
        player = null;
    }
}