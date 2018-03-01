"use strict";

var jsonfile = require('jsonfile');
//var fs = require("fs");
var ontologySolver = require('./ontologySolver');
var lightOntologyPath = './lightOntology.json';
var euclideanOntologyPath = './2DEuclideanOntology.json';

//var isAModule = require("./relationModules/isATest");
var hasAModule = require("./relationModules/hasATest");

//var lightFile = new json.File(lightOntologyPath);

//var euclideanOntology = new ontologySolver.Ontology('euclideanTest', null, null, euclideanOntologyPath, fs.readFileSync);








exports.Relations = function (){
  this.lightOntology = null;
  this.euclideanOntology = null;
  console.log("constructor called");
  var thiz = this;

  this.interpret =  function (name, args){
    switch(name){
      case "isA":
        return thiz.lightOntology.ontologySolver(args[0], "isA", args[1], true, null);
        //return isAModule.isA(args);
        break;
      case "close":
           return thiz.euclideanOntology.ontologySolver(args[0], "close", args[1], false, [args[2]]);
        break;
      case "getType":
        return getType(args);
        break;
      case "hasA":
        return hasAModule.hasA(args);
        break;
      default:
        error("invalid relation: " + relat);
    }
  };


  //cb is a callback function that gets called upon completion of ontology loading. 
  this.loadOntologies = function(cb){

    console.log("in load ontologies");
    console.log("this: "+ JSON.stringify(this));
    console.log(JSON.stringify(this.lightOntology));
    //todo, make this code generalize for more than 2 ontologies
    var loadedFirstOntology = false;

    jsonfile.readFile(lightOntologyPath, function(err, obj){
      console.log("loading light ontology...");
      console.log(JSON.stringify(this));
      thiz.lightOntology = new ontologySolver.Ontology('lightTest', null, obj, null, null);
      console.dir(thiz.lightOntology.ontologyObject);
      if(loadedFirstOntology){
        cb();
      } else {
        loadedFirstOntology = true;
      }

    });

    jsonfile.readFile(euclideanOntologyPath, function(err, obj){
    console.log("loading euclidean ontology...");
    thiz.euclideanOntology = new ontologySolver.Ontology('euclideanTest', null, obj, null, null);
    console.dir(thiz.euclideanOntology.ontologyObject);
    if(loadedFirstOntology){
      cb();
    } else {
      loadedFirstOntology = true;
    }
    });

  };
};

/*
function isA(args) {
    if(args.length != 2){
      error("isA has an incorrect number of arguments");
    }
    if(args[0] == "nonentity"){
      return false;
    } else if(args[1] == "entity"){
      return true;
    } else {
      return false;
    }
}


function hasA(args) {
    if(args.length != 2){
      error("hasA has an incorrect number of arguments");
    }
    if(args[0] == "nothing"){
      return false;
    } else if(args[1] == "everything"){
      return true;
    } else{
      return false;
    }
}
*/

/*
function close(args){
    return true;
}

function closed(args){
    return false;
}

*/

function getType(args){
    return typeof args[0];
}
