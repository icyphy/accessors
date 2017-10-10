// Fetch gps and audio data for each signpost and display on a map.

var accessorTableDone = false;
window.addEventListener('accessorTableDone', function() {
	accessorTableDone = true;
});

// Initialize map to sample data.
var now = Date.now() / 1000;	
var sampleXAudio = [];  // Sample data is 30 minutes long, every 10 seconds.
var sampleZAudio = [];  // Sample data is 24 hours long, every 5 minutes.
var sampleXRF = [];
var sampleZRF = [];
var zArray = [];

for (var i = 0; i < 180; i++) {
	sampleXAudio.unshift( (now - i * 10) / 60);
	for (var j = 0; j < 7; j++) {
		zArray.unshift(Math.random()*10 + 45);  // Range 45 to 55.
	}
	sampleZAudio.unshift(zArray);
	zArray = [];
}

zArray = [];
for (var i = 0; i < 288; i++) {
	sampleXRF.unshift( (now - i * 300) / 360);
	for (var j = 0; j < 80; j++) {	// Range -30 to -60.
		zArray.unshift(-30 - Math.random()*30);
	}
	sampleZRF.unshift(zArray);
	zArray = [];
}

var signposts = [ { mac : 'c098e5120001', xAudio: sampleXAudio, zAudio: sampleZAudio, xRF : [], zRF : [], usingSample: true},
				  { mac : 'c098e5120003', xAudio: sampleXAudio, zAudio: sampleZAudio, xRF : [], zRF : [], usingSample: true}, 
				  { mac : 'c098e5120004', xAudio: sampleXAudio, zAudio: sampleZAudio, xRF : [], zRF : [], usingSample: true}];

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

subscribeTo.logname = 'edu.berkeley.eecs.' + signposts[0].mac + '.signpost_rf_spectrum_max.v0-0-1';
initialValues["WebSocketClient4.server"] = 'gdp-rest-01.eecs.berkeley.edu';
initialValues["WebSocketClient4.port"] = 9008;
initialValues["WebSocketClient4.toSend"] = JSON.stringify(subscribeTo);
initialValues["WebSocketClient4.sslTls"] = true;
initialValues["WebSocketClient4.trustAll"] = true;

subscribeTo.logname = 'edu.berkeley.eecs.' + signposts[1].mac + '.signpost_rf_spectrum_max.v0-0-1';
initialValues["WebSocketClient5.server"] = 'gdp-rest-01.eecs.berkeley.edu';
initialValues["WebSocketClient5.port"] = 9008;
initialValues["WebSocketClient5.toSend"] = JSON.stringify(subscribeTo);
initialValues["WebSocketClient5.sslTls"] = true;
initialValues["WebSocketClient5.trustAll"] = true;

