
var ontologyChecker = require('./ontologyChecker');

// Require the module jsonfile to read a json object from a file
var jsonfile = require('jsonfile');

var testOntology;
var ontologyFile = ('./2DEuclideanOntology.json');

// Firt, start by loading the ontology into an object
jsonfile.readFile(ontologyFile, function(err, obj) {
	if (err) {
		console.log('Error loading the json object from file: ' + ontologyFile);
	} else {
		console.log('loaded ontology' + obj);
		testOntology = new ontologyChecker.Ontology('test', null, obj);


		if (testOntology) {
			console.log('the ontology: ' + testOntology.checkOntology("a", "close", "b", false, [0.1]));
		}
	}  
});




