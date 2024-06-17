/**
 * Recursively calculates the total strength of a nested data structure.
 * @param {Object} data - The nested data object.
 * @returns {number} The total strength of the data and its children.
 */
function recursive_total_strength(data) {
  if (!("children" in data)) { return data.strength; }
  else { return d3.sum(d3.map(data["children"], recursive_total_strength).keys()); }
}

/**
 * Flattens a nested JSON structure into a single-level array of objects.
 * @param {Object} data - The nested JSON object.
 * @returns {Array} An array of flattened objects with combined names, strengths, and lengths.
 */
function flatten_nested_json(data) {
  if (!("children" in data)) { return [data]; }

  var result = [];

  data.children.forEach(function (child) {
    var grandchildren = flatten_nested_json(child);

    grandchildren.forEach(function (grandchild) {
      result.push({
        "name": data.name + " " + grandchild.name,
        "strength": grandchild.strength,
        "length": grandchild.length
      });
    });
  });

  return result;
}

function getFillColor(input){
  if (typeof input === "number") {
    return input === 1 ? skipping_color : inclusion_color;
  } else if (typeof input === "object" && input !== null) {
    if (input.data && typeof input.data === "object") {
      if (input.data.name === "skip" || input.data.name.split("_")[0] === "skip") {
        return skipping_color;
      } else {
        return inclusion_color;
      }
    } else if (input.name) {
      if (input.name === "skip" || input.name.split("_")[0] === "skip") {
        return skipping_color;
      } else {
        return inclusion_color;
      }
    }
  } else if (typeof input === "string") {
    if (input === "skip" || input.split("_")[0] === "skip") {
      return skipping_color;
    } else {
      return inclusion_color;
    }
  }
  return inclusion_color; // Default color if input format is not recognized
};

function getHighlightColor(input){
  if (typeof input === "number") {
    return input === 1 ? skipping_highlight_color : inclusion_highlight_color;
  } else if (typeof input === "object" && input !== null) {
    if (input.data && typeof input.data === "object") {
      if (input.data.name === "skip" || input.data.name.split("_")[0] === "skip") {
        return skipping_highlight_color;
      } else {
        return inclusion_highlight_color;
      }
    } else if (input.name) {
      if (input.name === "skip" || input.name.split("_")[0] === "skip") {
        return skipping_highlight_color;
      } else {
        return inclusion_highlight_color;
      }
    }
  } else if (typeof input === "string") {
    if (input === "skip" || input.split("_")[0] === "skip") {
      return skipping_highlight_color;
    } else {
      return inclusion_highlight_color;
    }
  }
  return inclusion_highlight_color; // Default highlight color if input format is not recognized
};

function resetHighlight() {
  // Reset
  d3.select('div.feature-legend-container')
    .selectAll('rect.rectangle')
    .attr('fill', (d) => d.color);
  d3.select('div.feature-legend-container')
    .selectAll('.background')
    .style("fill", "none");
  d3.select('div.feature-legend-container')
    .selectAll('svg.feature-svg')
    .style("border", `2px solid ${lightOther}`)
    .style("box-shadow", "none");
  d3.select('div.feature-legend-container')
    .selectAll('svg.feature-long-svg')
    .style("border", `2px solid ${lightOther}`)
    .style("box-shadow", "none");
  d3.select('svg.feature-view-1')
    .selectAll(".bar").attr("fill", d => getFillColor(d));
  
  if (selectedBar !== null) {
    var color = null;
    var highlightColor = null;
    const className = d3.select(selectedBar).attr('class').split(' ')[1];
    d3.select('div.feature-legend-container')
      .select('rect.rectangle.' + className)
      .attr('fill', function(d) {
        color = d.color;
        highlightColor = d.highlight;
        return highlightColor;
    });
    d3.select('div.feature-legend-container')
      .selectAll('svg.feature-svg.' + className)
      .style("border", `2px solid ${highlightColor}`);
    d3.select('div.feature-legend-container')
      .selectAll('svg.feature-long-svg.' + className)
      .style("border", `2px solid ${highlightColor}`);
    d3.select(selectedBar).attr('fill', highlightColor);
    d3.select('svg.feature-view-2')
      .selectAll('.bar').attr('fill', color)
    if (selectedFeatureBar !== null) {
      const featureName = d3.select(selectedFeatureBar).attr('class').split(' ')[1];
      d3.select('div.feature-legend-container')
        .select('.background.' + featureName)
        .style("fill", color);
      d3.select(selectedFeatureBar).attr('fill', highlightColor);
    }
  }
}

let selected = null
let selectedClass = null
let previousClassColor = null

