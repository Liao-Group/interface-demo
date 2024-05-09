# Interface Demo

This repository is being used for hosting a demo version of the interactive visualization being developed in the interpreteble-splicing-visualization repo. 

The demo version only contains the interface being rendered using HTML, CSS and Javascript. The interactive graphs are created using the D3 javascript library.

## Code: 
- main.js: 
    - Contain the main entry point to the interface and the functions for rendering each graph. 
- utils.js: 
    - Contain auxialiary functions to be used in the main.js.
    - These are functions that are not directly related to rendering graphs.
- events.js: 
    - Contain code related to listening and responding to events coming fromt he users interactions with the interface. 
- contansts.js: 
    - holds contants used throughout the other files. Mostly related to 

## Styling Notes: 
- We are using `rem` for specifiying the dimensions dynamicly as the size of the screen changes