subscribeTo.logname = 'edu.berkeley.eecs.' + signposts[2].mac + '.signpost_rf_spectrum_max.v0-0-1';
initialValues["WebSocketClient6.server"] = 'gdp-rest-01.eecs.berkeley.edu';
initialValues["WebSocketClient6.port"] = 9008;
initialValues["WebSocketClient6.toSend"] = JSON.stringify(subscribeTo);
initialValues["WebSocketClient6.sslTls"] = true;
initialValues["WebSocketClient6.trustAll"] = true;

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
	      		container.setAttribute('class', 'container');
	      		
	      		var section1 = document.createElement('div');
	      		var section2 = document.createElement('div');
	      		section1.setAttribute('id', 'section1');
	      		section2.setAttribute('id', 'section2');
	      		
	      		// Google charts does not support centering title.  Create separately.
	      		var audioTitle = document.createElement('div');
	      		audioTitle.setAttribute('class', 'title');
	      		var RFTitle = document.createElement('div');
	      		RFTitle.setAttribute('class', 'title');
	      		
	      		var audioDiv = document.createElement('div');
	      		audioDiv.setAttribute('class', 'chart');
	      		var RFDiv = document.createElement('div');
	      		RFDiv.setAttribute('class', 'chart');
	      		
	      		infoWindow = new google.maps.InfoWindow();
	            
	      		var source = findSignpost(marker);
	      		
	      		if (source !== null) {
	      			if (source.usingSample) {
	      				audioTitle.innerHTML = marker.mac + ' Audio Spectrum Energy (Sample)';
	      				RFTitle.innerHTML = marker.mac + ' RF Spectrum Energy (Sample)';
	      			} else {
	      				audioTitle.innerHTML = marker.mac + ' Audio Spectrum Energy';
	      				RFTitle.innerHTML = marker.mac + ' RF Spectrum Energy';
	      			}
		      		
	      			section1.appendChild(audioTitle);
	      			section2.appendChild(RFTitle);
	      			
	      			// Create audio graph.
	    			var yData = [Math.log(63), Math.log(160), Math.log(400), Math.log(1000), Math.log(2500), Math.log(6250), Math.log(16000)];
	    			
	    			var relXData = [];
	    			var xBase = source.xAudio[0];
	    			for (var i = 0; i < source.xAudio.length; i++) {
	    				relXData.push(source.xAudio[i] - xBase);
	    			}
	    			
	    			// Z data needs to be in arrays of x times per y frequencies.
	    			var newZData = [];
	    			for (var i = 0; i < yData.length; i++) {
	    				newZData.push([]);
	    			}
	    			
	    			
	    			for (var i = 0; i < source.zAudio.length; i++) {
	    				for(var j = 0; j < yData.length; j++) {
	    					newZData[j].push(source.zAudio[i][j]);
	    				}
	    			}
	    			
					var data = [{
	            		// x is time, y is frequency, z is amplitude in db.
	            			   x: relXData,
	            		       y: yData,
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
      		        	  width: 400,
      		        	  height: 300,
      		        	  margin: {
        		        	    l: 10,
          		        	    r: 5,
          		        	    b: 5,
          		        	    t: 10,
          		        	    pad: 4
      		        	  }
	          		};
	      		        	
	    	        try {
	    	        	Plotly.newPlot(audioDiv, data, layout, {displayModeBar: false});
	    	        } catch(err) {
	    	        	console.log('Error graphing data.  Using sample data.');
	    	        	source.xAudio = sampleXAudio;
	    	        	source.zAudio = sampleZAudio;
	    	        	source.usingSample = true;
	    	        	
	    	        	// Use other variable name here in case this runs 
	    	        	// concurrently with RF plotting due to being in 
	    	        	// error callback.
		    			var relXData2 = [];
		    			var xBase2 = source.xAudio[0];
		    			for (var i = 0; i < source.xAudio.length; i++) {
		    				relXData2.push(source.xAudio[i] - xBase2);
		    			}
		    			
		    			// Z data needs to be in arrays of x times per y frequencies.
		    			var newZData2 = [];
		    			for (var i = 0; i < yData.length; i++) {
		    				newZData2.push([]);
		    			}
		    			
		    			
		    			for (var i = 0; i < source.zAudio.length; i++) {
		    				for(var j = 0; j < yData.length; j++) {
		    					newZData2[j].push(source.zAudio[i][j]);
		    				}
		    			}
		    			
						var data = [{
		            		// x is time, y is frequency, z is amplitude in db.
		            			   x: relXData2,
		            		       y: yData,
		            	           z: newZData2,
		            	           type: 'surface',
		            	           colorbar: {len: 0.5, thickness: 8, y: 0.7, x: 0.95, tickfont: {size: 10}}
		            	        }];
						
		    	        try {
		    	        	Plotly.newPlot(audioDiv, data, layout, {displayModeBar: false});
		    	        } catch(err) {
		    	        	console.log('Cannot create audio graph for ' + marker.mac);
		    	        }
	    	        }
	      			
	      			// Create RF graph.
	    			// Use midpoints of spectrum ranges for y.
	    		    yData = [];
	    			for (var i = 470; i < 950; i = i + 6) {
	    				yData.push(i + 3);
	    			}
	    			
	    			relXData = [];
	    			xBase = source.xRF[0];
	    			for (var i = 0; i < source.xRF.length; i++) {
	    				relXData.push(source.xRF[i] - xBase);
	    			}
	    			
	    			// Z data needs to be in arrays of x times per y frequencies.
	    			newZData = [];
	    			for (var i = 0; i < yData.length; i++) {
	    				newZData.push([]);
	    			}
	    			
	    			for (var i = 0; i < source.zRF.length; i++) {
	    				for(var j = 0; j < yData.length; j++) {
	    					newZData[j].push(source.zRF[i][j]);
	    				}
	    			}
	    			
					var data = [{
	            		// x is time, y is frequency, z is amplitude in db.
	            			   x: relXData,
	            			   y: yData,
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
		        				title: 'Hours',
		        				titlefont: {
		        					size: 10
		        				}
		        			},
		        			yaxis: {
		        				tickfont: {
		        					size: 10
		        				},
		        				title: 'Frequency (MHz)',
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
  		        	  width: 340,
  		        	  height: 300,
  		        	  margin: {
  		        	    l: 10,
  		        	    r: 5,
  		        	    b: 5,
  		        	    t: 10,
  		        	    pad: 4
  		        	  }
	          		};
	      		        	
    	        	try {
    	        		Plotly.newPlot(RFDiv, data, layout, {displayModeBar: false});
    	        	} catch(err) {
    	        		source.xRF = sampleXRF;
    	        		source.zRF = sampleZRF;
    	        		source.usingSample = true;
    	        		
    	        		// Use a different variable name in case this runs 
    	        		// concurrently with audio graph generation due to being
    	        		// in error callback.
    	    			relXData3 = [];
    	    			xBase3 = source.xRF[0];
    	    			for (var i = 0; i < source.xRF.length; i++) {
    	    				relXData3.push(source.xRF[i] - xBase3);
    	    			}
    	    			
    	    			// Z data needs to be in arrays of x times per y frequencies.
    	    			newZData3 = [];
    	    			for (var i = 0; i < yData.length; i++) {
    	    				newZData3.push([]);
    	    			}
    	    			
    	    			for (var i = 0; i < source.zRF.length; i++) {
    	    				for(var j = 0; j < yData.length; j++) {
    	    					newZData3[j].push(source.zRF[i][j]);
    	    				}
    	    			}
    	    			
    					var data = [{
    	            		// x is time, y is frequency, z is amplitude in db.
    	            			   x: relXData3,
    	            			   y: yData,
    	            	           z: newZData3,
    	            	           type: 'surface',
    	            	           colorbar: {len: 0.5, thickness: 8, y: 0.7, x: 0.95, tickfont: {size: 10}}
    	            	}];  
    					
        	        	try {
        	        		Plotly.newPlot(RFDiv, data, layout, {displayModeBar: false});
        	        	} catch(err) {
        	        		console.log('Cannot plot RF graph for ' + marker.mac);
        	        	}
    	        	}
	      		        
	            	section1.appendChild(audioDiv);
	            	section2.appendChild(RFDiv);
	            	
	            	container.appendChild(section1);
	            	container.appendChild(section2);
	            	
		            infoWindow.setContent(container);      		
		  			infoWindow.open(map, marker);

	      		} else {
	      			console.log('Could not find signpost for marker ' + marker.mac);
      				audioTitle.innerHTML = marker.mac + ' Not Found';
      				RFTitle.innerHTML = marker.mac + ' Not Found';
      				
	      			section1.appendChild(audioTitle);
	      			section2.appendChild(RFTitle);
	      			
	            	container.appendChild(section1);
	            	container.appendChild(section2);
	      		}
	          });
	      });
	}
	mapDrawn = true;
}

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

