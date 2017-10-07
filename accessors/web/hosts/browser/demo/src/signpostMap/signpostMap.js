// Fetch gps and audio data for each signpost and display on a map.

var accessorTableDone = false;
window.addEventListener('accessorTableDone', function() {
	accessorTableDone = true;
});

// Initialize map to sample data.
var now = Date.now() / 1000;	// Sample data is 30 minutes long, every 10 seconds.
var sampleX = [];
var sampleZ = [];


for (var i = 0; i < 180; i++) {
	sampleX.unshift( (now - i * 10) / 60);
	sampleZ.unshift( [Math.random()*10 + 45, Math.random()*10 + 45, 
			Math.random()*10 + 45, Math.random()*10 + 45, 
			Math.random()*10 + 45, Math.random()*10 + 45, 
			Math.random()*10 + 45]);
}

var signposts = [ { mac : 'c098e5120001', xData: sampleX, zData: sampleZ, usingSample: true},
				  { mac : 'c098e5120003', xData: sampleX, zData: sampleZ, usingSample: true}, 
				  { mac : 'c098e5120004', xData: sampleX, zData: sampleZ, usingSample: true}];

var mapDrawn = false; 

var gpsIndex = 0;
var gpsUrl = 'edu.berkeley.eecs.' + signposts[0].mac + '.signpost_gps.v0-0-1';

var gpsOptions = {"url":"https://gdp-rest-01.eecs.berkeley.edu/gdp/v1/gcl/" + gpsUrl + "?recno=-1",
				"headers":{"Authorization":"Basic ZWNkZW1vOnRlcnJhc3dhcm0="},
				"method":"GET"};

var subscribeTo = {};
subscribeTo.startrec = -1000;	// To get initial data to populate the graph.
subscribeTo.numrec = 0;  

var initialValues = {};
initialValues["REST.options"] = JSON.stringify(gpsOptions);
initialValues["REST.trigger"] = true;

subscribeTo.logname = 'edu.berkeley.eecs.' + signposts[0].mac + '.signpost_audio_frequency.v0-0-1';

initialValues["WebSocketClient.server"] = 'gdp-rest-01.eecs.berkeley.edu';
// Use 9007 for ws:// and 9008 for wss://
initialValues["WebSocketClient.port"] = 9008;
initialValues["WebSocketClient.toSend"] = JSON.stringify(subscribeTo);
initialValues["WebSocketClient.sslTls"] = true;
initialValues["WebSocketClient.trustAll"] = true;

subscribeTo.logname = 'edu.berkeley.eecs.' + signposts[1].mac + '.signpost_audio_frequency.v0-0-1';
initialValues["WebSocketClient2.server"] = 'gdp-rest-01.eecs.berkeley.edu';
initialValues["WebSocketClient2.port"] = 9008;
initialValues["WebSocketClient2.toSend"] = JSON.stringify(subscribeTo);
initialValues["WebSocketClient2.sslTls"] = true;
initialValues["WebSocketClient2.trustAll"] = true;

subscribeTo.logname = 'edu.berkeley.eecs.' + signposts[2].mac + '.signpost_audio_frequency.v0-0-1';
initialValues["WebSocketClient3.server"] = 'gdp-rest-01.eecs.berkeley.edu';
initialValues["WebSocketClient3.port"] = 9008;
initialValues["WebSocketClient3.toSend"] = JSON.stringify(subscribeTo);
initialValues["WebSocketClient3.sslTls"] = true;
initialValues["WebSocketClient3.trustAll"] = true;

