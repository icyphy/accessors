exports.setup = function() {
    this.input('services');
    this.input('latitude',{
        'type': 'number'
    });
    this.input('longitude',{
        'type': 'number'
    });
    this.output('response');
};

exports.initialize = function() {
    var options = 5000; //5 second timeout on getResource
    var self = this;

    //Don't send response until this accessor receives both a location and update
    //at least once and has the API key.
    
    //Center for map location
    var location = null;
    var update = null;
    var resourceContents = null;

    console.log("before getting key");
    // The key from https://developers.google.com/maps/documentation/javascript/get-api-key
    // that should be placed in $HOME/.ptKeystore/maps
    var resourceValue = "$KEYSTORE/maps.txt"
    getResource(resourceValue, options, function(status, resource){
        if(status != null){
            console.log("Error getting map API Key in ResponseGeneratorC: " + status);
        } else {
            if(resource == null){
                console.log("Error in ResponseGeneratorC: resourceContents is null but status is null");
            } else {
                resourceContents = resource;
                
                //Only send if at least one update and location have been received so far
                if( location && update){
                    update.mapPosition = location;
                    update.apiKey = resourceContents;
                    self.send('response', update);
                }
            }
        }
    });


    this.addInputHandler('longitude', function(){
        location = {
            "lat": this.get('latitude'),
            "lng": this.get('longitude')
        };

        //Only send if at least one update and api key have been received so far
        if(update && resourceContents != null){
            update.mapPosition = location;
            update.apiKey = resourceContents;
            self.send('response', update);
        }
    });

    this.addInputHandler('services', function() {
        console.log("in services handler in ResponseGeneratorC");
        var result = this.get('services');
        console.log("got result in ResponseGeneratorC");
        
        //console.log(result.results);
        
        if(typeof result === 'string'){
          console.log("in error case of ResponseGeneratorC");
          //connection or some other error
          error("Error in NearbyServices. Instead of service query response, recieved: " + result);
        }
        
        else{
            console.log("else case in ResponseGeneratorC");
            console.log(JSON.stringify(result.results.bindings));
            console.log("after JSON stringify")
           var resultLength = result.results.bindings.length;          
           var nearbyServices = [];
           //console.log(JSON.stringify(result.results));
           
           console.log("before first for");
           for (var k=0; k< resultLength; k++){
             if(result.results.bindings[k].name){       
                 console.log(JSON.stringify(result.results.bindings[k]));
                 var s_name = result.results.bindings[k].name.value; //extract after #
                 var service_name_res = s_name.split("#");
                 var service_name = "";
                 if(service_name_res.length>1){
                    console.log("if true");
                    service_name = service_name_res[1];
                 }
                 else{
                    console.log("if false");
                    service_name = service_name_res[0]; 
                 }
                 
                 console.log("after first for");
                 //extract lat long from cWKT. 
                 //TODO: replace this temp code
                 var s_loc = result.results.bindings[k].location.value; //split ' ' on substring between 'Point(' and ')'
                 var start_pos = s_loc.search("\\(");
                 var end_pos = s_loc.search("\\)");
                 var ser_loc = s_loc.substring(start_pos+1, end_pos);
                 var service_location = ser_loc.split(" ");
                 var service_lat = service_location[1];
                 var service_lon = service_location[0];
                 
                 var service_distance = result.results.bindings[k].distance_mi.value; 
                 
                 //Ignore any schema.org prefixes
                 var service_type = result.results.bindings[k].type.value;
                 var tmp_s = service_type.split("schema.org/");
                 if(tmp_s.length > 1){
                        service_type = tmp_s[1];
                 }
                 
                 var address = '';
                 var price = 1.0;
                 var ratingScore = 0;
                 var accessor = "ParkingComponent.js";
                 if("address" in result.results.bindings[k]){
                    address = result.results.bindings[k].address.value; 
                 }
                 
                 if("price" in result.results.bindings[k]){
                    price = result.results.bindings[k].price.value; 
                 }
                 
                 if("ratingScore" in result.results.bindings[k]){
                    ratingScore = result.results.bindings[k].ratingScore.value; 
                 }
                 
                 if("accessor" in result.results.bindings[k]){
                    accessor = result.results.bindings[k].accessor.value;   
                    accessor = accessor.split("dashboard/")[1];
                 }
                 
                 console.log("before obj");
                 var obj = {
                         'displayName': service_name,
                         'lat' : parseFloat(service_lat),
                         'lng' : parseFloat(service_lon),
                         'address': address,
                         'distance': Math.round(service_distance * 100) / 100, //in miles
                         'type': service_type,
                         'accessor': accessor,
                         'price': "3." + Math.floor(Math.random()*10) + Math.floor(Math.random()*10), //parseFloat(Math.random().toFixed(2)),
                         'ratingScore': ratingScore
                 }
                 nearbyServices.push(obj);
            }
           }

           update = {
                "id": "parkingDialogue",
                "parkingData": nearbyServices
           };
           console.log("after update in ResponseGeneratorC");

            //Only send if at least one location and API key have been received so far
            if(location && resourceContents != null){
                update = {
                    "id": "parkingDialogue",
                    "apiKey": resourceContents,
                    "mapPosition": location,
                    "parkingData": nearbyServices
                };
                console.log("right before sending in ResponseGeneratorC");
                self.send('response', update);
                console.log("sent: " + JSON.stringify(update));
            }
        }
    });
};

// var exampleData = [
//             {
//                 "displayName": "Parking1" ,
//                 "lat": 37.8626,
//                 "lng": -122.2637,
//                 "address": "1234 Place St.",
//                 "price": 3.12,
//                 "distance": 1.78,
//             },
//             {
//                 "displayName": "Parking2" ,
//                 "lat": 37.8731,
//                 "lng": -122.2617,
//                 "address": "4321 Street Pl.",
//                 "price": 2.98,
//                 "distance": 1.96,
//             },
//                 {
//                 "displayName": "Parking3" ,
//                 "lat": 37.8831,
//                 "lng": -122.2517,
//                 "address": "9273 Atom Rd.",
//                 "price": 3.01,
//                 "distance": 2.12,
//             },
//         ];