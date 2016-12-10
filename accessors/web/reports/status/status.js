// An object to store the results, as results['testName'].host = status
// e.g. results['net/REST'].node = passed;
var results;

/** After the page has loaded, import test results and create a table.
 */
$(window).on("load", function() {
	results = {};
	
	var url = "browserhost.txt";
	
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
	
	fillTable();
};


function parseResults(data, host) {

	// Retrieve table rows.  Pop the first (header) row.
	($($.parseHTML(data))).find('#testresult').find('tr').slice(1)
		.each(function(index) {
			
		// Each row contains three <td>s.
		// Test name, duration, result (passed / failed).
		// TODO:  Check that this works for failed tests - additional message printed?
		var entries = $(this).find('td');  
		var testname = $(entries[0]).text();
		
		// Find the accessor name, e.g., net/REST
		// For browser tests, the accessor name is the first work of the line.
		var accessorname;
		
		// Skip hosts/ tests; these do not relate to a specific accessor.
		if (testname.indexOf('hosts/') === -1) {
			if (host === 'node') {
				// Some node tests begin with NodeHost run accessors/web/.
				// Remove this.
				if (testname.indexOf('NodeHost') >= 0) {
					var dot = testname.indexOf('.');
					if (dot > 0) {
						testname = testname.substring(dot + 1);
					}
				}
			}
			
			var space = testname.indexOf(' ');
			
			if (space > 0) {
				accessorname = testname.substring(0, space);
			} else {
				accessorname = testname;
			}
			
			// Remove any leading slashes (node host has these, browser does not).
			if (accessorname[0] === '/') {
				accessorname = accessorname.substring(1);
			}
			
			if (results[accessorname] === null || 
					typeof results[accessorname] === 'undefined') {
				results[accessorname] = {};
			} 
			results[accessorname][host] = $(entries[2]).text();
		}
	});
};

/** Create a table from the results object.
 */
function fillTable(){
	for (var accessorname in results) {
		// TODO:  Alphabetize these.
		
		// Columns are browser, node.
		// TODO:  Add Cape Code.
		var row = table.insertRow(1);
		row.insertCell(0).innerHTML = accessorname;
		var cell1 = row.insertCell(1);
		var cell2 = row.insertCell(2);
		
		if (results[accessorname].browser !== null 
				&& typeof results[accessorname].browser !== 'undefined') {
			if (results[accessorname].browser === 'Passed') {
				cell1.className += 'passed';
				cell1.innerHTML = '&#9899';
			} else {
				cell1.className += 'failed';
				cell1.innerHTML = 'x';
			}
		}
		
		if (results[accessorname].node !== null 
				&& typeof results[accessorname].node !== 'undefined') {
			if (results[accessorname].node === 'Passed') {
				cell2.className += 'passed';
				cell2.innerHTML = '&#9899';
			} else {
				cell2.className += 'failed';
				cell2.innerHTML = 'x';
			}
		}	
	}
};
