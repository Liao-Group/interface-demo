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

// Define the image arrays, each with a unique feature identifier
const imagesData = {
  inclusion: [
    { url: "static/regular/incl_1.png", feature: "incl_1" },
    { url: "static/regular/incl_2.png", feature: "incl_2" },
    { url: "static/regular/incl_3.png", feature: "incl_3" },
    { url: "static/regular/incl_4.png", feature: "incl_4" },
    { url: "static/regular/incl_5.png", feature: "incl_5" },
    { url: "static/regular/incl_6.png", feature: "incl_6" },
    { url: "static/regular/incl_7.png", feature: "incl_7" },
  ],
  skipping: [
    { url: "static/regular/skip_1.png", feature: "skip_1" },
    { url: "static/regular/skip_2.png", feature: "skip_2" },
    { url: "static/regular/skip_3.png", feature: "skip_3" },
    { url: "static/regular/skip_4.png", feature: "skip_4" },
    { url: "static/regular/skip_5.png", feature: "skip_5" },
    { url: "static/regular/skip_6.png", feature: "skip_6" },
  ],
  longSkipping: [
    { url: "static/regular/g_poor.png", feature: "skip_g_poor" },
    { url: "static/regular/skip_struct.png", feature: "skip_struct" }
  ]
};

function featureSelection(featureName = null, className = null) {
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
        svg.style("border", "none").style("box-shadow", "none");
      }

      const background = svg.select(".background")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", "100%")
        .attr("height", "100%")
        .style("fill", "none");

      // console.log(featureName)


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
        console.log(error)
        background.style("fill", "none");
      }

      // if (d.feature === featureName) {
      //   background.style("fill", colors[0]);
      // } else {
      //   background.style("fill", "none");
      // }
      if (svgSelector === ".feature-long-svg") {
        svg.select("image")
          .attr("xlink:href", d.url)
          .attr("preserveAspectRatio", "none")
          // .attr("viewBox", "0 0 400 50") // Adjust viewBox to match the aspect ratio of the image
          .attr("width", "100%") // Use percentage width
          .attr("height", "100%"); // Use percentage height
      } else {
        svg.select("image")
          .attr("xlink:href", d.url)
          .attr("preserveAspectRatio", "none")
          // .attr("viewBox", "0 0 100 50") // Adjust viewBox to match the aspect ratio of the image
          .attr("width", "100%") // Use percentage width
          .attr("height", "100%"); // Use percentage height
      }

      svg.on("mouseover", (event, data) => {
        d3.select("svg.feature-view-2")
          .selectAll(".bar." + d.feature)
          .transition(300)
          .style("fill", colors[1]);

        background.transition(300).style("fill", colors[0]);
        svg.select(this).style("border", `3px solid ${colors[1]}`);
      })
        .on("mouseout", (event, data) => {
          d3.select("svg.feature-view-2")
            .selectAll(".bar." + d.feature)
            .transition(300)
            .style("fill", colors[0]);

          if (d.feature !== featureName) {
            background.transition(300).style("fill", "none");
            svg.select(this).style("border", "none").style("box-shadow", "none");
          }
        })
        .on("click", (event, info) => {
          console.log("clicked", d.feature);
          featureSelection(d.feature, className);
          if (Data) {
            nucleotideFeatureView(Data, Data.feature_activations, d.feature);
          }
        });
    });

    svgContainer.exit().remove();
  };
  // Update SVGs for inclusion images
  updateSVGs("div.svg-grid-inclusion", ".feature-svg", imagesData.inclusion, [inclusion_color, inclusion_highlight_color]);

  // Update SVGs for skipping images
  updateSVGs("div.svg-grid-skipping", ".feature-svg", imagesData.skipping, [skipping_color, skipping_highlight_color]);

  // Update SVGs for long skipping images
  updateSVGs("div.svg-grid-long-skipping", ".feature-long-svg", imagesData.longSkipping, [skipping_color, skipping_highlight_color]);
}