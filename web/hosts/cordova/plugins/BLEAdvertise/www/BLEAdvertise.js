var exec = require('cordova/exec');

/** Initialize the beacons-android library. */
exports.initialize = function(success, error) {
    exec(success, error, "BLEAdvertise", "initialize", []);
};

/**
 * Stop advertisement of all beacons.
 */
exports.stopAll = function() {
	var error = function() {
		console.log("Error while stopping advertisement.");
	}
	exec(null, error, "BLEAdvertise", "stopAll", []);
}

/**
 * Stop advertisement of particular beacon.
 */
exports.stop = function(handle) {
	var error = function() {
		console.log("Error while stopping advertisement.");
	}
	exec(null, error, "BLEAdvertise", "stop", []);
}

/** 
 * Start advertising Eddystone-URL beacon.
 * Upon success, the supplied callback is invoked with one argument.
 * The argument is a handle that can be used to stop the advertisement.
 */
exports.startEddystoneURLBeacon = function(URL, callback) {
	var error = function() {
		console.log("Error starting advertisement.");
	}
    exec(callback, error, "BLEAdvertise", "startEddystoneURLBeacon", [URL]);
};