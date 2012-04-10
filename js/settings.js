/**
 * @author 	Sam Christy <sam_christy@hotmail.co.uk>
 * @licence     GNU GPL v3.0 <http://www.gnu.org/licenses/gpl-3.0.html>
 * @copyright   Sam Christy 2012 | All rights reserved (c)
 */

// This module will load the settings from the user's local storage, when the program loads. It 
// will also be used to save the settings; when the user closes the program.
// 
// All of the settings are stored in a settings object, the properties of which are loaded into 
// the graph object.

Graph.defaultSettings = {
	textColour: "#000",
	backgroundColour: "#FFF",
	
	titleOffset: 10,
	titleFont: "bold 14pt Calibri",
	
	tickLength: 5,
	gridlineWidth: 1,
	gridlineColour: "#777",
		
	xGridlineCount: 10,
	yGridlineCount: 10,
	
	labelOffset: 10,
	labelFont: "11pt Calibri",
	
	plotLineWidth: 2.25,
	
	plotArea: {
		left: 80,
		top: 30,
		width: 700,
		height: 350
	},
	
	xAxis1: {   // bottom axis
		min: 0,
		max: 2.5,
		precision: 15,
		suffix: "",
		title: "Distance (metres)",
		
		auto: true
	},
	
	xAxis2: {}, // top axis
	
	yAxis1: {   // left axis
		min: 0,
		suffix: "",
		precision: 15,
		
		auto: true
	},
	
	yAxis2: {}
};

/**
 * Removes the saved default settings from the user's local storage, if there are any.
 */
Graph.clearSettings = function(){
	localStorage.clear();
}

/**
 * Saves the current Graph.defaultSettings into localStorage.
 */
Graph.saveSettings = function(){
	// Stringify data so that it can be stored as a string/value pair.
	var settings = JSON.stringify(Graph.defaultSettings);
	
	localStorage.setItem("Graph.defaultSettings", settings);
}

/**
 * Loads the saved default settings from localStorage into Graph.defaultSettings.
 */
Graph.loadSettings = function(){
	var settings = JSON.parse(localStorage.getItem("Graph.defaultSettings"));
	
	Graph.defaultSettings = settings;
}