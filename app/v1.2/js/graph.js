/**
 * @author 	Sam Christy <sam_christy@hotmail.co.uk>
 * @licence     GNU GPL v3.0 <http://www.gnu.org/licenses/gpl-3.0.html>
 * @copyright   Sam Christy 2012 | All rights reserved (c)
 */

/**
 * Creates a graph that can be configured with the settings object that you pass to it.
 */
function Graph(width, height, settings){
	// Load default settings into this graph's settings.
	for(var setting in Graph.defaultSettings)
		this["_" + setting] = Graph.defaultSettings[setting];
	
	// Don't worry, there are only two levels of recursion depth...
	// If the settings object is defined, overide the default settings.
	if(typeof settings !== "undefined")
		for(var option in settings){
			// If the property is an object, check if the object already exists. If the object does
			// exist, overwrite its properties with the identical properties from the 'settings'
			// object (specified by the user).
			if(Object.prototype.toString.call(settings[option]) === "[object Object]")
				for(var prop in settings[option])
					this["_" + option][prop] = settings[option][prop];
			else
				this["_" + option] = settings[option];
		}
		
	this._canvas = document.createElement("canvas");
	this._canvas.width = width;
	this._canvas.height = height;
	this._c = this._canvas.getContext("2d");
    
    this._autoScaleDPI(width, height);
}

/**
 * Creates an <img> element containing a copy of the graph in a PNG data URL format.
 */
Graph.prototype.toImg = function(){
	var png = this._canvas.toDataURL("image/png");
	var img = document.createElement("img");
	img.src = png;
	
	return img;
};

/**
 * Appends the graph to the specified DOM element.
 */
Graph.prototype.appendTo = function(element){
	element.appendChild(this._canvas);
}

/**
 * Returns a reference to the graph's <canvas>.
 */
Graph.prototype.getCanvas = function(){
	return this._canvas;
}

/**
 * Draws the graph, so that it's ready to have data plotted on it.
 */
Graph.prototype.draw = function(){
	this._c.save();
	
	this._c.fillStyle = this._backgroundColour;
	
	// Draw the graph's background.
	this._c.fillStyle = this._backgroundColour;
	this._c.fillRect(0, 0, this._canvas.width, this._canvas.height);
	
	// Determine if there are multiple axes.
	var xDualAxes = this._xAxis2 != null;
	var yDualAxes = this._yAxis2 != null;
	
	// If the auto-scaling option is enabled in the axis, scale its range and labels.
	if(this._xAxis1.auto)
		this._autoScaleAxis(this._xAxis1);
	if(this._yAxis1.auto)
		this._autoScaleAxis(this._yAxis1);
	if(this._xAxis2 && this._xAxis2.auto)
		this._autoScaleAxis(this.xAxis2);
	if(this._yAxis2 && this._yAxis2.auto)
		this._autoScaleAxis(this.yAxis2);
	
	// First we draw the axes' titles.
	this._c.fillStyle = this._textColour;
	this._c.font = this._titleFont;
	
	// Draw the primary x and y axes' titles.
	this._drawTitle(this._xAxis1.title, "bottom");
	this._drawTitle(this._yAxis1.title, "left");

	var titleHeight = Graph._estimateTextHeight(this._titleFont);
	
	// The plot area's values will become more accurate as the graph's various elements are drawn.
	this._plotArea.left   = this._titleOffset + titleHeight + Math.round(this._labelOffset / 2);
	this._plotArea.right  = this._labelOffset + titleHeight;   // Default right padding.
	this._plotArea.top    = this._labelOffset + titleHeight;   // Default top padding.
	this._plotArea.bottom = this._titleOffset + titleHeight + Math.round(this._labelOffset / 2);
	
	// Draw the second x axis' title, if it's defined.
	if(xDualAxes){
		this._drawTitle(this._xAxis2.title, "top");
		
		// Account for the title's padding and the title itself.
		this._plotArea.top = this._titleOffset + titleHeight + Math.round(this._labelOffset / 2);
	}
		
	// Draw the second y axis' title, if it's defined.
	if(yDualAxes){
		this._drawTitle(this._yAxis2.title, "right");
		
		// Account for the title's padding and the title itself.
		this._plotArea.right = this._titleOffset + titleHeight + Math.round(this._labelOffset / 2);
	}
	
	// The measurements of the labels are important for the layout of everything else.
	var x1LabelHeight = Graph._estimateTextHeight(this._labelFont);
	var x2LabelHeight = xDualAxes ? x1LabelHeight : 0;
	var y1LabelWidth = this._maxLabelWidth(this._yAxis1);
	var y2LabelWidth = yDualAxes ? this._maxLabelWidth(this._yAxis2) : 0;

	if(xDualAxes) // If we have a top axis, we need to account for its label and padding.
		this._plotArea.top += this._labelOffset + x2LabelHeight + this._tickLength;
		
	this._plotArea.bottom += this._labelOffset + x1LabelHeight + this._tickLength;
	
	this._plotArea.height = this._canvas.height - this._plotArea.top - this._plotArea.bottom;

	// Then we draw the axes' labels.
	this._c.font = this._labelFont;
	
	this._drawLabelsY(
		y1LabelWidth,
		this._yGridlineCount,
		this._yAxis1.min,
		this._yAxis1.max,
		this._yAxis1.precision,
		this._yAxis1.suffix,
		"left"
	);
	
	if(yDualAxes)  // If there is a right y axis, draw it.
		this._drawLabelsY(
			y2LabelWidth,
			this._yGridlineCount,
			this._yAxis2.min,
			this._yAxis2.max,
			this._yAxis2.precision,
			this._yAxis2.suffix,
			"right"
		);

	// Calculate the final position and dimensions of the plot area.
	this._plotArea.left += y1LabelWidth + this._labelOffset + this._tickLength;
	
	if(yDualAxes)
		this._plotArea.right += y2LabelWidth + this._labelOffset + this._tickLength;
	
	this._plotArea.width = this._canvas.width - this._plotArea.left - this._plotArea.right;
	
	delete this._plotArea.right;
	delete this._plotArea.bottom;
	
	// Avoids modifying three *more* functions...
	this._c.translate(this._plotArea.left, this._plotArea.top);
	
	this._drawLabelsX(
		this._xGridlineCount,
		this._xAxis1.min,
		this._xAxis1.max,
		this._xAxis1.precision,
		this._xAxis1.suffix,
		this._xAxis1.position
	);
	
	if(xDualAxes)  // If there is a top x axis, draw it.
		this._drawLabelsX(
			this._xGridlineCount,
			this._xAxis2.min,
			this._xAxis2.max,
			this._xAxis2.precision,
			this._xAxis2.suffix,
			this._xAxis2.position
		);
	
	// Finally, we draw the gridlines.
	this._c.fillStyle = this._gridlineColour;
	
	this._drawLinesX(this._xGridlineCount, this._xAxis1.min, this._xAxis1.max, xDualAxes);
	this._drawLinesY(this._yGridlineCount, this._yAxis1.min, this._yAxis1.max, yDualAxes);
	
	this._c.restore();
};

