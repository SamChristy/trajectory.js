Trajectory.js
=============

### Demo
A demonstration of the program is available on my [Dropbox account](http://dl.dropbox.com/u/42030209/rough/arrow/demo.html). A modern browser that implements the HTML5 `<canvas>` element is, obviously, required - I personally recommend [Google Chrome](https://www.google.com/chrome). 

### Explanation
This program is designed to compute the trajectories of projectiles and generate graphs inside your browser! I created it as a weekend project to help me cheat at archery. It actually functions as a practical tool and I've found that it matches both the real-world data and the results of my 40# English longbow on the range quite well. 

### Graph Class
I actually wrote my own graph-drawing class for this project, mainly as a learning excerise to familiarise myself with the <canvas> element and its API. Unfortunately, I feel that the API still has a way. It lacks features that I would consider *basic*, such as the ability to measure the height of text (`measureText()` only reports the width) and function for drawing dashed lines (non-trivial for anything but straight lines).