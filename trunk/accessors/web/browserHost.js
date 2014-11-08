// JavaScript functions for a browser swarmlet host.
// This file includes default accessor functions (initialize, fire, wrapup)
// and functions for reading inputs and sending outputs.
// Author: Edward A. Lee and Chris Shaver
// Copyright: http://terraswarm.org/accessors/copyright.txt
//
////////////////////
// Default method definitions.
// These may be shadowed by methods provided by the accessor.
function initialize() {
    throw "No initialize() method defined.";
}
function fire() {
    throw "No fire() method defined.";
}
function wrapup() {
    throw "No wrapup() method defined.";
}
////////////////////
// Method for retrieving inputs.
function get(input) {
    return document.getElementById(input + "Input").value;
}
////////////////////
// Method for setting outputs.
function send(value, output) {
    document.getElementById(output).innerHTML = value;
}
