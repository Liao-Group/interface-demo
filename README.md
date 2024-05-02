# Interface Demo

This repository is being used for hosting a demo version of the interactive visualization being developed in the interpreteble-splicing-visualization repo. 

The demo version only contains the interface being rendered using HTML, CSS and Javascript. The interactive graphs are created using the D3 javascript library.


## Refactoring 
#### 29-04-2024: 
- Starting to breakdown the main.js file into main.js, utils.js and events.js. 
    - utils.js will contain functions that support other graph rendering functions.
    - events.js will contain any  

## Styling Notes: 
- We are using `rem` for specifiying the dimensions dynamicly as the size of the screen changes
#### Todo:
- Rename some functions to proper javascript naming conventions. 
- properly remove other functions from main.js file.    
- We will use `function` for any large function that creates a graph or is utils/support function, while we will use `const` for inner functions.  