function featureSelection(featureName = null, className = null) {
  const gridContainer = document.querySelector('.feature-legend-container');
  const width = gridContainer.clientWidth;
  const height = gridContainer.clientHeight;
  const titleDiv = document.querySelector('.feature-legend-title'); // Select the title div
  const widthRatio = width / 491;
  const heightRatio = height / 381;
  titleDiv.style.fontSize = `${14*widthRatio}px`;

  const legendInfo = [
    { title: `Skipping`, name: 'skip', color: skipping_color, highlight: skipping_highlight_color }, 
    { title: `Inclusion`, name: 'incl', color: inclusion_color, highlight: inclusion_highlight_color }];

d3.select('.legend').selectAll("*").remove();
// Append SVG to the legend div
const svg = d3.select('.legend')
  .append('svg')

// Initialize legend
const legendItemSize = 20*widthRatio;
const legendSpacing = 4;
const xOffset = width - 400*widthRatio; // Adjust the x-offset to position the legend within visible range
const yOffset = 20;  // Start drawing from top with a small margin

const legend = svg.selectAll('.legendItem')
  .data(legendInfo)
  .enter()
  .append('g')
  .attr('class', 'legendItem')
  .attr('transform', (d, i) => {
    var x = xOffset;
    var y = yOffset + (legendItemSize + legendSpacing) * i;
    return `translate(${x}, ${y})`;
  });

// Create legend color squares
legend.append('rect')
  .attr('class', (d)=>'rectangle ' + d.name)
  .attr('width', legendItemSize)
  .attr('height', legendItemSize)
  .attr('fill', function(d) { 
    if (className !== null && className === d.name) { return d.highlight; } 
    else { return d.color; }
  })
  .on('mouseover', function(d) { 
    legend.selectAll('.rectangle').attr('fill', (d) => d.color);
    d3.select(this).attr('fill', (d) => d.highlight);
    d3.select('div.feature-legend-container')
      .selectAll('svg.feature-svg')
      .style("border", `2px solid ${lightOther}`)
      .style("box-shadow", "none");
    d3.select('div.feature-legend-container')
      .selectAll('svg.feature-long-svg')
      .style("border", `2px solid ${lightOther}`)
      .style("box-shadow", "none");
    d3.select('div.feature-legend-container')
      .selectAll('svg.feature-svg.' + d.name)
      .style("border", `2px solid ${d.highlight}`);
    d3.select('div.feature-legend-container')
      .selectAll('svg.feature-long-svg.' + d.name)
      .style("border", `2px solid ${d.highlight}`);
  })
  .on('mouseout', function(d) { resetHighlight() });


// Create legend labels
legend.append('text')
  .attr('x', legendItemSize + 5)
  .attr('y', legendItemSize / 2)
  .attr('dy', '0.35em')
  .style('font-size', `${20*widthRatio}px`)  // Adjust font size here
  .text(d => d.title);
  // Function to update SVGs with new data and highlight the selected feature
  const updateSVGs = (containerSelector, svgSelector, imagesArray, colors) => {
    const svgContainer = d3.select(containerSelector)
      .selectAll(svgSelector)
      .data(imagesArray, d => d.feature);

      const svgEnter = svgContainer.enter()
      .append("svg")
      .attr("class", d => `${svgSelector.slice(1)} ${d.feature} ${d.feature.split('_')[0]}`);

    svgEnter.append("rect").attr("class", (d) => "background " + d.feature );
    svgEnter.append("image");

    const svgMerged = svgEnter.merge(svgContainer);

    svgMerged.each(function (d) {
      const svg = d3.select(this);

      if (d.feature.split('_')[0] === className) {
        svg.style("border", `2px solid ${colors[1]}`);
      } else {
        svg.style("border", `2px solid ${lightOther}`).style("box-shadow", "none");
      }

      const background = svg.select(".background")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", "100%")
        .attr("height", "100%")
        .style("fill", "none");

      try {
        if (d.feature === featureName) {
          background.style("fill", colors[0])
        }
        else {
          background.style("fill", "none");
        }
      } catch (error) {
        background.style("fill", "none");
      }

      if (svgSelector === ".feature-long-svg") {
        svg.select("image")
          .attr("xlink:href", d.url)
          .attr("preserveAspectRatio", "none")
          .attr("width", "100%") // Use percentage width
          .attr("height", "100%"); // Use percentage height
      } else {
        svg.select("image")
          .attr("xlink:href", d.url)
          .attr("preserveAspectRatio", "none")
          .attr("width", "100%") // Use percentage width
          .attr("height", "100%"); // Use percentage height
      }

      svg.on("mouseover", (event, data) => {

          d3.select("svg.feature-view-2")
            .selectAll(".bar." + d.feature)
            .attr("fill", colors[1]);
       
        background.style("fill", colors[0]);
        // svg.select(this).style("border", `3px solid ${colors[1]}`);
      })
        .on("mouseleave", (event, data) => { resetHighlight(); })
        .on("click", (event, info) => {
          // previous = selected
          selected = d.feature
          // previousClass = selectedClass
          selectedClass = d.feature.split('_')[0]   
          const childrenData = d.feature.split("_")[0] === 'incl' ? Data.feature_activations.children[0] : Data.feature_activations.children[1]

          if (Data) {
            hierarchicalBarChart2(Data,childrenData)
            nucleotideFeatureView(Data, Data.feature_activations, d.feature);
          }  
          if(selectedClass === 'skip'){
            d3.select("svg.feature-view-1")
            .selectAll(`.bar-incl` )
            .attr("fill", inclusion_color);
            d3.select("svg.feature-view-1")
            .selectAll(`.bar-skip` )
            .attr("fill", skipping_highlight_color);
          }else if (selectedClass === 'incl'){
            d3.select("svg.feature-view-1")
            .selectAll(`.bar-skip` )
            .attr("fill", skipping_color);
            d3.select("svg.feature-view-1")
            .selectAll(`.bar-incl` )
            .attr("fill", inclusion_highlight_color);
          }
         
          d3.select("svg.feature-view-2")
            .selectAll('.bar')
            .attr('fill', colors[0]);
          d3.select("svg.feature-view-2")
            .select(".bar." + d.feature)
            .attr("fill", colors[1]);
          
          featureSelection(d.feature, d.feature.split("_")[0]);
          // this is causing to reset the feature legend 

          selectedBar = d3.select('svg.feature-view-1').select('.bar.' + selectedClass)._groups[0][0];
          selectedFeatureBar = d3.select('svg.feature-view-2').select('.bar.' + selected)._groups[0][0];
          resetHighlight();
        });
    });

    svgContainer.exit().remove();
  };

  // Update SVGs for inclusion images
  updateSVGs("div.svg-grid-inclusion", ".feature-svg", newImagesData.inclusion, [inclusion_color, inclusion_highlight_color]);

  // Update SVGs for skipping images
  updateSVGs("div.svg-grid-skipping", ".feature-svg", newImagesData.skipping, [skipping_color, skipping_highlight_color]);

  // Update SVGs for long skipping images
  updateSVGs("div.svg-grid-long-skipping", ".feature-long-svg", newImagesData.longSkipping, [skipping_color, skipping_highlight_color]);

}

