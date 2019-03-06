exports.setup = function(){
    this.input("parkingMessage");
    this.parameter('searchTerm', {
        'type': 'string',
        'value': 'parking',
        'options': ['parking', 'trafficAlerts', 'drivingAssistance', 'restaurants', 'automotive']
    });
    this.output('latitude',{
        'type': 'number'
    });
    this.output('longitude',{
        'type': 'number'
    });
    this.output('queryTerm',{
        'type': 'string'
    });
}

exports.initialize = function(){
    var thiz = this;
    this.addInputHandler("parkingMessage", function(){
        //Center for map and query location (this example is the middle of Berkeley)
        var location = {
            "lat": 37.8616,
            "lng": -122.2627,
        }

        thiz.send('latitude', location.lat);
        thiz.send('longitude', location.lng);
        thiz.send('queryTerm', thiz.getParameter('searchTerm'));
    });
}