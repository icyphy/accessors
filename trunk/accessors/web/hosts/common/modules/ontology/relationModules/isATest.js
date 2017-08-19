exports.isA = function(args){
    if(args.length != 2){
      error("isA has an incorrect number of arguments");
    }
    if(args[0] == "nonentity"){
      return false;
    } else if(args[1] == "entity"){
      return true;
    } else {
      return undefined;
    }  
}
