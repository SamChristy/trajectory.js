/**
 * @author 		Sam Christy <sam_christy@hotmail.co.uk>
 * @licence     GNU GPL v3.0 <http://www.gnu.org/licenses/gpl-3.0.html>
 * @copyright   Sam Christy 2012 | All rights reserved (c)
 */

/**
 * Turns the given array into a <table>.
 * @param {array} a The array.
 * @param {object} The <table>.
 */
function toTable(a){
	var table = document.createElement("table");
	var thead = document.createElement("thead");
	var tbody = document.createElement("tbody");
	
	// Process headers.
	var row = document.createElement("tr");
	
	// For each header.
	for(var h = 0; h < a[0].length; h++){
		var header = document.createElement("th");
		var content = document.createTextNode(a[0][h]);
		header.appendChild(content);
		row.appendChild(header);
	}
	
	thead.appendChild(row);
	
	// For each row.
	for(var r = 1; r < a.length; r++){
		var row = document.createElement("tr");
		
		// For each of the row's cells.
		for(var c = 0; c < a[r].length; c++){
			var cell = document.createElement("td");
			var content = document.createTextNode(a[r][c]);
			cell.appendChild(content);
			row.appendChild(cell);
		}
		
		tbody.appendChild(row);
	}
	
	table.appendChild(thead);
	table.appendChild(tbody);
	
	return table;
}