/** Get signpost data and create content for info windows.
 *  This is called back from the .html file once the map is loaded.
 */
// Called back from .html file once map is loaded.
function getSignposts() {
	
	// Watch for changes in the REST.response output.
	setTimeout(function() {
		if (accessorTableDone) {
			registerAndReact();
		} else {
			window.addEventListener('accessorTableDone', registerAndReact);
		}
	}, 1000);
}

/** Parse data received from the websocket.
 * 
 * @param data The data received from the websocket.
 * @param i The index of this signpost.
 */
// Audio

function parseDataAudio(data, i) {
	var values = JSON.parse(data.datum.data);
	// Time in seconds.  Check for duplicates; only save one per second.
	var time = Math.floor(new Date(values._meta.received_time) / 1000);
	if (signposts[i].usingSample === true) {
		signposts[i].usingSample = false;
		signposts[i].xAudio = [];
		signposts[i].zAudio = [];
	}
	
	if (signposts[i].xAudio.length === 0 || 
			signposts[i].xAudio[signposts[i].xAudio.length -1] !== time) {
		if (typeof values['63Hz'] === 'undefined' ||  
		    typeof values['160Hz'] === 'undefined' || 
		    typeof values['400Hz'] === 'undefined' || 
		    typeof values['1000Hz'] === 'undefined' ||
		    typeof values['2500Hz'] === 'undefined' || 
		    typeof values['6250Hz'] === 'undefined' || 
			typeof values['16000Hz']  === 'undefined') {
			console.log('Missing audio data.  Skipping sample.');
		} else {
			var z = [values['63Hz'].value, values['160Hz'].value, 
				values['400Hz'].value, values['1000Hz'].value, 
				values['2500Hz'].value, values['6250Hz'].value, 
				values['16000Hz'].value];
			
			// Discard any out of range data points.  Range is 30 - 70.
			var discard = false;
			for (var index = 0; index < z.length; index++) {
				if (z[index] < 30 || z[index] > 70) {
					discard = true;
					break;
				}
			}
			
			if (!discard) {
				if (signposts[i].xAudio.length > (-subscribeTo.startrec) - 100) {
					signposts[i].xAudio.shift();
					signposts[i].zAudio.shift();
				}
		
				signposts[i].xAudio.push(time/60);	// Time in minutes.
				signposts[i].zAudio.push(z);
			}
		}
	}
}

