// Construct REST request. 
var signposts = [ { mac : 'c098e5120003'}];

//  edu.berkeley.eecs.c098e5120003.signpost_gps.v0-0-1

var gpsIndex = 0;
var ambientIndex = 0;
var record = -6;

var gpsUrl = 'edu.berkeley.eecs.' + signposts[0].mac + '.signpost_gps.v0-0-1';

var gpsOptions = {"url":"https://gdp-rest-01.eecs.berkeley.edu/gdp/v1/gcl/" + gpsUrl + "?recno=-1",
				"headers":{"Authorization":"Basic ZWNkZW1vOnRlcnJhc3dhcm0="},
				"method":"GET"};

var ambientUrl = 'edu.berkeley.eecs.' + signposts[0].mac + '.signpost_ambient.v0-0-1';

// This only subscribes to one signpost at the moment.
// Need separate websockets for multiple signposts.
signposts[0].temps = [];


var subscribeTo = {};
subscribeTo.logname = ambientUrl;
//subscribeTo.logname = gclPrefix + '.' + mac + '.signpost_audio_frequency.v0-0-1';
subscribeTo.startrec = -10;	// To get initial data to populate the graph.
subscribeTo.numrec = 100;

var initialValues = {};
initialValues["REST.options"] = JSON.stringify(gpsOptions);
initialValues["REST.trigger"] = true;

// No /wss for ws://
initialValues["WebSocketClient.server"] = 'gdp-rest-01.eecs.berkeley.edu';
// Use 9007 for ws:// and 9008 for wss://
initialValues["WebSocketClient.port"] = 9008;
initialValues["WebSocketClient.toSend"] = JSON.stringify(subscribeTo);
initialValues["WebSocketClient.sslTls"] = true;
initialValues["WebSocketClient.trustAll"] = true;

// Assumes library will load before user clicks a marker.
var sampleGPS = {lat: 37.8732, lng: 122.2576};
var sampleTemps = [];
sampleTemps.push({ts: 1506774678, temperature_c: 24.56});
sampleTemps.push({ts: 1506784678, temperature_c: 24.78});
sampleTemps.push({ts: 1506794678, temperature_c: 25.34});
sampleTemps.push({ts: 1506804678, temperature_c: 25.87});
sampleTemps.push({ts: 1506814678, temperature_c: 26.02});

google.charts.load('current', {packages: ['corechart', 'line']});
//google.charts.setOnLoadCallback(function() {
var mapDrawn = false;

/** Find the signpost that corresponds to this marker.
 * 
 * @param marker The marker that was clicked on.
 * @returns The signpost associated with that marker, or null if none found.
 */
function findSignpost(marker) {
	for (var i = 0; i < signposts.length; i++) {
		if (signposts[i].mac === marker.mac) {
			return signposts[i];
		}
	}
	return null;
}

/** Draw the map with the given data.
 * 
 * @param data The lat, lng of each signpost and an array of {time, temperature}.
 */
function drawMap() {
	if (!mapDrawn) {
		var center = {lat: 37.874249, lng: -122.256387};
		var markers = [];
		
		// Coordinates must be named 'lat' and 'lng'.  Marker() constructor expects.
		
	    var map = new google.maps.Map(document.getElementById('map'), {
	        center: center,
	        mapTypeId: 'satellite',
	        zoom: 17
	      });
	      
	      var infoWindow = null;
	      var location;
	      
	      signposts.forEach(function(signpost) {
	    	  // Google maps uses minus sign for west longitude.
	    	  location = {lat : signpost.lat, lng : -signpost.lng};
	          marker = new google.maps.Marker({
	              position: location,
	              map: map,
	            });
	          marker.mac = signpost.mac;
	          markers.push(marker);
	      });
	      
	      markers.forEach(function(marker) {
	      	google.maps.event.addListener(marker, 'click', function() {
	      		if (infoWindow !== null) {
	      			infoWindow.close();
	      		}
	      		
	      		var container = document.createElement('div');
	      		// Google charts does not support centering title.  Create separately.
	      		var title = document.createElement('div');
	      		title.setAttribute('class', 'title');
	      		title.innerHTML = marker.mac + ' Temperature &deg;C';
	      		container.appendChild(title);
	      		
	      		var node = document.createElement('div');
	      		node.setAttribute('class', 'chart');
	      		infoWindow = new google.maps.InfoWindow();
	            
	      		// Create the data table.  Save with marker so we can edit it later.
	      		marker.markerData = new google.visualization.DataTable();
	      		marker.markerData.addColumn('datetime', 'Time');
	      		marker.markerData.addColumn('number', 'Temperature');
	      		
	      		var dataSource = findSignpost(marker);
	      		if (dataSource !== null) {
	      			for (var i = 0; i < dataSource.temps.length; i++) {
		      			marker.markerData.addRow([new Date(dataSource.temps[i].ts * 1000),
		      					dataSource.temps[i].temperature_c]);
		      		}
		
		      		// Assumes data is ordered.
		      		var startDate, endDate;
		      		if (dataSource.temps.length > 1) {
		      			startDate = new Date(dataSource.temps[0].ts*1000);
		      			endDate = new Date(dataSource.temps[dataSource.temps.length - 1].ts*1000);
		      		}
		      		
		            var options = {
		            	legend: {position: 'none'},
		                height: 100,
		                width: 300,
		            	hAxis: {
		                  viewWindow: {
		                	  min: startDate,
		                	  max: endDate
		                    },
		                  gridlines: {
		                      count: -1,
		                      units: {
		                        days: {format: ['MMM dd']},
		                        hours: {format: ['HH:mm', 'ha']},
		                      }
		                    },
		                    minorGridlines: {
		                      units: {
		                        hours: {format: ['hh:mm:ss a', 'ha']},
		                        minutes: {format: ['HH:mm a Z', ':mm']}
		                      }
		                    }
		
		                }
		            };
		            
		            var chart = new google.visualization.LineChart(node);
		            chart.draw(marker.markerData, options);
		            container.appendChild(node);
		            
		            infoWindow.setContent(container);      		
		  			infoWindow.open(map, marker);
	      		} else {
	      			console.log('Could not find signpost for marker ' + marker.mac);
	      		}
	          });
	      });
	}
	mapDrawn = true;
}

