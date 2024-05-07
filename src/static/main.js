// background colors
// maybe add this color value consts to another color.js separate file.
const background_color = "whitesmoke"; // "#e4e4e4";
const lightOther = "#d4d4d4"
const darkBackground = "#999999"
const background_model_color = "#e4f2e3"
const line_color = "#6b6b6b";
const strength_difference_color = "#dad7cd";
const nucleotide_color = "black";

// bar colors
var inclusion_color = "";
var inclusion_highlight_color = "";
var skipping_color = "";
var skipping_highlight_color = "";
// org colors
const org_inclusion_color = "#c5d6fb";
const org_inclusion_highlight_color = "#669aff";
const org_skipping_color = "#f6c3c2";
const org_skipping_highlight_color = "#ff6666";
//alternative colors
const ltr_inclusion_color = "#B2DAEF";
const ltr_skipping_color = "#F9C4D2";
const ltr_inclusion_highlight_color = "#3BBAE2";
const ltr_skipping_highlight_color = "#F16A92";

// featureSelected variable 
var featureSelected = ""
/* 
This variable represents the data coming formt he json file.
 I made it a mutable global variable so i can set it to data on d3.json()
 and then use it again in the feature selection function without having to pass 
 other values as we call that function. 
*/
var Data = []
var use_new_grouping = false;
window.addEventListener('resize', function () {

  PSIview(Data); // Redraw the graph with the same data
});

window.addEventListener('resize',function(){
  hierarchicalBarChart(Data, Data.feature_activations)
  nucleotideView(Data.sequence, Data.structs, Data.nucleotide_activations)
  console.log("resized")
});

d3.json("./get-data", function (data) {
  // setting the value for this Data variable that is acting as 
  Data = data
  nucleotideView(data.sequence, data.structs, data.nucleotide_activations);
  PSIview(data);
  hierarchicalBarChart(data, data.feature_activations);
  use_new_grouping = data.use_new_grouping == 1;
  console.log(use_new_grouping);
  featureSelection(featureName = null, data = data, use_new_grouping = use_new_grouping);
})



/**
 * PSI view function
 * currently working with the reisizing, I will probaly have to figure it out how to have a better ratio and 
 * also adjust the ratio of the words and the other 
 */
function PSIview(data) {
  // detal_force and predicted_psi values are coming from the actual json file. 
  const deltaForce = data.delta_force;
  const predictedPSI = data.predicted_psi;
  const plotPSI = false; // CHOICE: whether to plot deltaForce or predictedPSI

  d3.select("svg.psi-view").selectAll("*").remove();;
  const svgContainer = d3.select(".psi-view"); // Ensure you have a container with this class
  const width = svgContainer.node().clientWidth;
  const height = svgContainer.node().clientHeight;
  const heightRatio = height/370;
  const widthRatio = width/193;

  const svg = d3.select("svg.psi-view")
    .attr("width", width)
    .attr("height", height);
  const margin = { top: 40, right: 60, bottom: 30, left: 50 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  /* Change y range to a fix range */
  // const lowerBound = -(Math.abs(deltaForce) + 5);
  // const upperBound = Math.abs(deltaForce) + 5;
  const lowerBound = -120;
  const upperBound = 120;

  const yScale = d3.scaleLinear().domain([lowerBound, upperBound]).range([chartHeight, 0]);
  var yAxis = d3.axisLeft(yScale).ticks(5);
  if(plotPSI){
    // Conversion from predicted psi to delta force
    const deltaForceConversion = [-18.76, -7.77, 0.00, 7.82, 23.07];
    yAxis = d3.axisLeft(yScale).ticks(5)
      .tickFormat(function(d, i) { return deltaForceConversion[i]; });
  }
  console.log(yScale(deltaForce))

  // Conversion from predicted psi to delta force
  const predictePSIConversion = [0.000001, 0.000006, 0.000038, 0.000243, 0.004538, 0.071174, 0.499993, 0.892360, 0.971595, 0.982911, 0.985533, 0.987334, 0.988231];
  var yScale2 = d3.scaleLinear().domain([-0.1, 1.1]).range([chartHeight, 0]);
  var yAxis2 = d3.axisRight(yScale2).ticks(13)
    .tickFormat(function(d, i) { 
      if(predictePSIConversion[i] < 0.1) { return d3.format(".0e")(predictePSIConversion[i]); }
      else { return d3.format(".3")(predictePSIConversion[i]); }
    });
  if(plotPSI){
    yScale2 = d3.scaleLinear().domain([0, 1]).range([chartHeight, 0]);
    yAxis2 = d3.axisRight(yScale2).ticks(6);
  }

  svg.attr('width', width).attr('height', height);

  const chartGroup = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

  chartGroup.append('g').call(yAxis);
  svg.append('text')
    .attr('x', (width / 2))
    .attr('y', margin.top / 2)
    .attr('text-anchor', 'middle')
    .style('font-size', `${14*widthRatio}px`)
    .text('Difference-to-Prediction');

  chartGroup.append('g')
    .attr('transform', `translate(${chartWidth + 5}, 0)`)
    .call(yAxis2);

  const tooltip1 = chartGroup.append('text')
    .attr('x', chartWidth / 2)
    .attr('y', height - margin.bottom - 20)
    .attr('text-anchor', 'middle')
    .attr('font-size', `${12*heightRatio}px`)
    .attr('font-weight', 'bold')
    .attr('fill', 'black')
    .style('opacity', 0)
    .text('Δ Strength: ' + deltaForce.toFixed(2));;

  const tooltip2 = chartGroup.append('text')
    .attr('x', chartWidth / 2)
    .attr('y', height - margin.bottom - 20)
    .attr('text-anchor', 'middle')
    .attr('font-size', `${12*heightRatio}px`)
    .attr('font-weight', 'bold')
    .attr('fill', 'black')
    .style('opacity', 0)
    .text('Predicted PSI: ' + predictedPSI.toFixed(2));

  chartGroup.append('text')
    .attr('transform', `translate(${chartWidth + 60}, ${chartHeight/2}) rotate(-90)`)
    .attr("font-size", `${12*heightRatio}px`)
    .attr('dy', '-0.75em')
    .style('text-anchor', 'middle')
    .text('Predicted PSI')
    .on("mouseover", function (event, d) {
      tooltip2.transition()
        .duration(200)
        .style("opacity", .9);
    })
    .on("mouseout", function (event, d) {
      tooltip2.transition()
        .duration(200)
        .style("opacity", 0);
    });

  chartGroup.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -chartHeight / 2)
    .attr('y', -margin.left - 3)
    .attr("font-size", `${12*heightRatio}px`)
    .attr('dy', '2.25em')
    .style('text-anchor', 'middle')
    .text('Δ Strength (a.u)')
    .on("mouseover", function (event, d) {
      tooltip1.transition()
        .duration(200)
        .style("opacity", .9);
    })
    .on("mouseout", function (event, d) {
      tooltip1.transition()
        .duration(200)
        .style("opacity", 0);
    });

  chartGroup.append("line")
    .attr("x1", 0)
    .attr("x2", chartWidth + 5)
    .attr("y1", yScale(0))
    .attr("y2", yScale(0))
    .attr("stroke", "black")
    .attr("stroke-width", 1);

  const barColor = deltaForce < 0 ? skipping_color : inclusion_color;
  // Plot by deltaForce
  var barPosition = yScale(Math.max(0, deltaForce));
  var barHeight = Math.abs(yScale(deltaForce) - yScale(0));
  if(plotPSI){
    // Plot by predicted PSI
    barPosition = yScale2(Math.max(0.5, predictedPSI));
    barHeight = Math.abs((yScale2(predictedPSI) - yScale2(0.5)));
  }

  const bar = chartGroup.append('rect')
    .attr('x', 8)
    .attr('y', yScale(0))
    .attr('width', chartWidth - 10)
    .attr('height', 0)
    .attr('fill', barColor)
    .attr("stroke", "#000")
    .attr("stroke-width", 1)
    .on("click", function (event, d) {
      featureSelection(use_new_grouping = use_new_grouping, use_new_grouping = use_new_grouping)
      nucleotideView(data.sequence, data.structs, data.nucleotide_activations);
    });

  bar.transition()
    .duration(1000)
    .attr('y', Math.min(yScale(0), barPosition))
    .attr('height', barHeight);
};

