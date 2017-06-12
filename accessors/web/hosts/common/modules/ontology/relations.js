var isAModule = require("./relationModules/isATest");
var hasAModule = require("./relationModules/hasATest");


exports.interpret = function (name, args){
    switch(name){
      case "isA":
        return isAModule.isA(args);
        break;
      case "hasA":
        return hasAModule.hasA(args);
        break;
      case "close":
        return close(args);
        break;
      case "closed":
        return closed(args);
        break;
      case "getType":
        return getType(args);
      default:
        error("invalid relation: " + relat)
    }
}

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

function close(args){
    return true;
}

function closed(args){
    return false;
}

function getType(args){
    return typeof args[0];
}
