// Copyright (c) 2016-2017 The Regents of the University of California.
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

/**
 * Generate HTML for accessor status reports.
 * See https://www.icyphy.org/accessors/reports/status/demo/sampleStatus.html
 * and https://www.icyphy.org/accessors/wiki/Notes/Status
 * @module status
 * @author Beth Osyk
 * @version $$Id$$
 */

// Objects to store the testsToAccessors and accessorsToHosts.
// Cape Code uses a separate test suite, so these results are stored separately.
var accessorMap;
var capeCodeAccessorMap;

//An object to store the test results, as testResults['testName'].host = status
//e.g. testResults['net/REST'].node = passed;
var testResults;
var testLinks;

/** After the page has loaded, import test results and create a table.
 */
$(window).on("load", function() {
    testResults = {};
    testLinks = {};
    accessorMap = {};
    capeCodeAccessorMap = {};
    
    // Callback calls parseNodeResults.  Nesting the callbacks ensures all 
    // results are parsed before creating the table.
    $.ajax({
        url: "browserhost.txt",
        type: "GET",
        success: parseBrowserResults
    });
});

/** Parse the results for the browser.  A helper function for parseResults() 
 *  since the ajax() function can't accept additional arguments.
 */
function parseBrowserResults(data) {
    parseResults(data, 'browser');
    
    $.ajax({
        url: "nodehost.txt",
        type: "GET",
        success: parseNodeResults
    });
};

/** Parse the results for node.  A helper function for parseResults() 
 *  since the ajax() function can't accept additional arguments.
 */
function parseNodeResults(data) {
    parseResults(data, 'node');
    
    $.ajax({
        url: "capecodehost.txt",
        type: "GET",
        success: parseCapeCodeResults
    });
};

/** Parse Cape Code test results web page.
 * 
 * @param data The web page.
 * @param host The accessor host (e.g. 'node').
 */
function parseCapeCodeResults(data) {
    var index;
    
    // Retrieve table rows.  Pop the first (header) row.
    ($($.parseHTML(data))).find('#testresult').find('tr').slice(1)
        .each(function(index) {
            
            // Each row contains three <td>s.
            // Test name, duration, result (passed / failed).
            var entries = $(this).find('td');  
            var testname = $(entries[0]).text();
            
            // The Cape Code page contains many tests unrelated to accessors.
            // Check for an accessor test directory.
            
            if (testname.indexOf('org/terraswarm/accessor/test/auto') !== -1 || 
                testname.indexOf('ptolemy/actor/lib/jjs/modules') !== -1) {
                
                var exp = /[/() \[\]\.\-]/g;
                // Should match the same string in accessors/web/build.xml
                var link = "http://terra.eecs.berkeley.edu:8080/job/ptII/lastCompletedBuild/testReport/ptolemy.util.test.junit/AutoTests/" + 
                    testname.replace(exp, '_') + '/';
                
                index = testname.indexOf('/home/jenkins/workspace/ptII');
                if (index !== -1) {
                    testname = testname.substring(index + 29);
                }
                
                // Remove (RunModel) from the end.
                index = testname.indexOf(' ');
                if (index !== -1) {
                    testname = testname.substring(0, index);
                }
                
                if (testResults[testname] === null || 
                    typeof testResults[testname] === 'undefined') {
                    testResults[testname] = {};
                }
                
                // Columns start with 0.
                // Columns are Test name Duration Status
                testResults[testname]['capecode'] = $(entries[2]).text();
                testLinks[testname] = link;
            }
        });
    
    $.ajax({
        url: "accessorMap.txt",
        type: "GET",
        success: function(data) {
            accessorMap = JSON.parse(data);
            
            $.ajax({
                url: "accessorMapCapeCode.txt",
                type: "GET",
                success: function(data) {
                    capeCodeAccessorMap = JSON.parse(data);
                    Object.assign(accessorMap.testsToAccessors, capeCodeAccessorMap.testsToAccessors);
                    for (var accessor in capeCodeAccessorMap.accessorsToHosts) {
                        if (capeCodeAccessorMap.accessorsToHosts[accessor].includes('capecode')) {
                            if (!accessorMap.accessorsToHosts.hasOwnProperty(accessor)) {
                                accessorMap.accessorsToHosts[accessor] = [];
                            }
                            accessorMap.accessorsToHosts[accessor].push('capecode');
                        }
                    }
                    fillTable();
                }
            });
        }
    });
};