Graph.prototype.clear = function(){
	this._c.fillStyle = this._backgroundColour;
	this._c.fillRect(0, 0, this._canvas.width, this._canvas.height);
}

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

Graph.defaultSettings = {
	textColour: "#000",
	backgroundColour: "#FFF",
	
	titleOffset: 10,
	titleFont: "bold 14pt sans-serif",
	
	tickLength: 5,
	gridlineWidth: 1,
	gridlineColour: "#777",
		
	xGridlineCount: 10,
	yGridlineCount: 10,
	
	labelOffset: 10,
	labelFont: "11pt sans-serif",
    
    plotLineWidth: 3.5,

    autoScale: true,
	
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
	gold:        "#F6B915",
	lightGold:   "#f8d474"
};

/**
 * Draws the gridlines for the x axis. Ticks will be drawn for both axes, if there are two.
 */
Graph.prototype._drawLinesX = function(numberOfLines, min, max, dualAxes){
    // FIXME: There are some situations where varying gridlines or ranges will cause 0 to be missed.
    // (This is not a problem for graphs that have no negative values.)
    // It will be a good idea to add an option for drawing gridlines on 0 in a different colour...
	var range = max - min;
	var res = this._plotArea.width / range;
	var lineLength = this._plotArea.height + this._tickLength + 1;
	var py = 0;
	
	// If there are two axes, draw ticks on each.
	if(dualAxes){
		lineLength += this._tickLength;
		py -= this._tickLength
	}	
	
	for(var i = 0; i <= numberOfLines; i++){
		var px = Math.round(i / numberOfLines * range * res);
		
		// Using fillRect to avoid the anti-aliasing of lines...
		this._c.fillRect(px, py, this._gridlineWidth, lineLength);
	}
}

/**
 * Draws the gridlines for the y axis. Ticks will be drawn for both axes, if there are two.
 */
