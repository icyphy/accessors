// Ontology loader and checker module
//
// Copyright (c) 2015-2017 The Regents of the University of California.
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

/** This module provides the needed functions for loading, parsing, and 
 *  solving ontological requests.
 * 
 *  Description of the supported ontology JSON object
 *  -------------------------------------------------
 *
 *  Ontological knowledge is saved in a JSON object that includes a list of
 *  'elementary ontological knowledge'. We define by 'elementary ontological
 *  knowledge' as being either triples, or relations.
 *
 *  Triples are attributes of the ontology object of the form:
 * 		class_1: {
 *			"@context": "class1UrlOntology",
 *			isSubClassOf: [class_11 , class_12, ...]	
 *		}
 *  where variables class_1, class_11, and class_12 are classes that are related
 *  by the variable isSubClassOf relation.
 *  The contents of this triple can be read as:
 *  	"class_1 isSubClassOf class_11" and
 *  	"class_1 isSubClassOf class_12".
 *  isSubClassOf is a string that describes an ontological relational knowledge, 
 *  that can be, for instance: "isA", "hasA"...
 *  The value of isSubClassOf relation can be a string or an array of strings. Each
 *  string describes a class.
 *
 *  The "@context" attribute of a triple is a URL that refers to the context that
 *  uniquely identifies the attributes in the triple. This refers to  JSON-LD 
 *  encoding method for linked using JSON. This is a WWW Consortium Recommendation. 
 *  The use of this attribute is not supported in the current version. However it 
 *  is added as a reminder that the next versions will need to support JSON-LD.
 *
 *  Relations are also 'elementary ontological knowledge'. They are functions that
 *  can be used to evaluate and deduce more elaboraed ontological knowledge. These 
 *  realtions are stored in the attribute "$relations" and functions should be expressed
 *  following this syntax:
 *		"$relations": {
 *			function_1: "var ...; \n  ... \n return x",
 *			function_2: "... ; \n  ... \n retun y",
 *			...
 *		},
 *  where "$relations" is a keyword, function_1 and function_2 are function varilables
 *  of string values. The strings are the code of the functions.
 *
 *  FIXME: What about CASE SENSITIVITY??????????????????????????
 *
 *  Ontology loading
 *  ----------------
 *  There are several ways to load the ontology and construct the ontologyObject.
 *  The most straitforward and already implmented one creates the object during
 *  instantiation, and either a string to parse, the object itself, or a file path 
 *  with the file reader function are provided. 
 *  It is possible to add on runtime triples and functions, only is the ontology is 
 *  editable. This is a property (editable) that is set on creation and cannot be 
 *  changed.
 *
 *  For extensibility and broader use, if the ontology is editable, then triples can
 *  be loaded using URLs. This feature will help enabling JSON-LD support.
 * 
 *  Ontology solver
 *  ---------------
 *  
 *  Two types of ontology solving requests are supported, and they depend on the
 *  the elementary ontological knowledge we stated just above. 
 *  If the request relates to a triple, then an indepth frist search is performed.
 *  solve function is recursive and implements the inference engine. In this case, 
 *  a solve request returns either 'true' or 'undefined'.
 *  If the request relates to a relation, then the function is called on the arguments
 *  and the return value can be 'true', 'false' or 'undefined'.
 *
 *  Ontology matching
 *  -----------------
 *
 *  FIXME: This work is still under discussion/progress.
 *
 *  Ontology mapping
 *  ----------------
 *
 *  FIXME: This work is still under discussion/progress.
 *
 *  @module @accessors-hosts/common/modules/ontology
 *  @author Chadlia Jerad and Matt Weber
 *  @version $$Id: ontologySolver.js 2017-06-12 11:11:30Z chadlia.jerad $$   
 */
  
///////////////////////////////////////////////////////////////////
///////    Ontology class and its functions.

