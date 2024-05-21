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

let selected = null

function featureSelection(featureName = null, className = null) {
  const gridContainer = document.querySelector('.feature-legend-container');
  const width = gridContainer.clientWidth;
  const height = gridContainer.clientHeight;
  const titleDiv = document.querySelector('.feature-legend-title'); // Select the title div
  const widthRatio = width / 491;
  const heightRatio = height / 381;
  console.log(widthRatio,heightRatio)
  
  titleDiv.style.fontSize = `${0.875*widthRatio}rem`;

  const legendInfo = [{ title: `Skipping`, color: skipping_color }, { title: `Inclusion`, color: inclusion_color }];

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
  .attr('width', legendItemSize)
  .attr('height', legendItemSize)
  .style('fill', d => d.color);

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
      .attr("class", svgSelector.slice(1));

    svgEnter.append("rect").attr("class", "background");
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
        else if (d.feature.split('_')[1] === featureName.split('_')[1] && featureName.split('_')[1] == 'struct') {
          background.style("fill", colors[0]);
        } else {
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
            .transition(300)
            .attr("fill", colors[1]);
       
        background.transition(300).style("fill", colors[0]);
        svg.select(this).style("border", `3px solid ${colors[1]}`);
      })
        .on("mouseout", (event, data) => {
          console.log(d.feature ,selected)
          if(d.feature !== selected){
              d3.select("svg.feature-view-2")
            .selectAll(".bar." + d.feature)
            .transition(300)
            .attr("fill", colors[0]);
          }
          
          if (d.feature !== featureName) {
            background.transition(300).style("fill", "none");
            svg.select(this).style("border", "none").style("box-shadow", "none");
          }
        })
        .on("click", (event, info) => {
          previous = selected
          selected = d.feature

          if(previous!== selected){
             d3.select("svg.feature-view-2")
              .selectAll(".bar." + d.feature)
              .transition(300)
              .attr("fill", colors[1]);
            d3.select("svg.feature-view-2")
              .selectAll(".bar." + previous)
              .transition(300)
              .attr("fill", colors[0]);
          }

          featureSelection(d.feature, d.feature.split("_")[0]);
          const childreData = d.feature.split("_")[0] === 'incl' ? Data.feature_activations.children[0] : Data.feature_activations.children[1] 
          // hierarchicalBarChart2(d.feature.split("_")[0],childreData)
          console.log(Data.feature_activations.children[0])
          if (Data) {
            nucleotideFeatureView(Data, Data.feature_activations, d.feature);
          }
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