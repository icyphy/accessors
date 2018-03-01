// Code for generating the ontologyLogicParser.js module. See README.txt for instructions
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

/** Code for generating the ontologyLogicParser.js module. See README.txt for instructions
 * on how to generate the module.
 *
 * The language parsed by the generated file is a first order logic language for
 * ontologies. It supports parenthesis, negation (!), the literal values true, false, and undefined,
 * the infix operators and (&&), or (||), and implies (->), and custom defined relations
 * with boolean, undefined, string, and number, arguments eg. isA("Socrates", "Mortal" )
 *
 * The logical operators (!, &&, ||, ->) are defined over true, false, and undefined,
 * using the constructive logic interpretations. Eg. true || undefined = true;
 *
 * I tried to make the order of precedence match the C programming language (because 
 * everyone knows C). As such the order is from highest precedence to lowest precedence:
 * parenthesis, relations, negation, and, or, implies.
 *
 * The infix operators are left associative. For example the expression:
 * false -> false -> false
 * will be interpreted as (false -> false) -> false = false
 * instead of false -> (false -> false) = true
 *
 * Relations are defined externally in the module "relations.js". That module must
 * export the function "interpret" with two arguments. The first argument is the name of the
 * relation written as a string, and the second argument is an array of arguments to be checked
 * if that array is a tuple in the relation. For now, "interpret" returns true, false,
 * or undefined. In the future, we may implement probabilistic return values 
 * 
 * Every expression must ultimately result in the value: true, false, or undefined.
 * 
 *  @module @accessors-hosts/common/modules/ontology
 *  @author Matt Weber
 *  @version $$Id: ontologyChecker.js 2017-06-12 11:11:30Z chadlia.jerad $$   
 */


{
  //initilization code
  //console.log("Initialized options: " + JSON.stringify(options));
  //var relations = require('./relations.js');
  var thiz = this; //Saved so I can call thiz.parse later.
  
  var variableAssignment = {};
  var trueAssignments = [];
  var queryMode = false;
  var domainsMap = {}; //a map between variables and domains
  var quantifiedVariableArray = [];

  //A Q is treated as an existential quantifer in terms of later quantifiers,
  //but the appearance of a Q switches the output of the parser to query mode
  //where the trueAssignments object will be returned instead of "true/false"

  //For valid input you can also give an expression with variables 
  //and a variable assignment object as a parser option

  function tryAssignments(expression, quantVarIndex){
    /*
    console.log("printing expression");
    console.log(expression);
    console.log(quantVarIndex);
    console.log(quantifiedVariableArray);
    console.log("printing domainsMap");
    console.log(domainsMap);
    */


    //This condition is not an off-by-one error! When the index pushes past
    //the last element of the array, evaluate.
    if(quantVarIndex == quantifiedVariableArray.length){
       //console.log(JSON.stringify(variableAssignment));
      //console.log("in base case, printing expression");
      //console.log(expression);
      //console.log(JSON.stringify({"startRule":'expression', "variableAssignment":variableAssignment }));
      //Parse the expression using the current variableAssignment
      //and begin with the 'expression' rule (not the 'form' rule)
      var parseResult = thiz.parse(expression, 
        {"startRule":'expression', "variableAssignment":variableAssignment }
      );
      //console.log("parseResult was " + parseResult);
      if(queryMode && typeof parseResult !== 'undefined' && parseResult){
        //console.log("queryMode is true!");
        //console.log("adding assignment: " + JSON.stringify(variableAssignment) )
        
        //We have to copy the assignment to a new object, otherwise it remains symbolicly linked
        //and will change on the next assignment we test.
        trueAssignments.push(Object.assign( {}, variableAssignment));

      }
      return parseResult;

    } else {
      var currentQuantifier = quantifiedVariableArray[quantVarIndex].quantifier;
      var currentVariable = quantifiedVariableArray[quantVarIndex].variable;
      var currentDomain = domainsMap[currentVariable];
      var truthValue;
      switch (currentQuantifier) {
        case 'A':
          truthValue = true;
          for( var i = 0; i < currentDomain.length; i++){
            variableAssignment[currentVariable] = currentDomain[i];
            var assignmentResult = tryAssignments(expression, quantVarIndex +1);
            if( typeof assignmentResult === 'undefined' || ! assignmentResult){
              truthValue = false;
              break;
            }
          }
          break;
        case 'E':
          truthValue = false;
          for( var i = 0; i < currentDomain.length; i++){
            variableAssignment[currentVariable] = currentDomain[i];
            var assignmentResult = tryAssignments(expression, quantVarIndex + 1);
            if(typeof assignmentResult !== 'undefined' &&  assignmentResult){
              truthValue = true;
              break;
            }
          }
          break;
        case 'Q':
          queryMode = true;
          truthValue = false;
          for( var i = 0; i < currentDomain.length; i++){
            variableAssignment[currentVariable] = currentDomain[i];
            var assignmentResult =  tryAssignments(expression, quantVarIndex +1);
            truthValue =  truthValue || (typeof assignmentResult !== 'undefined' && assignmentResult);
          }
          break;
      }
      //console.log("at level: " + quantVarIndex + "returning truthvalue: " + truthValue);
      return truthValue;
    }
  }
}