/** Create (using new) an ontology instance. An ontology instance contains a description
 *  of the ontology triples as a JSON object. The created object includes the following 
 *  properties:
 *  * **ontologyName**: The name of the instance provided to the constructor.
 *  * **editable**: Boolean value stating if the ontology is editable or not. If 
      editable, then triples and functions can be added/updated on runtime.
 *  * **ontologyObject**: The object stores the differents triples of the ontology
 *    as a json object.
 *
 *  The ontologyObject creation is supported in three ways:
 *  * ** By providing the ontology description as a string. This string will be parsed 
 *    for the JSON object. An error is thrown if the string is not a valid JSON.
 *  * ** By directly providing the JSON object.
 *  * ** By providing a file path together with the file reader function.
 *
 *  If none of these methods is provided or if the provided one is not valid, the
 *  created ontologyObject remains empty. However, the ontologyObject can be filled
 *  on runtime with new triple values and functions, if editable.
 *
 *  @param ontologyName A name to give to the ontology.
 *  @param editable Boolen value to set it the ontology is editable or not
 *  @param ontologyString This is an optional parameter. If provided, it is a string 
 *   of the ontology object. 
 *  @param ontologuObject This is an optional parameter. It is possible to provide 
 *   the ontology object directly as an JSON object.
 *  @param ontologyFile This is an optional Parameter. It contains the path of the file
 *   that contains the ontology object description. If this parameter is provided, then 
 *   fileReader parameter needs also to be provided.
 *  @param fileReader An optional argument that needs to be provided together with 
 *   ontologyFile parameter. This function will retrieve the ontology object as a string
 *   from the specified ontologyFile path. 
 *  @param args An optional argument if fileReader function needs further
 */
function Ontology(ontologyName, editable, ontologyString, ontologyObject, ontologyFile, fileReader) {
	// Set the ontologyName
	this.ontologyName = ontologyName;

	// Set if the ontology is editable or not
	if (typeof editable === 'boolean') {
		this.editable = editable;
	} else {
		this.editable = true;
	}

	// Create the ontologyObject
	this.ontologyObject = {};

	// Load the ontologyObject attribute, that is the JSON object containing 
	// ontology knowledge
	// 1st way of reading the ontology
	if (ontologyString) {
		try {
			this.ontologyObject = JSON.parse(ontologyString);
		} catch (e) {
			console.log('Ontology module: Error parsing the ontology object from the string: ' + this.ontologyString);
		}
	} else if (ontologyObject) {
		// At this point, the passed parameter is only checked for being an object
		// FIXME: Add more control to check that this is a valid JSON object
		if (typeof ontologyObject === 'object') {
			this.ontologyObject = ontologyObject;	
		} else {
			console.log('Ontology module: Type error in ontologyObject parameter');
		}
	} else if (ontologyFile && fileReader) {
		// Attempt to load ontologyObject from a file, using the provided fileReader function
		if (typeof ontologyFile === 'string' && typeof fileReader === 'function') {
			try {
				this.ontologyObject = JSON.parse(fileReader.call(this, ontologyFile));
			} catch (e) {
				console.log('Ontology module: Error loading ontology from file. The error was: ' + e);		
			}
		} else {
			console.log('Ontology module: Type error in path and/or file reader parameters');
		}
	} 
}

/** Adds a function to the ontologyObject, if the ontology is editable. If the function is already defined, then
 *  it is NOT updated. For updating an existing function, one can call updateFunction
 *  prototype. The function is added to the predefined attribute '$relations'.
 *   
 *  @param functionRelationName Name of the function to add to the ontologyObject.
 *  @param functionCode The function source code
 *  @return true if added successfully, false if not.
 */
Ontology.prototype.addFunction = function(functionRelationName, functionCode) {
	// Check if the ontology is editable
	if (this.editable === false) {
		return false;
	}

	// Check that all mandatory parameters are strings
	if (typeof functionRelationName !== 'string' || typeof functionCode !== 'string') {
		return false;
	}

	// If '$relations' attribute does not exist, then add it
	if (!this.ontologyObject["$relations"]) {
		this.ontologyObject["$relations"] = {};
	}

	// Check if the function already exists
	if (this.ontologyObject["$relations"][functionRelationName]) {
		console.log('Ontology module: addFunction(): Function ' + functionRelationName + 
			' is already defined. Use updateFunction if you want to update its code.');
		return false;
	}

	// Add the new function
	this.ontologyObject["$relations"][functionRelationName] = functionCode;
	return true;
}

