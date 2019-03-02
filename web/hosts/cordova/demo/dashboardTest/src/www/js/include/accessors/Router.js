exports.setup = function(){
    this.input("userCommand");
    this.output("dashboard"); //triggers default components
    this.output("parkingDialogue"); //triggers parking dialogue
    this.output("selectAccessor",
        {'type': 'string'}
    ); //Path to user selected accessor
    this.output("parkingComponent"); //communication from the parking
};

exports.initialize = function(){
    this.addInputHandler("userCommand", function(){
        var command = this.get('userCommand');
        if(command && command.message){
            var msg = JSON.parse(command.message);
            if(msg.id){
                switch(msg.id){
                    case "parkingDialogue":
                        this.send("parkingDialogue", command);
                        break;
                    case "system":
                        if(msg.msg && msg.msg == "dashboard")
                            this.send("dashboard", command);
                        break;
                    case "parkingComponent":
                        this.send("parkingComponent", command);
                        break;
                        //FIXME: I'm having this send the value instead of the command
                        //just to save time for the paper deadline. This is inconsistent with how the
                        //other ports work
                    case "selectAccessor":
                        if(msg.accessorPath){
                            this.send("selectAccessor", msg.accessorPath);
                        }
                        break;
                    default:
                        error("Received message in router with an invalid ID");
                } 
            } else {
                error("Unable to parse ID out of message. Got ID: " + msg.id);
            }
        } else {
            error("Received message in router and was unable to identify ID");
        }
    });
};