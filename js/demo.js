/**
 * @author Sam Christy <sam_christy@hotmail.co.uk>
 */

// With wind resitance:    Red
// In a vacuum: 		   Blue
// Kinetic energy:    	   Purple 

document.getElementById("draw-graph").onclick = function(){
	var settings = {
		plotLineWidth: 2.25,
		
		plotArea: {
			width: 700
		},

		xGridlineCount: parseInt(document.getElementById("gridlines-x").value),
		yGridlineCount: parseInt(document.getElementById("gridlines-y").value),
		
		xAxis1: {
			min: parseFloat(document.getElementById("min-x").value),
			max: parseFloat(document.getElementById("max-x").value),
			precision: parseInt(document.getElementById("precision-x").value),
			title: "Distance (metres)"
		},
		
		yAxis1: {
			min: parseFloat(document.getElementById("min-y").value),
			max: parseFloat(document.getElementById("max-y").value),
			precision: parseInt(document.getElementById("precision-y").value),
			title: "Height (metres)"
		},
		
		xAxis2: null,
		//yAxis2: null
		yAxis2: {
			min: 0,
			max: 100,
			suffix: "%",
			title: "Kinetic Energy",
			position: "right"
		}
	};
	
	graph = new Graph(900, 450, settings);
	graph.draw();
	graph.appendTo(document.body);
};

document.getElementById("clear-graph").onclick = function(){
	graph.clearPlotArea();
}

document.getElementById("plot-trajectory").onclick = function(){
	// Get the parameters from the input fields.
	var velocity = parseFloat(document.getElementById("arrow-velocity").value);
	var angle = deg2Rad(parseFloat(document.getElementById("arrow-angle").value));
	var height = parseFloat(document.getElementById("arrow-height").value);
	var mass = parseFloat(document.getElementById("mass").value);
	var diameter = parseFloat(document.getElementById("shaft-diameter").value);
	var dragCoefficient = parseFloat(document.getElementById("drag-coefficient").value);
	g = parseFloat(document.getElementById("gravity").value);
	var colour = document.getElementById("line-colour").value;
	
	var duration = parseFloat(document.getElementById("duration").value);
	
	// Calculate the drag constant that will be used to compute the arrow's trajectory.
	var k = dragConstant(mass, diameter, dragCoefficient);
	
	// Compute the trajectory using the input parameters.
	var trajectoryInVacuum = vacTrajectory(velocity, angle, height);
	
	var bounds = trajectoryBounds(velocity, angle, height, 0, k);
	
	console.log("duration: " + bounds.duration.toFixed(2));
	console.log("distance: " + bounds.distance.toFixed(2));
	console.log("height:   " + bounds.height.toFixed(2));
	
	var trajectory = arrowTrajectory(velocity, angle, height, k, bounds.duration);
	
	// Plot the trajectory on the graph, using the specified colour.
	graph.plotData(trajectoryInVacuum, Graph.colours.red);
	
	graph.plotData(trajectory, Graph.colours.blue);
	
	// Convert the velocities to percentages of the initial velocity.
	var max = trajectory[0][2];
	for(var i = 0; i < trajectory.length; i++){
		trajectory[i][2] *= 100 / max;
	}

/*
 * var maxK = 0.0005 * mass * velocity * velocity;
	
	for(var i = 0; i < trajectory.length; i++){
		var v = trajectory[i][2];
		
		trajectory[i][2] = (0.0005 * mass * v * v) * 100 / maxk;
	}
 */


	// Plot the kinetic energy.
	graph.plotData(trajectory, Graph.colours.purple, 1, 2, 0, 2);
};