/** Adds a triple to the ontologyObject. If the attribute class1 already exists,
 *  then update isSubClassOf relation attribute only if class2 is not already there.
 *  It is also possible to update the @context attribute, but only if the original 
 *  one was an empty string and a context is provided as parameter. If the attribute
 *  class1 is a new one, then it is construted and added.
 *
 *  @param class1 First element of the new triple to add
 *  @param isSubClassOf Name of the subcalssing relation between class1 and class2
 *  @param class2 Second element of the new triple
 *  @param context An optional argument specifying the URL of the context, following 
 *   the JSON-LD WWW consortium recommendation.
 *  @return true if added successfully, false if not.
 */
Ontology.prototype.addTriple = function(class1, isSubClassOf, class2, context) {
	// Check if the ontology is editable
	if (this.editable === false) {
		return false;
	}

	// Check that all mandatory parameters are strings
	if (typeof class1 !== 'string' || typeof isSubClassOf !== 'string' || typeof class2 !== 'string') {
		return false;
	}

	// If class1 is already an attribute within the ontologyObject, then update it
	if (this.ontologyObject[class1]) {
		if (this.ontologyObject[class1][isSubClassOf]) {
			// If the relation isSubClassOf already exists, then update its value
			var class12Temp = this.ontologyObject[class1][isSubClassOf];
			if (typeof class12Temp === 'string') {
				// Add class2 only if it is new
				if (class12Temp !== class2) {
					this.ontologyObject[class1][isSubClassOf] = [class12Temp, class2];
				}
			} else {
				// It is already an array, add if does not exist already
				var index = this.ontologyObject[class1][isSubClassOf].indexOf(class2);
				if (index === -1) {
					this.ontologyObject[class1][isSubClassOf].push(class2);
				}
			}
		} else {
			// If Class1 context attribute is already defined, then keep the 
			// original one
			// Otherwise, if no precedent context attribute and a context is
			// provided as a parameter, then use it.
			this.ontologyObject[class1][isSubClassOf] = class2;
			if (this.ontologyObject[class1]["@context"] === '' && context && typeof context === 'string') {
				this.ontologyObject[class1]["@context"] = context;
			}
		}
	} else {
		// Case where Class 1 is a new class
		this.ontologyObject[class1] = {
			"@context": '',
			isSubClassOf : class2
		}
		if (context && typeof context === 'string') {
			this.ontologyObject[class1]["@context"] = context;
		}			
	}
	return true;
}

/** This function loads and adds a triple from a given URL as parameter, if the 
 *  ontology is editable. The aim is to enable, in the future, dynamically
 *  the dynamic creation of ontologies contents from the Web. 
 *  The broder goal is to enable loding JSON-LD on runtime and keep a local copy.
 *  
 *  Below is only the skeleton of a function prototype. Contents will be added depending
 *  on some design decisions.
 * 
 *  @tripleUrl A URL to a json object
 *  @return true if the tripel was loaded and added succesfully, false otherwise
 */
Ontology.prototype.loadAndAddTripleFromURL = function (tripleUrl) {
	// Check if the ontology is editable
	if (this.editable === false) {
		return false;
	}
	return true;
}

/** This is the skeleton of another function prototype that deals with ontology
 *  mapping...
 *
 *  FIXME: To develop
 */
Ontology.prototype.map = function () {
};

/** This function solves an ontology request. Two types of ontology solving requests are
 *  supported, and they depend on the the elementary ontological knowledge stated above. 
 *  If the request relates to a triple, then an in-depth first search is performed.
 *  solve function is recursive and implements the inference engine. In this case, 
 *  A solve request returns either 'true' or 'undefined'.
 *  If the request relates to a relation, then the function is called on the arguments
 *  and the return value can be 'true', 'false' or 'undefined'.
 *
 *  @param class1 First element of the triple.
 *  @param isSubClassOf This parameter may refer to the name of the relation in the triple 
 *   or to the function name.
 *  @param class2 Third element of the triple.
 *  @notTriple An optional argument. If equal to 'true', then perform a solving request 
 *   of a triple. Otherwise, solve using 'isSubClassOf' as a function name.
 *  @args An optional argument specifying the arguments that may be needed for the function
 *   call, if the solve request is using a function
 *  @return If the solve request if for a triple, then the answer can be 'true' or 'undefined'.
 *   If it is not a triple, then the answer can be 'true', 'false' or 'undefined'.
 */
