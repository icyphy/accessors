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

var signposts = [ { mac : 'c098e5120001', xAudio: sampleXAudio, zAudio: sampleZAudio, xRF : sampleXRF, zRF : sampleZRF, usingSample: true, lat: 37.8733, lng: 122.2568},
	  { mac : 'c098e5120003', xAudio: sampleXAudio, zAudio: sampleZAudio, xRF : sampleXRF, zRF : sampleZRF, usingSample: true, lat: 37.8735, lng: 122.2577}, 
	  { mac : 'c098e512000a', xAudio: sampleXAudio, zAudio: sampleZAudio, xRF : sampleXRF, zRF : sampleZRF, usingSample: true, lat: 37.863580, lng: 122.249355},
	  { mac : 'c098e512000d', xAudio: sampleXAudio, zAudio: sampleZAudio, xRF : sampleXRF, zRF : sampleZRF, usingSample: true, lat: 37.8739, lng: 122.2579},
	  { mac : 'c098e512000e', xAudio: sampleXAudio, zAudio: sampleZAudio, xRF : sampleXRF, zRF : sampleZRF, usingSample: true, lat: 37.8741, lng: 122.2579},
	  { mac : 'c098e512000f', xAudio: sampleXAudio, zAudio: sampleZAudio, xRF : sampleXRF, zRF : sampleZRF, usingSample: true, lat: 37.863663, lng: 122.249639},
	  { mac : 'c098e5120010', xAudio: sampleXAudio, zAudio: sampleZAudio, xRF : sampleXRF, zRF : sampleZRF, usingSample: true, lat: 37.863480, lng: 122.249619},
	  { mac : 'c098e5120011', xAudio: sampleXAudio, zAudio: sampleZAudio, xRF : sampleXRF, zRF : sampleZRF, usingSample: true, lat: 37.8747, lng: 122.2579},
	  { mac : 'c098e5120012', xAudio: sampleXAudio, zAudio: sampleZAudio, xRF : sampleXRF, zRF : sampleZRF, usingSample: true, lat: 37.8749, lng: 122.2579},
	  { mac : 'c098e5120013', xAudio: sampleXAudio, zAudio: sampleZAudio, xRF : sampleXRF, zRF : sampleZRF, usingSample: true, lat: 37.8751, lng: 122.2579},
	  { mac : 'c098e5120015', xAudio: sampleXAudio, zAudio: sampleZAudio, xRF : sampleXRF, zRF : sampleZRF, usingSample: true, lat: 37.8751, lng: 122.2579},
	  { mac : 'c098e5120016', xAudio: sampleXAudio, zAudio: sampleZAudio, xRF : sampleXRF, zRF : sampleZRF, usingSample: true, lat: 37.8751, lng: 122.2579},
	  { mac : 'c098e5120017', xAudio: sampleXAudio, zAudio: sampleZAudio, xRF : sampleXRF, zRF : sampleZRF, usingSample: true, lat: 37.8751, lng: 122.2579},
	  { mac : 'c098e5120018', xAudio: sampleXAudio, zAudio: sampleZAudio, xRF : sampleXRF, zRF : sampleZRF, usingSample: true, lat: 37.8751, lng: 122.2579},
	  { mac : 'c098e512001a', xAudio: sampleXAudio, zAudio: sampleZAudio, xRF : sampleXRF, zRF : sampleZRF, usingSample: true, lat: 37.8751, lng: 122.2579},
	  { mac : 'c098e512001b', xAudio: sampleXAudio, zAudio: sampleZAudio, xRF : sampleXRF, zRF : sampleZRF, usingSample: true, lat: 37.8751, lng: 122.2579},
	  { mac : 'c098e512001c', xAudio: sampleXAudio, zAudio: sampleZAudio, xRF : sampleXRF, zRF : sampleZRF, usingSample: true, lat: 37.8751, lng: 122.2579},
	  { mac : 'c098e512001d', xAudio: sampleXAudio, zAudio: sampleZAudio, xRF : sampleXRF, zRF : sampleZRF, usingSample: true, lat: 37.8751, lng: 122.2579},
	  { mac : 'c098e512001e', xAudio: sampleXAudio, zAudio: sampleZAudio, xRF : sampleXRF, zRF : sampleZRF, usingSample: true, lat: 37.8751, lng: 122.2579},
	  { mac : 'c098e512001f', xAudio: sampleXAudio, zAudio: sampleZAudio, xRF : sampleXRF, zRF : sampleZRF, usingSample: true, lat: 37.8751, lng: 122.2579}
	  ];

var signpostIndex = 0;

var mapDrawn = false; 

