var Graph = function(){

}

Graph.prototype.draw = function(settings){
	this.drawLinesX();
	this.drawLinesY();
	this.drawLabelsX();
	this.drawLabelsY();
	this.drawTitleX();
	this.drawTitleY();
}

Graph.prototype.clear = function(){}

Graph.prototype.reDraw = function(settings){
	this.clear();
	this.draw(settings);
}

var yAxis = {
	min: -10,
	max: 30,
	unitsPerLine: 5,
	linesPerLabel: 1,
	label: "Height (metres)"
};

var range = (yAxis.max - yAxis.min);
var numberOfLines = range / yAxis.unitsPerLine;

for(var i = 0; i <= numberOfLines; i++)
{
	var line = yAxis.min + i / numberOfLines * range;
	
	if(numberOfLines > range)
		line = line.toFixed(2);
	if(i % yAxis.linesPerLabel === 0)
		line = "major: " + line;
	else
		line = "  minor: " + line;
	
	console.log(line);
}

function mag(n){
	return Math.pow(10, Math.floor(Math.log(n) / Math.LN10));
}

function next(n){
	// from Math.ceil(x/mag(x))*mag(x);
	var magn = mag(n)/10;
	return Math.ceil(n / magn) * magn;
}
function next5(n){
	// from Math.ceil(x/mag(x))*mag(x);
	var magn = Math.pow(5, Math.floor(Math.log(n) / Math.log(5)));
	return Math.ceil(n / magn) * magn;
}