form
  = quantVars:quantifiedVariableList ':' expr:variableExpression ':' dom:domains {

    //console.log("form for next 3 lines:");
    //console.log(JSON.stringify(dom));
    //console.log(JSON.stringify(quantVars));
    //console.log(expr);
    //Validate: The same variable should only appear once in the variableList and the domain
    //and all variables in variableList must have a domain.

    // if a variable appears in seenVariables it is in quantVars
    // if a variable has the assignment "true" in seenVariables it appears in dom
    var seenVariables = {};

    if(quantVars.length === 0){
      error('Quantified variables are expected, but none are given.');
    }
    for(var i = 0; i < quantVars.length; i++){
      if( typeof seenVariables[quantVars[i].variable] !== 'undefined' ){
        error('Duplicate instance of variable ' + quantVars[i].variable + ' in quantifiers');
      } else {
        seenVariables[quantVars[i].variable] = false;
      }
    }

    for(var i = 0; i < dom.length; i++){
      if( typeof seenVariables[dom[i].variable] === 'undefined' ){
        error('Variable ' + dom[i].variable + ' appears in domains but not quantifiers.');
      } else if (seenVariables[dom[i].variable] === true){
        error('Variable ' + dom[i].variable + ' appears multiple times in domains.');
      } else {
        seenVariables[dom[i].variable] = true;
      }
    }


    for(var key in seenVariables){
      if(seenVariables[key] === false){
        error('Variable ' + key + ' has not been given a domain.' );
      }
    }

    //convert dom to a global object so it is 1) easier to find the domain for a variable
    //and 2) doesn't have to be passed on every recursive call to tryAssignments
    for(var i = 0; i < dom.length; i++){
      domainsMap[dom[i].variable] = dom[i].domain;
    }
    

    //convert quantVars to a global object for the same reason
    quantifiedVariableArray = quantVars;




    var assignmentResult = tryAssignments(expr, 0);
    if(queryMode && assignmentResult){
      //console.log("assignmentResults are: " + JSON.stringify(trueAssignments));
      return trueAssignments;
    } else {
      return assignmentResult;
    }
  }
/expr:expression { return expr;}

variableExpression
  = varExpr:([^:]*) { 
  //console.log('looking at form-variableExpression ' + varExpr.join(""));
  return varExpr.join('');}


/*
  = infixOp //must proceed everything else because they can be nonInfixExpressions
  / parens
  / prefixOp
  / relation
  / variable
*/