function parseDataRF(data, i) {
	var values = JSON.parse(data.datum.data);
	// Time in seconds.  Check for duplicates; only save one per second.
	var time = Math.floor(new Date(values._meta.received_time) / 1000);
	var z = [];
	var name = "", i2;
	
	if (signposts[i].usingSample === true) {
		signposts[i].usingSample = false;
		signposts[i].xRF = [];
		signposts[i].zRF = [];
	}
	
	if (signposts[i].xRF.length === 0 || 
			signposts[i].xRF[signposts[i].xRF.length -1] !== time) {
		var missing = false;
		
		for (var count = 470; count < 950; count = count + 6) {
			i2 = count + 6;
			name = count + 'MHz-' + i2 + 'MHz_max';
			if (typeof values[name] === 'undefined') {
				missing = true;
				break;
				console.log(name + ' is missing.  Skipping sample.');
			}
			z.push(values[name].value);
		}
		
		if (!missing) {
			if (signposts[i].xRF.length > (-subscribeTo.startrec) - 100) {
				signposts[i].xRF.shift();
				signposts[i].zRF.shift();
			}
	
			signposts[i].xRF.push(time/360);	// Time in hours.
			signposts[i].zRF.push(z);
		}
	}
}

/** Set up event listeners and react for the first time.
 */