Graph.prototype._drawLinesY = function(numberOfLines, min, max, dualAxes){
	var range = max - min;
	var res = this._plotArea.height / range;
	var lineLength = this._plotArea.width + this._tickLength + 1;
	
	// If there are two axes, draw ticks on each.
	if(dualAxes) lineLength += this._tickLength;
	
	for(var i = 0; i <= numberOfLines; i++){
		var py = Math.round(i / numberOfLines * range * res);
		
		// Using fillRect to avoid the anti-aliasing of lines...
		this._c.fillRect(-this._tickLength, py, lineLength, this._gridlineWidth);
	}
}

/**
 * Draws the labels for the either the top or bottom x axis.
 */
Graph.prototype._drawLabelsX = function(numberOfLabels, min, max, precision, suffix, position){
	var range = max - min;
	var res   = this._plotArea.width / range;
	var py;
	
	if(typeof precision === "undefined") precision = 0;
	if(typeof suffix    === "undefined") suffix = "";
	
	this._c.save();
	this._c.textAlign = "center";
	
	switch(position){
		case "top":
			py = - this._tickLength - Math.round(this._labelOffset / 3);
			this._c.textBaseline = "bottom";
			break;
		default:
			py = this._plotArea.height + this._tickLength + Math.round(this._labelOffset / 3);
			this._c.textBaseline = "top";
	}
	
	for(var i = 0; i <= numberOfLabels; i++){
		var x  = i / numberOfLabels * range + min;
		var px = Math.round(i / numberOfLabels * range * res);
		
		this._c.fillText(x.toFixed(precision) + suffix, px, py);
	}
	
	this._c.restore();
};

/**
 * Draws the labels for either the left or right y axis.
 */
Graph.prototype._drawLabelsY = function(maxLabelWidth, numberOfLabels, min, max, precision, suffix, position){
	var range = max - min;
	var px;
	
	if(typeof padding   === "undefined") padding = 0;
	if(typeof precision === "undefined") precision = 0;
	if(typeof suffix    === "undefined") suffix = "";
	
	this._c.save();
	this._c.textBaseline = "middle";
	
	switch(position){
		case "right":
			px = this._canvas.width - this._plotArea.right
				- Math.round(this._labelOffset / 2)
				- maxLabelWidth;
			this._c.textAlign = "left";
			break;
		default:  // left
			px = this._plotArea.left 
			+ Math.round(this._labelOffset / 2)
			+ maxLabelWidth;
			this._c.textAlign = "right";
	}

	for(var i = 0; i <= numberOfLabels; i++){
		var y  = i / numberOfLabels * range + min;
		var py = this._plotArea.top + 
			Math.round((numberOfLabels - i) / numberOfLabels * this._plotArea.height);
		
		var label = y.toFixed(precision) + suffix;
		this._c.fillText(label, px, py);
	}
	
	this._c.restore();
};

/**
 * Draws the title for the axis at the specified position.
 */
Graph.prototype._drawTitle = function(text, position){
	this._c.save();
	
	var px;
	var py;
	
	this._c.textAlign = "center";
	
    // TODO Consider evening out the title offsets, to make them look neater.
	switch(position){
		case "top":
			px = Math.round(this._canvas.width / 2);
			py = this._titleOffset;
			
			this._c.translate(px, py);
			this._c.textBaseline = "top";
			break;
		case "bottom":
			px = Math.round(this._canvas.width / 2);
			py = this._canvas.height - this._titleOffset;
			
			this._c.translate(px, py);
			this._c.textBaseline = "bottom";
			break;
		case "left":
			px = this._titleOffset;
			py = Math.round(this._canvas.height / 2);
			
			this._c.textBaseline = "top";
			this._c.translate(px, py);
			this._c.rotate(deg2Rad(-90));  // Turn text 90 degrees anti-clockwise.
			break;
		case "right":
			px = this._canvas.width - this._titleOffset;
			py = Math.round(this._canvas.height / 2);
			
			this._c.textBaseline = "top";
			this._c.translate(px, py);
			this._c.rotate(deg2Rad(90));  // Turn text 90 degrees clockwise.
			break;
	}
	
	this._c.fillText(text, 0, 0);
	
	this._c.restore();
}

/**
 * Scales the plot area to the native resolution of high-DPI devices, so that
 * the graph does not appear blurry. This function also scales the graph's text
 * and lines, in proportion with the client's pixel density.
 * 
 * @param {int} width
 * @param {int} height
 * @returns {float}
 */
