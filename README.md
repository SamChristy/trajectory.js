Trajectory.js
=============

### Demo
A demonstration of the program is available on my [Dropbox account](http://dl.dropbox.com/u/42030209/rough/arrow/demo.html). A modern browser that implements the HTML5 `<canvas>` element is, obviously, required – I personally recommend [Google Chrome](https://www.google.com/chrome). 

### Explanation
This program is designed to compute the trajectories of projectiles and generate graphs inside your browser! I created it as a weekend project to help me cheat at archery. It actually functions as a practical tool and I've found that it matches both the real-world data and the results of my 40# English longbow on the range quite well. It is also suitable for modelling other sub-sonic projectiles, such as tennis balls and air rifle pellets, providing that you know its drag coefficient (e.g. 0.5 for a sphere).

### Instructions
To use the program, simply enter the projectile's parameters and click 'Plot Trajectory'. To generate a copy of your graph that can be saved, click ‘Generate PNG’. After the image pops up, you can save it by right-clicking it and selecting ‘Save As…’ (the exact phrase varies with different web browsers).

I’ve put the default values to those of a 3/8” steel ball-bearing, shot at an angle of 5 degrees with an initial velocity of 80 metres/second, as an example. The blue line represents the trajectory with air resistance; the red line the trajectory without air resistance, i.e. in a vacuum; and the purple line the projectile’s kinetic energy, expressed as a percentage of its initial (this might be useful for hunters).

Graph Class
-----------
I actually wrote my own graph-drawing class for this project, mainly as a learning exercise to familiarise myself with the `<canvas>` element and its API. Unfortunately, I feel that the API still has a way to go. It lacks features that I would consider *basic*, such as the ability to measure the height of text (`measureText()` only reports the width) – which makes writing an adaptive layout engine slightly tricky!

#### How it Works
I may give a more detailed explanation, when I can find the time. But until then, the code in `/js/demo.js` should, hopefully, be clear enough to see how it works.

##### Basic Usage
*****************
###### Instantiate a new Graph Object
    var settings = {
        xAxis1: {  // Bottom axis
    		min: 0,
            max: 5,
            title: "Distance (metres)",
            auto: false
        },
        
        yAxis1: {  // Left axis
            min: 0,
            max: 25,
            title: "Height (metres)",
            auto: false
        },

        // To hide an axis, set its value to null.
        xAxis2: null,
        yAxis2: null
    }
    
    var g = new Graph(settings, width, height);
    
    // Draw the Graph, so that it is ready for plotting.
    g.draw();

###### Plot Data
    // Plotting an asymptotic curve as an example.
    var data = [
        [0, 0],
        [1, 1],
        [2, 4],
        [3, 9],
        [4, 16],
        [5, 25]
    ];
    
    // Plot the curve, using a nice green colour.
    g.plot(data, Graph.colours.green);
    
    // Finally, inset the Graph into the document, so that the user can see it.
    g.appendTo(document.body);

### Licence
All of the code (except for jQuery of course, which I've used in `demo.js`) is available under [GNU GPL v3.0](http://www.gnu.org/licenses/gpl-3.0.html) so feel free to use and modify it as you wish!
    