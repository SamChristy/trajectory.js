/**
 * @author Sam Christy <sam_christy@hotmail.co.uk>
 */

// TODO add an intelligent layout rendering engine.

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
			if(Object.prototype.toString.call(settings[option]) === "[object Object]"){
				// if(typeof this["_" + option] === "undefined")
				//	continue;
				for(var prop in settings[option])
					this["_" + option][prop] = settings[option][prop];
			}
			else
				this["_" + option] = settings[option];
		}
		
	this._canvas = document.createElement("canvas");
	this._canvas.width = width;
	this._canvas.height = height;
	this._c = this._canvas.getContext("2d");

	// Make the top, left-hand corner of the graph (0, 0);
	this._c.translate(this._plotArea.left, this._plotArea.top);
	
	// Flipping the y axis causes the text to be drawn back-to-front, so it has been removed.
	// this._c.scale(1, -1);
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

// XXX Draw the titles with their padding (from the edges of the graph), then draw the labels, then draw the plot area with the space that's left!

/**
 * Draws the graph, so that it's ready to have data plotted on it.
 */
Graph.prototype.draw = function(){
	this._c.save();
	
	this._c.fillStyle = this._backgroundColour;
	
	// Clear the graph.
	this._c.fillRect(
		-this._plotArea.left,
		-this._plotArea.top - this._plotArea.height,
		this._plotArea.width,
		this._plotArea.height
	);
	
	// Determine if there are multiple axes.
	var xDualAxes = this._xAxis2 != null;
	var yDualAxes = this._yAxis2 != null;
	
	
	// First we draw the axes' titles.
	this._c.fillStyle = this._textColour;
	this._c.font = this._titleFont;
	
	// Draw the primary x and y axes.
	this._drawTitle(this._xAxis1.title, this._xAxis1.position);
	this._drawTitle(this._yAxis1.title, this._yAxis1.position);
	
	// Draw the second x axis, if it's defined.
	if(xDualAxes)
		this._drawTitle(this._xAxis2.title, this._xAxis2.position);
	
	// Draw the second y axis, if it's defined.
	if(yDualAxes)
		this._drawTitle(this._yAxis2.title, this._yAxis2.position);
	
	// Then we draw the axes' labels.
	this._c.font = this._labelFont;
	
	// TODO Make the _drawLabelsX function return the the height of the tallest label.
	this._drawLabelsX(
		this._xGridlineCount,
		this._xAxis1.min,
		this._xAxis1.max,
		this._xAxis1.precision,
		this._xAxis1.suffix,
		this._xAxis1.position
	);
	
	this._drawLabelsY(
		this._yGridlineCount,
		this._yAxis1.min,
		this._yAxis1.max,
		this._yAxis1.precision,
		this._yAxis1.suffix,
		this._yAxis1.position
	);
	
	if(xDualAxes)  // If there are two x axes, draw the second.
	this._drawLabelsX(
		this._xGridlineCount,
		this._xAxis2.min,
		this._xAxis2.max,
		this._xAxis2.precision,
		this._xAxis2.suffix,
		this._xAxis2.position
	);
	
	// TODO Make the _drawLabelsY function return the width of the widest label.
	// 		It's probably only necessary to take the width of the labels near the middle.
	// 		use: ctx.measureText(text).width
	
	if(yDualAxes)  // If there are two y axes, draw the second.
		this._drawLabelsY(
			this._yGridlineCount,
			this._yAxis2.min,
			this._yAxis2.max,
			this._yAxis2.precision,
			this._yAxis2.suffix,
			this._yAxis2.position
		);
	
	// Finally, we draw the gridlines.
	this._c.fillStyle = this._gridlineColour;
	
	this._drawLinesX(this._xGridlineCount, this._xAxis1.min, this._xAxis1.max, xDualAxes);
	this._drawLinesY(this._yGridlineCount, this._yAxis1.min, this._yAxis1.max, yDualAxes);
	
	this._c.restore();
};

Graph.prototype.clear = function(){
	this._c.fillStyle = this._backgroundColour;
	this._c.fillRect(-this._plotArea.left, -this._plotArea.top, this._canvas.width, this._canvas.height);
}

// 'Private' methods - because JavaScript sucks...

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
			py = -this._labelOffset;
			this._c.textBaseline = "bottom";
			break;
		default:
			py = this._labelOffset + this._plotArea.height;
			this._c.textBaseline = "top";
	}
	
	for(var i = 0; i <= numberOfLabels; i++){
		var x  = i / numberOfLabels * range + min;
		var px = Math.round(i / numberOfLabels * range * res);
		
		// Using fillRect to avoid the anti-aliasing of lines...
		this._c.fillText(x.toFixed(precision) + suffix, px, py);
	}
	
	this._c.restore();
};

/**
 * Draws the labels for either the left or right y axis.
 */
Graph.prototype._drawLabelsY = function(numberOfLabels, min, max, precision, suffix, position){
	var range = max - min;
	var px;
	
	if(typeof precision === "undefined") precision = 0;
	if(typeof suffix    === "undefined") suffix = "";
	
	this._c.save();
	this._c.textBaseline = "middle";
	
	// Account for the slightly wierd text-alignment engine of the <canvas>...
	var labelOffset = Math.round(this._labelOffset * 1.33);
	
	switch(position){
		case "right":
			px = this._plotArea.width + labelOffset;
			this._c.textAlign = "left";
			break;
		default:  // left
			px = -labelOffset;
			this._c.textAlign = "right";
	}

	for(var i = 0; i <= numberOfLabels; i++){
		var y  = i / numberOfLabels * range + min;
		var py = Math.round((numberOfLabels - i) / numberOfLabels * this._plotArea.height);
		
		// Using fillRect to avoid the anti-aliasing of lines...
		this._c.fillText(y.toFixed(precision) + suffix, px, py);
	}
	
	this._c.restore();
};

// TODO Make this function return the height of the title.
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
			px = Math.round(this._plotArea.width / 2);
			py = -this._titleOffset;
			
			this._c.translate(px, py);
			this._c.textBaseline = "bottom";
			break;
		case "bottom":
			px = Math.round(this._plotArea.width / 2);
			py = this._plotArea.height + this._titleOffset;
			
			this._c.translate(px, py);
			this._c.textBaseline = "top";
			break;
		case "left":
			px = Math.round(-this._titleOffset * 1.35);
			py = Math.round(this._plotArea.height / 2);
			
			this._c.textBaseline = "bottom";
			this._c.translate(px, py);
			this._c.rotate(-90 * deg);  // Turn text 90 degrees anti-clockwise.
			break;
		case "right":
			px = Math.round(this._plotArea.width + this._titleOffset * 1.35);
			py = Math.round(this._plotArea.height / 2);
			
			this._c.textBaseline = "bottom";
			this._c.translate(px, py);
			this._c.rotate(90 * deg);  // Turn text 90 degrees clockwise.
			break;
	}
	
	this._c.fillText(text, 0, 0);
	
	this._c.restore();
}

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
function estimateTextHeight(font){
	var canvas = document.createElement("canvas");
	var c = canvas.getContext("2d");
	
	c.font = font;
	
	return c.measureText("m").width;
}