function registerAndReact() {
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
	  		console.log('Error invoking WebSocketClient accessor.  Using sample data.');
	  		useSampleAudioData(0);
	  	});
	
	  document.getElementById('WebSocketClient.received')
	  	.addEventListener('DOMSubtreeModified', function() {
		  var value = document.getElementById('WebSocketClient.received').innerText;
		// TODO: Try/catch here.
		  var data = JSON.parse(value);
		  if (data.type === 2) {
			 console.log('Subscription ended.');
		  } else {
			 parseDataAudio(data, 0);
		  }
	  });
	  
	  document.getElementById('WebSocketClient2Error')
	  	.addEventListener('DOMSubtreeModified', function() {
	  		console.log('Error invoking WebSocketClient accessor.  Using sample data.');
	  		useSampleAudioData(1);
	  	});
	
	  document.getElementById('WebSocketClient2.received')
	  	.addEventListener('DOMSubtreeModified', function() {
		  var value = document.getElementById('WebSocketClient2.received').innerText;
		// TODO: Try/catch here.
		  var data = JSON.parse(value);
		  if (data.type === 2) {
			  console.log('Subscription ended.');
		  } else {
			  parseDataAudio(data, 1);
		  }
	  });
	  
	  document.getElementById('WebSocketClient3Error')
	  	.addEventListener('DOMSubtreeModified', function() {
	  		console.log('Error invoking WebSocketClient accessor.  Using sample data.');
	  		useSampleAudioData(2);
	  	});
	
	  document.getElementById('WebSocketClient3.received')
	  	.addEventListener('DOMSubtreeModified', function() {
		  var value = document.getElementById('WebSocketClient3.received').innerText;
		// TODO: Try/catch here.
		  var data = JSON.parse(value);
		  if (data.type === 2) {
			console.log('Subscription ended.');
		  } else {
			  parseDataAudio(data, 2);
		  }
	  });
	  
	  document.getElementById('WebSocketClient4Error')
	  	.addEventListener('DOMSubtreeModified', function() {
	  		console.log('Error invoking WebSocketClient accessor.  Using sample data.');
	  		useSampleRFData(0);
	  	});
	
	  document.getElementById('WebSocketClient4.received')
	  	.addEventListener('DOMSubtreeModified', function() {
		  var value = document.getElementById('WebSocketClient4.received').innerText;
		// TODO: Try/catch here.
		  var data = JSON.parse(value);
		  if (data.type === 2) {
			 console.log('Subscription ended.');
		  } else {
			 parseDataRF(data, 0);
		  }
	  });
	  
	  document.getElementById('WebSocketClient5Error')
	  	.addEventListener('DOMSubtreeModified', function() {
	  		console.log('Error invoking WebSocketClient accessor.  Using sample data.');
	  		useSampleRFData(1);
	  	});
	
	  document.getElementById('WebSocketClient5.received')
	  	.addEventListener('DOMSubtreeModified', function() {
		  var value = document.getElementById('WebSocketClient5.received').innerText;
		// TODO: Try/catch here.
		  var data = JSON.parse(value);
		  if (data.type === 2) {
			  console.log('Subscription ended.');
		  } else {
			  parseDataRF(data, 1);
		  }
	  });
	  
	  document.getElementById('WebSocketClient6Error')
	  	.addEventListener('DOMSubtreeModified', function() {
	  		console.log('Error invoking WebSocketClient accessor.  Using sample data.');
	  		useSampleRFData(2);
	  	});
	
	  document.getElementById('WebSocketClient6.received')
	  	.addEventListener('DOMSubtreeModified', function() {
		  var value = document.getElementById('WebSocketClient6.received').innerText;
		// TODO: Try/catch here.
		  var data = JSON.parse(value);
		  if (data.type === 2) {
			console.log('Subscription ended.');
		  } else {
			  parseDataRF(data, 2);
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
	 
	  reactIfExecutable('REST');
	  reactIfExecutable('WebSocketClient');
	  reactIfExecutable('WebSocketClient2');
	  reactIfExecutable('WebSocketClient3'); 
	  reactIfExecutable('WebSocketClient4');
	  reactIfExecutable('WebSocketClient5');
	  reactIfExecutable('WebSocketClient6'); 
	}, 2000);
}

/** Use sample audio data for the given signpost.
 * 
 * @param i  The index of the signpost.
 */
function useSampleAudioData(i) {
	signposts[i].xAudio = sampleXAudio;
	signposts[i].zAudio = sampleZAudio;
	signposts[i].usingSample = true;
}

/** Use sample RF data for the given signpost.
 * 
 * @param i  The index of the signpost.
 */
function useSampleRFData(i) {
	signposts[i].xRF = sampleXRF;
	signposts[i].zRF = sampleZRF;
	signposts[i].usingSample = true;
}