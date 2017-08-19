// Code for testing the ontologyLogicParser.js module. See README.txt for instructions
// on how to generate the module.
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

/** 
 * Code for testing the ontologyLogicParser.js module. See README.txt for instructions
 * on how to generate the module. Run the test by running node parserTester.js.
 *
 * In the future this will be integrated into the accessors testing infratructure,
 * but for now, this is too much a work in progress.
 * 
 *  @module @accessors-hosts/common/modules/ontology
 *  @author Matt Weber and Chadlia Jerad
 *  @version $$Id: ontologyChecker.js 2017-06-12 11:11:30Z chadlia.jerad $$   
 */

'use strict';

var parser = require('./ontologyLogicParser.js');
console.log('past require parser');
var relations = require('./relations');
console.log('past requireRelations in parsertester');
var relats = new relations.Relations();
console.log(JSON.stringify(relats));

console.log('past constructor in parsertester');
var parseTest = (function (){
  var counter = 0;
  return function (input, expectedResult){
    counter = counter + 1;
    console.log('#' + counter + ' Testing input: "' + input + '"');
    var actualResult;
    try{
      actualResult = parser.parse(input, {"relations": relats });
    } catch(e) {
      if(expectedResult == "error"){
        console.log("Test successful! Result matches: " + expectedResult);
        return true;
      }
      console.log(e);
      return false;
    }
    if(JSON.stringify(actualResult) != JSON.stringify(expectedResult)){
      console.log("**Test unsuccessful! Result is: " + JSON.stringify(actualResult));
      console.log("expected result was: " + JSON.stringify(expectedResult));
      return false;
    } else{
      console.log("Test successful! Result matches: " +  JSON.stringify(expectedResult));
      return true;
    }
  }
})();

var allTestsSuccessful = true;

