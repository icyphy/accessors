// Node script to write invidiual adapters into an adapter ontology.
//
// Copyright (c) 2015-2019 The Regents of the University of California.
// All rights reserved.
//
// Permission is hereby granted, without written agreement and without
// license or royalty fees, to use, copy, modify, and distribute this
// software and its documentation for any purpose, provided that the above
// copyright notice and the following two paragraphs appear in all copies
// of this software.
//
// IN NO EVENT SHALL THE UNIVERSITY OF CALIFORNIA BE LIABLE TO ANY PARTY
// FOR DIRECT, INDIRECT, SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES
// ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
// THE UNIVERSITY OF CALIFORNIA HAS BEEN ADVISED OF THE POSSIBILITY OF
// SUCH DAMAGE.
//
// THE UNIVERSITY OF CALIFORNIA SPECIFICALLY DISCLAIMS ANY WARRANTIES,
// INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE. THE SOFTWARE
// PROVIDED HEREUNDER IS ON AN "AS IS" BASIS, AND THE UNIVERSITY OF
// CALIFORNIA HAS NO OBLIGATION TO PROVIDE MAINTENANCE, SUPPORT, UPDATES,
// ENHANCEMENTS, OR MODIFICATIONS.
//

//@author Matt Weber

// To use, first run
// $ npm install 'n3' 
// In the directory containing this script.

// Needs two command line arguments:
// First, the path to an accessor class ontology (turtle format ttl extension) with no individuals, likely $PTII/org/terraswarm/accessor/accessors/web/ontology/AdaptersCore.ttl 
// Second, the path to the desired output ontology file (written in turtle format ttl extension).
// eg. Invoke as: $ node adapterOntologyBuilder.js AdaptersCore.ttl OutputAdapters.ttl

if (process.argv.length <= 2) {
    console.log("Usage: node " + __filename + " path to adapter core ontology, output file path");
    process.exit(-1);
}

var fs = require('fs');
var N3 = require('n3');
var DataFactory = N3.DataFactory;
var quad = DataFactory.quad;
var literal = DataFactory.literal;
var namedNode = DataFactory.namedNode;
var store = new N3.Store();
var parser = new N3.Parser();

//Specify prefixes here (if any).
var writer = new N3.Writer({ prefixes: {
                         adapters: "http://ptolemy.berkeley.edu/adapters#",
                         accessors: "http://ptolemy.berkeley.edu/accessors#" }
                        }); 
 
var adapterCorePath = process.argv[2];
var outputPath = process.argv[3];

fs.readFile(adapterCorePath, 'utf8', function (err, data) {
    parser.parse(data, function(error, quad, prefixes){
        if(error){
            console.log("Error parsing adapter core ontology: " + error);
        }
        if(quad){
            writer.addQuad(quad);
        }
        if(quad == null){
            addIndividuals()
        }
    });
});

//After parsing the core ontology, create nodes for individuals.
function addIndividuals(){

    //Create temperature objects with identity arrows

    //Kelvin
    writer.addQuad(
      namedNode('http://ptolemy.berkeley.edu/adapters#Kelvin'),
      namedNode('a'),
      namedNode('http://ptolemy.berkeley.edu/adapters#CategoryObject')
    );

    //Celsius
    writer.addQuad(
      namedNode('http://ptolemy.berkeley.edu/adapters#Celsius'),
      namedNode('a'),
      namedNode('http://ptolemy.berkeley.edu/adapters#CategoryObject')
    );

    //Fahrenheit
    writer.addQuad(
      namedNode('http://ptolemy.berkeley.edu/adapters#Fahrenheit'),
      namedNode('a'),
      namedNode('http://ptolemy.berkeley.edu/adapters#CategoryObject')
    );

    //TODO replace this loop with inference in the repository.
    var categoryObjects = ["Kelvin", "Celsius", "Fahrenheit"];
    for(var i = 0; i < categoryObjects.length; i++){
        var identityArrow = store.createBlankNode('CategoryArrow');
        writer.addQuad(
          identityArrow,
          namedNode('a'),
          namedNode('http://ptolemy.berkeley.edu/adapters#CategoryArrow')
        );

        writer.addQuad(
          identityArrow,
          namedNode('http://ptolemy.berkeley.edu/adapters#MatchesFrom'),
          namedNode('http://ptolemy.berkeley.edu/adapters#' + categoryObjects[i])
        );

        writer.addQuad(
          identityArrow,
          namedNode('http://ptolemy.berkeley.edu/adapters#MatchesTo'),
          namedNode('http://ptolemy.berkeley.edu/adapters#' + categoryObjects[i])
        );

        writer.addQuad(
          namedNode('http://ptolemy.berkeley.edu/accessors/adapters/Identity.js'),
          namedNode('http://ptolemy.berkeley.edu/adapters#Implements'),
          identityArrow
        );
    }

    //Celsius to Fahrenheit
    var cToF = store.createBlankNode('CelsiusToFahrenheit');
    writer.addQuad(
          cToF,
          namedNode('a'),
          namedNode('http://ptolemy.berkeley.edu/adapters#CategoryArrow')
        );

        writer.addQuad(
          cToF,
          namedNode('http://ptolemy.berkeley.edu/adapters#MatchesFrom'),
          namedNode('http://ptolemy.berkeley.edu/adapters#Celsius')
        );

        writer.addQuad(
          cToF,
          namedNode('http://ptolemy.berkeley.edu/adapters#MatchesTo'),
          namedNode('http://ptolemy.berkeley.edu/adapters#Fahrenheit')
        );

        writer.addQuad(
          namedNode('http://ptolemy.berkeley.edu/accessors/adapters/CelsiusToFahrenheit.js'),
          namedNode('http://ptolemy.berkeley.edu/adapters#Implements'),
          cToF
        );

    //Kelvin to Fahrenheit
    var kToF = store.createBlankNode('KelvinToFahrenheit');
    writer.addQuad(
          kToF,
          namedNode('a'),
          namedNode('http://ptolemy.berkeley.edu/adapters#CategoryArrow')
        );

        writer.addQuad(
          kToF,
          namedNode('http://ptolemy.berkeley.edu/adapters#MatchesFrom'),
          namedNode('http://ptolemy.berkeley.edu/adapters#Kelvin')
        );

        writer.addQuad(
          kToF,
          namedNode('http://ptolemy.berkeley.edu/adapters#MatchesTo'),
          namedNode('http://ptolemy.berkeley.edu/adapters#Fahrenheit')
        );

        writer.addQuad(
          namedNode('http://ptolemy.berkeley.edu/accessors/adapters/KelvinToFahrenheit.js'),
          namedNode('http://ptolemy.berkeley.edu/adapters#Implements'),
          kToF
        );


    writer.end(function (error, result){
        if(error){
            console.log("Error serializing output ontology: " + error);
        }
        fs.appendFileSync(outputPath, result);
        //console.log(result)
    });
}