exports.hasA = function(args){
    if(args.length != 2){
      error("hasA has an incorrect number of arguments");
    }
    if(args[0] == "nothing"){
      return false;
    } else if(args[1] == "everything"){
      return true;
    } else{
      return undefined;
    }
}
