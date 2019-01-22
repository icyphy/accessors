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
        
        //Center for map location (this example is the middle of Berkeley)
        var exampleLocation = {
            "lat": 37.8716,
            "lng": -122.2727,
        }
        var exampleData = [
            {
                "displayName": "Parking1" ,
                "lat": 37.8626,
                "lng": -122.2637,
                "address": "1234 Place St.",
                "price": 3.12,
                "distance": 1.78,
            },
            {
                "displayName": "Parking2" ,
                "lat": 37.8731,
                "lng": -122.2617,
                "address": "4321 Street Pl.",
                "price": 2.98,
                "distance": 1.96,
            },
                {
                "displayName": "Parking3" ,
                "lat": 37.8831,
                "lng": -122.2517,
                "address": "9273 Atom Rd.",
                "price": 3.01,
                "distance": 2.12,
            },
        ];
        var update = {
            "id": "parking",
            "apiKey": resourceContents,
            "mapPosition": exampleLocation,
            "parkingData": exampleData
        };
        this.send('response', update);
    });
}