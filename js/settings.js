/**
 * @author Sam Christy <sam_christy@hotmail.co.uk>
 * @licence GNU GPL v3
 * 
 * This module will load the settings from the user's local storage, when the program loads. It 
 * will also be used to save the settings; when the user closes the program.
 * 
 * All of the settings are stored in a settings object, the properties of which are loaded into 
 * the graph object.
 */

// FIXME There are some situations where varying gridlines or ranges will cause 0 to missed. It will be a good idea to add an option for drawing gridlines on 0 in a different colour...

// FIXME I should get rid of the objects within the settings object. The code in the constructor is too hacky. plotArea.left can be replaced with plotAreaLeft, etc...

// TODO Consider adding a feature for drawing a legend, in the top, right-hand corner of the graph.

Graph.defaultSettings = {
	textColour: "#000",
	backgroundColour: "#FFF",
	
	titleOffset: 30,
	titleFont: "bold 14pt Calibri",
	
	tickLength: 5,
	gridlineWidth: 1,
	gridlineColour: "#777",
		
	xGridlineCount: 10,
	yGridlineCount: 10,
	
	labelOffset: 10,
	labelFont: "11pt Calibri",
	
	plotLineWidth: 2.5,
	
	plotArea: {
		left: 80,
		top: 30,
		width: 700,
		height: 350
	},
	
	// TODO add seperate 'labelOffset' properties to the different labels and titles. They will be
	// 		useful features for the layout engine (because the width of the labels will vary).
	xAxis1: { // bottom axis (default)
		min: -2.5,
		max: 2.5,
		precision: 2,
		suffix: "",
		position: "bottom",
		title: "Distance (metres)",
	},
	
	xAxis2: {}, // top axis
	
	yAxis1: { // left axis (default)
		suffix: "",
		position: "left",
	},
	
	yAxis2: {},
};

// Idea for simpler settings system.
var set = {
	xAxis1TitleOffset: 10,
	xAxis2TitleOffset: 10,
	yAxis1TitleOffset: 14,
	yAxis2TitleOffset: 14,
	xAxis1Title: "",
	xAxis1Precision: 2
	
	// etc...
}

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