var gpsIndex = 0;
var gpsUrl = 'edu.berkeley.eecs.' + signposts[0].mac + '.signpost_gps.v0-0-1';

var gpsOptions = {"url":"https://gdp-rest-01.eecs.berkeley.edu/gdp/v1/gcl/" + gpsUrl + "?recno=-1",
				"headers":{"Authorization":"Basic ZWNkZW1vOnRlcnJhc3dhcm0="},
				"method":"GET"};

var subscribeTo = {};
subscribeTo.startrec = -600;	// To get initial data to populate the graph.
subscribeTo.numrec = 0;  

var initialValues = {};
initialValues["REST.options"] = JSON.stringify(gpsOptions);
initialValues["REST.trigger"] = true;

//Use 9007 for ws:// and 9008 for wss://
for (var i = 0; i < signposts.length; i++) {
	subscribeTo.logname = 'edu.berkeley.eecs.' + signposts[i].mac + '.signpost_audio_frequency.v0-0-1';
	initialValues['WebSocketClient' + i + 'Audio.server'] = 'gdp-rest-01.eecs.berkeley.edu';
	initialValues['WebSocketClient' + i + 'Audio.port'] = 9008;
	initialValues['WebSocketClient' + i + 'Audio.toSend'] = JSON.stringify(subscribeTo);
	initialValues['WebSocketClient' + i + 'Audio.sslTls'] = true;
	initialValues['WebSocketClient' + i + 'Audio.trustAll'] = true;
	
	subscribeTo.logname = 'edu.berkeley.eecs.' + signposts[i].mac + '.signpost_rf_spectrum_max.v0-0-1';
	initialValues['WebSocketClient' + i + 'RF.server'] = 'gdp-rest-01.eecs.berkeley.edu';
	initialValues['WebSocketClient' + i + 'RF.port'] = 9008;
	initialValues['WebSocketClient' + i + 'RF.toSend'] = JSON.stringify(subscribeTo);
	initialValues['WebSocketClient' + i + 'RF.sslTls'] = true;
	initialValues['WebSocketClient' + i + 'RF.trustAll'] = true;
}

/** Draw the map with the given data.
 * 
 * @param data The lat, lng of each signpost and an array of time, temperature.
 */
function drawMap() {
	if (!mapDrawn) {
		var center = {lat: 37.874249, lng: -122.256387};
		var markers = [];
		
		var greenColor = "32CD32";
		var greenImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + greenColor,
				null, null, null, new google.maps.Size(40, 60));
		
		var redColor = "CD4F39";
		var redImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + redColor,
				null, null, null, new google.maps.Size(40, 60));
		
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
	    	  var labeltext = signpost.mac[signpost.mac.length - 2] +  
	    	  		signpost.mac[signpost.mac.length - 1];
	    
	    	  
	    	  if (signpost.usingSample) {
		          marker = new google.maps.Marker({
		              position: location,
		              map: map,
		              label: labeltext,
		              icon: redImage
		            });
		          marker.mac = signpost.mac;
		          markers.push(marker);
	    	  } else {
		          marker = new google.maps.Marker({
		              position: location,
		              map: map,
		              label: labeltext,
		              icon: greenImage
		            });
		          marker.mac = signpost.mac;
		          markers.push(marker);
	    	  }
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
	      			Plotly.purge(audioDiv);
	      			Plotly.purge(RFDiv);
	      			
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
	var values;
	var error = false;
	try {
		values = JSON.parse(data.datum.data);
	} catch(err) {
		console.log('Error parsing json datum');
		error = true;
	}
	
	if (!error) {
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
}

