// Node script to write invidiuals into an accessor ontology by iterating
// over the contents of the local accessor repo.
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
// First, the path to the root directory of the accessors repo, likely $PTII/org/terraswarm/accessor/accessors/web/
// Second, the path to an accessor class ontology (turtle format ttl extension) with no individuals, likely $PTII/org/terraswarm/accessor/accessors/web/ontology/Accessors.ttl 
// Third, the path to the desired output ontology file (written in turtle format ttl extension).
// eg. Invoke as: $ node accessorOntologyBuilder.js .. AccessorsCore.ttl OutputAccessors.ttl


var fs = require('fs');

// Update this path if this file is moved!
// __dirname is the path of the directory in which this file is defined.
var pathToNodeHost = __dirname +'/../hosts/node/nodeHost.js'
var nodeHost = require(pathToNodeHost);
var rdf = require('rdf');
var createNamedNode = rdf.environment.createNamedNode.bind(rdf.environment);
var createBlankNode = rdf.environment.createBlankNode.bind(rdf.environment);
var createLiteral = rdf.environment.createLiteral.bind(rdf.environment);
var createTriple = rdf.environment.createTriple;

var path = require('path');
 
if (process.argv.length <= 3) {
    console.log("Usage: " + __filename + " path to directory containing index, path to accessor class ontology, output file path");
    process.exit(-1);
}
 
var topPath = process.argv[2];
var accessorClassPath = process.argv[3];
var outputPath = process.argv[4];

//Set prefixes to use in the constructed ontology.
//Note: Prefixes in the input ontology are handled automatically and separately from these.
var profile = rdf.environment.createProfile();
//profile.setDefaultPrefix('http://ptolemy.berkeley.edu/accessors');
profile.setPrefix('accessors','http://ptolemy.berkeley.edu/accessors#' );
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


