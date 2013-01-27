/**
 * @author 	Sam Christy <sam_christy@hotmail.co.uk>
 * @licence     GNU GPL v3.0 <http://www.gnu.org/licenses/gpl-3.0.html>
 * @copyright   Sam Christy 2012 | All rights reserved (c)
 */
importScripts('trajectory.js')

onmessage = function(e) {
    var input = e.data;
    var returnData = {};
    
    // Calculate the drag constant that will be used to compute the arrow's trajectory.
	returnData.k = dragConstant(input.mass, input.diameter, input.dragCoef, input.density);
    
	// Compute the trajectory using the input parameters.
	returnData.trajectoryInVacuum = vacTrajectory(input.gravity, input.velocity, input.angle, 
        input.height);
    
	// Calculate the real trajectory's duration, distance and max height.
	returnData.bounds = trajectoryBounds(input.gravity, input.velocity, input.angle, input.height, 
        0, returnData.k);
    
    // Compute the real trajectory, using the precomputed flight duration.
    returnData.trajectory = trajectory(input.gravity, input.velocity, input.angle, input.mass, 
        input.height, returnData.k, returnData.bounds.duration);
    
    postMessage(returnData);
}