Graph.prototype._autoScaleDPI = function(width, height) {
    // Explanation: http://www.html5rocks.com/en/tutorials/canvas/hidpi/
    var devicePixelRatio = window.devicePixelRatio || 1;
    var backingStoreRatio = this._c.webkitBackingStorePixelRatio
        || this._c.mozBackingStorePixelRatio || this._c.msBackingStorePixelRatio
        || this._c.oBackingStorePixelRatio || this._c.backingStorePixelRatio || 1;
    var ratio = devicePixelRatio / backingStoreRatio;
    
    if (this._autoScale && devicePixelRatio !== backingStoreRatio) {
        // Scale up to the device's native resolution.
        this._canvas.width *= ratio;
        this._canvas.height *= ratio;
        
        // Use CSS to scale back down to the device's logical resolution.
        this._canvas.style.width = width + 'px';
        this._canvas.style.height = height + 'px';
        
        // Scale up the width of the lines.
        this._gridlineWidth *= ratio;
        this._plotLineWidth *= ratio;
        this._tickLength *= ratio;
        
        // Scale up the size of the text (slightly hacky!)
        var numberRegex = /\d+\.?\d*/;
        var titleFontSize = parseFloat(this._titleFont.match(numberRegex)[0]);
        var labelFontSize = parseFloat(this._labelFont.match(numberRegex)[0]);
        
        this._titleFont = this._titleFont.replace(numberRegex, titleFontSize * ratio);
        this._labelFont = this._labelFont.replace(numberRegex, labelFontSize * ratio);
    }
    
    return ratio;
}

/**
 * Finds good values for the axis...
 */
Graph.prototype._autoScaleAxis = function(axis){
	axis.min = Graph._roundAxisDown(axis.min);
	axis.max = Graph._roundAxisUp(axis.max);
	
	var range = axis.max - axis.min;
	
	axis.precision = Graph._determinePrecision(range, this._xGridlineCount/*, axis.precision*/);
}

/**
 * Estimates the width of the axis' longest label.
 */
Graph.prototype._maxLabelWidth = function(axis){
	var longestLabel = axis.max.toFixed(axis.precision) + axis.suffix;
	var width = this._c.measureText(longestLabel).width;
	
	return width;
}

// Below are static helper functions, which are not intended to be used externally.

// Another interesting use for the below function would be for advising maximum label counts.
// E.g. if the height of the labels is > the height of the axis / the number of labels, there
// simply isn't enough room!

/**
 * Estimates the height of a portion of text rendered in a specific font style, by measuring the
 * width of a lowercase 'm'. Yes this is hacky, but it's good enough for Mozilla!
 * 
 * @param {string} font A string describing the text's style.
 * @return {int} The estimated height (CSS pixels).
 */
Graph._estimateTextHeight = function(font){
	var canvas = document.createElement("canvas");
	var c = canvas.getContext("2d");
	
	c.font = font;
	
	return c.measureText("e").width * 2;
}

/**
 * Used for finding a good maximum value for an axis.
 */
Graph._roundAxisUp = function(n){
	if(n === 0) return 0;
	
	var magn = Math.pow(10, Math.floor(Math.log(n) / Math.LN10));
	
	return Math.ceil(n / magn) * magn;
}

/**
 * Used for finding a good minimum value for an axis.
 */
Graph._roundAxisDown = function(n){
	if(n === 0) return 0;
	
	var magn = Math.pow(10, Math.floor(Math.log(n) / Math.LN10));
	
	return Math.floor(n / magn) * magn;
}

/**
 * Works out how many digits after the decimal point are needed to display a number.
 * e.g. 1/8 or 0.125 will need 3.
 */
Graph._determinePrecision = function(n, x, max){
	if(typeof max === "undefined") max = 15;  // Max precision of 64 bit floating point.
	
	for(var i = 0; i < max; i++){
		var mag = Math.pow(10, i);
		
		if((n * mag) % x === 0)
			return i;
	}
	
	return max;
}

// Maths helper functions
// degrees / π * 180
// radians * π / 180

/**
 * Converts degress to radians.
 * @param {float} degrees The angle in degrees.
 * @return {float} The angle in radians.
 */
function deg2Rad(degrees){
	return degrees * 0.017453292519943295;
}

/**
 * Converts radians to degress.
 * @param {float} radians The angle in radians.
 * @return {float} The angle in degrees.
 */
function rad2Deg(radians){
	return radians / 0.017453292519943295;
}

/**
 * Finds the next multiple of factor, from n.
 * e.g. nextMultiple(267, 50) => 300
 * @param {float} n
 * @param {int} factor
 * @return {int}
 * @todo Use this function - why did I write it?
 */
function nextMultiple(n, factor){
	if(n % factor !== 0){
        return n - n % factor + factor;
	}
	
	return n;
}