function parseDataRF(data, i) {
	var error;
	try {
		var values = JSON.parse(data.datum.data);
	} catch(err) {
		error = true;
	}
	
	if (!error) {
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
					console.log(name + ' is missing.  Skipping sample.');
					break;
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
}

/** Set up event listeners and react for the first time.
 */
function registerAndReact() {
	setTimeout(function() {
	  document.getElementById('RESTError')
	  	.addEventListener('DOMSubtreeModified', function() {
	  		// GPS not found for this accessor.  It's OK, use default sample.
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
	
	  document.getElementById('REST.response')
	  	.addEventListener('DOMSubtreeModified', function() {
		  var value = document.getElementById('REST.response').innerText;
		  
		  var gpsData;
		  var error = false;
		  
		  try {
			  gpsData = JSON.parse(value);
		  } catch(err) {
			  error = true;
		  }
		  
		  if (!error) {
			  if (typeof gpsData.latitude !== 'undefined' && gpsData.longitude !== 'undefined' && 
					  gpsData.latitude.value > 0 && gpsData.longitude.value > 0) {
				  signposts[gpsIndex].lat = gpsData.latitude.value;
				  signposts[gpsIndex].lng = gpsData.longitude.value;
			  }
		  }
		  
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
	  
	  // Sadly trying to do this in a loop doesn't seem to work due to the loop
	  // index being undefined in the DOMSubtreeModified callback. 
	
	  document.getElementById('WebSocketClient0Audio.received')
	  	.addEventListener('DOMSubtreeModified', function() {
		  var value = document.getElementById('WebSocketClient0Audio.received').innerText;
		  var error = false;
		  var data;
		  try { data = JSON.parse(value); } catch(err){ error = true;}
		  if (!error) {
			  if (data.type === 2) {
				 console.log('Subscription ended.');
			  } else {
				 parseDataAudio(data, 0);
			  }
		  }
	  });
	  
	  document.getElementById('WebSocketClient0RFError')
	  	.addEventListener('DOMSubtreeModified', function() {
	  		console.log('Error invoking WebSocketClient accessor.  Using sample data.');
	  		useSampleRFData(0);
	  	});
	
	  document.getElementById('WebSocketClient0RF.received')
	  	.addEventListener('DOMSubtreeModified', function() {
		  var value = document.getElementById('WebSocketClient0RF.received').innerText;
		  var error = false;
		  var data;
		  try { data = JSON.parse(value); } catch(err) { error = true;}
		  if (!error) {
			  if (data.type === 2) {
				 console.log('Subscription ended.');
			  } else {
				 parseDataRF(data, 0);
			  }
		  }
	  });
	  
	  document.getElementById('WebSocketClient1AudioError')
	  	.addEventListener('DOMSubtreeModified', function() {
	  		console.log('Error invoking WebSocketClient accessor.  Using sample data.');
	  		useSampleAudioData(1);
	  	});
	
	  document.getElementById('WebSocketClient1Audio.received')
	  	.addEventListener('DOMSubtreeModified', function() {
		  var value = document.getElementById('WebSocketClient1Audio.received').innerText;
		  var error = false;
		  var data;
		  try { data = JSON.parse(value); } catch(err){ error = true;}
		  if (!error) {
			  if (data.type === 2) {
				 console.log('Subscription ended.');
			  } else {
				 parseDataAudio(data, 1);
			  }
		  }
	  });
	  
	  document.getElementById('WebSocketClient1RFError')
	  	.addEventListener('DOMSubtreeModified', function() {
	  		console.log('Error invoking WebSocketClient accessor.  Using sample data.');
	  		useSampleRFData(1);
	  	});
	
	  document.getElementById('WebSocketClient1RF.received')
	  	.addEventListener('DOMSubtreeModified', function() {
		  var value = document.getElementById('WebSocketClient1RF.received').innerText;
		  var error = false;
		  var data;
		  try { data = JSON.parse(value); } catch(err) { error = true;}
		  if (!error) {
			  if (data.type === 2) {
				 console.log('Subscription ended.');
			  } else {
				 parseDataRF(data, 1);
			  }
		  }
	  });
	  
	  document.getElementById('WebSocketClient2AudioError')
	  	.addEventListener('DOMSubtreeModified', function() {
	  		console.log('Error invoking WebSocketClient accessor.  Using sample data.');
	  		useSampleAudioData(2);
	  	});
	
	  document.getElementById('WebSocketClient2Audio.received')
	  	.addEventListener('DOMSubtreeModified', function() {
		  var value = document.getElementById('WebSocketClient2Audio.received').innerText;
		  var error = false;
		  var data;
		  try { data = JSON.parse(value); } catch(err){ error = true;}
		  if (!error) {
			  if (data.type === 2) {
				 console.log('Subscription ended.');
			  } else {
				 parseDataAudio(data, 2);
			  }
		  }
	  });
	  
	  document.getElementById('WebSocketClient3RFError')
	  	.addEventListener('DOMSubtreeModified', function() {
	  		console.log('Error invoking WebSocketClient accessor.  Using sample data.');
	  		useSampleRFData(3);
	  	});
	
	  document.getElementById('WebSocketClient3RF.received')
	  	.addEventListener('DOMSubtreeModified', function() {
		  var value = document.getElementById('WebSocketClient3RF.received').innerText;
		  var error = false;
		  var data;
		  try { data = JSON.parse(value); } catch(err) { error = true;}
		  if (!error) {
			  if (data.type === 2) {
				 console.log('Subscription ended.');
			  } else {
				 parseDataRF(data, 3);
			  }
		  }
	  });
	  
	  document.getElementById('WebSocketClient4AudioError')
	  	.addEventListener('DOMSubtreeModified', function() {
	  		console.log('Error invoking WebSocketClient accessor.  Using sample data.');
	  		useSampleAudioData(4);
	  	});
	
	  document.getElementById('WebSocketClient4Audio.received')
	  	.addEventListener('DOMSubtreeModified', function() {
		  var value = document.getElementById('WebSocketClient4Audio.received').innerText;
		  var error = false;
		  var data;
		  try { data = JSON.parse(value); } catch(err){ error = true;}
		  if (!error) {
			  if (data.type === 2) {
				 console.log('Subscription ended.');
			  } else {
				 parseDataAudio(data, 4);
			  }
		  }
	  });
	  
	  document.getElementById('WebSocketClient4RFError')
	  	.addEventListener('DOMSubtreeModified', function() {
	  		console.log('Error invoking WebSocketClient accessor.  Using sample data.');
	  		useSampleRFData(4);
	  	});
	
	  document.getElementById('WebSocketClient4RF.received')
	  	.addEventListener('DOMSubtreeModified', function() {
		  var value = document.getElementById('WebSocketClient4RF.received').innerText;
		  var error = false;
		  var data;
		  try { data = JSON.parse(value); } catch(err) { error = true;}
		  if (!error) {
			  if (data.type === 2) {
				 console.log('Subscription ended.');
			  } else {
				 parseDataRF(data, 4);
			  }
		  }
	  });
	  
	  document.getElementById('WebSocketClient4AudioError')
	  	.addEventListener('DOMSubtreeModified', function() {
	  		console.log('Error invoking WebSocketClient accessor.  Using sample data.');
	  		useSampleAudioData(4);
	  	});
	
	  document.getElementById('WebSocketClient4Audio.received')
	  	.addEventListener('DOMSubtreeModified', function() {
		  var value = document.getElementById('WebSocketClient4Audio.received').innerText;
		  var error = false;
		  var data;
		  try { data = JSON.parse(value); } catch(err){ error = true;}
		  if (!error) {
			  if (data.type === 2) {
				 console.log('Subscription ended.');
			  } else {
				 parseDataAudio(data, 4);
			  }
		  }
	  });
	  
	  document.getElementById('WebSocketClient4RFError')
	  	.addEventListener('DOMSubtreeModified', function() {
	  		console.log('Error invoking WebSocketClient accessor.  Using sample data.');
	  		useSampleRFData(4);
	  	});
	
	  document.getElementById('WebSocketClient4RF.received')
	  	.addEventListener('DOMSubtreeModified', function() {
		  var value = document.getElementById('WebSocketClient4RF.received').innerText;
		  var error = false;
		  var data;
		  try { data = JSON.parse(value); } catch(err) { error = true;}
		  if (!error) {
			  if (data.type === 2) {
				 console.log('Subscription ended.');
			  } else {
				 parseDataRF(data, 4);
			  }
		  }
	  });
	  
	  document.getElementById('WebSocketClient4AudioError')
	  	.addEventListener('DOMSubtreeModified', function() {
	  		console.log('Error invoking WebSocketClient accessor.  Using sample data.');
	  		useSampleAudioData(4);
	  	});
	
	  document.getElementById('WebSocketClient4Audio.received')
	  	.addEventListener('DOMSubtreeModified', function() {
		  var value = document.getElementById('WebSocketClient4Audio.received').innerText;
		  var error = false;
		  var data;
		  try { data = JSON.parse(value); } catch(err){ error = true;}
		  if (!error) {
			  if (data.type === 2) {
				 console.log('Subscription ended.');
			  } else {
				 parseDataAudio(data, 4);
			  }
		  }
	  });
	  
	  document.getElementById('WebSocketClient4RFError')
	  	.addEventListener('DOMSubtreeModified', function() {
	  		console.log('Error invoking WebSocketClient accessor.  Using sample data.');
	  		useSampleRFData(4);
	  	});
	
	  document.getElementById('WebSocketClient4RF.received')
	  	.addEventListener('DOMSubtreeModified', function() {
		  var value = document.getElementById('WebSocketClient4RF.received').innerText;
		  var error = false;
		  var data;
		  try { data = JSON.parse(value); } catch(err) { error = true;}
		  if (!error) {
			  if (data.type === 2) {
				 console.log('Subscription ended.');
			  } else {
				 parseDataRF(data, 4);
			  }
		  }
	  });
	  
	  document.getElementById('WebSocketClient5Audio.received')
	  	.addEventListener('DOMSubtreeModified', function() {
		  var value = document.getElementById('WebSocketClient5Audio.received').innerText;
		  var error = false;
		  var data;
		  try { data = JSON.parse(value); } catch(err){ error = true;}
		  if (!error) {
			  if (data.type === 2) {
				 console.log('Subscription ended.');
			  } else {
				 parseDataAudio(data, 5);
			  }
		  }
	  });
	  
	  document.getElementById('WebSocketClient5RFError')
	  	.addEventListener('DOMSubtreeModified', function() {
	  		console.log('Error invoking WebSocketClient accessor.  Using sample data.');
	  		useSampleRFData(5);
	  	});
	
	  document.getElementById('WebSocketClient5RF.received')
	  	.addEventListener('DOMSubtreeModified', function() {
		  var value = document.getElementById('WebSocketClient5RF.received').innerText;
		  var error = false;
		  var data;
		  try { data = JSON.parse(value); } catch(err) { error = true;}
		  if (!error) {
			  if (data.type === 2) {
				 console.log('Subscription ended.');
			  } else {
				 parseDataRF(data, 5);
			  }
		  }
	  });
	  
	  document.getElementById('WebSocketClient6Audio.received')
	  	.addEventListener('DOMSubtreeModified', function() {
		  var value = document.getElementById('WebSocketClient6Audio.received').innerText;
		  var error = false;
		  var data;
		  try { data = JSON.parse(value); } catch(err){ error = true;}
		  if (!error) {
			  if (data.type === 2) {
				 console.log('Subscription ended.');
			  } else {
				 parseDataAudio(data, 6);
			  }
		  }
	  });
	  
	  document.getElementById('WebSocketClient6RFError')
	  	.addEventListener('DOMSubtreeModified', function() {
	  		console.log('Error invoking WebSocketClient accessor.  Using sample data.');
	  		useSampleRFData(6);
	  	});
	
	  document.getElementById('WebSocketClient6RF.received')
	  	.addEventListener('DOMSubtreeModified', function() {
		  var value = document.getElementById('WebSocketClient6RF.received').innerText;
		  var error = false;
		  var data;
		  try { data = JSON.parse(value); } catch(err) { error = true;}
		  if (!error) {
			  if (data.type === 2) {
				 console.log('Subscription ended.');
			  } else {
				 parseDataRF(data, 6);
			  }
		  }
	  });
	  
	  document.getElementById('WebSocketClient7Audio.received')
	  	.addEventListener('DOMSubtreeModified', function() {
		  var value = document.getElementById('WebSocketClient7Audio.received').innerText;
		  var error = false;
		  var data;
		  try { data = JSON.parse(value); } catch(err){ error = true;}
		  if (!error) {
			  if (data.type === 2) {
				 console.log('Subscription ended.');
			  } else {
				 parseDataAudio(data, 7);
			  }
		  }
	  });
	  
	  document.getElementById('WebSocketClient7RFError')
	  	.addEventListener('DOMSubtreeModified', function() {
	  		console.log('Error invoking WebSocketClient accessor.  Using sample data.');
	  		useSampleRFData(7);
	  	});
	
	  document.getElementById('WebSocketClient7RF.received')
	  	.addEventListener('DOMSubtreeModified', function() {
		  var value = document.getElementById('WebSocketClient7RF.received').innerText;
		  var error = false;
		  var data;
		  try { data = JSON.parse(value); } catch(err) { error = true;}
		  if (!error) {
			  if (data.type === 2) {
				 console.log('Subscription ended.');
			  } else {
				 parseDataRF(data, 16);
			  }
		  }
	  });

	  document.getElementById('WebSocketClient8Audio.received')
	  	.addEventListener('DOMSubtreeModified', function() {
		  var value = document.getElementById('WebSocketClient8Audio.received').innerText;
		  var error = false;
		  var data;
		  try { data = JSON.parse(value); } catch(err){ error = true;}
		  if (!error) {
			  if (data.type === 2) {
				 console.log('Subscription ended.');
			  } else {
				 parseDataAudio(data, 8);
			  }
		  }
	  });
	  
	  document.getElementById('WebSocketClient8RFError')
	  	.addEventListener('DOMSubtreeModified', function() {
	  		console.log('Error invoking WebSocketClient accessor.  Using sample data.');
	  		useSampleRFData(8);
	  	});
	
	  document.getElementById('WebSocketClient8RF.received')
	  	.addEventListener('DOMSubtreeModified', function() {
		  var value = document.getElementById('WebSocketClient8RF.received').innerText;
		  var error = false;
		  var data;
		  try { data = JSON.parse(value); } catch(err) { error = true;}
		  if (!error) {
			  if (data.type === 2) {
				 console.log('Subscription ended.');
			  } else {
				 parseDataRF(data, 8);
			  }
		  }
	  });
	  
	  document.getElementById('WebSocketClient9Audio.received')
	  	.addEventListener('DOMSubtreeModified', function() {
		  var value = document.getElementById('WebSocketClient9Audio.received').innerText;
		  var error = false;
		  var data;
		  try { data = JSON.parse(value); } catch(err){ error = true;}
		  if (!error) {
			  if (data.type === 2) {
				 console.log('Subscription ended.');
			  } else {
				 parseDataAudio(data, 9);
			  }
		  }
	  });
	  
	  document.getElementById('WebSocketClient9RFError')
	  	.addEventListener('DOMSubtreeModified', function() {
	  		console.log('Error invoking WebSocketClient accessor.  Using sample data.');
	  		useSampleRFData(9);
	  	});
	
	  document.getElementById('WebSocketClient9RF.received')
	  	.addEventListener('DOMSubtreeModified', function() {
		  var value = document.getElementById('WebSocketClient9RF.received').innerText;
		  var error = false;
		  var data;
		  try { data = JSON.parse(value); } catch(err) { error = true;}
		  if (!error) {
			  if (data.type === 2) {
				 console.log('Subscription ended.');
			  } else {
				 parseDataRF(data, 9);
			  }
		  }
	  });
	  
	  document.getElementById('WebSocketClient10Audio.received')
	  	.addEventListener('DOMSubtreeModified', function() {
		  var value = document.getElementById('WebSocketClient10Audio.received').innerText;
		  var error = false;
		  var data;
		  try { data = JSON.parse(value); } catch(err){ error = true;}
		  if (!error) {
			  if (data.type === 2) {
				 console.log('Subscription ended.');
			  } else {
				 parseDataAudio(data, 10);
			  }
		  }
	  });
	  
	  document.getElementById('WebSocketClient10RFError')
	  	.addEventListener('DOMSubtreeModified', function() {
	  		console.log('Error invoking WebSocketClient accessor.  Using sample data.');
	  		useSampleRFData(10);
	  	});
	
	  document.getElementById('WebSocketClient10RF.received')
	  	.addEventListener('DOMSubtreeModified', function() {
		  var value = document.getElementById('WebSocketClient10RF.received').innerText;
		  var error = false;
		  var data;
		  try { data = JSON.parse(value); } catch(err) { error = true;}
		  if (!error) {
			  if (data.type === 2) {
				 console.log('Subscription ended.');
			  } else {
				 parseDataRF(data, 10);
			  }
		  }
	  });
	  
	  document.getElementById('WebSocketClient11Audio.received')
	  	.addEventListener('DOMSubtreeModified', function() {
		  var value = document.getElementById('WebSocketClient11Audio.received').innerText;
		  var error = false;
		  var data;
		  try { data = JSON.parse(value); } catch(err){ error = true;}
		  if (!error) {
			  if (data.type === 2) {
				 console.log('Subscription ended.');
			  } else {
				 parseDataAudio(data, 11);
			  }
		  }
	  });
	  
	  document.getElementById('WebSocketClient11RFError')
	  	.addEventListener('DOMSubtreeModified', function() {
	  		console.log('Error invoking WebSocketClient accessor.  Using sample data.');
	  		useSampleRFData(11);
	  	});
	
	  document.getElementById('WebSocketClient11RF.received')
	  	.addEventListener('DOMSubtreeModified', function() {
		  var value = document.getElementById('WebSocketClient11RF.received').innerText;
		  var error = false;
		  var data;
		  try { data = JSON.parse(value); } catch(err) { error = true;}
		  if (!error) {
			  if (data.type === 2) {
				 console.log('Subscription ended.');
			  } else {
				 parseDataRF(data, 11);
			  }
		  }
	  });
	  
	  document.getElementById('WebSocketClient12Audio.received')
	  	.addEventListener('DOMSubtreeModified', function() {
		  var value = document.getElementById('WebSocketClient12Audio.received').innerText;
		  var error = false;
		  var data;
		  try { data = JSON.parse(value); } catch(err){ error = true;}
		  if (!error) {
			  if (data.type === 2) {
				 console.log('Subscription ended.');
			  } else {
				 parseDataAudio(data, 12);
			  }
		  }
	  });
	  
	  document.getElementById('WebSocketClient12RFError')
	  	.addEventListener('DOMSubtreeModified', function() {
	  		console.log('Error invoking WebSocketClient accessor.  Using sample data.');
	  		useSampleRFData(12);
	  	});
	
	  document.getElementById('WebSocketClient12RF.received')
	  	.addEventListener('DOMSubtreeModified', function() {
		  var value = document.getElementById('WebSocketClient12RF.received').innerText;
		  var error = false;
		  var data;
		  try { data = JSON.parse(value); } catch(err) { error = true;}
		  if (!error) {
			  if (data.type === 2) {
				 console.log('Subscription ended.');
			  } else {
				 parseDataRF(data, 12);
			  }
		  }
	  });
	  
	  document.getElementById('WebSocketClient13Audio.received')
	  	.addEventListener('DOMSubtreeModified', function() {
		  var value = document.getElementById('WebSocketClient13Audio.received').innerText;
		  var error = false;
		  var data;
		  try { data = JSON.parse(value); } catch(err){ error = true;}
		  if (!error) {
			  if (data.type === 2) {
				 console.log('Subscription ended.');
			  } else {
				 parseDataAudio(data, 13);
			  }
		  }
	  });
	  
	  document.getElementById('WebSocketClient13RFError')
	  	.addEventListener('DOMSubtreeModified', function() {
	  		console.log('Error invoking WebSocketClient accessor.  Using sample data.');
	  		useSampleRFData(13);
	  	});
	
	  document.getElementById('WebSocketClient13RF.received')
	  	.addEventListener('DOMSubtreeModified', function() {
		  var value = document.getElementById('WebSocketClient13RF.received').innerText;
		  var error = false;
		  var data;
		  try { data = JSON.parse(value); } catch(err) { error = true;}
		  if (!error) {
			  if (data.type === 2) {
				 console.log('Subscription ended.');
			  } else {
				 parseDataRF(data, 13);
			  }
		  }
	  });
	  
	  document.getElementById('WebSocketClient14Audio.received')
	  	.addEventListener('DOMSubtreeModified', function() {
		  var value = document.getElementById('WebSocketClient14Audio.received').innerText;
		  var error = false;
		  var data;
		  try { data = JSON.parse(value); } catch(err){ error = true;}
		  if (!error) {
			  if (data.type === 2) {
				 console.log('Subscription ended.');
			  } else {
				 parseDataAudio(data, 14);
			  }
		  }
	  });
	  
	  document.getElementById('WebSocketClient14RFError')
	  	.addEventListener('DOMSubtreeModified', function() {
	  		console.log('Error invoking WebSocketClient accessor.  Using sample data.');
	  		useSampleRFData(14);
	  	});
	
	  document.getElementById('WebSocketClient14RF.received')
	  	.addEventListener('DOMSubtreeModified', function() {
		  var value = document.getElementById('WebSocketClient14RF.received').innerText;
		  var error = false;
		  var data;
		  try { data = JSON.parse(value); } catch(err) { error = true;}
		  if (!error) {
			  if (data.type === 2) {
				 console.log('Subscription ended.');
			  } else {
				 parseDataRF(data, 14);
			  }
		  }
	  });
	  
	  document.getElementById('WebSocketClient15Audio.received')
	  	.addEventListener('DOMSubtreeModified', function() {
		  var value = document.getElementById('WebSocketClient15Audio.received').innerText;
		  var error = false;
		  var data;
		  try { data = JSON.parse(value); } catch(err){ error = true;}
		  if (!error) {
			  if (data.type === 2) {
				 console.log('Subscription ended.');
			  } else {
				 parseDataAudio(data, 15);
			  }
		  }
	  });
	  
	  document.getElementById('WebSocketClient15RFError')
	  	.addEventListener('DOMSubtreeModified', function() {
	  		console.log('Error invoking WebSocketClient accessor.  Using sample data.');
	  		useSampleRFData(15);
	  	});
	
	  document.getElementById('WebSocketClient15RF.received')
	  	.addEventListener('DOMSubtreeModified', function() {
		  var value = document.getElementById('WebSocketClient15RF.received').innerText;
		  var error = false;
		  var data;
		  try { data = JSON.parse(value); } catch(err) { error = true;}
		  if (!error) {
			  if (data.type === 2) {
				 console.log('Subscription ended.');
			  } else {
				 parseDataRF(data, 15);
			  }
		  }
	  });
	  
	  document.getElementById('WebSocketClient16Audio.received')
	  	.addEventListener('DOMSubtreeModified', function() {
		  var value = document.getElementById('WebSocketClient16Audio.received').innerText;
		  var error = false;
		  var data;
		  try { data = JSON.parse(value); } catch(err){ error = true;}
		  if (!error) {
			  if (data.type === 2) {
				 console.log('Subscription ended.');
			  } else {
				 parseDataAudio(data, 16);
			  }
		  }
	  });
	  
	  document.getElementById('WebSocketClient16RFError')
	  	.addEventListener('DOMSubtreeModified', function() {
	  		console.log('Error invoking WebSocketClient accessor.  Using sample data.');
	  		useSampleRFData(16);
	  	});
	
	  document.getElementById('WebSocketClient16RF.received')
	  	.addEventListener('DOMSubtreeModified', function() {
		  var value = document.getElementById('WebSocketClient16RF.received').innerText;
		  var error = false;
		  var data;
		  try { data = JSON.parse(value); } catch(err) { error = true;}
		  if (!error) {
			  if (data.type === 2) {
				 console.log('Subscription ended.');
			  } else {
				 parseDataRF(data, 16);
			  }
		  }
	  });
	  
	  document.getElementById('WebSocketClient17Audio.received')
	  	.addEventListener('DOMSubtreeModified', function() {
		  var value = document.getElementById('WebSocketClient17Audio.received').innerText;
		  var error = false;
		  var data;
		  try { data = JSON.parse(value); } catch(err){ error = true;}
		  if (!error) {
			  if (data.type === 2) {
				 console.log('Subscription ended.');
			  } else {
				 parseDataAudio(data, 17);
			  }
		  }
	  });
	  
	  document.getElementById('WebSocketClient17RFError')
	  	.addEventListener('DOMSubtreeModified', function() {
	  		console.log('Error invoking WebSocketClient accessor.  Using sample data.');
	  		useSampleRFData(17);
	  	});
	
	  document.getElementById('WebSocketClient17RF.received')
	  	.addEventListener('DOMSubtreeModified', function() {
		  var value = document.getElementById('WebSocketClient17RF.received').innerText;
		  var error = false;
		  var data;
		  try { data = JSON.parse(value); } catch(err) { error = true;}
		  if (!error) {
			  if (data.type === 2) {
				 console.log('Subscription ended.');
			  } else {
				 parseDataRF(data, 17);
			  }
		  }
	  });
	  
	  document.getElementById('WebSocketClient18Audio.received')
	  	.addEventListener('DOMSubtreeModified', function() {
		  var value = document.getElementById('WebSocketClient18Audio.received').innerText;
		  var error = false;
		  var data;
		  try { data = JSON.parse(value); } catch(err){ error = true;}
		  if (!error) {
			  if (data.type === 2) {
				 console.log('Subscription ended.');
			  } else {
				 parseDataAudio(data, 18);
			  }
		  }
	  });
	  
	  document.getElementById('WebSocketClient18RFError')
	  	.addEventListener('DOMSubtreeModified', function() {
	  		console.log('Error invoking WebSocketClient accessor.  Using sample data.');
	  		useSampleRFData(18);
	  	});
	
	  document.getElementById('WebSocketClient18RF.received')
	  	.addEventListener('DOMSubtreeModified', function() {
		  var value = document.getElementById('WebSocketClient18RF.received').innerText;
		  var error = false;
		  var data;
		  try { data = JSON.parse(value); } catch(err) { error = true;}
		  if (!error) {
			  if (data.type === 2) {
				 console.log('Subscription ended.');
			  } else {
				 parseDataRF(data, 18);
			  }
		  }
	  });
	  
	  document.getElementById('WebSocketClient19Audio.received')
	  	.addEventListener('DOMSubtreeModified', function() {
		  var value = document.getElementById('WebSocketClient19Audio.received').innerText;
		  var error = false;
		  var data;
		  try { data = JSON.parse(value); } catch(err){ error = true;}
		  if (!error) {
			  if (data.type === 2) {
				 console.log('Subscription ended.');
			  } else {
				 parseDataAudio(data, 19);
			  }
		  }
	  });
	  
	  document.getElementById('WebSocketClient19RFError')
	  	.addEventListener('DOMSubtreeModified', function() {
	  		console.log('Error invoking WebSocketClient accessor.  Using sample data.');
	  		useSampleRFData(19);
	  	});
	
	  document.getElementById('WebSocketClient19RF.received')
	  	.addEventListener('DOMSubtreeModified', function() {
		  var value = document.getElementById('WebSocketClient19RF.received').innerText;
		  var error = false;
		  var data;
		  try { data = JSON.parse(value); } catch(err) { error = true;}
		  if (!error) {
			  if (data.type === 2) {
				 console.log('Subscription ended.');
			  } else {
				 parseDataRF(data, 19);
			  }
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
	  for (var i = 0; i < signposts.length; i++) {
		  reactIfExecutable('WebSocketClient' + i + 'Audio');
		  reactIfExecutable('WebSocketClient' + i + 'RF');
	  }
	}, 3000);
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
