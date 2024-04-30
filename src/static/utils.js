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


function featureSelection(featureName = null) {
  // Function to update SVGs with new data and highlight the selected feature
  const updateSVGs = (containerSelector, svgSelector, imagesArray, colors) => {
    const svgContainer = d3.select(containerSelector).selectAll(svgSelector)
      .data(imagesArray);

    svgContainer.each(function (d) {
      const svg = d3.select(this);
      svg.selectAll("*").remove();

      if (d.feature === featureName) {
        svg.style("border", `3px solid ${colors[1]}`);
      } else {
        svg.style("border", "none").style("box-shadow", "none");
      }

      svg.append("image")
        .attr("xlink:href", d.url)
        .attr("width", "100px")
        .attr("height", "50px")
        .attr("preserveAspectRatio", "xMidYMid meet")
        .on("mouseover", (event, data) => {
          d3.select("svg.feature-view-2")
            .selectAll(".bar." + d.feature)
            .transition(300)
            .style("fill", colors[1])
          svg.style("border", `3px solid ${colors[1]}`);
        })
        .on("mouseout", (event, data) => {
          d3.select("svg.feature-view-2")
            .selectAll(".bar." + d.feature)
            .transition(300)
            .style("fill", colors[0])
          svg.style("border", "none").style("box-shadow", "none");
        })
        .on("click", (event, info) => {
          console.log("clicked",d.feature)
          svg.style("border", `3px solid ${colors[1]}`);
          featureSelection(d.feature)
          if(Data){
            nucleotide_feature_view(Data, Data.feature_activations, d.feature);
          }
        });


    })
  };
  // Define the image arrays, each with a unique feature identifier
  const imagesData = {
    inclusion: [
      { url: "static/images/incl_1.png", feature: "incl_1" },
      { url: "static/images/incl_2.png", feature: "incl_2" },
      { url: "static/images/incl_3.png", feature: "incl_3" },
      { url: "static/images/incl_4.png", feature: "incl_4" },
      { url: "static/images/incl_5.png", feature: "incl_5" },
      { url: "static/images/incl_6.png", feature: "incl_6" }
    ],
    skipping: [
      { url: "static/images/skip_2.png", feature: "skip_2" },
      { url: "static/images/skip_3.png", feature: "skip_3" },
      { url: "static/images/skip_4.png", feature: "skip_4" },
      { url: "static/images/skip_5.png", feature: "skip_5" },
      { url: "static/images/skip_6.png", feature: "skip_6" }
    ],
    longSkipping: [
      { url: "static/images/g_poor.png", feature: "g_poor" },
      { url: "static/images/skip_struct.png", feature: "struct" }
    ]
  };
  // Update SVGs for inclusion images
  updateSVGs("div.svg-grid-inclusion", "svg.feature-svg", imagesData.inclusion, [inclusion_color,inclusion_highlight_color]);

  // Update SVGs for skipping images
  updateSVGs("div.svg-grid-skipping", "svg.feature-svg", imagesData.skipping, [skipping_color,skipping_highlight_color]);

  // Update SVGs for long skipping images
  const svgContainer3 = d3.select("div.svg-grid-long-skipping").selectAll("svg.feature-long-svg")
    .data(imagesData.longSkipping);

  svgContainer3.each(function (d) {
    const svg = d3.select(this);
    svg.selectAll("*").remove();

    svg.append("image")
      .attr("xlink:href", d.url)
      .attr("width", "400px")
      .attr("height", "60px")
      .attr("preserveAspectRatio", "xMidYMid meet");

    if (featureName) {
      const name = featureName.split("_")[1] || "";
      if (d.feature === name) {
        svg.style("border", `3px solid ${skipping_highlight_color}`);
      } else {
        svg.style("border", "none").style("box-shadow", "none");
      }
    } else {
      svg.style("border", "none").style("box-shadow", "none");
    }
  });
};