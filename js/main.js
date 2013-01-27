/**
 * @author 	Sam Christy <sam_christy@hotmail.co.uk>
 * @licence     GNU GPL v3.0 <http://www.gnu.org/licenses/gpl-3.0.html>
 * @copyright   Sam Christy 2012 | All rights reserved (c)
 */

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
	
    console.time('trajectory');
    
	// Calculate the drag constant that will be used to compute the arrow's trajectory.
	var k = dragConstant(input.mass, input.diameter, input.dragCoef, input.density);
	// Compute the trajectory using the input parameters.
	var trajectoryInVacuum = vacTrajectory(input.velocity, input.angle, input.height);
	// Calculate the real trajectory's duration, distance and max height.
	var bounds = trajectoryBounds(input.velocity, input.angle, input.height, 0, k);
	// Compute the real trajectory, using the precomputed duration.
	var trajectory = arrowTrajectory(input.velocity, input.angle, input.mass, input.height, k, 
        bounds.duration);
        
    console.timeEnd('trajectory');
    
	var initialKineticEnergy = 0.0005 * input.mass * input.velocity * input.velocity;
	
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
	
    console.time('graph');
    
	// Remove the graph, if it already exists.
	graphContainer.innerHTML = "";
	
	var graph = new Graph(835, 500, settings);
	graph.draw();
	graph.appendTo(graphContainer);
	
	// Plot the kinetic energy.
	graph.plotData(trajectory, Graph.colours.purple, 1, 2, 0, 2);
	
	// Plot the trajectories on the graph.
	graph.plotData(trajectoryInVacuum, Graph.colours.red);
	graph.plotData(trajectory, Graph.colours.blue);
    
    console.timeEnd('graph');
    
    updateFlightStats(bounds.duration, bounds.distance, bounds.height, initialKineticEnergy);
}

/**
 * Get the projectile's input data.
 */
function getInput() {
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

/**
 * Validates all of the fields, to ensure that they contain sensible values (all fields are 
 * required).
 */
function validateFields() {}