fs.readFile(accessorClassPath, 'utf8', function (err, data) {
    if (err) throw err;
    var base = "http://ptolemy.berkeley.edu/accessors";
    var parsed = rdf.TurtleParser.parse(data, base);
    var graph = parsed.graph;
    var typePredicate = createNamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
    //console.log(ontol.graph.toTurtle(profile));

    var categories;
    var topIndex = topPath + '/index.json';
    var i;
    fs.readFile(topIndex, 'utf8', function (err, data) {
      if (err) throw err;
      categories = JSON.parse(data);

      //Track the number of completed categories to enable a callback after every accessor has been processed
      var finishedCategories = 0;

      for(i = 0; i < categories.length; i++){
        var category = categories[i];
        getAccessors(category);
      }

    function getAccessors(category){
        var categoryIndex = topPath + '/' + category + '/index.json';
        fs.readFile(categoryIndex, 'utf8', function (err, data) {
            if (err) throw err;
            var accessorList = JSON.parse(data);
            for(var j =0; j < accessorList.length; j++){
                //console.log(accessorList[j]);
                accessorPath = topPath + '/' + category + '/' + accessorList[j];
                try{ 
                    //This function makes a synchronous read on the accessorPath
                    var x = nodeHost.instantiateInterface("x", accessorPath);
                    //console.log(x);
                    //console.log(x.accessor.inputs[x.accessor.inputList[0]]);

                    //Write accessor 'type' triple
                    //File type (.js) is kept to let accessor URIs work on the web
                    var accessorName = path.basename(x.accessor.accessorClass); 
                    var accessorFullDir =  path.dirname(x.accessor.accessorClass);
                    var accessorParentDir = path.basename(accessorFullDir);
                    var accessorClass = accessorParentDir + '/' + accessorName;

                    //NOTE: for this uri to work without redirection it has to start with https
                    var accessorURI = "https://ptolemy.berkeley.edu/accessors/" + accessorClass;
                    var accessorNode = createNamedNode(accessorURI);
                    var accessorType = createNamedNode('http://ptolemy.berkeley.edu/accessors#Accessor');
                    var accessorTypeTriple = createTriple(accessorNode, typePredicate, accessorType);
                    graph.add(accessorTypeTriple);

                    var baseType = createNamedNode('http://www.w3.org/2002/07/owl#NamedIndividual');
                    var accessorBaseTypeTriple = createTriple(accessorNode, typePredicate, baseType);
                    graph.add(accessorBaseTypeTriple);

                    //Write the accessor 'extends' triple if any
                    //Note that this extended accessor will get its own type triple when it is processed as the primary accessor
                    //above in the previous lines.
                    if(x.accessor.extending){
                        //console.log(x.accessor.extending.accessorClass);
                        var extendedAccessorURI = "http://ptolemy.berkeley.edu/accessors/" + x.accessor.extending.accessorClass + ".js";
                        var extendedAccessorNode = createNamedNode(extendedAccessorURI);
                        var extendsPredicate = createNamedNode('http://ptolemy.berkeley.edu/accessors#Extends');
                        var extendsTriple = createTriple(accessorNode, extendsPredicate, extendedAccessorNode);
                        graph.add(extendsTriple);
                    }

                    //FIXME: currently no test cases have subAccessors
                    //Write the subAccessors triples if any
                    if(x.accessor.subAccessors){
                        for(var o; o < x.accessor.subAccessors.length; o++){
                            var subAcc = x.accessor.subAccessors[o];
                            var subAccURI = "http://ptolemy.berkeley.edu/accessors/" + subAcc.accessorClass + ".js";
                            var subAccNode = createNamedNode(subAccURI);
                            var subAccPredicate = createNamedNode('http://ptolemy.berkeley.edu/accessors#SubAccessor');
                            var subAccTriple = createTriple(accessorNode, subAccPredicate, subAccNode);
                            graph.add(subAccTriple);
                        }
                    }

                    //Write the accessor 'implements' triple if any
                    if(x.accessor.implementedInterfaces){
                        for(var q = 0; q <x.accessor.implementedInterfaces.length; q++ ){
                            var face = x.accessor.implementedInterfaces[q];
                            
                            //Assume this interface has not already been entered into the ontology.
                            //It needs a type triple, ports, and an implements triple
                            var faceName = path.basename(face.accessorClass); 
                            var faceFullDir =  path.dirname(face.accessorClass);
                            var faceParentDir = path.basename(faceFullDir);
                            var faceClass = faceParentDir + '/' + faceName;

                            //Write type triple for the interface
                            var implementedFaceURI = "http://ptolemy.berkeley.edu/accessors/" + faceClass;
                            var faceNode = createNamedNode(implementedFaceURI);
                            var faceType = createNamedNode('http://ptolemy.berkeley.edu/accessors#Interface');
                            var faceTypeTriple = createTriple(faceNode, typePredicate, faceType);
                            graph.add(faceTypeTriple);

                            //Write implemented triple for this accessor and this interface
                            var implementsPredicate = createNamedNode('http://ptolemy.berkeley.edu/accessors#Implements');
                            var implementsTriple = createTriple(accessorNode, implementsPredicate, faceNode);
                            graph.add(implementsTriple);

                            //Write port triples for the interface
                            addPortsToGraph(face, implementedFaceURI, faceNode );
                        }

                    }

                    //Write accessor 'requires' triples if any
                    for (var i = 0; i < x.modules.length; i++){
                        
                        //Write type triple for this module
                        //An accessor that refers to a module as '@accessors-modules/web-socket-server' and
                        //as just 'web-socket-server' should refer to the same module. 
                        var moduleName = path.basename(x.modules[i]);
                        var moduleURI = 'http://ptolemy.berkeley.edu/hosts#Module.' + moduleName;
                        var moduleNode = createNamedNode(moduleURI);
                        var moduleType = createNamedNode('http://ptolemy.berkeley.edu/hosts#Module');
                        var moduleTypeTriple = createTriple(moduleNode, typePredicate, moduleType);
                        graph.add(moduleTypeTriple);
                        
                        //Write requires triple for this module
                        var requiresPredicate = createNamedNode('http://ptolemy.berkeley.edu/accessors#Requires');
                        var requiresTriple = createTriple(accessorNode, requiresPredicate, moduleNode);
                        graph.add(requiresTriple);
                    }

                    //Write accessor port triples
                    addPortsToGraph(x.accessor, accessorURI, accessorNode );
                    
                } catch (e) {
                    console.error("Problem instantiating interface for " + accessorPath);
                    console.error(e);
                }

                //console.log(x);
            }
            finishedCategories++;
            if(finishedCategories == categories.length){
                outputOntology()
            }

        });
    }

    //Write port triples for this accessor/interface to the graph
    //In case port names contain illegal characters (like whitespace), they are URI encoded.
    function addPortsToGraph(face, faceURI, faceNode ){

        //Write accessor input triples if any
        for (var i = 0; i< face.inputList.length; i++){

            //Write type triple for this input
            var inputName = encodeURIComponent(face.inputList[i]);
            var inputURI = faceURI + '.Input.' + inputName;
            var inputNode = createNamedNode(inputURI);
            var inputType = createNamedNode('http://ptolemy.berkeley.edu/accessors#Input');
            var inputTypeTriple = createTriple(inputNode, typePredicate, inputType);
            graph.add(inputTypeTriple);

            //Write hasInput triple for this accessor
            var hasInputPredicate = createNamedNode('http://ptolemy.berkeley.edu/accessors#HasInput');
            var hasInputTriple = createTriple(faceNode, hasInputPredicate, inputNode);
            graph.add(hasInputTriple);
        }


        //FIXME: typed literals are behaving strangely, adding quotes to strings etc.
        //Write input property triples if any
        if( face.inputs[inputName]){
            var inputObject = face.inputs[inputName]

            //Write hasType triple for this input if given
            if (inputObject.type){
                var inputTypeLiteral = createLiteral(inputObject.type, 'http://www.w3.org/2001/XMLSchema#string');
                var inputHasTypePredicate = createNamedNode('http://ptolemy.berkeley.edu/accessors#HasType');
                var inputHasTypeTriple = createTriple(inputNode, inputHasTypePredicate, inputTypeLiteral );
                graph.add(inputHasTypeTriple);
            }

            // //FIXME: currently literals are written as stringified JSON instead of the true type.
            // //I can't figure out how to get this to write arbitrary types
            // //One option is to encode a different type of literal according to the specified type attribute from above
            // //Write hasDefaultValue triple for this input if given
            // if(inputObject.value){
            //     var inputDefaultValueLiteral = createLiteral(JSON.stringify(inputObject.value), 'http://www.w3.org/2001/XMLSchema#string');
            //     var inputHasDefaultValuePredicate = createNamedNode('http://ptolemy.berkeley.edu/accessors#HasDefaultValue');
            //     var inputHasDefaultValueTriple = createTriple(inputNode, inputHasDefaultValuePredicate, inputDefaultValueLiteral);
            //     graph.add(inputHasDefaultValueTriple);
            // }

            // //Write Visibility triple for this input if given
            // if(inputObject.visibility){
            //     var inputVisibilityLiteral = createLiteral(JSON.stringify(inputObject.visibility), 'http://www.w3.org/2001/XMLSchema#string');
            //     var inputVisibilityPredicate = createNamedNode('http://ptolemy.berkeley.edu/accessors#Visibility');
            //     var inputVisibilityTriple = createTriple(inputNode, inputVisibilityPredicate, inputVisibilityLiteral);
            //     graph.add(inputVisibilityTriple);
            // }

            // //Write option triples for this input if given
            // if(inputObject.options){
            //     for(var j = 0; j < inputObject.options.length; j++ ){
            //         var inputOptionLiteral = createLiteral(JSON.stringify(inputObject.options[j]), 'http://www.w3.org/2001/XMLSchema#string');
            //         var inputHasOptionPredicate = createNamedNode('http://ptolemy.berkeley.edu/accessors#HasOption');
            //         var inputHasOptionTriple = createTriple(inputNode, inputHasOptionPredicate, inputOptionLiteral);
            //         graph.add(inputHasOptionTriple);
            //     }
            // }

        }


        //Write accessor parameter triples if any
        for (var i = 0; i< face.parameterList.length; i++){

            //Write type triple for this parameter
            var parameterName = encodeURIComponent(face.parameterList[i]);
            var parameterURI = faceURI + '.Parameter.' + parameterName;
            var parameterNode = createNamedNode(parameterURI);
            var parameterType = createNamedNode('http://ptolemy.berkeley.edu/accessors#Parameter');
            var parameterTypeTriple = createTriple(parameterNode, typePredicate, parameterType);
            graph.add(parameterTypeTriple);

            //Write hasParameter triple for this accessor
            var hasParameterPredicate = createNamedNode('http://ptolemy.berkeley.edu/accessors#HasParameter');
            var hasParameterTriple = createTriple(faceNode, hasParameterPredicate, parameterNode);
            graph.add(hasParameterTriple);

            //FIXME: typed literals are behaving strangely, adding quotes to strings etc.
            //Write parameter property triples if any
            if( face.parameters[parameterName]){
                var parameterObject = face.parameters[parameterName]

                //Write hasType triple for this parameter if given
                if (parameterObject.type){
                    var parameterTypeLiteral = createLiteral(parameterObject.type, 'http://www.w3.org/2001/XMLSchema#string');
                    var parameterHasTypePredicate = createNamedNode('http://ptolemy.berkeley.edu/accessors#HasType');
                    var parameterHasTypeTriple = createTriple(parameterNode, parameterHasTypePredicate, parameterTypeLiteral );
                    graph.add(parameterHasTypeTriple);
                }

                // //FIXME: currently literals are written as stringified JSON instead of the true type.
                // //I can't figure out how to get this to write arbitrary types
                // //One option is to encode a different type of literal according to the specified type attribute from above
                // //Write hasDefaultValue triple for this parameter if given
                // if(parameterObject.value){
                //     var parameterDefaultValueLiteral = createLiteral(JSON.stringify(parameterObject.value), 'http://www.w3.org/2001/XMLSchema#string');
                //     var parameterHasDefaultValuePredicate = createNamedNode('http://ptolemy.berkeley.edu/accessors#HasDefaultValue');
                //     var parameterHasDefaultValueTriple = createTriple(parameterNode, parameterHasDefaultValuePredicate, parameterDefaultValueLiteral);
                //     graph.add(parameterHasDefaultValueTriple);
                // }

                // //Write Visibility triple for this parameter if given
                // if(parameterObject.visibility){
                //     var parameterVisibilityLiteral = createLiteral(JSON.stringify(parameterObject.visibility), 'http://www.w3.org/2001/XMLSchema#string');
                //     var parameterVisibilityPredicate = createNamedNode('http://ptolemy.berkeley.edu/accessors#Visibility');
                //     var parameterVisibilityTriple = createTriple(parameterNode, parameterVisibilityPredicate, parameterVisibilityLiteral);
                //     graph.add(parameterVisibilityTriple);
                // }

                // //Write option triples for this parameter if given
                // if(parameterObject.options){
                //         //console.log("hiiiii!!!!");
                //         //console.log(parameterObject.options[j]);
                //         //console.log(parameterObject.options.length);
                //     for(var k = 0; k < parameterObject.options.length; k++ ){
                //         var parameterOptionLiteral = createLiteral(JSON.stringify(parameterObject.options[k]), 'http://www.w3.org/2001/XMLSchema#string');
                //         var parameterHasOptionPredicate = createNamedNode('http://ptolemy.berkeley.edu/accessors#HasOption');
                //         var parameterHasOptionTriple = createTriple(parameterNode, parameterHasOptionPredicate, parameterOptionLiteral);
                //         graph.add(parameterHasOptionTriple);
                //     }
                // }
            }
        }

        //Write accessor output triples
        for (var i = 0; i< face.outputList.length; i++){

            //Write type triple for this output
            var outputName = encodeURIComponent(face.outputList[i]);
            var outputURI = faceURI + '.Output.' + outputName;
            var outputNode = createNamedNode(outputURI);
            var outputType = createNamedNode('http://ptolemy.berkeley.edu/accessors#Output');
            var outputTypeTriple = createTriple(outputNode, typePredicate, outputType);
            graph.add(outputTypeTriple);

            //Write hasOutput triple for this accessor
            var hasOutputPredicate = createNamedNode('http://ptolemy.berkeley.edu/accessors#HasOutput');
            var hasOutputTriple = createTriple(faceNode, hasOutputPredicate, outputNode);
            graph.add(hasOutputTriple);

            //FIXME: typed literals are behaving strangely, adding quotes to strings etc.
            //Write output property triples if any
            if( face.outputs[outputName]){
                var outputObject = face.outputs[outputName]

                //Write hasType triple for this output if given
                if (outputObject.type){
                    var outputTypeLiteral = createLiteral(outputObject.type, 'http://www.w3.org/2001/XMLSchema#string');
                    var outputHasTypePredicate = createNamedNode('http://ptolemy.berkeley.edu/accessors#HasType');
                    var outputHasTypeTriple = createTriple(outputNode, outputHasTypePredicate, outputTypeLiteral );
                    graph.add(outputHasTypeTriple);
                }

                //FIXME: writing parsed json instead of a boolean
                //Write Spontaneity triple for this output if given
                if(outputObject.spontaneous){
                    var outputSpontaneityLiteral = createLiteral(JSON.stringify(outputObject.spontaneous), 'http://www.w3.org/2001/XMLSchema#string');
                    var outputSpontaneityPredicate = createNamedNode('http://ptolemy.berkeley.edu/accessors#Spontaneity');
                    var outputSpontaneityTriple = createTriple(outputNode, outputSpontaneityPredicate, outputSpontaneityLiteral);
                    graph.add(outputSpontaneityTriple);
                }
            }
        }
    }


        //Prints the constructed ontology in turtle format after everything has been written to the graph.
        //The rdf module doesn't print URI's in brackets which means '#' symbols in the URIs are treated as turtle comments
        function outputOntology(){
            // var thingToPrint = graph.toArray();
            // for( var w= 0; w < thingToPrint.length; w++){
            //     console.log(thingToPrint[w]);
            // }
            var arrayRep = graph.toArray().map(function(stmt){
                // var nonBracketTurtle = stmt.toTurtle(profile);
                // var components = nonBracketTurtle.split(" ");
                // components[0] = "<" + components[0] + ">";
                // components[1] = "<" + components[1] + ">";
                
                // //Only literals have a defined datatype attribute for the object node and we don't want them in brackets
                // if(! stmt.object.datatype){
                //     components[2] = "<" + components[2] + ">";
                // }
                // return components.join(" ");
                return stmt.toTurtle(profile);
            });

            //console.log(arrayRep);
            fs.appendFileSync(outputPath, arrayRep.join('\n'));
            //var y = nodeHost.getTopLevelAccessors();
            //console.log(y)

        }
    });


});