relats.loadOntologies( 
  function(){
    allTestsSuccessful = parseTest('true', true) && allTestsSuccessful; 
    allTestsSuccessful = parseTest('false', false) && allTestsSuccessful; 
    allTestsSuccessful = parseTest('(true)', true) && allTestsSuccessful; 
    allTestsSuccessful = parseTest('   (     true      )', true) && allTestsSuccessful; 
    allTestsSuccessful = parseTest('   !(     true      )', false) && allTestsSuccessful; 
    allTestsSuccessful = parseTest('   (  !   true      )', false) && allTestsSuccessful; 
    allTestsSuccessful = parseTest('   (  !   true      ', 'error') && allTestsSuccessful; 
    allTestsSuccessful = parseTest('   (     true !)     ', 'error') && allTestsSuccessful; 
    allTestsSuccessful = parseTest('   (     true ) !    ', 'error') && allTestsSuccessful; 
    allTestsSuccessful = parseTest('   !(!     true )    ', true) && allTestsSuccessful; 
    allTestsSuccessful = parseTest(' ! ! ! !(!     true )    ', false) && allTestsSuccessful; 
    allTestsSuccessful = parseTest(' ! ! ! !(!     false )    ', true) && allTestsSuccessful; 
    allTestsSuccessful = parseTest(' !, ! ! !(!     false )    ', 'error') && allTestsSuccessful; 
    allTestsSuccessful = parseTest(' ! () ! ! !(!     false )    ', 'error') && allTestsSuccessful; 
    allTestsSuccessful = parseTest(' ! () ! ! !(!     false )    ', 'error') && allTestsSuccessful; 
    allTestsSuccessful = parseTest(' ! ! ! !(!     false ())    ', 'error') && allTestsSuccessful;
    allTestsSuccessful = parseTest('true && true', true) && allTestsSuccessful;
    allTestsSuccessful = parseTest('true && true && true', true) && allTestsSuccessful;
    allTestsSuccessful = parseTest('true && true && false', false) && allTestsSuccessful;
    allTestsSuccessful = parseTest('true && true || false', true) && allTestsSuccessful;
    allTestsSuccessful = parseTest('(true && true) || false', true) && allTestsSuccessful;
    allTestsSuccessful = parseTest('(true && (true || false))', true) && allTestsSuccessful;
    allTestsSuccessful = parseTest('true && (false || true)', true) && allTestsSuccessful;
    allTestsSuccessful = parseTest('false || true && false', false) && allTestsSuccessful;
    allTestsSuccessful = parseTest('false -> true', true) && allTestsSuccessful;
    allTestsSuccessful = parseTest('false -> (true && false)', true) && allTestsSuccessful;
    allTestsSuccessful = parseTest('true -> (true && false)', false) && allTestsSuccessful;
    allTestsSuccessful = parseTest('true -> true && false', false) && allTestsSuccessful;
    allTestsSuccessful = parseTest('false -> false || false', true) && allTestsSuccessful;
    allTestsSuccessful = parseTest('true -> (false || false)', false) && allTestsSuccessful;
    allTestsSuccessful = parseTest('false -> false -> false', false) && allTestsSuccessful; // test for left associativity
    allTestsSuccessful = parseTest('false -> (false -> false -> false -> false)', true) && allTestsSuccessful; // test for left associativity
    allTestsSuccessful = parseTest('false -> (false -> (false && false) -> false)', true) && allTestsSuccessful; // test for left associativity
    allTestsSuccessful = parseTest('false -> false -> false -> false -> false', false) && allTestsSuccessful; // test for left associativity
    allTestsSuccessful = parseTest('false -> (false -> false)', true) && allTestsSuccessful;
    allTestsSuccessful = parseTest('(false -> false) -> false', false) && allTestsSuccessful;
    // allTestsSuccessful = parseTest('isA("human" , "entity" )', true) && allTestsSuccessful;
    // allTestsSuccessful = parseTest('isA("nonentity" , "food" )', false) && allTestsSuccessful;
    // allTestsSuccessful = parseTest('isA("nonentity" , "food" ) -> hasA("watch" , "everything" )', true) && allTestsSuccessful;
    // allTestsSuccessful = parseTest('isA(,"nonentity", "food" )', 'error') && allTestsSuccessful;
    allTestsSuccessful = parseTest('true()', 'error') && allTestsSuccessful;
    allTestsSuccessful = parseTest('true(false)', 'error') && allTestsSuccessful;
    // allTestsSuccessful = parseTest('IsA', 'error') && allTestsSuccessful;
    // allTestsSuccessful = parseTest('IsAt("human" , "entity" )', 'error') && allTestsSuccessful;
    //allTestsSuccessful = parseTest('closed("me", "door")', false) && allTestsSuccessful;
    //allTestsSuccessful = parseTest('closed("me_", "_door")', false) && allTestsSuccessful;
    allTestsSuccessful = parseTest('getType("me")', 'string') && allTestsSuccessful;
    allTestsSuccessful = parseTest('getType(10)', 'number') && allTestsSuccessful;
    allTestsSuccessful = parseTest('getType(10.01)', 'number') && allTestsSuccessful;
    allTestsSuccessful = parseTest('isA("hueBulb" , "light" )', true) && allTestsSuccessful;
    allTestsSuccessful = parseTest('isA("hueBulb" , "light" ) || false', true) && allTestsSuccessful;
    allTestsSuccessful = parseTest('isA("hueBulb" , "light" ) || true', true) && allTestsSuccessful;
    allTestsSuccessful = parseTest('isA("hueBulb" , "light" ) -> true', true) && allTestsSuccessful;
    allTestsSuccessful = parseTest('false -> isA("hueBulb" , "light" )', true) && allTestsSuccessful;
    allTestsSuccessful = parseTest('true -> isA("hueBulb" , "light" )', true) && allTestsSuccessful;
    allTestsSuccessful = parseTest('true && isA("hueBulb" , "light" )', true) && allTestsSuccessful;
    allTestsSuccessful = parseTest('false && isA("hueBulb" , "light" )', false) && allTestsSuccessful;
    allTestsSuccessful = parseTest('undefined && isA("hueBulb" , "light" )', undefined) && allTestsSuccessful;
    allTestsSuccessful = parseTest('undefined', undefined) && allTestsSuccessful;
    allTestsSuccessful = parseTest('undefined -> undefined -> undefined', undefined) && allTestsSuccessful;
    allTestsSuccessful = parseTest('! undefined', undefined) && allTestsSuccessful;
    allTestsSuccessful = parseTest('x', 'error') && allTestsSuccessful;
    allTestsSuccessful = parseTest('Ex : x : x = [true, false]', true) && allTestsSuccessful;
    allTestsSuccessful = parseTest('Ax : x : x = [true, false]', false) && allTestsSuccessful;
    allTestsSuccessful = parseTest('Ax : x || true : x = [true, false]', true) && allTestsSuccessful;
    allTestsSuccessful = parseTest('Ax : x && true : x = [true, false]', false) && allTestsSuccessful;
    allTestsSuccessful = parseTest('Qx : x && true : x = [true, false]', [{"x" : true}]) && allTestsSuccessful;
    allTestsSuccessful = parseTest('Qx : !x && true : x = [true, false]', [{"x" : false}]) && allTestsSuccessful;
    allTestsSuccessful = parseTest('Qx Qy : x && y : x = [true, false], y = [true, false]', [{"x" : true, "y": true}]) && allTestsSuccessful;
    allTestsSuccessful = parseTest('Qx Qy : x || y : x = [true, false], y = [true, false]', [{"x":true,"y":true},{"x":true,"y":false},{"x":false,"y":true}]) && allTestsSuccessful;
    allTestsSuccessful = parseTest('Qx Qy : x || y : x = [ undefined], y = [true, false]', 'error') && allTestsSuccessful;
    allTestsSuccessful = parseTest('Qx Qy : x || y : x = [ ], y = [true, false]', 'error') && allTestsSuccessful;
    allTestsSuccessful = parseTest('Ex Qy Qz: x -> y || z : x = [true, false ], y = [true, false], z = [true, false]', [{"x":true,"y":true,"z":true},{"x":true,"y":true,"z":false},{"x":true,"y":false,"z":true}]) && allTestsSuccessful;
    allTestsSuccessful = parseTest('Ax Az Qy: y && (y -> x || z) : x = [true, false ], y = [true, false], z = [true, false]', false) && allTestsSuccessful;
    allTestsSuccessful = parseTest('Ax Az Ey: y && (y -> x || z) : x = [true, false ], y = [true, false], z = [true, false]', false) && allTestsSuccessful;
    allTestsSuccessful = parseTest('close("a", "b", 10.0)', true) && allTestsSuccessful;
    allTestsSuccessful = parseTest('close("a", "b", 0.1)', false) && allTestsSuccessful;
    //allTestsSuccessful = parseTest('Ex : isA( x , "light") : x = [ "door", "hueBulb"]', true) && allTestsSuccessful;
    //allTestsSuccessful = parseTest('isA( "door" , "light")', undefined) && allTestsSuccessful;
    //allTestsSuccessful = parseTest('isA( "hueBulb" , "light")', undefined) && allTestsSuccessful;

    //allTestsSuccessful = parseTest('Ax : isA( x , "light") : x = [ "door", "hueBulb"]', false) && allTestsSuccessful;
    //allTestsSuccessful = parseTest('Qx : isA( x , "light") : x = [ "door", "hueBulb"]', [ {"x":"hueBulb"} ]) && allTestsSuccessful;
    //allTestsSuccessful = parseTest(': : x = [true, false]', true) && allTestsSuccessful;

    //allTestsSuccessful = parseTest('Ex Ey Ez: x && y && z : x = [true, false, undefined, 7], y = [true, false], z = [true, false, undefined]', true) && allTestsSuccessful;
    //allTestsSuccessful = parseTest('Ex Ey Ez: x && y || z : x = [true, false, undefined, 7], y = [true, false], z = [true, false, undefined]', true) && allTestsSuccessful;


    //allTestsSuccessful = parseTest('Qx . x : x = [true, false]', {"x" = true}) && allTestsSuccessful;
    //allTestsSuccessful = parseTest('Qx . x : x = [true, false]', [true]) && allTestsSuccessful;
    console.log('######################################################')
    console.log("Do all tests pass? " + allTestsSuccessful);

  }
);


//console.log( parser.parse('Qx : x && true : x = [true, false]') );

/*
//console.log("true");
var result = parser.parse('true');
console.log(result);

var result = parser.parse('(! true)');
console.log(result);

var result = parser.parse('(! false)');
console.log(result);

var result = parser.parse('word()');
console.log(result);

var result = parser.parse('word( var1)');
console.log(result);

var result = parser.parse('word( var1, var2)');
console.log(result);

var result = parser.parse('word( var1, var2, var3)');
console.log(result);

var result = parser.parse('! word( var1, var2, var3)');
console.log(result);
*/
/*
var apples = ["item1", "item2", "item3"];
apples.unshift("item9000");
console.log(apples);
*/
