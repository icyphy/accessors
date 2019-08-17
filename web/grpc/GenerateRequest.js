// Generate a properly formed request once per second
// for the Greeter service.
exports.setup = function() {
    this.output("request");
}

var handle = null;
var count = 0;

exports.initialize = function () {
    count = 0;
    var thiz = this;
    handle = setInterval(function () {
        thiz.send('request', {name: 'world' + count});
        count += 1;
    }, 1000);
};

exports.wrapup = function () {
    if (handle) {
        clearInterval(handle);
        handle = null;
    }
};
