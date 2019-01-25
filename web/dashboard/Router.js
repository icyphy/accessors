exports.setup = function(){
    this.input("userCommand");
    this.output("accessor");
    this.output("parking");
    this.output("parkingComponent");
};

exports.initialize = function(){
    this.addInputHandler("userCommand", function(){
        var command = this.get('userCommand');
        if(command && command.message){
            var msg = JSON.parse(command.message);
            if(msg.id){
                switch(msg.id){
                    case "parking":
                        this.send("parking", command);
                        break;
                    case "system":
                        this.send("accessor", command);
                        break;
                    case "parkingComponent":
                        this.send("parkingComponent", command);
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