/** Find the signpost that corresponds to this marker.
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
 * @param data The lat, lng of each signpost and an array of time, temperature.
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

	      		
	      		var node = document.createElement('div');
	      		node.setAttribute('class', 'chart');
	      		infoWindow = new google.maps.InfoWindow();
	            
	      		var source = findSignpost(marker);
	      		if (source !== null) {
	      			if (source.usingSample) {
	      				title.innerHTML = marker.mac + ' Audio Spectrum Energy (Sample)';
	      			} else {
	      				title.innerHTML = marker.mac + ' Audio Spectrum Energy';
	      			}
		      		
		      		container.appendChild(title);
	      			
	    			var logy = [Math.log(63), Math.log(160), Math.log(400), Math.log(1000), Math.log(2500), Math.log(6250), Math.log(16000)];
	    			
	    			var relXData = [];
	    			var xBase = source.xData[0];
	    			for (var i = 0; i < source.xData.length; i++) {
	    				relXData.push(source.xData[i] - xBase);
	    			}
	    			
	    			// Z data needs to be in arrays of x times per y frequencies.
	    			var newZData = [];
	    			for (var i = 0; i < logy.length; i++) {
	    				newZData.push([]);
	    			}
	    			
	    			
	    			for (var i = 0; i < source.zData.length; i++) {
	    				for(var j = 0; j < logy.length; j++) {
	    					newZData[j].push(source.zData[i][j]);
	    				}
	    			}
	    			
					var data = [{
	            		// x is time, y is frequency, z is amplitude in db.
	            			   x: relXData,
	            		       y: [Math.log(63), Math.log(160), Math.log(400), Math.log(1000), Math.log(2500), Math.log(6250), Math.log(16000)],
	            	           z: newZData,
	            	           type: 'surface',
	            	           colorbar: {len: 0.5, thickness: 8, y: 0.7, x: 0.95, tickfont: {size: 10}}
	            	        }];
	            	
	    	        	var layout = {
    	        			scene: {
    	        				camera: {
    	        					up: {x:0, y:0, z:1},
    	        					center: {x:0.15, y:0, z: -0.5},
    	        					eye: {x:2, y:2, z:0.8}
    	        				
    	        				},
    		        			xaxis: {
    		        				range: [relXData[0], 
    		        					relXData[relXData.length - 1]],
    		        				tickfont: {
    		        					size: 10
    		        				},
    		        				title: 'Minutes',
    		        				titlefont: {
    		        					size: 10
    		        				}
    		        			},
    		        			yaxis: {
    		        				numticks: 7,
    		        			    tickvals: [Math.log(63), Math.log(160), Math.log(400), Math.log(1000), Math.log(2500), Math.log(6250), Math.log(16000)],
    		        			    ticktext: [63, 160, 400, 1000, 2500, 6250, 16000],
    		        				tickfont: {
    		        					size: 10
    		        				},
    		        				range: [Math.log(63), Math.log(16000)],
    		        				title: 'Frequency (Hz)',
    		        				titlefont: {
    		        					size: 10
    		        				}
    		        			},
    		        			zaxis: {
    		        				tickfont: {
    		        					size: 10
    		        				},
    		        				title: 'db',
    		        				titlefont: {
    		        					size: 10
    		        				}
    		        			},
    	        			},
      		        	  autosize: false,
      		        	  width: 450,
      		        	  height: 300,
      		        	  margin: {
      		        	    l: 10,
      		        	    r: 5,
      		        	    b: 5,
      		        	    t: 10,
      		        	    pad: 4
      		        	  }
	          		};
	      		        	
	            	Plotly.newPlot(node, data, layout, {displayModeBar: false});
	      		        
		            container.appendChild(node);
		            
		            infoWindow.setContent(container);      		
		  			infoWindow.open(map, marker);

	      		} else {
	      			console.log('Could not find signpost for marker ' + marker.mac);
      				title.innerHTML = marker.mac + ' Audio Spectrum Energy';
      				container.appendChild(title);
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
	
	// Watch for changes in the REST.response output.
	setTimeout(function() {
		  document.getElementById('RESTError')
		  	.addEventListener('DOMSubtreeModified', function() {
		  		// An error occurred.  Create overlay with default data.
		  		console.log('Error invoking REST accessor.');
		  	});
		
		  document.getElementById('REST.response')
		  	.addEventListener('DOMSubtreeModified', function() {
	  		  var value = document.getElementById('REST.response').innerText;
			  
	  		  // TODO:  Make three rest calls to fetch all gps data.  Test this first.
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
				// Draw map and assume websocket data will load before person clicks on map.
	  			drawMap();
			  }
		  });
		  	
		  document.getElementById('WebSocketClientError')
		  	.addEventListener('DOMSubtreeModified', function() {
		  		// An error occurred.  Create overlay with default data.
		  		console.log('Error invoking WebSocketClient accessor.  Using sample data.');
		  		useSampleData(0);
		  	});
		
		  document.getElementById('WebSocketClient.received')
		  	.addEventListener('DOMSubtreeModified', function() {
	  		  var value = document.getElementById('WebSocketClient.received').innerText;
	  		// TODO: Try/catch here.
	  		  var data = JSON.parse(value);
	  		  if (data.type === 2) {
	  			 console.log('Error fetching websocket data.  Using sample data.');
	  			 console.log('Subscription ended.');
	  		  } else {
	  			 parseData(data, 0);
	  		  }
		  });
		  
		  document.getElementById('WebSocketClient2Error')
		  	.addEventListener('DOMSubtreeModified', function() {
		  		// An error occurred.  Create overlay with default data.
		  		console.log('Error invoking WebSocketClient accessor.  Using sample data.');
		  		useSampleData(1);
		  	});
		
		  document.getElementById('WebSocketClient2.received')
		  	.addEventListener('DOMSubtreeModified', function() {
	  		  var value = document.getElementById('WebSocketClient2.received').innerText;
	  		// TODO: Try/catch here.
	  		  var data = JSON.parse(value);
	  		  if (data.type === 2) {
	  			  console.log('Subscription ended.');
	  		  } else {
	  			  parseData(data, 1);
	  		  }
		  });
		  
		  document.getElementById('WebSocketClient3Error')
		  	.addEventListener('DOMSubtreeModified', function() {
		  		// An error occurred.  Create overlay with default data.
		  		console.log('Error invoking WebSocketClient accessor.  Using sample data.');
		  		useSampleData(2);
		  	});
		
		  document.getElementById('WebSocketClient3.received')
		  	.addEventListener('DOMSubtreeModified', function() {
	  		  var value = document.getElementById('WebSocketClient3.received').innerText;
	  		// TODO: Try/catch here.
	  		  var data = JSON.parse(value);
	  		  if (data.type === 2) {
	  			console.log('Subscription ended.');
	  		  } else {
	  			  parseData(data, 2);
	  		  }
		  });
		 
		 document.getElementById("showAccessor").addEventListener("click", function() {
				var div = document.getElementById("accessorContainer");
				
				if (div.style.display === "none") {
					div.style.display = "";
					document.getElementById("showAccessor").textContent = "Hide Accessors";
				} else {
					div.style.display = "none";
					document.getElementById("showAccessor").textContent = "Show Accessors";
				}
			});
		 
		 if (!accessorTableDone) {
			 window.addEventListener('accessorTableDone', reactMe);
			 
		 } else {
			 reactMe();
		 }
		 
	}, 1000);
}

/** Parse data received from the websocket.
 * 
 * @param data The data received from the websocket.
 * @param i The index of this signpost.
 */
