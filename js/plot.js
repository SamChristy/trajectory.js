/**
 * @author 		Sam Christy <sam_christy@hotmail.co.uk>
 * @licence     GNU GPL v3.0 <http://www.gnu.org/licenses/gpl-3.0.html>
 * @copyright   Sam Christy 2012 | All rights reserved (c)
 */

// TODO Consider adding a feature for drawing a legend, in the top, right-hand corner of the graph.

// Data is given provided as a two-dimensional array, where the first value represents the x
// cordinate and the second represents the y coordinate [x, y]. There is no real limit to the 
// number of rows; although more will generally result in a smoother plot.
//
// var data = [
//     [x0, y0],
//     [x1, y1],
//     [x2, y2],
//     [x3, y3],
// ];

/**
 * Draws the a line on the graph, using the coordinates specified by data.
 */
Graph.prototype.plotData = function(data, colour, xAxis, yAxis, xIndex, yIndex){
	// Choose the axes that the data is being plotted for, this will determine the scale used.
	// 1 is for the primary axis, i.e. xAxis1 or yAxis1,
	// 2 is for the secondary axis, xAxis2 or yAxis2.
	if(typeof xAxis === "undefined" || xAxis === 1){
		xMin = this._xAxis1.min;
		xMax = this._xAxis1.max;
	}
	else{
		xMin = this._xAxis2.min;
		xMax = this._xAxis2.max;
	}
	if(typeof yAxis === "undefined" || yAxis === 1){
		yMin = this._yAxis1.min;
		yMax = this._yAxis1.max;
	}
	else{
		yMin = this._yAxis2.min;
		yMax = this._yAxis2.max;
	}
	
	if(typeof xIndex === "undefined") xIndex = 0;
	if(typeof yIndex === "undefined") yIndex = 1;
	
	this._c.save();
	
	this._c.translate(this._plotArea.left, this._plotArea.top);
	
	this._c.beginPath();
	
	// Clip the plot line to the plot area.
	this._c.rect(1, 1, this._plotArea.width - 1, this._plotArea.height -1);
	this._c.clip();
	
	this._c.lineCap = "round";
	
	this._c.lineWidth = this._plotLineWidth;
	this._c.strokeStyle = colour;
	
	var xRange = xMax - xMin;
	var yRange = yMax - yMin;

	// Calculate the location of the first point in the plot line.
	var px = ((data[0][xIndex] - xMin) / xRange) * this._plotArea.width;
	var py = this._plotArea.height - ((data[0][yIndex] - yMin) / yRange) * this._plotArea.height;
	
	this._c.beginPath();
	this._c.moveTo(px, py);
	
	for(var i = 1; i < data.length; i++){
		px = ((data[i][0] - xMin) / xRange) * this._plotArea.width;
		py = this._plotArea.height - ((data[i][yIndex] - yMin) / yRange) * this._plotArea.height;
		
		// Add the point to the plot line.
		this._c.lineTo(px, py);
	}
	
	this._c.stroke();
	
	this._c.restore();
}

/**
 * Removes all of the lines from the plot area.
 */
Graph.prototype.clearPlotArea = function(){
	this.clear();
	this.draw();
};

/**
 * Adds the plot as a key to the graph's legend. It should be possible to add keys seperately,
 * by adding to the background...
 */
Graph.prototype.addKeyToLegend = function(){

};

Graph.colours = {
	blue:        "#4A7EBB",
	green:       "#9BBB59",
	orange:      "#DA8137",
	purple:      "#7D60A0",
	red:         "#BE4B48",
	lightblue:   "#8EA5CB",
	lightgreen:  "#B5CA92",
	lightorange: "#F6B18A",
	lightpurple: "#A597B9",
	lightred:    "#CE8E8D",
	
	gold: "#F6B915",
	lightGold: "#f8d474"
};