variable
  = _ variableString:name _ {
  //console.log("hello from variable");
    if(typeof options.variableAssignment === 'undefined' ){
      error("Variables are not allowed if no variable assignment has been given in options.");
    }
    if(typeof options.variableAssignment[variableString] === 'undefined'){
      error("No assignment has been given to the unbound variable '" + variableString + "'");
    } else {
      //console.log('replacing ' + variableString + " with " + options.variableAssignment[variableString]);
      
      //var parseResult = thiz.parse(options.variableAssignment[variableString].toString(), {"startRule":'terminal' });
      //console.log("variable parsing result was: " + parseResult);
      return options.variableAssignment[variableString];

      // To prevent someone from trying to hack this parser with code injection
      // in a variable, force the start rule for its evaluation to be 'terminal'
    }
  }

quantifiedVariableList
  = quantVars:(quantifiedVariable+) {
    //console.log("return quantVarsList: " + JSON.stringify(quantVars));
    return quantVars;
  }

quantifiedVariable
  = _ quantifier:[AEQ] _ variable:(name) _ { 
  //console.log("quantifier: " + quantifier);
  //console.log("variable: " + variable);
  return { "quantifier": quantifier, "variable": variable  }; }

// should match something of the form
// x = [1 ,2 ,3], y = [true], z = ["apple", "orange"]
// and return
// [ {"variable":x, "domain": [1,2,3], ... }  ] 

domains
  = head:variableDomain tail:(domainSequence+) { 
  tail.splice(0, 0, head);
  //console.log('domains case 2: ' + JSON.stringify(tail));
  return tail;}
  / dom:variableDomain { 
    //console.log('domains case 1: ' + JSON.stringify([dom]));
    return [dom];
      }
  

domainSequence
  = _ ','  varDom:variableDomain  {
  //console.log('vardom is ' + JSON.stringify(varDom));
  return varDom;}


// should match something of the form
// x = [1 ,2 ,3]
// and return 
// {"variable":x, "domain": [1,2,3]}
variableDomain
  = _ variable:name _ '=' _ '[' _ value:terminal _ ']' _ 
  { 
  //console.log('varDomain case 1');
  return { "variable": variable, "domain":[value ]  }; }

  / _ variable:name _ '=' _ '[' _ head:terminal _  tail:(domainItem+) ']' _ {
    //console.log("variable: " + JSON.stringify(variable));

  //console.log('head ' + JSON.stringify(head));
  //console.log('tail ' + JSON.stringify(tail));
    tail.splice(0,0, head) ;
  //console.log('after splice tail ' + JSON.stringify(tail));
  //console.log('varDomain case 2' + JSON.stringify({ "variable": variable, "domain":tail }) );
  return { 
  "variable": variable, "domain":tail }; }
  
domainItem
  = ',' _ item:terminal  {
  //console.log('domain item: ' + item);
  return item;}

expression
  = infi:infixOp {return infi;}//must proceed everything else because they can be nonInfixExpressions
  / par:parens {return par;}
  / pre:prefixOp  {return pre;}
  / relat:relation {return relat;}

//Needed to prevent left recursion for infixOps
nonInfixExpression
  = stripped:parens {return stripped}
  / prefixOp
  / relation
  / vari:variable {return vari;}

prefixOp
  = _ "!" _ expr:expression {
    if(typeof expr === 'undefined'){
      return undefined
    } else{
      return ! expr;
    }
  
  }


// These ops are left recursive (expression, infixOp,  expression)
// The trick for making them so is explained at 
// http://www.engr.mun.ca/~theo/Misc/exp_parsing.htm#classic
infixOp
  = aa:A {return aa;}

A
  = _ lhs:B rhs:(Arepeat*) {
      var result = lhs;

      for(var i = 0; i < rhs.length; i++){
        if ( typeof result !== 'undefined' && typeof rhs[i] !== 'undefined' ){
          result = (! result) || rhs[i];
        } else if(typeof result === 'undefined' && typeof rhs[i] === 'undefined'){
          result = undefined;
        } else if ( typeof result !== 'undefined'){
          if(result === false){
            result = true;
          } else {
            result = undefined;
          }
        } else if ( typeof rhs[i] !== 'undefined'){
          if(rhs[i] === true){
            result = true;
          } else {
            result = undefined;
          }
        }
      }
      return result;
    }

Arepeat
  = _ "->" _ symbol:B { return symbol;}

