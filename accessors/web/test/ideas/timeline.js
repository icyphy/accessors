// Based on http://alignedleft.com/tutorials/d3/making-a-scatterplot
window.onload = function() {
var dataset = [ 
	{ 'xy': [100, 60], 
	  'time': '1:00',
	  'pass':true,
	  'message':'net/Discovery: Cory hall printer should be available'
	}, 
	{ 'xy': [100, 120], 
	  'time': '1:30',
	  'pass':false,
	  'message':'cameras/Camera: Room 123 camera should be recording'
	},
    { 'xy': [100, 200], 
	  'time': '2:15',
	  'pass':true,
	  'message':'robotics/Scarab: Robot should bring coffee to room 123'
	}];
	
//Create SVG element
var svg = d3.select("#timeline")
            .append("svg")
            .attr("width", 1000)
            .attr("height", 250);
			
svg.append("line")
   .attr("x1", 100)
   .attr("x2", 100)
   .attr("y1", 60)
   .attr("y2", 200)
   .attr("stroke", "lightgrey")
   .attr("stroke-width", 4);
   
svg.selectAll("circle")
   .data(dataset)
   .enter()
   .append("circle")
      .attr("cx", function(d) {
        return d.xy[0];
   })
   .attr("cy", function(d) {
        return d.xy[1];
   })
   .attr("r", 10)
   .attr("fill", function(d) {
		if (d.pass) {
			return "lightgreen";
		} else {
			return "red";
		}
   })
   .attr("stroke", "grey")
   .attr("stroke-width", 2);

svg.selectAll("timetext")
   .data(dataset)
   .enter()
   .append("text")
      .text(function(d) {
        return d.time;
   })
   .attr("x", function(d) {
        return d.xy[0] - 55;
   })
   .attr("y", function(d) {
        return d.xy[1] + 5;
   })
   .attr("font-family", "sans-serif")
   .attr("font-size", "16px");

svg.selectAll("messagetext")
   .data(dataset)
   .enter()
   .append("text")
      .text(function(d) {
		return d.message;
   })
   .attr("x", function(d) {
        return d.xy[0] + 55;
   })
   .attr("y", function(d) {
        return d.xy[1] + 5;
   })
   .attr("font-family", "sans-serif")
   .attr("font-size", "16px");
};

   
