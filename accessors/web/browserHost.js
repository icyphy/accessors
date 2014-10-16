// JavaScript functions for a browser host.
// Default method definitions
function initialize() {
    throw "No initialize() method defined.";
}
function initializeWrapper() {
    try {
        initialize();
    } catch (e) {
        alert(e);
    }
}
function fire() {
    throw "No fire() method defined.";
}
function fireWrapper() {
    try {
        fire();
    } catch (e) {
        alert(e);
    }
}
function wrapup() {
    throw "No wrapup() method defined.";
}
function wrapupWrapper() {
    try {
        wrapup();
    } catch (e) {
        alert(e);
    }
}
// Method for retrieving inputs.
function get(input) {
    return document.getElementById(input + "Input").value;
}
// Method for setting outputs.
function send(value, output) {
    document.getElementById(output).innerHTML = value;
}
// Method for synchronously reading a URL.
function readURL(url) {
    var request = new XMLHttpRequest();
    // The third argument specifies a synchronous read.
    request.open("GET", url, false);
    // Null argument says there is no body.
    request.send(null);
    // readyState === 4 is the same as readyState === request.DONE.
    if (request.readyState === request.DONE) {
        if (request.status <= 400) {
            return request.responseText;
        } else {
            throw "readURL failed with code " + request.status + " at URL: " + url;
        }
    } else {
        throw "readURL did not complete: " + url;
    }
}