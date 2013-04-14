Trajectory.js
=============

### Live Demo
- [Version 1.2](http://samchristy.github.com/trajectory.js/app/v1.2/) (optimised for tablets)
- [Version 1.1](http://samchristy.github.com/trajectory.js/app/v1.1/)
- [Version 1.0](http://samchristy.github.com/trajectory.js/app/v1.0/) (single-threaded, for IE9 users)

#### Supported Browsers
The following browsers are supported (according to [caniuse.com](http://caniuse.com/)):
- Chrome (4+)
- Safari (5+)
- Opera (10.6+)
- Firefox (3.5+)
- Internet Explorer (10+)

### Explanation
This program is designed to compute the trajectories of projectiles and generate graphs inside your 
browser! I created it as a weekend project to help me cheat at archery. It actually functions as a 
practical tool and I’ve found that it matches both the real-world data and the results of my 40# 
English longbow on the range quite well. It is also suitable for modelling other sub-sonic 
projectiles, such as tennis balls and air rifle pellets, providing that you know its drag 
coefficient (e.g. 0.5 for a sphere).

### Instructions
To use the program, simply enter the projectile’s parameters and click ‘Plot Trajectory’. To 
generate a copy of your graph that can be saved, click ‘Generate PNG’. After the image pops up, 
you can save it by right-clicking it and selecting ‘Save As…’ (the exact phrase varies with 
different web browsers).

I’ve put the default values to those of a 3/8" steel ball-bearing, shot at an angle of 5 degrees 
with an initial velocity of 85 metres/second, as an example. The blue line represents the trajectory 
with air resistance; the red line the trajectory without air resistance, i.e. in a vacuum; and the 
purple line the projectile’s kinetic energy, expressed as a percentage of its initial (this might be
 useful for hunters).

Graph Class
-----------
I actually wrote my own graph-drawing class for this project, mainly as a learning exercise to 
familiarise myself with the `<canvas>` element and its API. Unfortunately, I feel that the API still
 has a way to go. It lacks features that I would consider *basic*, such as the ability to measure 
the height of text (`measureText()` only reports the width) – which makes writing an adaptive layout
 engine slightly tricky!

#### How it Works
I may give a more detailed explanation, when I can find the time. But until then, the code in 
`/js/main.js` should, hopefully, be clear enough to see how it works.

##### Basic Usage
*****************
###### Instantiate a new Graph Object
```javascript
// Don’t forget to include graph.js

// Overide the default settings, to customise the Graph.
var settings = {
    xAxis1: {  // Bottom axis
        min: 0,
        max: 10,
        title: "n",
    },

    yAxis1: {  // Left axis
        min: 0,
        max: 100,
        title: "n\u00B2",
    },

    // To hide an axis, set its value to null.
    xAxis2: null,
    yAxis2: null
};

var width = 500;
var height = 300;

var g = new Graph(width, height, settings);

// Draw the Graph, so that it is ready for plotting.
g.draw();
```

###### Plot Data
```javascript
// Plotting an asymptotic curve as an example.
var data = [
    [0, 0],
    [1, 1],
    [2, 4],
    [3, 9],
    [4, 16],
    [5, 25],
    [6, 36],
    [7, 49],
    [8, 64],
    [9, 81],
    [10, 100]
];

// Plot the curve, using a nice green colour.
g.plotData(data, Graph.colours.green);

// Finally, inset the Graph into the document, so that the user can see it.
g.appendTo(document.body);
```

### Licence
All of the code is available under [GNU GPL v3.0](http://www.gnu.org/licenses/gpl-3.0.html) so feel 
free to use and modify it as you wish!

© 2013 Sam Christy