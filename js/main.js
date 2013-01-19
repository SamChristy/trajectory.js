/**
 * @author 	Sam Christy <sam_christy@hotmail.co.uk>
 * @licence     GNU GPL v3.0 <http://www.gnu.org/licenses/gpl-3.0.html>
 * @copyright   Sam Christy 2012 | All rights reserved (c)
 */

// Red: With wind resitance
// Blue: In a vacuum
// Purple: Kinetic energy

$("#clear-graph").click(function(){
	$("#graph-container > canvas").remove();
});

$("#generate-image").click(generatePNG);

function generatePNG(){
	if(typeof graph === "undefined"){
		alert("You have to plot the trajectory first!");
		return;
	}
	
	var png = graph.toImg();
	var canvas = graph.getCanvas();
	
	var w = window.open("", "png", 
		"width=" + Math.round(canvas.width * 1.04)
		+ ",height=" + Math.round(canvas.height * 1.04)
		+ ",modal=yes"
	);

	w.document.body.appendChild(png);
	w.document.title = "Generated PNG";
}

$("#plot-trajectory").click(function(){
	// Get the projectile's input data.
	var velocity = parseFloat($("#arrow-velocity").val());
	var angle    = deg2Rad(parseFloat($("#arrow-angle").val()));
	var height   = parseFloat($("#arrow-height").val());
	var mass     = parseFloat($("#mass").val());
	var diameter = parseFloat($("#shaft-diameter").val());
	var dragCoef = parseFloat($("#drag-coefficient").val());
	var density  = parseFloat($("#fluid-density").val());
	gravity = parseFloat($("#gravity").val());
	
	// Calculate the drag constant that will be used to compute the arrow's trajectory.
	var k = dragConstant(mass, diameter, dragCoef, density);
	
	// Compute the trajectory using the input parameters.
	var trajectoryInVacuum = vacTrajectory(velocity, angle, height);
	
	// Calculate the real trajectory's duration, distance and max height.
	var bounds = trajectoryBounds(velocity, angle, height, 0, k);
	
	// Compute the real trajectory, using the precomputed duration.
	var trajectory = arrowTrajectory(velocity, angle, height, k, bounds.duration);
	
	var settings = {
		xGridlineCount: parseInt($("#gridlines-x").val()),
		yGridlineCount: parseInt($("#gridlines-y").val()),
		
		xAxis1: {
			min: 0,
			max: bounds.distance,
			title: "Distance (metres)"
		},
		
		yAxis1: {
			min: 0,
			max: bounds.height,
			title: "Height (metres)"
		},
		
		xAxis2: null,
		
		yAxis2: {
			min: 0,
			max: 100,
			suffix: "%",
			title: "Kinetic Energy",

			auto: false
		}
	};
	
	// Remove the graph, if it already exists.
	$("#graph-container > canvas").remove();
	
	graph = new Graph(835, 500, settings);
	graph.draw();
	graph.appendTo($("#graph-container")[0]);
	
	
	// Replace each velocity value with its kinetic energy, then convert it to a percentage of the
	// initial kinetic energy.
	var maxK = 0.0005 * mass * velocity * velocity;
	
	for(var i = 0; i < trajectory.length; i++){
		var v = trajectory[i][2];
		
		trajectory[i][2] = (0.0005 * mass * v * v) * 100 / maxK;
	}

	// Plot the kinetic energy.
	graph.plotData(trajectory, Graph.colours.purple, 1, 2, 0, 2);
	
	// Plot the trajectories on the graph.
	graph.plotData(trajectoryInVacuum, Graph.colours.red);
	graph.plotData(trajectory, Graph.colours.blue);
	
	// Finally print the stats of the flight.
	$("#flight-duration").text(bounds.duration.toFixed(2));
	$("#flight-distance").text(bounds.distance.toFixed(2));
	$("#flight-height").text(bounds.height.toFixed(2));
	$("#kinetic-energy").text(maxK.toFixed(2));
});