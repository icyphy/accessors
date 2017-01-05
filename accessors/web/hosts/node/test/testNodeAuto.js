// @version: $$Id$$
// Run the tests in accessors/web/test/auto.
// To run this test, do:
//   sudo npm install -g mocha
//   (cd mocha; mocha testNodeAllAuto.js)
// or
//   (cd ../../../; ant tests.mocha.composites)

var nodeHost = require('../nodeHost.js');
var fs = require('fs');

/** Run all the .js tests in a directory using mocha.
 *  It is expected that the .js file define composite accessors.
 *  @param auto The directory that contains the .js files.
 */
exports.testNodeAuto = function(auto) {
    console.log("testNodeAuto.js: testNodeAuto(" + auto + ")");
    var accessors;
    try {
        // If run in accessors/web/hosts/node/test/mocha/
        accessors = fs.readdirSync('../../../../' + auto);
    } catch (e) {
        // If run in accessors/web/
        accessors = fs.readdirSync(auto);
    }
    
    var mochaListener;
    
    // describe() is a mocha function.
    // IMPORTANT: Don't change 'NodeHost', the Accessor Status page uses it.
    // See https://www.terraswarm.org/accessors/wiki/Notes/Status
    describe('NodeHost' , function() {
        this.timeout(20000); // Increase default timeout.  Originally 2000ms.
        
        before(function() {        
            // Remove the mocha listener (restore later) and 
            // use our own handlers.
            mochaListener = process.listeners('uncaughtException').pop();
            
            process.removeAllListeners('exit');
            process.removeAllListeners('uncaughtException');
        });
	
        accessors.forEach(function(accessor) {
	    var testTimeout = 500;
            if (accessor.length > 3 && accessor.indexOf('.') > 0 && 
		accessor.substring(accessor.length - 3, accessor.length) === ".js" &&
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
                // it() is a mocha function.
                it ('run accessors/web/' + auto + '/' + accessor + '\n.  To replicate: (cd hosts/node; node nodeHostInvoke --timeout ' + testTimeout + " " + auto + '/' + accessor + ')\n', function (done) {
                    var testAccessorName = auto +'/' + accessor;
		    
		    // Remove the .js from the name
 		    if (testAccessorName.substring(testAccessorName.length - 3, testAccessorName.length) === ".js") {
			testAccessorName = testAccessorName.substring(0, testAccessorName.length -3);
		    }
                    var testAccessor = 
                        nodeHost.instantiateTopLevel(nodeHost.uniqueName(testAccessorName),
						     testAccessorName);
                    
                    var exception = null;
                    var exceptionHandler, exitHandler;
                    
                    // Treat exceptions and calls to 'exit' as failures.
                    process.once('uncaughtException', exceptionHandler = function(error) { 
                        exception = error;
                        done(error);
                    });
                    
                    process.once('exit', exitHandler = function(error) { 
                        exception = error;
                        done(error);
                    });
                    
                    setTimeout(function(){
                        // A test is considered successful if no errors 
                        // occur within a given timeout.
                        // TODO:  Improve upon arbitrary timeout.
                        // TODO:  Any way to listen for a stop?
                        // Remove listeners at the end of a successful test
                        // to avoid having a potentially infinite number of 
                        // listeners.

                        if (exception === null) {
                            // Call wrapup() on the accessor.  
                            // If the accessor contains a TrainableTest
                            // that has not fired, the TrainableTest will
                            // (correctly) throw an exception. 
                            testAccessor.wrapup();
                            
                            // Wait to see if any exceptions occur in wrapup.
                            setTimeout(function() {
                                process.removeListener('uncaughtException', exceptionHandler);
                                process.removeListener('exit', exitHandler);
                                
                                done();
                            }, 500);
                        }
                    }, testTimeout);
                });
            }
        });
        
        after(function() {
            process.listeners('uncaughtException').push(mochaListener);
        });
        
    });
};