B
  = _ lhs:C rhs:(Brepeat*) {
      var result = lhs;
      for(var i = 0; i < rhs.length; i++){
        if ( typeof result !== 'undefined' && typeof rhs[i] !== 'undefined' ){
          result = result || rhs[i];
        } else if(typeof result === 'undefined' && typeof rhs[i] === 'undefined'){
          result = undefined;
        } else if ( typeof result !== 'undefined'){
          if(result === true){
            result = true;
          } else {
            result = undefined;
          }
        } else if ( typeof rhs[i] !== 'undefined'){
          if(rhs[i] === true){
            result = true;
          } else {
            result = undefined;
          }
        }
      }
      return result;
    }

Brepeat
  = _ "||" _ symbol:C { return symbol;}

C
  = _ lhs:D rhs:(Crepeat*){
      var result = lhs;
      for(var i = 0; i < rhs.length; i++){
        if ( typeof result !== 'undefined' && typeof rhs[i] !== 'undefined' ){
          result = result && rhs[i];
        } else if(typeof result === 'undefined' && typeof rhs[i] === 'undefined'){
          result = undefined;
        } else if ( typeof result !== 'undefined'){
          if(result === false){
            result = false;
          } else {
            result = undefined;
          }
        } else if ( typeof rhs[i] !== 'undefined'){
          if(rhs[i] === false){
            result = false;
          } else {
            result = undefined;
          }
        }
      }
      return result;
    }

Crepeat
  =_ "&&" _ symbol:D { return symbol;}


D
  = nonInf:nonInfixExpression { return nonInf}

/*
  = _ B (_ "&&" _ B)*  { return head && tail;}


  / _ head:nonInfixExpression _ "||" _ tail:expression { return head || tail;}
  / _ head:nonInfixExpression _ "->" _ tail:expression { return (! head) || tail;}
*/


terminal
  =t:boolean {
    //console.log("found a bool terminal " + t);
    return t;}
  /t:string {
    //console.log("found a string terminal " + t);
    return t;}
  /t:decimal{ 
    //must preceed integer 
    //console.log("found a decimal terminal " + t);
    return t;}
  /t:integer {
    //console.log("found an integer terminal " + t);
    return t;}

literal
  =t:terminal
  /vari:variable {
   //console.log("got a variable in literal: " +  vari);
  return vari;}


boolean
  = _ 'true' _ {return true;}
  / _ 'false' _ {return false;}
  / _ 'undefined' _ {return undefined;}

string
  = _ '\"' str:([^"]*) '\"' _ {return str.join('');}

integer
  = _ int:([0-9]+) _ {console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&got "+ int); return parseInt(int.join(''));}

decimal
  = _ head:([0-9]*) '.' tail:([0-9]+) _ {
  tail.splice(0, 0, '.');
  for(var i = head.length -1; i >= 0; i--){
    tail.splice(0, 0, head[i]);
  }
  return parseFloat(tail.join(''));} 

//FIXME temporary implementation
relation
  = boolean   //must be first case to check for reserved names
  / _ relat:name _ "(" _ ")" _ {
        //console.log("relation1");
        return options.relations.interpret(relat, []);
      }
  / _ relat:name _ "(" _ arg1:literal _ ")" _ {
        //console.log("relation2");
        return options.relations.interpret(relat, [arg1]);
      }
  / _ relat:name _ "(" _ arg1:literal _ args:argument+ ")" _ {
          //console.log("relation3");
        args.unshift(arg1);
        return options.relations.interpret(relat, args);
      }


argument
  = _ "," _ arg:literal _ {return arg;}


//This should only work if names are checked after relations and reserved words like truefalse
// because it's the same except for parenthesis
name
  = head:[a-z_]i tail:[a-z0-9_]i* {tail.unshift(head);
  //console.log('name is: ' + tail.join(""));
   return tail.join("");}

parens
  = _ "(" _ expr:expression _ ")" _ {return expr}

_ "whitespace"
  = [ \t\n\r]*


/*
//todos

//equality relation

//tuples, like for coordinates
*/

