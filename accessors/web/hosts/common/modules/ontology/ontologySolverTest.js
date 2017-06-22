// This file in an illustration of the use of the ontomogy module
// A tutorial is on the way

// Require module Ontology Solver
var ontologySolver = require('./ontologySolver');

// Require module fs to read the contents in the file
var fs = require('fs');

// In this case, lightOntology is saved in a json file
var lightOntology;
var lightOntologyFile = ('./lightOntology.json');

// Read the contents of the ontology file
var ontologyString = fs.readFileSync(lightOntologyFile, 'utf8');
// console.log(ontologyString);
// console.log(JSON.parse(ontologyString));

// Create light ontology using the constructor. The meaning of the parameters are (in order):
// the ontology name, set the ontology to be editable, pass the ontology string, no ontology 
// object, no file path and no file reader funtion.
lightOntology = new ontologySolver.Ontology('lightOntology', true, ontologyString, null, null, null);

// It is also possible to load the ontology by providing the file path and the reader function 
// the previous instruction will be called this way
// lightOntology = new ontologySolver.Ontology('lightOntology', true, null, null, lightOntologyFile, fs.readFileSync, 'utf8');

// If the ontology is loaded successfully, then solve some requests.
if (lightOntology) {
	var slvTemp, addTripleTemp, addFuncTemp;

	console.log('************ Testing solve in lightOntology');
	
	slvTemp = lightOntology.solve("hueBulb", "isA", "smartLight", true);
	console.log('Solve in ' + lightOntology.ontologyName + ' if hueBulb isA smartlight: ' + slvTemp);
	
	slvTemp = lightOntology.solve("hueBulb", "isA", "light", true);
	console.log('Solve in ' + lightOntology.ontologyName + ' if hueBulb isA light: ' + slvTemp);
	
	slvTemp = lightOntology.solve("hueBulb", "isA", "eee", true);
	console.log('Solve in ' + lightOntology.ontologyName + ' if hueBulb isA eee: ' + slvTemp);

	console.log('************ Testing addTriple in lightOntology');

	addTripleTemp = lightOntology.addTriple("hueBulb", "isA", "smartLight");
	console.log('Add triple in ' + lightOntology.ontologyName + ' if hueBulb isA smartlight: ' + addTripleTemp);
	
	addTripleTemp = lightOntology.addTriple("hueBulb", "isA", "light");
	console.log('Add triple in ' + lightOntology.ontologyName + ' if hueBulb isA light: ' + addTripleTemp);
	
	addTripleTemp = lightOntology.addTriple("hueBulb", "isA", "eee");
	console.log('Add triple in ' + lightOntology.ontologyName + ' if hueBulb isA eee: ' + addTripleTemp);

	console.dir(lightOntology.ontologyObject);
}


///////////////////////////////////////////////////////////////////////////////////

// In this case, lightOntology is saved in a json file
var euclideanOntology;
var euclideanOntologyFile = ('./2DEuclideanOntology.json');

// Read the contents of the ontology file
var ontologyString = fs.readFileSync(euclideanOntologyFile, 'utf8');
// console.log(ontologyString);
// console.log(JSON.parse(ontologyString));

// Create euclidean ontology using the constructor. The meaning of the parameters are (in order):
// the ontology name, set the ontology to be editable, pass the ontology string, no ontology 
// object, no file path and no file reader funtion.
euclideanOntology = new ontologySolver.Ontology('euclideanOntology', true, ontologyString, null, null, null);

// If the ontology is 
if (euclideanOntology) {

	console.log('************ Testing solve in 2DEuclideanOntology');

	console.log('Solve in ' + euclideanOntology.ontologyName + ' if a is close to be and the threshold is 10: ' +
			euclideanOntology.solve("a", "close", "b", false, [10]));
	console.log('Solve in ' + euclideanOntology.ontologyName + ' if a is close to be and the threshold is 0.1: ' +
			euclideanOntology.solve("a", "close", "b", false, [0.1]));

	var newFunction = "if (a.coordinates[0] < b.coordinates[1]) {return true;} else {return false;}";
	console.log('Adding function foo to euclideanOntology: ' + euclideanOntology.addFunction('foo', newFunction));
	console.dir(euclideanOntology.ontologyObject);

	console.log('Solve in ' + euclideanOntology.ontologyName + ' testing foo ' +
			euclideanOntology.solve("a", "foo", "b", false));

	console.log('Solve in ' + euclideanOntology.ontologyName + ' testing foo ' +
			euclideanOntology.solve("a", "close", "c", false, [0.1]));
}  
