/**
 * Collection of functions for computing the trajectories of subsonic projectiles.
 *
 * @author      Sam Christy <sam_christy@hotmail.co.uk>
 * @licence     GNU GPL v3.0 <http://www.gnu.org/licenses/gpl-3.0.html>
 * @copyright   Sam Christy 2012 | All rights reserved (c)
 */

/**
 * Calculates the drag constant for an projectile that is used to compute its trajectory with
 * trajectory().
 * 
 * @param {float} mass      The projectile's mass (g).
 * @param {float} diameter  The projectile's diameter (mm).
 * @param {float} dragCoef  The projectile's drag coefficient.
 * @param {float} [density] The density of the medium, e.g. air, (kg/m³).
 * @return {float}
 */
function dragConstant(mass, diameter, dragCoef, density){
	if(!density) density =  1.29;
	return Math.PI / 8 * 0.001 * density * (diameter * diameter) * dragCoef / mass;
}

/**
 * Calculates the maximum height reached during the trajectory of an projectile, as well as its final
 * distance and duration. This function is used to get an even distribution of plots across a 
 * trajectory when using trajectory.
 * 
 * @param {float} g         Gravitational acceleration.
 * @param {float} velocity
 * @param {float} angle
 * @param {float} [height]
 * @param {float} [bottom]
 * @param {float} [k]
 * @param {float} [dt]
 * @return {object}
 */
function trajectoryBounds(g, velocity, angle, height, bottom, k, dt){
	// Default arguments...
	if(typeof height === "undefined") height = 0;
	if(typeof bottom === "undefined") bottom = 0;
	if(!k) k = 0.0037;
	if(!dt) dt = 0.001;
	
	var bounds = {
		distance: null,
		height: null,
		duration: null
	};

	var vx = velocity * Math.cos(angle);   // Initial horizontal velocity.
	var vy = velocity * Math.sin(angle);   // Initial vertical velocity.
	var distance = 0;                      // Distance travelled by the projectile.
	var dtdt = dt * dt;                    // The time interval squared.
	
	var dx;	  // The horizontal distance covered each time interval, dt.
	var dy;	  // The vertical distance covered each time interval, dt.
	var a;	  // Vector deceleration.
	var ax;   // Horizontal deceleration due to air resistance.
	var ay;	  // Vertical deceleration due to air resistance and gravity.
	
	// We stop when the projectile lands, i.e. its height < bottom.
	for(var t = 0; height >= bottom; t += dt){
		// Compute drag from initial velocity.
		a = -k * velocity * velocity;
		
		// Compute the X and Y vector components of drag and velocity.
		ax = a * Math.cos(angle);
		ay = a * Math.sin(angle);
		
		// Compute the change in X and Y position.
		dx = vx * dt + 0.5 * ax * dtdt; 
		dy = vy * dt + 0.5 * (ay - g) * dtdt;
		
		// Move the projectile.
		distance += dx;
		height += dy;
		
		// Compute new vector velocity.
		velocity = Math.sqrt(Math.pow(dx / dt, 2) + Math.pow(dy / dt, 2));
		
		// Compute new X and Y velocities.
		vx += ax * dt;
		vy += (ay - g) * dt;
		
		// Compute new flight angle.
		angle = Math.atan2(dy, dx);
		
		if(dy <= 0 && bounds.height === null)  // We've reached our max height, let's record it.
			bounds.height = height;
	}
	
	// Record the final distance and duration.
	bounds.distance = distance;
	bounds.duration = t;
	
	return bounds;
}

/**
 * Computes the trajectory of an projectile with air resistance.
 * 
 * @param {float} g           Gravitational acceleration.
 * @param {float} velocity    The projectile's initial horizontal velocity (metres / second).
 * @param {float} angle       The projectile's initial angle (radians).
 * @param {float} mass        The mass of the projectile.
 * @param {float} [height]    The projectile's initial height (metres).
 * @param {float} [k]         The drag equation constant for the projectile.
 * @param {float} [duration]  The duration of the flight to compute.
 * @param {int}   [dt]        The time interval for calculations (seconds).
 * @param {int}   [plotCount]
 * @return {array}
 */
