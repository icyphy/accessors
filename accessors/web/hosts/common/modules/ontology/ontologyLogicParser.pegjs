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
  var relations = require('./relations.js');
}

expression
  = infixOp //must proceed everything else because they can be nonInfixExpressions
  / parens
  / prefixOp
  / relation

//Needed to prevent left recursion for infixOps
nonInfixExpression
  = stripped:parens {return stripped}
  / prefixOp
  / relation

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
  = A

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
  = _ "||" _ symbol:C {return symbol;}

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
  =_ "&&" _ symbol:D {return symbol;}


D
  = nonInfixExpression

/*
  = _ B (_ "&&" _ B)*  { return head && tail;}


  / _ head:nonInfixExpression _ "||" _ tail:expression { return head || tail;}
  / _ head:nonInfixExpression _ "->" _ tail:expression { return (! head) || tail;}
*/


literal
  =boolean
  /string
  /decimal //must preceed integer
  /integer


boolean
  = _ 'true' _ {return true;}
  / _ 'false' _ {return false;}
  / _ 'undefined' _ {return undefined;}

string
  = _ '\"' str:([^"]*) '\"' _ {return str.join('');}

integer
  = _ int:([0-9]*) _ {return parseInt(int.join(''));}

decimal
  = _ dec:(([0-9]*) '.' ([0-9]*)) _ {return parseFloat(dec.join(''));} 

//FIXME temporary implementation
relation
  = boolean   //must be first case to check for reserved names
  / _ relat:name _ "(" _ ")" _ {
        return relations.interpret(relat, []);
      }
  / _ relat:name _ "(" _ arg1:literal _ ")" _ {
        return relations.interpret(relat, [arg1]);
      }
  / _ relat:name _ "(" _ arg1:literal _ args:argument+ ")" _ {
        args.unshift(arg1);
        return relations.interpret(relat, args);
      }


argument
  = _ "," _ arg:literal _ {return arg;}


//This should only work if names are checked after relations and reserved words like truefalse
// because it's the same except for parenthesis
name
  = head:[a-z_]i tail:[a-z0-9_]i* {tail.unshift(head); return tail.join("");}

parens
  = _ "(" _ expr:expression _ ")" _ {return expr}

_ "whitespace"
  = [ \t\n\r]*


/*
//todos

//variables are non-negative integers
variable
  =

//looks like a relation but prefixed by '$'
function
  =

//Quantifiers
*/

