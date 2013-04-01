/**
 * @author 	Sam Christy <sam_christy@hotmail.co.uk>
 * @licence     GNU GPL v3.0 <http://www.gnu.org/licenses/gpl-3.0.html>
 * @copyright   Sam Christy 2012 | All rights reserved (c)
 */

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
 */
function nextMultiple(n, factor){
	if(n % factor !== 0){
		return n - n % factor + factor;
	}
	
	return n;
}