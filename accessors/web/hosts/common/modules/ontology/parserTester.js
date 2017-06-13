'use strict';

var parser = require('./ontologyLogicParser.js');

var parseTest = (function (){
  var counter = 0;
  return function (input, expectedResult){
    counter = counter + 1;
    console.log('#' + counter + ' Testing input: "' + input + '"');
    var actualResult;
    try{
      actualResult = parser.parse(input);
    } catch(e) {
      if(expectedResult == "error"){
        console.log("Test successful! Result matches: " + expectedResult);
        return true;
      }
      console.log(e);
      return false;
    }
    if(actualResult != expectedResult){
      console.log("**Test unsuccessful! Result is: " + actualResult);
      console.log("expected result was: " + expectedResult);
      return false;
    } else{
      console.log("Test successful! Result matches: " +  expectedResult);
      return true;
    }
  }
})();

var allTestsSuccessful = true;

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
allTestsSuccessful = parseTest('close("me", "door")', true) && allTestsSuccessful;
allTestsSuccessful = parseTest('closed("me", "door")', false) && allTestsSuccessful;
allTestsSuccessful = parseTest('closed("me_", "_door")', false) && allTestsSuccessful;
allTestsSuccessful = parseTest('getType("me")', 'string') && allTestsSuccessful;
allTestsSuccessful = parseTest('getType(10)', 'number') && allTestsSuccessful;
allTestsSuccessful = parseTest('getType(10.01)', 'number') && allTestsSuccessful;
allTestsSuccessful = parseTest('isA("hueBulb" , "light" )', undefined) && allTestsSuccessful;
allTestsSuccessful = parseTest('isA("hueBulb" , "light" ) || false', undefined) && allTestsSuccessful;
allTestsSuccessful = parseTest('isA("hueBulb" , "light" ) || true', true) && allTestsSuccessful;
allTestsSuccessful = parseTest('isA("hueBulb" , "light" ) -> true', true) && allTestsSuccessful;
allTestsSuccessful = parseTest('false -> isA("hueBulb" , "light" )', true) && allTestsSuccessful;
allTestsSuccessful = parseTest('true -> isA("hueBulb" , "light" )', undefined) && allTestsSuccessful;
allTestsSuccessful = parseTest('true && isA("hueBulb" , "light" )', undefined) && allTestsSuccessful;
allTestsSuccessful = parseTest('false && isA("hueBulb" , "light" )', false) && allTestsSuccessful;
allTestsSuccessful = parseTest('undefined && isA("hueBulb" , "light" )', undefined) && allTestsSuccessful;
allTestsSuccessful = parseTest('undefined', undefined) && allTestsSuccessful;
allTestsSuccessful = parseTest('undefined -> undefined -> undefined', undefined) && allTestsSuccessful;
console.log('######################################################')
console.log("Do all tests pass? " + allTestsSuccessful);

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