/** Parse test results web page.
 * 
 * @param data The web page.
 * @param host The accessor host (e.g. 'node').
 */
function parseResults(data, host) {

    // Retrieve table rows.  Pop the first (header) row.
    ($($.parseHTML(data))).find('#testresult').find('tr').slice(1)
        .each(function(index) {
            
            // Each row contains three <td>s.
            // Test name, duration, result (passed / failed).
            // TODO:  Check that this works for failed tests - additional message printed?
            var entries = $(this).find('td');  
            var longtestname = $(entries[0]).text();
            
            // Find the accessor name, e.g., net/REST
            // For browser tests, the accessor name is the first work of the line.
            var testname;
            
            // Skip hosts/ tests; these do not relate to a specific accessor.
            if (longtestname.indexOf('hosts/') === -1) {
                
                var exp = /[/() \[\]\.\-]/g;
                var link;
                
                if (host === 'node') {
                    // Should match the same string in accessors/web/build.xml
                    link = "http://terra.eecs.berkeley.edu:8080/job/accessors/lastCompletedBuild/testReport/NodeHost/" + 
                        longtestname.replace(exp, '_') + '/';
                    // Remove any NodeHost run . 
                    if (longtestname.indexOf('NodeHost') >= 0) {
                        var dot = longtestname.indexOf('.');
                        if (dot > 0) {
                            longtestname = longtestname.substring(dot + 1);
                        }
                    }
                } else if (host === 'browser') {
                    // Should match the same string in accessors/web/build.xml
                    link = "http://terra.eecs.berkeley.edu:8080/job/accessors/lastCompletedBuild/testReport/(root)/BrowserHost/" + 
                        longtestname.replace(exp, '_') + '/';
                    // Remove any BrowserHost BrowserHost .
                    if (longtestname.indexOf('BrowserHost') >= 0) {
                        var dot = longtestname.indexOf('.');
                        if (dot > 0) {
                            longtestname = longtestname.substring(dot + 1);
                        }
                    }
                }
                
                var space = longtestname.indexOf(' ');
                
                if (space > 0) {
                    testname = longtestname.substring(0, space);
                } else {
                    testname = longtestname;
                }
                
                // Remove any accessors/web/
                var index = testname.indexOf('accessors/web/');
                if (index !== -1) {
                    testname = testname.substring(index + 14); 
                }
                
                // Remove any leading slashes (node host has these, browser does not).
                if (testname[0] === '/') {
                    testname = testname.substring(1);
                }
                
                // Add .js at the end if not present.
                if (testname.substring(testname.length -3, testname.length) !== '.js') {
                    testname += '.js';
                }
                
                if (testResults[testname] === null || 
                    typeof testResults[testname] === 'undefined') {
                    testResults[testname] = {};
                    testLinks[testname] = link;
                } 
                // Columns start with 0.
                // Browser columns are Class Duration Status
                // Node columns are Class Duration Fail diff Skip diff Pass diff Total diff         
                
                if (host === 'browser') {
                    testResults[testname][host] = $(entries[2]).text();
                } else if (host === 'node') {
                    if ($(entries[4]).text() === "1") {
                        testResults[testname][host] = "Skipped";
                    } else if (($(entries[6]).text() === "1")) {
                        testResults[testname][host] = "Passed";
                    } else {
                        // Consider any test not passed or skipped as failed.
                        testResults[testname][host] = "Failed";
                    }
                } else {
                    testResults[testname][host] = $(entries[2]).text();
                }
            }
        });
};

/** Create a table from the testResults object.
 */