/**
 * Feature view 1 
 */
function hierarchicalBarChart(parent, data) {
  console.log("here")
  d3.select("svg.feature-view-1").selectAll("*").remove();;
  const svgContainer = d3.select(".feature-view-1"); // Ensure you have a container with this class
  const width = svgContainer.node().clientWidth;
  const height = svgContainer.node().clientHeight;

  //  these values for the height and the width might change depending on the 
  // on the browerser. even on the same broweser it may change depending on the 
  //size of the screen they may open on depending on the desktop size. 

  const heightRatio = height/370;
  const widthRatio = width/193;

  const margin = { top: 40, right: 20, bottom: 30, left: 50};
  const svg = d3.select("svg.feature-view-1")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  
  const legendInfo = [{ title: `Skipping`, color: skipping_color }, { title: `Inclusion`, color: inclusion_color }];

  const getFillColor = (node) => {
    if (typeof node === "number") {
      return node === 1 ? skipping_color : inclusion_color;
    } else if (node) {
      return node.data.name === "skip" ? skipping_color : inclusion_color;
    } else {
      return inclusion_color; // Default color if node is neither a number nor an object
    }
  };

  const getHighlightColor = (node) => {
    return node === 1 ? skipping_highlight_color : inclusion_highlight_color;
  };

  const root = d3.hierarchy(data).sum(d => d.strength);

  const xScale = d3.scaleBand()
    .domain(root.children ? root.children.map(d => d.data.name) : [])
    .range([0, chartWidth])
    .padding(0.2);

  /* Change y range to a fix range */
  const yScale = d3.scaleLinear()
    // .domain([0, root.value])
    .domain([0, 180])
    .range([chartHeight, 0]);

  // Axes
  const xAxis = d3.axisBottom(xScale).tickFormat("").tickSize(0);
  const yAxis = d3.axisLeft(yScale);

  svg.append("text")
    .attr("x", (chartWidth / 2) - 10)
    .attr("y", - margin.top / 2)
    .attr("text-anchor", "middle")
    .style('font-size', `${14*widthRatio}px`)
    // .text('Inclusion and Skipping');
    .text('Class Strengths');


  svg.append("text")
    .attr("class", "x-axis-label")
    .attr("text-anchor", "middle")
    .attr("x", chartWidth / 2)
    .attr("y", chartHeight + 15)
    .style('font-size', `${12*widthRatio}px`)
    .text("Classes");

  svg.append("text")
    .attr("class", "y-axis-label")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("x", -chartHeight / 2)
    .attr("y", -31)
    .attr("font-size", `${12*heightRatio}px`)
    .text("Strength (a.u)");

  // Append the axes to the SVG
  svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${chartHeight})`)
    .call(xAxis);

  svg.append("g")
    .attr("class", "y-axis")
    .call(yAxis);

  // Create bars
  svg.selectAll(".bar")
    .data(root.children ? root.children : [])
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", d => xScale(d.data.name))
    .attr("y", d => yScale(d.value))
    .attr("width", xScale.bandwidth())
    .attr("height", d => chartHeight - yScale(d.value))
    .attr("fill", d => getFillColor(d))
    .attr("stroke", "#000")
    .attr("stroke-width", 1)
    .on("click", (event, d) => {
      // console.log(data.children[d])
      if (data.children[d].children) {
        var className = data.children[d].name;
        hierarchicalBarChart2(parent, data.children[d])
        const svgElement = d3.select("svg.feature-view-3");
        svgElement.selectAll("*").remove();
        featureSelection(featureName=null, className=className, use_new_grouping = use_new_grouping)
        nucleotideView(parent.sequence, parent.structs, parent.nucleotide_activations, className);
      }
    })

    .on("mouseover", function (event, d) {
      d3.select(this).transition()
        .duration(100)
        .attr("fill", getHighlightColor(d));
    })
    .on("mouseout", function (event, d) {
      d3.select(this).transition()
        .duration(100)
        .attr("fill", getFillColor(d));
    });

  // Initialize legend
  var legendItemSize = 12*widthRatio;
  var legendSpacing = 4;
  var xOffset = (chartWidth - 70)*widthRatio; // Adjust the x-offset to position the legend
  var yOffset = margin.top* heightRatio;

  var legend = svg
    .selectAll('.legendItem')
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
  legend
    .append('rect')
    .attr('width', legendItemSize)
    .attr('height', legendItemSize)
    .style('fill', d => d.color);

  // Create legend labels
  legend
    .append('text')
    .attr('x', legendItemSize + 5)
    .attr('y', legendItemSize / 2)
    .attr('dy', '0.35em')
    .style('font-size', `${12*widthRatio}px`)
    .text(d => d.title);
};

/**
 * hierarchicalBarChart2
 */
const hierarchicalBarChart2 = (parent, data) => {
  const margin = { top: 40, right: 20, bottom: 30, left: 40 };
  const width = parseFloat(d3.select("svg.feature-view-2").style("width")) - margin.left - margin.right;
  const height = parseFloat(d3.select("svg.feature-view-2").style("height")) - margin.top - margin.bottom;

  const getFillColor = (data) => {
    // Custom logic for color
    if (data.name === 'incl') {
      return inclusion_color;
    } else {
      return skipping_color;
    }
  };

  const getHighlightColor = (data) => {

    // Custom logic for color
    if (data.name === 'incl') {
      return inclusion_highlight_color;
    } else {
      return skipping_highlight_color;
    }
  };

  const color = getFillColor(data);
  const highlightColor = getHighlightColor(data);

  const svgElement = d3.select("svg.feature-view-2");
  svgElement.selectAll("*").remove(); // Clear SVG before redrawing

  const svg = svgElement
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Compute the hierarchical data
  const root = d3.hierarchy(data).sum(d => d.strength);

  // Sort children by strength in descending order and keep only the top 10
  const topChildren = root.children
    .sort((a, b) => b.value - a.value)
  // .slice(0, 8);

  // Use the topChildren for xScale domain
  const xScale = d3.scaleBand()
    .domain(topChildren.map(d => d.data.name))
    .range([0, width])
    .padding(0.2);

  /* Change y range to a fix range */
  const yScale = d3.scaleLinear()
    // .domain([0, d3.max(topChildren, d => d.value)]) // Update to use the max of topChildren
    .domain([0, 70])
    .range([height, 0]);

  // Axes
  const xAxis = d3.axisBottom(xScale).tickSize(0).tickFormat("");
  const yAxis = d3.axisLeft(yScale).ticks(5); // Adjust tick count if necessary

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", - margin.top / 2)
    .attr("text-anchor", "middle")
    .style('font-size', '14px')
    .text((data.name == "incl" ? "Inclusion" : "Skipping") + ' Features');

  svg.append("text")
    .attr("class", "x-axis-label")
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 15)
    .text("Features");

  svg.append("text")
    .attr("class", "y-axis-label")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -25)
    .text("Strength (a.u)");

  // Append the axes to the SVG
  svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(xAxis)
    .selectAll("text") // select all the text elements for the x-axis
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-30)");

  // Your existing Y-axis code
  svg.append("g")
    .attr("class", "y-axis")
    .call(yAxis);

  const tooltip = svg.append("text")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("font-size", "12px")
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle");

  featureSelection(featureName = null, data = parent, use_new_grouping = use_new_grouping)
  // Create bars for topChildren
  svg.selectAll(".bar")
    .data(topChildren)
    .enter().append("rect")
    .attr("class", function (d) { return "bar " + d.data.name; })
    .attr("x", d => xScale(d.data.name))
    .attr("y", d => yScale(d.value))
    .attr("width", xScale.bandwidth())
    .attr("height", d => height - yScale(d.value))
    .attr("fill", d => color)
    .attr("stroke", "#000") // Set the color of the outline
    .attr("stroke-width", 1)
    .on("click", (event, d) => {
      if (topChildren[d].children) {
        // svg.select(this).style("fill",highlightColor);
        featureSelected = topChildren[d].data.name
        console.log(featureSelected)
        var className = topChildren[d].data.name.split('_')[0]
        featureSelection(topChildren[d].data.name, className= className, use_new_grouping = use_new_grouping)
        hierarchicalBarChart3(topChildren[d], topChildren[d].data.name);
        if (topChildren[d].data.name.slice(-4) != "bias") {
          nucleotideFeatureView(parent, parent.feature_activations, topChildren[d].data.name);
        }
      }
    })
    // Highlight bar on mouseover
    .on("mouseover", function (event, d) {
      var className = topChildren[d].data.name.split('_')[0]
      featureSelection(topChildren[d].data.name,className= className, use_new_grouping = use_new_grouping)
      d3.select(this).transition()
        .duration(100)
        .attr("fill", highlightColor);

    })
    .on("mouseleave", function (event, d) {
      var className = topChildren[d].data.name.split('_')[0]
      featureSelection(featureSelected,className= className, use_new_grouping = use_new_grouping)
      d3.select(this).transition()
        .duration(100)
        .attr("fill", color);
      featureSelected = ''

    });

};

/**
 * hierarchicalBarChart3
 */
function hierarchicalBarChart3(data, parentName){

  const margin = { top: 40, right: 20, bottom: 30, left: 40 };
  const width = parseFloat(d3.select("svg.feature-view-3").style("width")) - margin.left - margin.right;
  const height = parseFloat(d3.select("svg.feature-view-3").style("height")) - margin.top - margin.bottom;

  const getFillColor = (name) => {

    if (String(name).split("_")[0] === 'incl') {
      return inclusion_color;
    } else {
      return skipping_color;
    }
  };

  const getHighlightColor = (name) => {
    // Custom logic for color
    if (String(name).split("_")[0] === 'incl') {
      return inclusion_highlight_color;
    } else {
      return skipping_highlight_color;
    }
  };

  const color = getFillColor(parentName);
  const highlightColor = getHighlightColor(parentName);

  const svgElement = d3.select("svg.feature-view-3");
  svgElement.selectAll("*").remove(); // Clear SVG before redrawing

  const svg = svgElement
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const children = data.children || [];

  // Sort children by value in descending order and keep only the top 10
  const topChildren = children
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const xScale = d3.scaleBand()
    .domain(topChildren.map(d => d.data.name))
    .range([0, width])
    .padding(0.2);

  /* Change y range to a fix range */
  const yScale = d3.scaleLinear()
    // .domain([0, d3.max(topChildren, d => d.value)])
    .domain([0, 20])
    .range([height, 0]);

  // Axes
  const xAxis = d3.axisBottom(xScale).tickSize(0).tickFormat("");
  const yAxis = d3.axisLeft(yScale).ticks(5);

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", - margin.top / 2)
    .attr("text-anchor", "middle")
    .style('font-size', '14px')
    .text("Strongest Positions for Given Feature");

  svg.append("text")
    .attr("class", "x-axis-label")
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", height + 15)
    .text("Positions");

  svg.append("text")
    .attr("class", "y-axis-label")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -25)
    .attr("font-size", "12px")
    .text("Strength (a.u) ");

  // Append the axes to the SVG
  svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(xAxis)
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-30)");

  svg.append("g")
    .attr("class", "y-axis")
    .call(yAxis);

  // Create bars
  svg.selectAll(".bar")
    .data(topChildren)
    .enter().append("rect")
    .attr("class", function (d) { return "bar " + d.data.name; })
    .attr("x", d => xScale(d.data.name))
    .attr("y", d => yScale(d.value))
    .attr("width", xScale.bandwidth())
    .attr("height", d => height - yScale(d.value))
    .attr("fill", d => color)
    .attr("stroke", "#000")
    .attr("stroke-width", 1)
    .on('click', function (d) {
      // d3.select(this).transition()
      //   .duration(100)
      //   .attr("fill", highlightColor);
      // d3.select("svg.nucleotide-view").selectAll(".obj.bar." + d.data.name)
      //   .transition()
      //   .duration(100)
      //   .attr("fill", highlightColor);
    })
    .on("mouseover", function (d) {
      d3.select(this).transition()
        .duration(100)
        .attr("fill", highlightColor);
      // console.log(d3.select("svg.nucleotide-view").selectAll(".obj.bar" + d.data.name));
      // console.log(d);
      d3.select("svg.nucleotide-view").selectAll(".obj.bar." + d.data.name)
        .raise()
        .transition()
        .duration(300)
        .attr("fill", highlightColor);
    })
    .on("mouseleave", function (d) {
      d3.select(this).transition()
        .duration(100)
        .attr("fill", color);
      d3.select("svg.nucleotide-view").selectAll(".obj.bar")
        .transition()
        .duration(100)
        .attr("fill", color);
    });
};

/**
 * nucleotideView 
 */
function nucleotideView(sequence, structs, data, classSelected = null) {
  svg = d3.select("svg.nucleotide-view")
  svg.selectAll("*").remove();
  d3.select("svg.nucleotide-sort").selectAll("*").remove();
  d3.select("svg.nucleotide-zoom").selectAll("*").remove();
  const svgContainer = d3.select(".nucleotide-view"); // Ensure you have a container with this class
  const width = svgContainer.node().clientWidth;
  const height = svgContainer.node().clientHeight;
  const heightRatio = height/640;
  const widthRatio = width/1290;

  console.log(width,height)
  // console.log("nucleotideView", sequence, structs, data);
  var margin = { top: 30, right: 10, bottom: 20, left: 50, middle: 22 };
  var svg_nucl = d3.select("svg.nucleotide-view");
  
  // Title
  svg_nucl.append("text")
    .attr("x", (width / 2)*widthRatio)
    .attr("y", margin.top / 2 + 5)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Exon View");

  // Add X axis
  var positions = Array.from(new Array(sequence.length), (x, i) => i + 1);
  var x = d3.scaleBand()
    .range([margin.left, (width - margin.right)])
    .domain(positions)
    .padding(0.2);
  var xInclAxis = d3.axisBottom(x)
    .tickSize(2*widthRatio)
    .tickFormat(function (d) {
      return Array.from(structs)[d - 1];
    });
  var xSkipAxis = d3.axisTop(x)
    .tickSize(2*widthRatio)
    .tickFormat(function (d) {
      if ((d % 10 == 0 && d - 10 != 0 && d - 10 != 80) || (d % 10 == 1 && d - 10 === 1)) {
        return d - 10;
      } else { return "" };
    });
  var xNuAxis = d3.axisBottom(x)
    .tickSize(0)
    .tickFormat(function (d) {
      return Array.from(sequence)[d - 1];
    });
  var gxIncl = svg_nucl.append("g")
    .attr("class", "x axis")
    .attr("font-size", `${12*heightRatio}px`)
    .attr("transform", "translate(0," + (margin.top + (height - margin.top - margin.bottom) / 2 - margin.middle) + ")")
    .call(xInclAxis);
  var gxSkip = svg_nucl.append("g")
    .attr("class", "x axis")
    .attr("font-size", `${12*heightRatio}px`)
    .attr("transform", "translate(0," + (margin.top + (height - margin.top - margin.bottom) / 2 + margin.middle) + ")")
    .call(xSkipAxis);
  var gxNu = svg_nucl.append("g")
    .attr("class", "x axis")
    .attr("font-size", `${12*heightRatio}px`)
    .attr("transform", "translate(0," + (margin.top + (height - margin.top - margin.bottom) / 2 - 5) + ")")
    .call(xNuAxis);
  gxNu.selectAll("path")
    .style("stroke-width", 0);
  gxNu.selectAll(".tick")
    .each(function (d, i) {
      d3.select(this)
        .select("text")
        .attr("font-size", `${12*widthRatio}px`)
        .attr("fill", (d <= 10 || d > 80) ? line_color : nucleotide_color)
    });

  // Add Y axis
  var max_incl = d3.max(d3.map(data.children[0].children, recursive_total_strength).keys());
  var max_skip = d3.max(d3.map(data.children[1].children, recursive_total_strength).keys());
  /* Change y range to a fix range */
  // var max_strength = d3.max([max_incl, max_skip]);
  var max_strength = 10;
  var yIncl = d3.scaleLinear()
    .domain([0, max_strength])
    .range([margin.top + (height - margin.top - margin.bottom) / 2 - margin.middle, margin.top]);
  var ySkip = d3.scaleLinear()
    .domain([0, max_strength])
    .range([margin.top + (height - margin.top - margin.bottom) / 2 + margin.middle, height - margin.bottom]);

  // Set up for nucleotide sort
  var sort_width = parseFloat(d3.select("svg.nucleotide-sort").style("width"));
  var sort_height = parseFloat(d3.select("svg.nucleotide-sort").style("height"));
  var svg_sort = d3.select("svg.nucleotide-sort");

  // Set up for nucleotide zoom
  var zoom_width = parseFloat(d3.select("svg.nucleotide-zoom").style("width"));
  var zoom_height = parseFloat(d3.select("svg.nucleotide-zoom").style("height"));
  var svg_zoom = d3.select("svg.nucleotide-zoom");

  const InclusionAxis = (color = false) => {
    const barColor = color ? lightOther : inclusion_color;
    const barHighlightColor = color ? darkBackground : inclusion_highlight_color;

    var gyIncl = svg_nucl.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + margin.left + ",0)")
      .attr("font-size", `${12*heightRatio}px`)
    gyIncl.transition().duration(800).call(d3.axisLeft(yIncl).ticks(4));

    svg_nucl.append("text")
      .attr("class", "ylabel_inclusion")
      .attr("text-anchor", "middle")
      .attr("x", -(margin.top + (height - margin.top - margin.bottom) / 4 - margin.middle / 2))
      .attr("y", margin.left)
      .attr("dy", "-2.25em")
      .attr("font-size", `${12*heightRatio}px`)
      .attr("transform", "rotate(-90)")
      .text("Inclusion strength (a.u)");

    svg_nucl.selectAll("nucleotide-incl-bar")
      .data(data.children[0].children)
      .enter()
      .append("rect")
      .datum(function (d) { return d; })
      .attr("class", function (d) { return "obj incl pos_" + d.name.slice(4); })
      .attr("x", function (d) { return x(parseInt(d.name.slice(4))); })
      .attr("y", function (d) { return yIncl(0); })
      .attr("width", x.bandwidth())
      .attr("height", 0)
      .attr("fill", barColor)
      .attr("stroke", line_color)
      .lower()
      .transition()
      .duration(800)
      .attr("y", function (d) { return yIncl(recursive_total_strength(d)); })
      .attr("height", function (d) { return (margin.top + (height - margin.top - margin.bottom) / 2 - margin.middle) - yIncl(recursive_total_strength(d)); })
      .delay(function (d, i) { return (i * 10) });
  }

  const SkipAxis = (color = false) => {
    const barColor = color ? lightOther : skipping_color;
    const barHighlightColor = color ? darkBackground : skipping_highlight_color;

    var gySkip = svg_nucl.append("g")
      .attr("class", "y axis")
      .attr("font-size", `${12*heightRatio}px`)
      .attr("transform", "translate(" + margin.left + ",0)");
    gySkip.transition().duration(800).call(d3.axisLeft(ySkip).ticks(4));

    svg_nucl.append("text")
      .attr("class", "ylabel_skip")
      .attr("text-anchor", "middle")
      .attr("x", -(margin.top / 2 + (height - margin.top - margin.bottom) / 4 + margin.middle / 2 + height / 2 - margin.bottom / 2))
      .attr("y", margin.left)
      .attr("dy", "-2.25em")
      .attr("font-size", `${12*heightRatio}px`)
      .attr("transform", "rotate(-90)")
      .text("Skipping strength (a.u)");

    svg_nucl.selectAll("nucleotide-skip-bar")
      .data(data.children[1].children)
      .enter()
      .append("rect")
      .datum(function (d) { return d; })
      .attr("class", function (d) { return "obj skip pos_" + d.name.slice(4); })
      .attr("x", function (d) { return x(parseInt(d.name.slice(4))); })
      .attr("y", (margin.top + (height - margin.top - margin.bottom) / 2 + margin.middle))
      .attr("width", x.bandwidth())
      .attr("height", 0)
      .attr("fill", barColor)
      .attr("stroke", line_color)
      .lower()
      .on("mouseover", function (d) {
        d3.select(this).style("fill", barHighlightColor);
        console.log(barHighlightColor)
      })
      .on("mouseleave", function (d) {
        d3.select(this).style("fill", barColor);
        console.log(barColor)
      })
      .transition()
      .duration(800)
      .attr("y", (margin.top + (height - margin.top - margin.bottom) / 2 + margin.middle))
      .attr("height", function (d) { return ySkip(recursive_total_strength(d)) - (margin.top + (height - margin.top - margin.bottom) / 2 + margin.middle); })
      .delay(function (d, i) { return (i * 10); });
  };

  if (classSelected === "incl") {
    InclusionAxis()
    SkipAxis(true)
    hovering('skip')
    clicking('skip')
  } else if (classSelected === "skip") {
    SkipAxis()
    InclusionAxis(true)
    hovering('incl')
    clicking('incl')
  } else {
    InclusionAxis()
    SkipAxis()
    hovering()
    clicking()
  }
  function hovering(color = null) {
    console.log(color)
    const skipBarColor = color == 'skip' ? lightOther : skipping_color;
    const skipBarHighlightColor = color == 'skip' ? darkBackground : skipping_highlight_color;
    const inclBarColor = color == 'incl' ? lightOther : inclusion_color;
    const inclBarHighlightColor = color == 'incl' ? darkBackground : inclusion_highlight_color;
    // Hghlight on hover
    gxNu.selectAll(".tick")
      .each(function (d) {
        d3.select(this)
          .select("text")
          .attr("class", "obj nt pos_" + d);
      });

    svg_nucl.selectAll(".obj")
      .classed("free", true);

    svg_nucl.selectAll(".obj.free")
      .on("mouseover", function (d) {
        var pos = d3.select(this)
          .attr("class")
          .slice(9, -4);
        d3.select(".obj.incl.free." + pos)
          .style("fill", inclBarHighlightColor);
        d3.select(".obj.skip.free." + pos)
          .style("fill", skipBarHighlightColor);
        d3.select(".obj.nt." + pos)
          .style("font-weight", "bold");
      })
      .on("mouseleave", function (d) {
        var pos = d3.select(this)
          .attr("class")
          .slice(9, -4);
        d3.select(".obj.incl.free." + pos)
          .style("fill", inclBarColor);
        d3.select(".obj.skip.free." + pos)
          .style("fill", skipBarColor);
        d3.select(".obj.nt." + pos)
          .style("font-weight", "normal");
      });
  };
  function clicking(color = null) {
    // Show nucleotide zoom on click
    console.log(color)
    const skipBarColor = color == 'skip' ? lightOther : skipping_color;
    const skipBarHighlightColor = color == 'skip' ? darkBackground : skipping_highlight_color;
    const inclBarColor = color == 'incl' ? lightOther : inclusion_color;
    const inclBarHighlightColor = color == 'incl' ? darkBackground : inclusion_highlight_color;
    svg_nucl.selectAll(".obj.free")
      .on("click", function (d) {
        d3.selectAll(".obj.incl")
          .style("fill", inclBarColor)
          .classed("free", true);
        d3.selectAll(".obj.skip")
          .style("fill", skipBarColor)
          .classed("free", true);
        d3.selectAll(".obj.nt")
          .style("font-weight", "normal")
          .classed("free", true);

        var pos = d3.select(this)
          .attr("class")
          .slice(9, -4);
        d3.select(".obj.incl.free." + pos)
          .style("fill", inclBarHighlightColor)
          .classed("free", false);
        d3.select(".obj.skip.free." + pos)
          .style("fill", skipBarHighlightColor)
          .classed("free", false);
        d3.select(".obj.nt." + pos)
          .style("font-weight", "bold")
          .classed("free", false);
        nucleotideSort(pos, margin, sort_width, sort_height, svg_sort, svg_zoom,[skipBarColor,skipBarHighlightColor,inclBarColor,inclBarHighlightColor]);
        nucleotideZoom(sequence, structs, pos, margin, zoom_width, zoom_height, svg_zoom, max_strength,[skipBarColor,skipBarHighlightColor,inclBarColor,inclBarHighlightColor]);
      });
  }
  return svg_nucl
}
/**
 * nucleotideFeatureView
 */
function nucleotideFeatureView(parent, data, feature_name) {
  var margin = { top: 30, right: 10, bottom: 20, left: 50, middle: 22 };
  var width = parseFloat(d3.select("svg.nucleotide-view").style("width"));
  var height = parseFloat(d3.select("svg.nucleotide-view").style("height"));

  svg = d3.select("svg.nucleotide-view")
  svg.selectAll("rect").remove();
  svg.selectAll(".y.axis").remove();
  d3.select("svg.nucleotide-sort").selectAll("*").remove();
  d3.select("svg.nucleotide-zoom").selectAll("*").remove();

  var class_name = feature_name.split("_")[0];
  if (class_name == "incl") {
    data = flatten_nested_json(data.children[0]).filter(function (d, i, arr) {
      return d.name.split(" ")[1] == feature_name;
    });
  } else {
    data = flatten_nested_json(data.children[1]).filter(function (d, i, arr) {
      return d.name.split(" ")[1] == feature_name;
    });
  }
  /* Change y range to a fix range */
  // var max_strength = d3.max(d3.map(data, function (d) { return d.strength / d.length; }).keys());
  var max_strength = 6;

  // X scale
  var sequence = parent.sequence;
  var positions = Array.from(new Array(sequence.length), (x, i) => i + 1);
  var x = d3.scaleBand()
    .range([margin.left, width - margin.right])
    .domain(positions)
    .padding(0);

  // Y Axis

  console.log(data.filter(function(d){ return (d.strength / d.length) > 0.01 }));

  if (class_name == "incl") {
    svg.selectAll("text.ylabel_skip").remove();
    var yIncl = d3.scaleLinear()
      .domain([0, max_strength])
      .range([margin.top + (height - margin.top - margin.bottom) / 2 - margin.middle, margin.top]);
    var gyIncl = svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + margin.left + ",0)");
    gyIncl.transition().duration(800).call(d3.axisLeft(yIncl).ticks(3));
    svg.selectAll("nucleotide-incl-bar")
      // Filter out nucleotide feature with strength < 0.01
      .data(data.filter(function(d){ return (d.strength / d.length) > 0.01 }))
      .enter()
      .append("rect")
      .datum(function (d) { return d; })
      .attr("class", function (d) { return "obj bar " + d.name.slice(4); })
      .attr("x", function (d) { return x(parseInt(d.name.split(" ")[2].split("_")[1])); })
      .attr("y", function (d) { return yIncl(0); })
      .attr("width", function (d) { return x.bandwidth() * d.length; })
      .attr("height", 0)
      .attr("fill", inclusion_color)
      .attr("stroke", line_color)
      .attr("opacity", 0.8)
      .lower()
      .on("mouseover", function (d) {
        d3.select(this).style("fill", inclusion_highlight_color);
      })
      .on("mouseleave", function (d) {
        d3.select(this).style("fill", inclusion_color);
      })
      .transition()
      .duration(800)
      .attr("y", function (d) { return yIncl(d.strength / d.length); })
      .attr("height", function (d) { return (margin.top + (height - margin.top - margin.bottom) / 2 - margin.middle) - yIncl(d.strength / d.length); })
      .delay(function (d, i) { return (i * 10); });
  }
  if (class_name == "skip") {
    svg.selectAll("text.ylabel_inclusion").remove();
    var ySkip = d3.scaleLinear()
      .domain([0, max_strength])
      .range([margin.top + (height - margin.top - margin.bottom) / 2 + margin.middle, height - margin.bottom]);
    var gySkip = svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + margin.left + ",0)");
    gySkip.transition().duration(800).call(d3.axisLeft(ySkip).ticks(3));


    svg.selectAll("nucleotide-skip-bar")
      // Filter out nucleotide feature with strength < 0.01
      .data(data.filter(function(d){ return (d.strength / d.length) > 0.01 }))
      .enter()
      .append("rect")
      .datum(function (d) { return d; })
      .attr("class", function (d) { return "obj bar " + d.name.slice(4); })
      .attr("x", function (d) { return x(parseInt(d.name.split(" ")[2].split("_")[1])); })
      .attr("y", (margin.top + (height - margin.top - margin.bottom) / 2 + margin.middle))
      .attr("width", function (d) { return x.bandwidth() * d.length; })
      .attr("height", 0)
      .attr("fill", skipping_color)
      .attr("stroke", line_color)
      .attr("opacity", 0.8)
      .lower()
      .on("mouseover", function (d) {
        d3.select(this).style("fill", skipping_highlight_color);
      })
      .on("mouseleave", function (d) {
        d3.select(this).style("fill", skipping_color);
      })
      .transition()
      .duration(800)
      .attr("y", (margin.top + (height - margin.top - margin.bottom) / 2 + margin.middle))
      .attr("height", function (d) { return ySkip(d.strength / d.length) - (margin.top + (height - margin.top - margin.bottom) / 2 + margin.middle); })
      .delay(function (d, i) { return (i * 10); });
  }
}
/**
 * nucleotideSort
 */
function nucleotideSort(pos, margin, width, height, svg_sort, svg_zoom,colors) {
  const inclusionColor = colors[2]
  const inclusionHighlightColor = colors[3]
  const skippingColor = colors[0]
  const skippingHighlightColor = colors[1]

  svg_sort.selectAll("*").remove(); // Clear SVG before redrawing

  // Add title
  svg_sort.append("text")
    .attr("x", width / 2)
    .attr("y", margin.top / 2 + 5)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Nucleotide View");

  // Data preparation
  const inclData = flatten_nested_json(d3.selectAll(`.obj.incl.${pos}`).datum());
  const skipData = flatten_nested_json(d3.selectAll(`.obj.skip.${pos}`).datum());
  /* Change y range to a fix range */
  // const maxIncl = d3.max(inclData.map(d => d.strength));
  // const maxSkip = d3.max(skipData.map(d => d.strength));
  // const maxStrength = d3.max([maxIncl, maxSkip]);
  const maxStrength = 6;

  const topInclData = inclData.sort((a, b) => b.strength - a.strength).slice(0, 10);
  const topSkipData = skipData.sort((a, b) => b.strength - a.strength).slice(0, 10);

  // X axis setup
  const sortXIncl = d3.scaleBand()
    .range([margin.left, width - margin.right])
    .domain(topInclData.map(d => d.name))
    .padding(0.2);

  const sortXSkip = d3.scaleBand()
    .range([margin.left, width - margin.right])
    .domain(topSkipData.map(d => d.name))
    .padding(0.2);

  const sortXInclAxis = d3.axisBottom(sortXIncl).tickSize(2);
  const sortXSkipAxis = d3.axisTop(sortXSkip).tickSize(2);

  const sortGxIncl = svg_sort.append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0, ${margin.top + (height - margin.top - margin.bottom) / 2 - margin.middle})`);

  const sortGxSkip = svg_sort.append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0, ${margin.top + (height - margin.top - margin.bottom) / 2 + margin.middle})`);

  // Y axis setup
  const sortYIncl = d3.scaleLinear()
    .domain([0, maxStrength])
    .range([margin.top + (height - margin.top - margin.bottom) / 2 - margin.middle, margin.top]);

  const sortYSkip = d3.scaleLinear()
    .domain([0, maxStrength])
    .range([margin.top + (height - margin.top - margin.bottom) / 2 + margin.middle, height - margin.bottom]);

  const sortGYIncl = svg_sort.append("g")
    .attr("class", "y axis")
    .attr("transform", `translate(${margin.left}, 0)`);

  const sortGYSkip = svg_sort.append("g")
    .attr("class", "y axis")
    .attr("transform", `translate(${margin.left}, 0)`);

  const sortInclYLabel = svg_sort.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "middle")
    .attr("x", -(margin.top + (height - margin.top - margin.bottom) / 4 - margin.middle / 2))
    .attr("y", margin.left)
    .attr("dy", "-2.25em")
    .attr("font-size", "12px")
    .attr("transform", "rotate(-90)")
    .style("fill", background_color)
    .text("Inclusion strength (a.u)");

  const sortSkipYLabel = svg_sort.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "middle")
    .attr("x", -(margin.top / 2 + (height - margin.top - margin.bottom) / 4 + margin.middle / 2 + height / 2 - margin.bottom / 2))
    .attr("y", margin.left)
    .attr("dy", "-2.25em")
    .attr("font-size", "12px")
    .attr("transform", "rotate(-90)")
    .style("fill", background_color)
    .text("Skipping strength (a.u)");

  // X axis rendering
  sortXInclAxis.tickFormat(() => "");
  sortXSkipAxis.tickFormat(() => "");

  sortGxIncl.transition().duration(800).call(sortXInclAxis)
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-50)");

  sortGxSkip.transition().duration(800).call(sortXSkipAxis)
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-50)");

  // Y axis rendering
  sortInclYLabel.transition().duration(800).style("fill", "black");
  sortSkipYLabel.transition().duration(800).style("fill", "black");
  sortGYIncl.transition().duration(800).call(d3.axisLeft(sortYIncl).ticks(5));
  sortGYSkip.transition().duration(800).call(d3.axisLeft(sortYSkip).ticks(5));

  // Remove previous bars
  svg_sort.selectAll(".incl.narrow-bar")
    .transition()
    .duration(300)
    .attr("y", sortYIncl(0))
    .attr("height", 0)
    .remove();

  svg_sort.selectAll(".skip.narrow-bar")
    .transition()
    .duration(300)
    .attr("y", sortYSkip(0))
    .attr("height", 0)
    .remove();

  // Add new bars
  const inclBars = svg_sort.selectAll("incl-narrow-bar")
    .data(topInclData)
    .enter()
    .append("rect")
    .attr("class", d => `obj incl narrow-bar ${d.name.split(" ").join("-")}`)
    .attr("x", d => sortXIncl(d.name))
    .attr("y", sortYIncl(0))
    .attr("width", sortXIncl.bandwidth())
    .attr("height", 0)
    .attr("fill", inclusionColor)
    .attr("stroke", line_color)
    .lower();

  inclBars.on("mouseover", function (event, d) {
    d3.select(this).transition().duration(100).attr("fill", inclusionHighlightColor);
    const featureClass = d3.select(this).attr("class").split(" ")[3];
    d3.selectAll(`.incl.wide-bar.${featureClass}`)
      .raise()
      .transition()
      .duration(300)
      .attr("fill", inclusionHighlightColor)
      .attr("opacity", 1);
    d3.selectAll(`.annotate.incl.${featureClass}`)
      .raise()
      .transition()
      .duration(300)
      .attr("opacity", 0);
  });

  inclBars.on("mouseout", function (event, d) {
    d3.select(this).transition().duration(100).attr("fill", inclusionColor);
    svg_zoom.selectAll(".incl.wide-bar").attr("fill", inclusionColor).attr("opacity", 0.5);
    svg_zoom.selectAll(".incl.annotate").attr("opacity", 0);
  });

  inclBars.transition()
    .duration(800)
    .attr("y", d => sortYIncl(d.strength))
    .attr("height", d => (margin.top + (height - margin.top - margin.bottom) / 2 - margin.middle) - sortYIncl(d.strength))
    .delay((_, i) => i * 10);

  const skipBars = svg_sort.selectAll("skip-narrow-bar")
    .data(topSkipData)
    .enter()
    .append("rect")
    .attr("class", d => `obj skip narrow-bar ${d.name.split(" ").join("-")}`)
    .attr("x", d => sortXSkip(d.name))
    .attr("y", sortYSkip(0))
    .attr("width", sortXSkip.bandwidth())
    .attr("height", 0)
    .attr("fill", skippingColor)
    .attr("stroke", line_color)
    .lower();

  skipBars.on("mouseover", function (event, d) {
    d3.select(this).transition().duration(100).attr("fill", skippingHighlightColor);
    const featureClass = d3.select(this).attr("class").split(" ")[3];
    d3.selectAll(`.skip.wide-bar.${featureClass}`)
      .raise()
      .transition()
      .duration(300)
      .attr("fill", skippingHighlightColor)
      .attr("opacity", 1);
    d3.selectAll(`.annotate.skip.${featureClass}`)
      .raise()
      .transition()
      .duration(300)
      .attr("opacity", 0);
  });

  skipBars.on("mouseout", function (event, d) {
    d3.select(this).transition().duration(100).attr("fill", skippingColor);
    svg_zoom.selectAll(".skip.wide-bar").attr("fill", skippingColor).attr("opacity", 0.5);
    svg_zoom.selectAll(".skip.annotate").attr("opacity", 0);
  });

  skipBars.transition()
    .duration(800)
    .attr("y", margin.top + (height - margin.top - margin.bottom) / 2 + margin.middle)
    .attr("height", d => sortYSkip(d.strength) - (margin.top + (height - margin.top - margin.bottom) / 2 + margin.middle))
    .delay((_, i) => i * 10);
}
/**
 * nucleotideZoom
 */
function nucleotideZoom(sequence, structs, pos, margin, zoom_width, height, svg_zoom, max_strength,colors) {
  const int_pos = parseInt(pos.slice(4));
  const positions = Array.from({ length: 11 }, (_, i) => i - 5);

  const inclusionColor = colors[2]
  const skippingColor = colors[0]
  const zoom_x = d3.scaleBand()
    .range([margin.left, zoom_width - margin.right])
    .domain(positions)
    .padding(0);

  /* Change y range to a fix range */
  const zoom_yIncl = d3.scaleLinear()
    // .domain([0, max_strength])
    .domain([0, 6])
    .range([margin.top + (height - margin.top - margin.bottom) / 2 - margin.middle, margin.top]);

  const zoom_ySkip = d3.scaleLinear()
    .domain([0, max_strength])
    .range([margin.top + (height - margin.top - margin.bottom) / 2 + margin.middle, height - margin.bottom]);

  svg_zoom.selectAll("*").remove(); // Clear SVG before redrawing

  // Add title
  svg_zoom.append("text")
    .attr("x", zoom_width / 2)
    .attr("y", margin.top / 2 + 5)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Nucleotide Features");

  // Add X axis
  const zoom_xAxis = d3.axisBottom(zoom_x).tickSize(2);
  const zoom_xSkipAxis = d3.axisTop(zoom_x).tickSize(2);
  const zoom_xNuAxis = d3.axisBottom(zoom_x).tickSize(0);

  const zoom_gxIncl = svg_zoom.append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0, ${margin.top + (height - margin.top - margin.bottom) / 2 - margin.middle})`);

  const zoom_gxSkip = svg_zoom.append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0, ${margin.top + (height - margin.top - margin.bottom) / 2 + margin.middle})`);

  const zoom_gxNu = svg_zoom.append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0, ${margin.top + (height - margin.top - margin.bottom) / 2 - 5})`);

  zoom_xAxis.tickFormat((d) => Array.from(structs.slice(int_pos - 6, int_pos + 5))[d + 5]);
  zoom_xSkipAxis.tickFormat((d) => (d % 5 === 0 && int_pos + d - 10 > 0 && int_pos + d - 10 < 71) ? int_pos + d - 10 : "");
  zoom_xNuAxis.tickFormat((d) => Array.from(sequence.slice(int_pos - 6, int_pos + 5))[d + 5]);

  zoom_gxIncl.transition().duration(800).call(zoom_xAxis);
  zoom_gxSkip.transition().duration(800).call(zoom_xSkipAxis);
  zoom_gxNu.call(zoom_xNuAxis);

  zoom_gxNu.selectAll("path").style("stroke-width", 0);
  zoom_gxNu.selectAll(".tick").each(function (d) {
    d3.select(this)
      .select("text")
      .attr("font-weight", d === 0 ? "bold" : "normal")
      .attr("fill", d === 0 ? "black" : line_color);
  });

  // Add Y axis
  const zoom_gyIncl = svg_zoom.append("g")
    .attr("class", "y axis")
    .attr("transform", `translate(${margin.left}, 0)`);

  const zoom_gySkip = svg_zoom.append("g")
    .attr("class", "y axis")
    .attr("transform", `translate(${margin.left}, 0)`);

  const zoom_incl_ylabel = svg_zoom.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "middle")
    .attr("x", -(margin.top + (height - margin.top - margin.bottom) / 4 - margin.middle / 2))
    .attr("y", margin.left)
    .attr("dy", "-3.25em")
    .attr("font-size", "12px")
    .attr("transform", "rotate(-90)")
    .style("fill", background_color)
    .text("Inclusion strength (a.u)");

  const zoom_skip_ylabel = svg_zoom.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "middle")
    .attr("x", -(margin.top / 2 + (height - margin.top - margin.bottom) / 4 + margin.middle / 2 + height / 2 - margin.bottom / 2))
    .attr("y", margin.left)
    .attr("dy", "-3.25em")
    .attr("font-size", "12px")
    .attr("transform", "rotate(-90)")
    .style("fill", background_color)
    .text("Skipping strength (a.u)");

  zoom_incl_ylabel.transition().duration(800).style("fill", "black");
  zoom_skip_ylabel.transition().duration(800).style("fill", "black");
  zoom_gyIncl.transition().duration(800).call(d3.axisLeft(zoom_yIncl).ticks(5));
  zoom_gySkip.transition().duration(800).call(d3.axisLeft(zoom_ySkip).ticks(5));

  // Add borders
  const left_border = svg_zoom.append("line")
    .attr("x1", zoom_x(0))
    .attr("x2", zoom_x(0))
    .attr("y1", zoom_yIncl(max_strength))
    .attr("y2", zoom_ySkip(max_strength))
    .attr("stroke", "black")
    .attr("stroke-dasharray", [2, 2])
    .attr("opacity", 0);

  const right_border = svg_zoom.append("line")
    .attr("x1", zoom_x(1))
    .attr("x2", zoom_x(1))
    .attr("y1", zoom_yIncl(max_strength))
    .attr("y2", zoom_ySkip(max_strength))
    .attr("stroke", "black")
    .attr("stroke-dasharray", [2, 2])
    .attr("opacity", 0);

  left_border.raise().transition().duration(1000).attr("opacity", 1);
  right_border.raise().transition().duration(1000).attr("opacity", 1);

  // Data
  const incl_data = flatten_nested_json(d3.selectAll(`.obj.incl.${pos}`).datum());
  const skip_data = flatten_nested_json(d3.selectAll(`.obj.skip.${pos}`).datum());
  const max_incl = d3.max(incl_data.map((d) => d.strength));
  const max_skip = d3.max(skip_data.map((d) => d.strength));
  max_strength = d3.max([max_incl, max_skip]);

  // Remove previous bars
  svg_zoom.selectAll(".incl.wide-bar")
    .transition()
    .duration(300)
    .attr("y", zoom_yIncl(0))
    .attr("height", 0)
    .remove();

  svg_zoom.selectAll(".skip.wide-bar")
    .transition()
    .duration(300)
    .attr("y", zoom_ySkip(0))
    .attr("height", 0)
    .remove();

  svg_zoom.selectAll(".annotate").remove();

  // Add new bars
  const inclBars = svg_zoom.selectAll("incl-feature-bar")
    .data(incl_data)
    .enter()
    .append("rect")
    .attr("class", (d) => `obj incl wide-bar ${d.name.split(" ").join("-")}`)
    .attr("x", (d) => d.length <= 6 ? zoom_x(1 - parseInt(d.name.slice(-1))) : zoom_x(-5))
    .attr("y", zoom_yIncl(0))
    .attr("width", (d) => d.length <= 6 ? zoom_x.bandwidth() * d.length : zoom_x.bandwidth() * 11)
    .attr("height", 0)
    .attr("fill", inclusionColor)
    .attr("stroke", line_color)
    .attr("opacity", 0.5)
    .lower();

  inclBars.transition()
    .duration(800)
    .attr("y", (d) => zoom_yIncl(d.strength))
    .attr("height", (d) => (margin.top + (height - margin.top - margin.bottom) / 2 - margin.middle) - zoom_yIncl(d.strength))
    .delay((_, i) => i * 10);

  const skipBars = svg_zoom.selectAll("skip-feature-bar")
    .data(skip_data)
    .enter()
    .append("rect")
    .attr("class", (d) => `obj skip wide-bar ${d.name.split(" ").join("-")}`)
    .attr("x", (d) => d.length <= 6 ? zoom_x(1 - parseInt(d.name.slice(-1))) : zoom_x(-5))
    .attr("y", zoom_ySkip(0))
    .attr("width", (d) => d.length <= 6 ? zoom_x.bandwidth() * d.length : zoom_x.bandwidth() * 11)
    .attr("height", 0)
    .attr("fill", skippingColor)
    .attr("stroke", line_color)
    .attr("opacity", 0.5)
    .lower();

  skipBars.transition()
    .duration(800)
    .attr("y", margin.top + (height - margin.top - margin.bottom) / 2 + margin.middle)
    .attr("height", (d) => zoom_ySkip(d.strength) - (margin.top + (height - margin.top - margin.bottom) / 2 + margin.middle))
    .delay((_, i) => i * 10);

  // Add feature labels
  const inclFeatureText = svg_zoom.selectAll("incl-feature-text")
    .data(incl_data)
    .enter()
    .append("text")
    .text((d) => d.name.split(" ")[1])
    .attr("class", (d) => `annotate incl ${d.name.split(" ").join("-")}`)
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("opacity", 0)
    .attr("x", (d) => {
      if (d.length <= 6) {
        return zoom_x(1 - parseInt(d.name.slice(-1))) + zoom_x.bandwidth() * d.length / 2;
      } else {
        return zoom_x(-5) + zoom_x.bandwidth() * 11 / 2;
      }
    })
    .attr("y", (d) => (zoom_yIncl(d.strength) + zoom_yIncl(0)) / 2)
    .lower();

  inclFeatureText.transition().duration(1000).attr("opacity", 0);

  const skipFeatureText = svg_zoom.selectAll("skip-feature-text")
    .data(skip_data)
    .enter()
    .append("text")
    .text((d) => d.name.split(" ")[1])
    .attr("class", (d) => `annotate skip ${d.name.split(" ").join("-")}`)
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("opacity", 0)
    .attr("x", (d) => {
      if (d.length <= 6) {
        return zoom_x(1 - parseInt(d.name.slice(-1))) + zoom_x.bandwidth() * d.length / 2;
      } else {
        return zoom_x(-5) + zoom_x.bandwidth() * 11 / 2;
      }
    })
    .attr("y", (d) => (zoom_ySkip(d.strength) + zoom_ySkip(0)) / 2)
    .attr("dy", "0.75em")
    .lower();

  skipFeatureText.transition().duration(1000).attr("opacity", 0);
}