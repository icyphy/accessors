// Declare max x and y values here.  Values will be scaled according to 
// the map graphic size.
// Place any default "fallback" data here.
// I highly recommend using JSON.  Some hosts currently have problems
// appending and reading non-JSON to GDP, as there is not yet a good
// way to set the HTTP Content-Type response header appropriately. 

// Image is 584 x 488 px.
var imageWidth = 584;
var imageHeight = 488;

var xMax = 100;
var yMax = 100;

// temp in degrees F, humidity in percent
var defaultData = [ { x : 10, y : 12, temp : 58, humidity : 42, label : "sample window"},
					   { x : 38, y : 51, temp : 77, humidity : 55, label : "sample table"},
					   { x : 77, y : 20, temp : 88, humidity : 67, label : "sample shelf"},
					   { x : 48, y: 7, temp : 65, humidity : 44, label : "sample tv"},
					   { x : 54, y : 67, temp : 41, humidity : 52, label : "sample sofa"}];

var data = defaultData;
// Assumes all data objects have same fields.
var headers = Object.keys(data[0]);
// For setting table width.
var headerLength = 0;
headers.forEach(function (header) {
	headerLength += header.length + 2;
});

// For touch in phone vs. desktop.
var touchEvent = 'ontouchstart' in window ? 'touchstart' : 'click'; 

// Have to fetch GDP records individually at the moment.  Number of 
// records parameter is not yet implemented.
// https://gdp-rest-01.eecs.berkeley.edu/gdp-rest-interface.html
// We'll be using records 1 through 5 inclusive.
var gdpData = [];
var count = 1;

// Define initial values for accessor inputs. 
var options = {"url":"https://gdp-rest-01.eecs.berkeley.edu/gdp/v1/gcl/edu.berkeley.eecs.ectest.dots?recno=1",
				"headers":{"Authorization":"Basic ZWNkZW1vOnRlcnJhc3dhcm0="},
				"method":"GET"};
var initialValues = {};
initialValues["REST.options"] = JSON.stringify(options);
initialValues["REST.trigger"] = true;
 	    
// Watch for changes in the REST.response output.
// Wait a bit after onload to make sure accessors are fully loaded.
setTimeout(function() {
	  document.getElementById('RESTError')
	  	.addEventListener('DOMSubtreeModified', function() {
	  		// An error occurred.  Create overlay with default data.
	  		data = defaultData;
	  		createOverlay();
	  	});
	
	  document.getElementById('REST.response')
	  	.addEventListener('DOMSubtreeModified', function() {
		  var value = 
			  document.getElementById('REST.response').innerText;
		  gdpData.push(JSON.parse(value));
		  
		  // Use separate count instead of gdpData.length since
		  // responses might take some time to return.
		  // Save value, change URL to get next record, and react again.
		  if (count < 5) {
			  count++;
			  options.url = "https://gdp-rest-01.eecs.berkeley.edu/gdp/v1/gcl/edu.berkeley.eecs.ectest.dots?recno=" + count;
			  document.getElementById('REST.options').value = JSON.stringify(options);
			  
			  reactIfExecutable('REST');
			  
		  } else {
			  // Create the overlay with gdpData.
			  data = gdpData;
			  createOverlay();
		  }
	  });
	  
	  // Add button listener for show/hide button.
	 document.getElementById("showAccessor").addEventListener("click", function() {
		var accessorDiv = document.getElementById("REST");
		if (accessorDiv.style.display === "none") {
			accessorDiv.style.display = "";
			document.getElementById("showAccessor").textContent = "Hide Accessor";
		} else {
			accessorDiv.style.display = "none";
			document.getElementById("showAccessor").textContent = "Show Accessor";
		}
	});
	  
	  // React accessor first time.
	  reactIfExecutable('REST');
}, 4000);
 		
// Create the overlay.  Called after data is fetched. 
function createOverlay() {
	var svg = d3.select('#svg')
				.append('svg')
				.attr('width', imageWidth + 100)	// Data tables may extend.
				.attr('height', imageHeight);
	
	var dots = svg.selectAll('dots')
					.data(data)
					.enter()
					.append('circle')
					.attr('cx', function(d) { return d.x * imageWidth / xMax;})
					.attr('cy', function(d) { return d.y * imageHeight / yMax;})
					.attr('fill', function(d) { var g = 30 + 2*d.temp; var r = 2*d.temp - 50; return 'rgb(' + r + ', ' + g + ',180)';})
					.attr('stroke', 'black')
					.attr('r', 10)
					.on(touchEvent, mouseOver)
					.on('mouseover', mouseOver);
	
	// Mouse over and on-click display a text box with a label.
	function mouseOver(d, i) {
		svg.selectAll('#textbox').remove(); // Remove any previous text.
		svg.selectAll('#table').remove();
		
		var x = d.x * imageWidth / xMax;
		var y = d.y * imageHeight / yMax;
		
		// Pop-up textbox example.
		/*
		var textbox = svg.append('g')
					.attr('id', 'textbox')
					.attr('transform', 'translate (' + x + ', ' + y + ')')
					.on(touchEvent, removeTextbox);
		
		textbox.append('rect')
				.attr('width', (d.label.length + 8) * imageWidth / xMax)
				.attr('height', 5 * imageHeight / yMax)
				.attr('fill', 'white')
				.attr('stroke', 'black');
				    					
		textbox.append('text')
			.attr('x', 2 * imageWidth / xMax)
			.attr('y', 3 * imageHeight / yMax)
			.attr('font-family', 'monospace')
			.text(d.label);
		*/
		
		// End pop-up textbox example.
		
		// Pop-up table example.
		// See css file for table formatting.
		var table = svg.append('foreignObject')
					.attr('transform', 'translate (' + x + ', ' + y + ')')
					.attr('id', 'table')
					.attr('width', (headerLength + 5 + Math.floor(0.5*headerLength)) * imageWidth / xMax)
					.attr('height', 13 * imageHeight / yMax)
					.append('xhtml:body')
					.on(touchEvent, removeTable);
		
		table.append('table')
			 .attr('class', 'dottable');
		
		var header = table.append('tr')
						  .attr('class', 'dottable')
						  .selectAll('th')
						  .data(headers)
						  .enter() 
						  .append('th')
						  .attr('class', 'dottable')
						  .text(function(d) { return d});
		
		var rowData = [];
		for (var prop in d){
			rowData.push(d[prop]).toString();
		}
		
		table.append('tr')
			 .attr('class', 'dottable')
			 .selectAll('td')
			 .data(rowData)
			 .enter()
			 .append('td')
			 .attr('class', 'dottable')
			 .text(function(d) {return d;});
		
		// End pop-up table example.
	}
	
	// Clicking on the table removes it.
	function removeTable() {
		svg.selectAll('#table').remove();
	}
	
	// Clicking on textbox removes it.
	function removeTextbox() {
		svg.selectAll('#textbox').remove();
		
	}
}