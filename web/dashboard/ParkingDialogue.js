exports.setup = function(){
    this.input("parkingMessage");
    this.output("response");
    this.parameter("MapsAPIKeyLocation", {
        type: "string",
        value: "MAPS_API_KEY_DONT_COMMIT.txt"
    });
}

exports.initialize = function(){
    var options = '';
    var self = this;
    this.addInputHandler("parkingMessage", function(){
        var resourceValue = this.getParameter('MapsAPIKeyLocation');
        var resourceContents = getResource(resourceValue, options, null);
        var update = {
            "id": "parking",
            "apiKey": resourceContents
        };
        this.send('response', update);
    });
}