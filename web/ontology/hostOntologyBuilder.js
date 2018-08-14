// Node script to write invidiuals into a hosts ontology by iterating
// over the modules in the accessor and Ptolemy II repos.
//
// Copyright (c) 2015-2018 The Regents of the University of California.
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
// $ npm install 'rdf' 
// In the directory containing this script.

// Needs three command line arguments.
// First, the path to the hosts directory of the accessors repo, likely $PTII/org/terraswarm/accessor/accessors/web/hosts
// Second, the path to the Ptolemy II modules directory in the Ptolemy repo, likely $PTII/ptolemy/actor/lib/jjs/modules
// Third, the path to an hosts class ontology (turtle format ttl extension) with no individuals, likely $PTII/org/terraswarm/accessor/accessors/web/ontology/Hosts.ttl 
// Fourth, the path to the desired output ontology file (written in turtle format ttl extension).
// eg. Invoke as: $ node hostOntologyBuilder.js ../hosts $PTII/ptolemy/actor/lib/jjs/modules Hosts.ttl OutputHosts.ttl


var fs = require('fs');

// Update this path if this file is moved!
// __dirname is the path of the directory in which this file is defined.
var pathToNodeHost = __dirname +'/../hosts/node/nodeHost.js';
//var nodeHost = require(pathToNodeHost);
var rdf = require('rdf');
var createNamedNode = rdf.environment.createNamedNode.bind(rdf.environment);
var createBlankNode = rdf.environment.createBlankNode.bind(rdf.environment);
var createLiteral = rdf.environment.createLiteral.bind(rdf.environment);
var createTriple = rdf.environment.createTriple;

var path = require('path');
 
if (process.argv.length <= 4) {
    console.log("Usage: " + __filename + " path to hosts directory, path to PTII modules directory, path to hosts class ontology, output file path");
    process.exit(-1);
}
 
var hostsPath = process.argv[2];
var ptIIModulesPath = process.argv[3];
var hostClassPath = process.argv[4];
var outputPath = process.argv[5];

//Set prefixes to use in the constructed ontology.
//Note: Prefixes in the input ontology are handled automatically and separately from these.
var profile = rdf.environment.createProfile();
//profile.setDefaultPrefix('http://ptolemy.berkeley.edu/accessors');
//profile.setPrefix('accessors','http://ptolemy.berkeley.edu/accessors#' );
profile.setPrefix('hosts', 'http://ptolemy.berkeley.edu/hosts#');
profile.setPrefix('owl', 'http://www.w3.org/2002/07/owl#');
profile.setPrefix('rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#');
profile.setPrefix('xml', 'http://www.w3.org/XML/1998/namespace');
profile.setPrefix('xsd', 'http://www.w3.org/2001/XMLSchema#');
profile.setPrefix('rdfs', 'http://www.w3.org/2000/01/rdf-schema#');

//Create file and clobber existing contents
fs.writeFileSync(outputPath, "");

//Output the prefixes used by this ontology
var prefixes = profile.prefixes.prefixMap.forEach(logMapElements);


function logMapElements(value, key, map) {
    //This output uses corect turtle syntax
    fs.appendFileSync(outputPath, '@prefix ' + key + ': <' + value + '> .\n');
}

//Empty line separates prefixes and the rest of the ontology
fs.appendFileSync(outputPath, '\n');


fs.readFile(hostClassPath, 'utf8', function (err, data) {
    if (err) throw err;
    var base = "http://ptolemy.berkeley.edu/hosts";
    var parsed = rdf.TurtleParser.parse(data, base);
    var graph = parsed.graph;
    var typePredicate = createNamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
    var implementsPredicate = createNamedNode('http://ptolemy.berkeley.edu/hosts#Implements');
    var moduleType = createNamedNode('http://ptolemy.berkeley.edu/hosts#Module');
    //console.log(ontol.graph.toTurtle(profile));

    //Read Browser Host Modules
    var browserPath = path.join(hostsPath, 'browser/modules');
    var browserDirFiles = fs.readdirSync(browserPath);
    var browserURI = 'http://ptolemy.berkeley.edu/hosts#Host.BrowserHost';
    for(var i = 0; i < browserDirFiles.length; i++){
        var currentFile = browserDirFiles[i];

        //Assume all files with .js extension are modules
        if(path.extname(currentFile) == ".js"){
            var moduleName = path.basename(currentFile, ".js");         
            var moduleURI = "http://ptolemy.berkeley.edu/hosts#Module." + moduleName;
            addModuleTriples(moduleURI, browserURI);
        }
    }

    //Read Common Host Modules
    var commonPath = path.join(hostsPath, 'common/modules');
    var commonDirFiles = fs.readdirSync(commonPath);
    var commonURI = 'http://ptolemy.berkeley.edu/hosts#Host.CommonHost';
    for(var i = 0; i < commonDirFiles.length; i++){
        var currentFile = commonDirFiles[i];

        //Assume all files with .js extension are modules
        if(path.extname(currentFile) == ".js"){
            var moduleName = path.basename(currentFile, ".js");         
            var moduleURI = "http://ptolemy.berkeley.edu/hosts#Module." + moduleName;
            addModuleTriples(moduleURI, commonURI);
        }
    }

    outputOntology();

    //Prints the constructed ontology in turtle format after everything has been written to the graph.
    //The rdf module doesn't print URI's in brackets which means '#' symbols in the URIs are treated as turtle comments
    function outputOntology(){
        var arrayRep = graph.toArray().map(function(stmt){
            return stmt.toTurtle(profile);
        });
        fs.appendFileSync(outputPath, arrayRep.join('\n'));
    }

    //Writes 'type' and 'implements' triples for the module
    function addModuleTriples(moduleURI, hostURI){   
        
        //Write Module 'type' triple
        var moduleNode = createNamedNode(moduleURI);
        var moduleTypeTriple = createTriple(moduleNode, typePredicate, moduleType);
        graph.add(moduleTypeTriple);

        //Write Module 'Implements' triple
        var hostNode = createNamedNode(hostURI); 
        var moduleImplementsTriple = createTriple(hostNode, implementsPredicate, moduleNode);
        graph.add(moduleImplementsTriple);
    }
});

