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
  = _ "!" _ expr:expression {return !expr}


//These ops are left recursive (expression -> infixOp -> expression)
//so convert them to prefix
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

