"use strict";
var audio, blockSize, channels, signalInputHander, signalJsonInputHandler;

audio = require('audio-io');

signalInputHander = null;

signalJsonInputHandler = null;

channels = null;

blockSize = null;

exports.playArray = function() {
  var audioVector;
  audioVector = this.get('signal');
  console.log("Audio Play (array), channels: " + channels + ", data size : " + audioVector.length);
  audio.play(channels, audioVector);
};

exports.playJSON = function(audioJSON) {
  audioJSON = this.get('signalJSON');
  console.log("Audio Play (JSON), channels: " + audioJSON.channels + ", data size : " + audioJSON.data.length);
  audio.play(audioJSON.channels, audioJSON.data);
};

exports.setup = function() {
  this.parameter('numOutputChannels', {
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
  this.input('signal');
  this.input('signalJSON', {
    type: 'json'
  });
};

exports.initialize = function() {
  console.log("Audio Play Initialize... Initializing...");
  console.log("Number Output Channels : " + this.getParameter('numOutputChannels'));
  console.log("Sampling Rate : " + this.getParameter('samplingRate'));
  console.log("Block Size : " + this.getParameter('blockSize'));
  channels = this.getParameter('numOutputChannels');
  blockSize = this.getParameter('blockSize');
  audio.initialize(0, channels, this.getParameter('samplingRate'), blockSize);
  signalInputHander = this.addInputHandler('signal', this.exports.playArray.bind(this));
  signalJsonInputHandler = this.addInputHandler('signalJSON', this.exports.playJSON.bind(this));
};

exports.wrapup = function() {
  audio.wrapup();
  this.removeInputHandler('signal', signalInputHander);
  this.removeInputHandler('signalJSON', signalJsonInputHandler);
};