function fillTable(){
    
    // List accessors in alphabetical order.
    var accessornames = Object.keys(accessorMap.accessorsToHosts).sort();
    var accessorname;
    
    // Create accessors-to-tests from tests-to-accessors.
    var accessorsToTests = {};
    var accessors;
    var ext, row, cell0, cell1, cell2, testResult, supported, hosts, status;
    
    accessornames.forEach(function(name) {
        ext = name.indexOf('.js');
        if (ext > 0) {
            name = name.substring(0, ext);
        }
        accessorsToTests[name] = [];
        
        for (var test in accessorMap.testsToAccessors) {
            accessors = accessorMap.testsToAccessors[test];
            
            if (accessors !== null && typeof accessors !== 'undefined' &&
                accessors.length > 0) {

                if(accessors.includes(name)) {
                    accessorsToTests[name].push(test);
                }
            }
        }
    });
    
    for (var i = accessornames.length - 1; i >= 0; i--) {
        
        accessorname = accessornames[i];
        var shortname = accessorname;
        
        ext = accessorname.indexOf('.js');
        if (ext > 0) {
            shortname = accessorname.substring(0, ext);
        }
        
        // Insert tests first.  Since rows are inserted at top of table, tests
        // will move down as new rows are added.
        
        var tests = accessorsToTests[shortname];
        var cells = {};

        allTests = {};
        allTests.browser = '';
        allTests.node = '';
        allTests.capecode = '';
        
        if (tests !== null && typeof tests !== 'undefined' && tests.length > 0){
            tests.forEach(function(test) {
                row = table.insertRow(1);
                row.className += 'hidden';
                row.className += ' ' + accessorname;        // To expand/collapse tests.
                
                cell0 = row.insertCell(0);

                if (testLinks[test] !== null && 
                    typeof testLinks[test] !== 'undefined') {
                    cell0.innerHTML = "<a href=\"" + testLinks[test] + "\"> " + test + "</a>";
                } else {
                    cell0.innerHTML = test;
                }
                cell0.className += 'testname ';        // For left-justifying in table.
                
                // TODO:  Add more hosts.
                // Does host support ALL accessors in this test?  
                accessors = accessorMap.testsToAccessors[test];
                
                supported = {};
                supported.browser = true;
                supported.capecode = true;
                supported.node = true;
                
                // Last first.
                cells.node = row.insertCell(1);
                cells.capecode = row.insertCell(1);
                cells.browser = row.insertCell(1);
                
                testResult = testResults[test];
                
                // Check if the host supports ALL accessors in the test case.
                // If not, the test case is not supported.
                accessors.forEach(function(accessor){
                    hosts = accessorMap.accessorsToHosts[accessor + '.js'];
                    if (!hosts.includes('all')) {
                        if (!hosts.includes('browser')) {
                            supported.browser = false;
                        } 
                        if (!hosts.includes('node')) {
                            supported.node = false;
                        }
                        if (!hosts.includes('capecode')) {
                            supported.capecode = false;
                        }
                    }
                });
                
                // Fill in results of this test case.
                fillCells(cells, supported, testResult);

                // Did all tests for this accessor pass?
                if (testResult !== null && typeof testResult !== 'undefined') {
                    Object.keys(testResult).forEach(function(host) {
                        if (testResult[host] !== null && 
                            typeof testResult[host] !== 'undefined') {
                            if (testResult[host] === 'Passed') {
                                if (allTests[host] === '') {
                                    allTests[host] = 'passed';
                                } else if (allTests[host] === 'failed') {
                                    allTests[host] = 'partial';
                                }
                            } else {
                                // Everything other than 'passed' considered a 
                                // failure.
                                if (allTests[host] === '') {
                                    allTests[host] = 'failed';
                                } else if (allTests[host] === 'passed') {
                                    allTests[host] = 'partial';
                                }
                            }
                        }
                        
                    });
                }
            });
        }
        
        // Columns are browser, cape code, node.
        row = table.insertRow(1);
        row.id = accessorname;
        cell0 = row.insertCell(0);

        var link = "https://www.icyphy.org/accessors/doc/jsdoc/accessor-" + 
            accessorname.replace('/', '_').replace('.js', '.html');
        
        // Add + sign to expand if there are test cases.
        var expandable = false
        Object.keys(allTests).forEach(function (host){
            if (allTests[host] !== '') {
                expandable = true;
            }
        });
        
        if (expandable) {
            cell0.innerHTML = "+ " + "<a href=\"" + link + "\">" + 
                accessorname  + "</a>";
            row.className += 'collapsed';
        } else {
            cell0.innerHTML = "<a href=\"" + link + "\">" + accessorname + "</a>";
        }
        cell0.className += 'name';
        
        cells = {};
        
        // Last first.
        cells.node = row.insertCell(1);
        cells.capecode = row.insertCell(1);
        cells.browser = row.insertCell(1);
        
        fillSummary(accessorname, cells, allTests);
    }
    
    addRowHandlers();
    
    /** Fill out entries in a test case row, depending on results.
     * 
     * @param cells The cells to enter data into.
     * @param supported Fields for each host indicating if the host supports 
     *  all modules required by all accessors in the test case.
     * @param testResult Fields for each host indicating test result.
     */
    function fillCells(cells, supported, testResult) {
        Object.keys(supported).forEach(function(host) {
            if (supported[host] === true) {
                if(testResult !== null && typeof testResult !== 'undefined' && 
                   testResult[host] !== null && 
                   typeof testResult[host] !== 'undefined') {
                    if (testResult[host] === 'Passed' || 
                        testResult[host] === 'Fixed') {
                        cells[host].className += 'passed ';
                        cells[host].innerHTML = '&#9899';
                    } else {
                        cells[host].className += 'failed ';
                        cells[host].innerHTML = 'x';
                    }
                }
                // Leave blank if no test result. 
                // Cape Code has a separate test suite from browser and node, 
                // so a test will not be run on all hosts.
            }        
            // Leave blank if not supported, even if test case fails.
            // In some cases tests may be run on a host that doesn't support them.
        });
    }
    
    /** Fill out entries in the accessor summary row, depending on the results 
     * of all test cases.
     */
    function fillSummary(accessor, cells, allTests) {
        Object.keys(allTests).forEach(function(host) { 
            // If no tests, check if host supports all modules required by the 
            // accessor.
            if (allTests[host] === ''){
                if(accessorMap.accessorsToHosts[accessor].includes(host) || 
                   accessorMap.accessorsToHosts[accessor].includes('all')) {
                    cells[host].className += 'supported ';
                    cells[host].innerHTML = 'o';
                }
            } else if (allTests[host] === 'passed') {
                cells[host].className += 'passed ';
                cells[host].innerHTML = '&#9899';
            } else if (allTests[host] === 'partial') {
                cells[host].className += 'partial ';
                cells[host].innerHTML = '&#9650';
            } else if (allTests[host] === 'failed'){
                cells[host].className += 'failed ';
                cells[host].innerHTML = 'x';
            } 
        });
    }
};

/** Add click handlers to all accessor name rows, to expand test cases.
 */
function addRowHandlers() {
    var rows = document.getElementsByClassName("collapsed");

    for (var i = 0; i < rows.length; i++) {
        rows[i].onclick = function() {
            var testrows = document.getElementsByClassName(this.id);
            if (this.classList.contains('collapsed')) {
                this.classList.remove('collapsed');
                this.classList.add('expanded');
                this.children[0].innerHTML = '-' + 
                    this.children[0].innerHTML.substring(1);
                
                for (var j = 0; j < testrows.length; j++) {
                    testrows[j].classList.remove('hidden');
                    testrows[j].classList.add('visible');
                }
                
            } else {
                this.classList.remove('expanded');
                this.classList.add('collapsed');
                this.classList.add('expanded');
                this.children[0].innerHTML = '+' + 
                    this.children[0].innerHTML.substring(1);
                
                for (var j = 0; j < testrows.length; j++) {
                    testrows[j].classList.remove('visible');
                    testrows[j].classList.add('hidden');
                }
            }
        }
    }
}
