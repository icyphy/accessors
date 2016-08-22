// @version: $$Id$$
// Run the tests in accessors/web/test/auto.
// To run this test, do:
//   sudo npm install -g mocha
//   mocha testNodeAuto.js
// or
//   cd accessors/web; ant tests.mocha.composites

var nodeHost = require('../../nodeHost.js');
var fs = require('fs');

//describe('hosts.node.test.mocha.testNodeAuto', function () {
    var autos = ["test/auto", "net/test/auto"];
    autos.forEach(function(auto) {
        var accessors;
        try {
        // If run in accessors/web/hosts/node/test/mocha/
            accessors = fs.readdirSync('../../../../' + auto);
        } catch (e) {
            // If run in accessors/web/
            accessors = fs.readdirSync(auto);
        }

        describe('testNodeAuto ' + auto.replace('/','.'), function () {
            accessors.forEach(function(accessor) {

                if (accessor.length > 3 && accessor.indexOf('.') > 0 && 
		                accessor.indexOf('~') == -1 &&
                		accessor.substring(0,4) != '.svn' &&
                		accessor.substring(0,4) != '.log') {
                	// mocha-junit-reporter creates a "classname" attribute 
                	// with the value of the test name.  Unfortunately, Jenkins
                	// uses any classname as the top level in the display
                	// hierarchy.  So, we insert a "describe" with the test name
                	// It would be better not to insert a classname attribute. 
                	// Unfortunately, there is no option to omit it.  
                	// Alternatively, we could post-process the file, modify
                	// mocha-junit-reporter or try a different reporter.  
                	// Tried mocha-jenkins-reporter, but it does not seem to 
                	// generate a results file when passed a file path.
                	describe('NodeHost run accessors/web/' + auto + '/' + accessor + '\n', function () {
                        //it('NodeHost run accessors/web/' + auto + '/' + accessor + '\n', function (done) {
                		it ('NodeHost', function(done) {
	                        var testAccessor = [ auto +'/' + accessor ];
	                        instantiateAndInitialize(testAccessor);
	                        
	                        var exception = null;
	                        process.once('uncaughtException', function(error) { 
	                        	exception = error;
	                        	done(error);
	                        });
                        
	                        setTimeout(function(){
	                        	if (exception === null) {
	                        		done();
	                        	}
	                        }, 1000);
	                        
	                        // TODO:
	                        // What is the success criteria?  Lack of exception
	                        // e.g. from trainable test after certain amount of 
	                        // time?  any way to listen for a stop?
	                        // Node-host-specific solution here
	                        
	                        // Cancel timer in case of a stop?
                		});
                	});
                	}

                });
            });
        });
   // });
