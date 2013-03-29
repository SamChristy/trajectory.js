/**
 * @author 	Sam Christy <sam_christy@hotmail.co.uk>
 * @licence     GNU GPL v3.0 <http://www.gnu.org/licenses/gpl-3.0.html>
 * @copyright   Sam Christy 2012 | All rights reserved (c)
 */

// Red: With wind resitance
// Blue: In a vacuum
// Purple: Kinetic energy

var graphContainer = document.getElementById("graph-container");
var genImageButton = document.getElementById("generate-image");
var plotButton = document.getElementById("plot-trajectory");
var cancelButton = document.getElementById("cancel");

genImageButton.addEventListener('click', generatePNG, false);
plotButton.addEventListener('click', plotTrajectory, false);
cancelButton.style.display = 'none';
cancelButton.addEventListener('click', abort, false);

window.addEventListener('keypress', function(e) {
    if (e.which == 13)  // Enter
        plotTrajectory();
}, false);

/**
 * Terminates the trajectory computation background thread.
 */
function abort() {
    if (typeof worker !== 'undefined') {
        worker.terminate();
        swapElements(cancelButton, plotButton);
    }
}

/**
 * Temporarily swaps the elements by setting their CSS display values.
 * @param {object} e1 The element to be hidden.
 * @param {object} e2 The hidden element, that will appear in the other's place.
 */
function swapElements(e1, e2) {
    e1.style.display = 'none';
    e2.style.display = '';
}

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

/**
 * Computes the trajectory and plots it on a graph.
 */
function plotTrajectory() {
    swapElements(plotButton, cancelButton);
    
    var input = getInput();
	
    console.time('trajectory');
    
    if (typeof worker !== 'undefined') {
        worker.terminate();
    }
    
    worker = new Worker('js/worker.js');
    worker.postMessage(input);
    
    worker.onmessage = function(e) {
        var trajectoryInVacuum = e.data.trajectoryInVacuum;
        var bounds = e.data.bounds;
        var trajectory = e.data.trajectory;
        worker.terminate();
        
        console.timeEnd('trajectory');
    
        var initialKineticEnergy = 0.0005 * input.mass * input.velocity * input.velocity;
        renderGraph(trajectory, trajectoryInVacuum, bounds);
        updateFlightStats(bounds.duration, bounds.distance, bounds.height, initialKineticEnergy);
        
        swapElements(cancelButton, plotButton);
    }
}

function renderGraph(trajectory, trajectoryInVacuum, bounds) {
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
}


/**
 * Get the projectile's input data.
 */
function getInput() {
    var input = {
        "gravity"  : parseFloat(document.getElementById("gravity").value),
        "velocity" : parseFloat(document.getElementById("velocity").value),
        "angle"    : deg2Rad(parseFloat(document.getElementById("angle").value)),
        "height"   : parseFloat(document.getElementById("height").value),
        "mass"     : parseFloat(document.getElementById("mass").value),
        "diameter" : parseFloat(document.getElementById("diameter").value),
        "dragCoef" : parseFloat(document.getElementById("drag-coefficient").value),
        "density"  : parseFloat(document.getElementById("fluid-density").value)
    }
    
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