Ontology.prototype.solve = function (class1, isSubClassOf, class2, notTriple, args) {
	//console.dir(ontologyObject);
	var thiz = this;
	var triple;
	// console.log('Call to '+thiz.ontologyName+' : '+class1+' :: '+ isSubClassOf +' :: '+ class2);
	if (typeof notTriple === undefined || (notTriple === true)) {
		// Check id class1 is defined in the  ontology
			// console.log('get the triple: '+ class1);
		
		if (thiz.ontologyObject[class1]) {
			triple = this.ontologyObject[class1];
		} else {
			return undefined;
		}

		// Check first is the ontology object defines the given relation
		if (triple[isSubClassOf]) {
			// If isSubClassOf is defined, then check if the value is a sting
			// or an array of srtings before comparing
			// console.log('the triple of '+ class1 + ' exists');
			if (typeof triple[isSubClassOf] === "string") {
				// console.log('the triple of: '+ class1+ ' is a string');
				if (triple[isSubClassOf] === class2) {
					return true;
				} else {
					return thiz.solve(triple[isSubClassOf], isSubClassOf, class2, notTriple, args);
				}
			} else {
				// If it is not a string, then it is an array of strings
				// need to parse
				// console.log('the triple of: '+ class1+ ' is an array of lenght: ' + typeof triple[isSubClassOf]);
				for (var i = 0 ; i < triple[isSubClassOf].length; i++) {
					// console.dir(triple);
					// console.log('in foreach: '+triple[isSubClassOf][i] + " :: "+class2 + ' typeof : '+typeof triple[isSubClassOf][i] +'  '+typeof class2);
					if (triple[isSubClassOf][i] === class2) {
						// console.log('return true');
						return true;
					} else {

						var res = thiz.solve(triple[isSubClassOf][i], isSubClassOf, class2, notTriple, args);
						// console.log('ckeck: '+triple[isSubClassOf][i] + ' '+isSubClassOf+ ' '+class2+' resr= '+res);
						if ( res === false) return false;
						else if (res === true) return true;
						else //undefined
							continue;
					}

				};
				return undefined;
			}
		} else {
			// Case were the relation is not defined for the class1
			return undefined;
		}

	} else {
		// console.log('testing notTriple');
		if (thiz.ontologyObject[class1] && thiz.ontologyObject[class2] && thiz.ontologyObject.$relations) {
			// console.log('all parameters for not Trips are valid');
			var ontologyFunction;
			if (thiz.ontologyObject.$relations[isSubClassOf]) {
				var functionCode = thiz.ontologyObject.$relations[isSubClassOf];
				// console.log(functionCode);

				try {
					ontologyFunction = new Function ('a', 'b', 'args', functionCode);
				} catch (e) {
					console.log('Error in the provided ontology function: ' + e);
					return undefined;
				}

				// If the function is loaded properly, then we check
				return ontologyFunction(thiz.ontologyObject[class1], thiz.ontologyObject[class2], args);
			}
		}
	}
};

/** Updates an existing function in the ontologyObject. If the function is new, then
 *  it is added. The function is a value of the predefined attribute '$relations'.
 *   
 *  @param functionRelationName Name of the function to update in the ontologyObject.
 *  @param functionCode The function source code
 *  @return true if updated successfully, false if not.
 */
Ontology.prototype.updateFunction = function(functionRelationName, functionCode) {
	// Check first that all mandatory parameters are strings
	if (typeof functionRelationName !== 'string' || typeof functionCode !== 'string') {
		return false;
	}

	// If '$relations' attribute does not exist, then add it
	if (!this.ontologyObject["$relations"]) {
		this.ontologyObject["$relations"] = {};
	}

	// Update/add the function
	this.ontologyObject["$relations"][functionRelationName] = functionCode;
	return true;
}

////////////////////////////////////////////////////////////////////////////////
////////////    Exports

exports.Ontology = Ontology;