function parseData(data, i) {
	var values = JSON.parse(data.datum.data);
	// Time in seconds.  Check for duplicates; only save one per second.
	var time = Math.floor(new Date(values._meta.received_time) / 1000);
	if (signposts[i].usingSample === true) {
		signposts[i].usingSample = false;
		signposts[i].xData = [];
		signposts[i].zData = [];
	}
	
	if (signposts[i].xData.length === 0 || 
			signposts[i].xData[signposts[i].xData.length -1] !== time) {
		var z = [values['63Hz'].value, values['160Hz'].value, 
			values['400Hz'].value, values['1000Hz'].value, 
			values['2500Hz'].value, values['6250Hz'].value, 
			values['16000Hz'].value];
		
		if (signposts[i].xData.length > (-subscribeTo.startrec) - 100) {
			signposts[i].xData.shift();
			signposts[i].zData.shift();
		}

		signposts[i].xData.push(time/60);	// Time in minutes.
		signposts[i].zData.push(z);
	}
}

/** React accessors for the first time.
 */
function reactMe() {
	setTimeout(function() {
		  reactIfExecutable('REST');
		  reactIfExecutable('WebSocketClient');
		  reactIfExecutable('WebSocketClient2');
		  reactIfExecutable('WebSocketClient3');
	}, 1000);
}

/** Use sample data for the given signpost.
 * 
 * @param i  The index of the signpost.
 */
function useSampleData(i) {
	signposts[i].xData = sampleX;
	signposts[i].zData = sampleZ;
	signposts[i].usingSample = true;
}