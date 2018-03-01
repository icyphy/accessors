ontologyLogicParser.js is a PEG.js (https://pegjs.org/) generated parser. Its logic is written in ontologyLogicParser.pegjs. To globally install PEG.js, use:

$npm install -g pegjs

To generate ontologyLogicParser.js from ontologyLogicParser.pegjs run:

$pegjs -o ontologyLogicParser.js ontologyLogicParser.pegjs

To run a suite of tests on the parser, run:

$node parserTester.js