/** Get signpost data and create content for info windows.
 *  This is called back from the .html file once the map is loaded.
 */
// Called back from .html file once map is loaded.
function getSignposts() {
	var gpsReady = false;
	var tempsReady = false;
	
	// Watch for changes in the REST.response output.
	// Wait a bit after onload to make sure accessors are fully loaded.
	setTimeout(function() {
		  document.getElementById('RESTError')
		  	.addEventListener('DOMSubtreeModified', function() {
		  		// An error occurred.  Create overlay with default data.
		  		console.log('Error invoking REST accessor.');
		  	});
		
		  document.getElementById('REST.response')
		  	.addEventListener('DOMSubtreeModified', function() {
	  		  var value = document.getElementById('REST.response').innerText;
			  
			  var gpsData = JSON.parse(value);
			  signposts[gpsIndex].lat = gpsData.latitude.value;
			  signposts[gpsIndex].lng = gpsData.longitude.value;
			  
			  gpsIndex ++;
			  if (gpsIndex < signposts.length) {
				  gpsUrl = 'edu.berkeley.eecs.' + signposts[gpsIndex].mac + '.signpost_gps.v0-0-1';
				  
				  var gpsOptions = {"url":"https://gdp-rest-01.eecs.berkeley.edu/gdp/v1/gcl/" + gpsUrl + "?recno=-1",
			  				"headers":{"Authorization":"Basic ZWNkZW1vOnRlcnJhc3dhcm0="},
			  				"method":"GET"};
				  document.getElementById('REST.options').value = JSON.stringify(gpsOptions);
				  reactIfExecutable('REST');
			  } else {
				  gpsReady = true;
				  if (tempsReady) {
	  				  drawMap();
				  }
			  }
		  });
		  	
		  document.getElementById('WebSocketClientError')
		  	.addEventListener('DOMSubtreeModified', function() {
		  		// An error occurred.  Create overlay with default data.
		  		console.log('Error invoking WebSocketClient accessor.  Using sample data.');
	  			  // FIXME:  Support multiple signposts.
	  			  signposts[0].temps = sampleTemps;
	  			  if (signposts[0].lat === null || typeof signposts[0].lat === 'undefined') {
	  				  signposts[0].lat = sampleGPS.lat;
	  				  signposts[0].lng = sampleGPS.lng;
	  			  }
	  			  drawMap();
		  	});
		
		  document.getElementById('WebSocketClient.received')
		  	.addEventListener('DOMSubtreeModified', function() {
	  		  var value = document.getElementById('WebSocketClient.received').innerText;
	  		//console.log('Fetched ambient data ' + value);
	  		
	  		// TODO: Try/catch here.
	  		  var data = JSON.parse(value);
	  		  if (data.type === 2) {
	  			  console.log('Error fetching websocket data.  Using sample data.');
	  			  // TODO:  Support multiple signposts.
	  			  signposts[0].temps = sampleTemps;
	  			  if (signposts[0].lat === null || typeof signposts[0].lat === 'undefined') {
	  				  signposts[0].lat = sampleGPS.lat;
	  				  signposts[0].lng = sampleGPS.lng;
	  			  }
	  			  drawMap();
	  		  } else {
		  		  var datum = {};
		  		  var tempc = JSON.parse(data.datum.data);
		  		  datum.temperature_c = tempc.temperature_c.value;
		  		  datum.ts = data.datum.ts.tv_sec;
		  		  
		  		  if (signposts[0].temps.length < 10) {
		  			  signposts[0].temps.push(datum);
		  			  if (signposts[0].temps.length === 10) {
		  				  tempsReady = true;
		  				  if (gpsReady) {
		  					drawMap();
		  				  }
		  			  }
		  		  } else {
		  			  signposts[0].temps.shift();
		  			  signposts[0].temps.push(datum);
		  			  
		  			  // TODO: Update any open info windows
		  			  
		  		  }
	  		  }
		  });

		  
		  // Add button listener for show/hide button.
		 document.getElementById("showAccessor").addEventListener("click", function() {
			var accessorDiv = document.getElementById("REST");
			var accessorDiv2 = document.getElementById("WebSocketClient");
			
			if (accessorDiv.style.display === "none") {
				accessorDiv.style.display = "";
				accessorDiv2.style.display = "";
				document.getElementById("showAccessor").textContent = "Hide Accessors";
			} else {
				accessorDiv.style.display = "none";
				accessorDiv2.style.display = "none";
				document.getElementById("showAccessor").textContent = "Show Accessors";
			}
		});
		 
		  // React accessor first time.
		  reactIfExecutable('REST');
		  reactIfExecutable('WebSocketClient');
	}, 6000);
	
}
