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
 *  checking ontologies...
 *  This work is still on progress...
 *  Better documentation and significant improvements are on the way!
 * 
 *  @module @accessors-hosts/common/modules/ontology
 *  @author Chadlia Jerad and Matt Weber
 *  @version $$Id: ontologyChecker.js 2017-06-12 11:11:30Z chadlia.jerad $$   
 */
 
// Contains the ontology description
var ontologyFile;

// The ontology extracted from the file, if valid, will be stored in this object
var ontologyObject;
 
///////////////////////////////////////////////////////////////////
//// Ontology class and its functions.

/** Create (using new) an ontology instance whose triples are provided in a json 
 *  object.
 * 
 *  the specified code. This will evaluate the specified code, and if it exports a
 *  setup() function, invoke that function. The created object includes at least the
 *  following properties:
 *
 *  * **accessorName**: The name of the instance provided to the constructor.
*/
function Ontology(ontologyName, ontologyString, ontologyObject, ontologyFile, fileReader) {
	// Set the ontologyName
	this.ontologyName = ontologyName;

	// Construct ontologyObject attribute, that is the JSON object containing 
	// ontology constructs
	if (ontologyString) {
		this.ontologyObject = JSON.pase(ontologyString);
	} else if (ontologyObject) {
		this.ontologyObject = ontologyObject;
	} else if (ontologyFile && fileReader) {
		this.ontologyObject = JSON.pase(fileReader.call(ontologyFile));
	} else {
		// return null;
	}


	// FIXME: add controls to get the ontologie functions...

}

/** This function performs ontology checking. 
 *  There are two ways for using this function. The first one deals with
 *  triple ontological infor
 *
 * @param value1 fir
 */
Ontology.prototype.checkOntology = function (value1, relation, value2, notTriple, args) {
	//console.dir(ontologyObject);
	var triple;
	if (typeof notTriple === undefined || (notTriple === true)) {
		if (this.ontologyObject[value1]) {
			triple = this.ontologyObject[value1];
		} else {
			return undefined;
		}

		if (triple[relation] === value2) {
			return true;
		} else {
			return this.checkOntology(triple[relation], relation, value2);
		}

	} else {
		console.log('testing notTriple');
		if (this.ontologyObject[value1] && this.ontologyObject[value2] && this.ontologyObject.$relations) {
			console.log('all parameters for not Trips are valid');
			var ontologyFunction;
			if (this.ontologyObject.$relations[relation]) {
				var functionCode = this.ontologyObject.$relations[relation];
				console.log(functionCode);

				try {
					ontologyFunction = new Function ('a', 'b', 'args', functionCode);
				} catch (e) {
					console.log('Error in the provided ontology function: ' + e);
					return undefined;
				}

				// If the function is loaded properly, then we check
				return ontologyFunction(this.ontologyObject[value1], this.ontologyObject[value2], args);
			}
		}
	}
};

/**
 *
 *
 */
Ontology.prototype.matchOntology = function (value1, relation, value2, notTriple, args) {
};


////////////////////////////////////////////////////////////////////////////////
////////////    Exports

exports.Ontology = Ontology;
