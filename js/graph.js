/**
 * @author 		Sam Christy <sam_christy@hotmail.co.uk>
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
}

// Public methods

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

// 'Private' methods - because JavaScript sucks...

// FIXME There are some situations where varying gridlines or ranges will cause 0 to missed. It will be a good idea to add an option for drawing gridlines on 0 in a different colour...

/**
 * Draws the gridlines for the x axis. Ticks will be drawn for both axes, if there are two.
 */
Graph.prototype._drawLinesX = function(numberOfLines, min, max, dualAxes){
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
	//return c.measureText("m").width;
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