
exports.setup = function() {
    this.input('latitude');
    this.input('longitude');
    this.input('queryTerm');
    this.parameter('yelpResults',{
        'type': 'boolean',
        'value': false
    });
    this.output('updateYelpOnto');
    this.output('query',{
        'type': 'string'
    });
}

exports.initialize = function() {
    var self = this;
    var start_time = Date.now().toString();
    var current_time = start_time;
    this.addInputHandler('queryTerm', function() {
        var latitude = this.get('latitude');
        var longitude = this.get('longitude');
        var searchTerm = this.get('queryTerm');
        
        //Update Yelp Ontologies if enabled
        if(self.getParameter('yelpResults')){
                self.send('updateYelpOnto', '');    
        }
        
        var queryPrefixString = "PREFIX uom: <http://www.opengis.net/def/uom/OGC/1.0/>\n";
        queryPrefixString += "PREFIX geo: <http://www.opengis.net/ont/geosparql#>\n";
        queryPrefixString += "PREFIX geof: <http://www.opengis.net/def/function/geosparql/>\n";
        queryPrefixString += "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n";
        queryPrefixString += "PREFIX acc: <http://ptolemy.berkeley.edu/accessors#>\n";
        queryPrefixString += "PREFIX schema: <http://schema.org/>\n";
        queryPrefixString += "PREFIX sosa: <http://www.w3.org/ns/sosa/>\n";
        
        //Query Core ontology       
        var coreQueryString = "SELECT ?type ?name ?address ?location ?price ?accessor ?distance_mi WHERE { ?name acc:hasService ?service . ?service geo:serviceType";
        coreQueryString+= "?type . ?name acc:price ?price. ?name acc:serviceURI ?accessor. ?name acc:address ?address. ?name geo:location ?location.BIND";
        coreQueryString+= "(geof:distance(?location, \'\'\'<http://www.opengis.net/def/crs/OGC/1.3/CRS84> Point (";
        coreQueryString +=  longitude + " " + latitude + ")\'\'\'^^geo:wktLiteral, uom:metre)/1609.344 AS ?distance_mi) . filter(str(?type)='" + searchTerm + "')}";
        
        //Query Yelp Ontology 
        //TODO: ASK for appropriate services if available
        var yelpQueryString = "";
        current_time = Date.now().toString();
        if(self.getParameter('yelpResults')){
            yelpQueryString += "select ?type ?name ?address ?location ?ratingScore  ?distance_mi where{ ?obs a sosa:Observation. ?obs schema:expires ?exp. ?obs sosa:resultTime ?time.";
            yelpQueryString += "?obs sosa:hasResult ?businessNode. ?businessNode schema:name ?name. ?businessNode schema:address ?address. ?businessNode geo:asWKT ?location.";
            yelpQueryString += "?businessNode rdf:type ?type. ?businessNode schema:aggregateRating ?aggRating. ?aggRating schema:ratingValue ?ratingScore. BIND";
            yelpQueryString += "(geof:distance(?location,\'\'\'<http://www.opengis.net/def/crs/OGC/1.3/CRS84> Point(" + longitude + " " + latitude + ")\'\'\'^^geo:wktLiteral, uom:metre)/1609.344"
            yelpQueryString += " AS ?distance_mi) . filter (?ratingScore > 3.5)}";
            start_time = current_time;
            //console.log(yelpQueryString);
        }
        
        var combinedQuery = queryPrefixString;
        combinedQuery += "SELECT * WHERE { { " + coreQueryString + "} UNION {" + yelpQueryString + "} } ORDER BY ?distance_mi";
        self.send('query', combinedQuery);
        //console.log(combinedQuery);
    });
}