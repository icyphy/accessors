"use strict";
var audio, recording, triggerHandler;

audio = require('audio-io');

triggerHandler = null;

recording = false;

exports.record = function() {
  console.log("record funciton triggered...");
  recording = !recording;
  console.log("recording is " + recording);
  if (recording === true) {
    console.log("passing onData callback to audio.capture");
    audio.capture(this.exports.onData.bind(this));
  } else {
    console.log("passing a null callback to audio.capture");
    audio.capture(null);
  }
};

exports.setup = function() {
  console.log("Audio Capture Setup");
  this.parameter('numInputChannels', {
    type: 'number',
    value: 1
  });
  this.parameter('samplingRate', {
    type: 'number',
    value: 44100
  });
  this.parameter('blockSize', {
    type: 'number',
    value: 512
  });
  this.input('trigger');
  this.output('signal');
};

exports.onData = function(audioVector) {
  this.send('signal', audioVector);
};

exports.initialize = function() {
  console.log("Audio Capture Initialize... Initializing...");
  console.log("Number Input Channels : " + this.getParameter('numInputChannels'));
  console.log("Sampling Rate : " + this.getParameter('samplingRate'));
  console.log("Block Size : " + this.getParameter('blockSize'));
  audio.initialize(this.getParameter('numInputChannels'), 0, this.getParameter('samplingRate'), this.getParameter('blockSize'));
  console.log("Registering the trigger handler for 'trigger'");
  triggerHandler = this.addInputHandler('trigger', this.exports.record.bind(this));
  recording = false;
};

this.exports.wrapup = function() {
  console.log("Audio Capture Wrapup");
  audio.wrapup();
  this.removeInputHandler('trigger', triggerHandler);
};
