/**
 * @author 	Sam Christy <sam_christy@hotmail.co.uk>
 * @licence     GNU GPL v3.0 <http://www.gnu.org/licenses/gpl-3.0.html>
 * @copyright   Sam Christy 2012 | All rights reserved (c)
 */

// TODO Make the UI scale to different resolutions and optimise the controls for
//      tablet and mobile devices.

// Red: With wind resitance
// Blue: In a vacuum
// Purple: Kinetic energy

var clearGraphButton = document.getElementById("clear-graph");
var graphContainer = document.getElementById("graph-container");

clearGraphButton.addEventListener('click', function() {
    graphContainer.innerHTML = "";
}, false);

var genImageButton = document.getElementById("generate-image");
genImageButton.addEventListener('click', generatePNG, false);

function generatePNG() {
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

var plotButton = document.getElementById("plot-trajectory");
plotButton.addEventListener('click', plotTrajectory, false);

window.addEventListener('keypress', function(e) {
    if (e.which == 13)  // Enter
        plotTrajectory();
}, false);

/**
 * Computes the trajectory and plots it on a graph.
 */
function plotTrajectory() {
    var input = getInput();
	
	// Calculate the drag constant that will be used to compute the arrow's trajectory.
	var k = dragConstant(input.mass, input.diameter, input.dragCoef, input.density);
	
	// Compute the trajectory using the input parameters.
	var trajectoryInVacuum = vacTrajectory(input.velocity, input.angle, input.height);
	
	// Calculate the real trajectory's duration, distance and max height.
	var bounds = trajectoryBounds(input.velocity, input.angle, input.height, 0, k);
	
	// Compute the real trajectory, using the precomputed duration.
	var trajectory = arrowTrajectory(input.velocity, input.angle, input.height, k, bounds.duration);
	
	var settings = {
		xGridlineCount: 10,
		yGridlineCount: 10,
		
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
	graphContainer.innerHTML = "";
	
	graph = new Graph(835, 500, settings);
	graph.draw();
	graph.appendTo(graphContainer);
	
	// Replace each velocity value with its kinetic energy, then convert it to a percentage of the
	// initial kinetic energy.
	var maxK = 0.0005 * input.mass * input.velocity * input.velocity;
	
	for(var i = 0; i < trajectory.length; i++){
		var v = trajectory[i][2];
		
		trajectory[i][2] = (0.0005 * input.mass * v * v) * 100 / maxK;
	}

	// Plot the kinetic energy.
	graph.plotData(trajectory, Graph.colours.purple, 1, 2, 0, 2);
	
	// Plot the trajectories on the graph.
	graph.plotData(trajectoryInVacuum, Graph.colours.red);
	graph.plotData(trajectory, Graph.colours.blue);
    
    updateFlightStats(bounds.duration, bounds.distance, bounds.height, maxK);
}

/**
 * Get the projectile's input data.
 */
function getInput() {
    // TODO Add alternative unit options (Metric/Imperial) to the UI and handle
    //      the conversions here.
    var input = {
        "velocity" : parseFloat(document.getElementById("velocity").value),
        "angle"    : deg2Rad(parseFloat(document.getElementById("angle").value)),
        "height"   : parseFloat(document.getElementById("height").value),
        "mass"     : parseFloat(document.getElementById("mass").value),
        "diameter" : parseFloat(document.getElementById("diameter").value),
        "dragCoef" : parseFloat(document.getElementById("drag-coefficient").value),
        "density"  : parseFloat(document.getElementById("fluid-density").value)
    }
    
    // gravity is defined globally, as it is also used by `trajectory.js`.
    gravity = parseFloat(document.getElementById("gravity").value);
    
    return input;
}

function updateFlightStats(duration, distance, height, energy, precision) {
    if (typeof precision === "undefined")
        precision = 2;
    
    document.getElementById("flight-duration").textContent = duration.toFixed(precision);
    document.getElementById("flight-distance").textContent = distance.toFixed(precision);
    document.getElementById("flight-height").textContent   = height.toFixed(precision);
    document.getElementById("kinetic-energy").textContent  = energy.toFixed(precision);
};

// TODO: Write validation functions for the input and validate input before
//       performing calculations.

/**
 * Validates all of the fields, to ensure that they contain sensible values (all fields are 
 * required).
 */
function validateFields() {}