"use strict";
var audio, fileInputHander;

audio = require('audio-io');

fileInputHander = null;

exports.loadFile = function() {
  this.send('wavdata', audio.loadwav(this.get('wavfile')));
};

exports.setup = function() {
  this.input('wavfile', {
    type: 'string'
  });
  this.output('wavdata', {
    type: 'json'
  });
};

exports.initialize = function() {
  fileInputHander = this.addInputHandler('wavfile', this.exports.loadFile.bind(this));
};

exports.wrapup = function() {
  audio.wrapup();
  this.removeInputHandler('wavfile', fileInputHander);
};