function downloadSvg(svgElement, filename) {
  // Create a temporary SVG element
  const tempSvg = svgElement.cloneNode(true);
  document.body.appendChild(tempSvg);

  // Get the bounding box of the SVG element
  const bbox = svgElement.getBBox();
  tempSvg.setAttribute('width', bbox.width);
  tempSvg.setAttribute('height', bbox.height);
  tempSvg.setAttribute('viewBox', `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`);

  const svgString = new XMLSerializer().serializeToString(tempSvg);
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const DOMURL = window.URL || window.webkitURL || window;
  const url = DOMURL.createObjectURL(svgBlob);
  const image = new Image();

  image.onload = function () {
    const scaleFactor = 2; // Increase this value to improve resolution
    const canvas = document.createElement('canvas');
    canvas.width = bbox.width * scaleFactor;
    canvas.height = bbox.height * scaleFactor;
    const ctx = canvas.getContext('2d');

    // Fill the canvas with white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the image on the canvas
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    DOMURL.revokeObjectURL(url);
    const imgURI = canvas.toDataURL('image/png');
    triggerDownload(imgURI, filename);

    // Remove the temporary SVG element
    document.body.removeChild(tempSvg);
  };

  image.src = url;
}

function triggerDownload(imgURI, filename) {
  const a = document.createElement('a');
  a.href = imgURI;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}



function downloadSelectedSVGs() {
  const checkboxes = document.querySelectorAll('.svg-checkbox:checked');
  checkboxes.forEach((checkbox, index) => {
    setTimeout(() => {
      const svgElement = document.querySelector("svg." + checkbox.value);
      if (svgElement) {
        downloadSvg(svgElement, checkbox.value);
      }
    }, 500 * index);  // Delay each download by 500ms incrementally
  });
}


function resetGraph() {
  console.log('Graph has been reset to initial state.');
  nucleotideView(Data.sequence, Data.structs, Data.nucleotide_activations);
  hierarchicalBarChart(Data, Data.feature_activations);
  featureSelection(null, Data);
  d3.select("svg.feature-view-2").selectAll("*").remove();

  d3.select("svg.feature-view-3").selectAll("*").remove();


  selectedBar = null;
  selectedFeatureBar = null;
  resetHighlight();
}


async function fetchData(option) {
  try {
      const response = await fetch(`./get-data?option=${option}`);
      const data = await response.json();
      if (data.error) {
          console.error("Error fetching data:", data.error);
          // Optionally, inform the user visually
      } else {
          window.Data = data;
          // Render data
          featureSelection(null, data);
          nucleotideView(data.sequence, data.structs, data.nucleotide_activations);
          PSIview(data);
          hierarchicalBarChart(data, data.feature_activations);
          d3.select("svg.feature-view-2").selectAll("*").remove();
          d3.select("svg.feature-view-3").selectAll("*").remove();
      }
  } catch (error) {
      console.error("Failed to fetch or parse data:", error);
  }
}

function onGraphRendered(element ) {
  // Target the container where the graph is rendered
  const featureView2 = document.querySelector(element);
  const event = new CustomEvent('graphRendered', { detail: { view: featureView2 } });
  featureView2.dispatchEvent(event);

}