var exec = require('cordova/exec');


// Example
exports.coolMethod = function(arg0, success, error) {
    exec(success, error, "BLEAdvertise", "coolMethod", [arg0]);
};


exports.initialize = function(success, error) {
    exec(success, error, "BLEAdvertise", "initialize", []);
};