function trajectory(g, velocity, angle, mass, height, k, duration, dt, plotCount){
	// Default arguments...
	if(typeof height === "undefined") height = 0;
	if(!k) k = 0.0037;
	if(!duration) duration = 2;
	if(!dt) dt = 0.001;
	if(!plotCount) plotCount = 100;
	
	var data = new Array(plotCount);       // We'll store the plots here.
	var vx = velocity * Math.cos(angle);   // Initial horizontal velocity.
	var vy = velocity * Math.sin(angle);   // Initial vertical velocity.
	var distance = 0;                      // Distance travelled by the projectile.
	var dtdt = dt * dt;                    // The time interval squared.
	
	var dx;	  // The horizontal distance covered each time interval, dt.
	var dy;	  // The vertical distance covered each time interval, dt.
	var a;	  // Vector deceleration.
	var ax;   // Horizontal deceleration due to air resistance.
	var ay;	  // Vertical deceleration due to air resistance and gravity.
	
	var initialKineticEnergy = (0.0005 * mass * velocity * velocity)
	data[0] = [distance, height, 100];
	
	for(var t = 0, plot = 1; plot < plotCount; t += dt){
		// Compute drag from initial velocity.
		a = -k * velocity * velocity;
		
		// Compute the X and Y vector components of drag and velocity.
		ax = a * Math.cos(angle);
		ay = a * Math.sin(angle);
		
		// Compute the change in X and Y position.
		dx = vx * dt + 0.5 * ax * dtdt; 
		dy = vy * dt + 0.5 * (ay - g) * dtdt;
		
		// Move the projectile.
		distance += dx;
		height += dy;
		
		// Compute new vector velocity.
		velocity = Math.sqrt(Math.pow(dx / dt, 2) + Math.pow(dy / dt, 2));
		
		// Compute new X and Y velocities.
		vx += ax * dt;
		vy += (ay - g) * dt;
		
		// Compute new flight angle.
		angle = Math.atan2(dy, dx);
        
        // Calculate the kinetic energy as a percentage of its initial value.
        var retainedKineticEnergy = (0.0005 * mass * velocity * velocity) * 100 / initialKineticEnergy;
		
		if(Math.floor(t / duration * plotCount) > plot){
			data[plot] = [distance, height, retainedKineticEnergy];
			plot++;
		}
	}
    
	return data;
}

/**
 * Calculates the distance reached by a projectile in a vacuum.
 * 
 * @param {float} g        Gravitational acceleration.
 * @param {float} angle    The launch angle in radians.
 * @param {float} velocity The velocity of the projectile.
 * @param {float} height   The initial height of the projectile (archer's chin  for an arrow).
 * @return {float}
 */
function vacFlightDistance(g, angle, velocity, height){
	var vSinAngle = Math.sin(angle) * velocity;
	
	return (velocity * Math.cos(angle) / g) * (vSinAngle + Math.sqrt(vSinAngle * vSinAngle + 2 * g * height));
}

/**
 * Calculates the maximum height reached by a projectile, in a vacuum.
 * 
 * @param {float} g        Gravitational acceleration.
 * @param {float} angle    The initial angle (radians).
 * @param {float} velocity 
 * @param {float} height   The projectile's initial height.
 * @return {float}
 */
function vacFlightHeight(g, angle, velocity, height){
	var sinAngle = Math.sin(angle);
	
	return (velocity * velocity * sinAngle * sinAngle) / (2 * g) + height;
}

/**
 * Calculates the flight duration of a proctile, in a vacuum.
 * 
 * @param {float} g        Gravitational acceleration.
 * @param {float} angle    The initial angle in radians.
 * @param {float} velocity
 * @param {float} height   The projectile's initial height.
 * @return {float}
 */
function vacFlightDuration(g, angle, velocity, height){
	var vSinAngle = Math.sin(angle) * velocity;
	
	return (vSinAngle + Math.sqrt(vSinAngle * vSinAngle + 2 * g * height)) / g;
}

/**
 * Calculates the (parabolic) trajectory of a projectile in a vacuum.
 * 
 * @param {float} g           Gravitational acceleration.
 * @param {float} velocity    The projectile's initial velocity (metres/second).
 * @param {float} angle       The projectile's initial angle (radians).
 * @param {float} [height]    The projectile's initial height (metres).
 * @param {float} [bottom]    The value on the y axis at which to stop the trajectory.
 * @param {int}   [plotCount] The number of plots in the trajectory. 
 */
function vacTrajectory(g, velocity, angle, height, bottom, plotCount){
	if(typeof height === "undefined") height = 0;
	if(typeof bottom === "undefined") bottom = 0;
	if(typeof plotCount === "undefined") plotCount = 100;
	
	var data = new Array(plotCount);
	var duration = vacFlightDuration(g, angle, velocity, height - bottom);
	
	plotCount--;
	
	for(var plot = 0; plot <= plotCount; plot++){
		var time = plot / plotCount * duration;
		
		data[plot] = [
			velocity * time * Math.cos(angle),
			velocity * time * Math.sin(angle) - g / 2 * (time * time) + height
		];
	}
	
	return data;
}