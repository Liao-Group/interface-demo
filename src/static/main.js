
// featureSelected variable 
var featureSelected = ""
/* 
This variable represents the data coming formt he json file.
 I made it a mutable global variable so i can set it to data on d3.json()
 and then use it again in the feature selection function without having to pass 
 other values as we call that function. 
*/
var Data = []
var featuresParent = []
var featuresChildren = []
var positionsParent = []
var positionsChildren = []
var use_new_grouping = false
var widthRatio
let selectedBar = null;
let selectedFeatureBar = null;

/**
 * PSI view function
 * currently working with the reisizing, I will probaly have to figure it out how to have a better ratio and 
 * also adjust the ratio of the words and the other 
 */
function PSIview(data) {
  // detal_force and predicted_psi values are coming from the actual json file. 
  const deltaForce = data.delta_force;
  const predictedPSI = data.predicted_psi;
  const plotPSI = true; // CHOICE: whether to plot deltaForce or predictedPSI

  d3.select("svg.psi-view").selectAll("*").remove();;
  const svgContainer = d3.select(".psi-view"); // Ensure you have a container with this class
  const width = svgContainer.node().clientWidth;
  const height = svgContainer.node().clientHeight;
  const heightRatio = height / 370;
  widthRatio = width / 193;


  const svg = d3.select("svg.psi-view")
    .attr("width", width)
    .attr("height", height);
  const margin = { top: 40, right: 50, bottom: 30, left: 50 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const lowerBound = -120;
  const upperBound = 120;

  var yScale = d3.scaleLinear().domain([lowerBound, upperBound]).range([chartHeight, 0]);
  var yAxis = d3.axisLeft(yScale).ticks(5);

  if (plotPSI) {
    const deltaForce = [-100, -20, -10, -5, 0, 5, 10, 20, 100];
    const correspondingPSI = [0.000006, 0.071174, 0.232515, 0.361840, 0.5, 0.638148, 0.756705, 0.892360, 0.987334];

    yScale = d3.scaleLinear().domain([0, 1]).range([chartHeight, 0]);
    yAxis = d3.axisLeft(yScale).tickValues(correspondingPSI)
      .tickFormat(function (d, i) { return deltaForce[i]; });
  }

  // Conversion from predicted psi to delta force
  const predictePSIConversion = [0.000001, 0.000006, 0.000038, 0.000243, 0.004538, 0.071174, 0.499993, 0.892360, 0.971595, 0.982911, 0.985533, 0.987334, 0.988231];
  var yScale2 = d3.scaleLinear().domain([-0.1, 1.1]).range([chartHeight, 0]);
  var yAxis2 = d3.axisRight(yScale2).ticks(13)
    .tickFormat(function (d, i) {
      if (predictePSIConversion[i] < 0.1) { return d3.format(".0e")(predictePSIConversion[i]); }
      else { return d3.format(".3")(predictePSIConversion[i]); }
    });
  if (plotPSI) {
    yScale2 = d3.scaleLinear().domain([0, 1]).range([chartHeight, 0]);
    yAxis2 = d3.axisRight(yScale2).ticks(6);
  }

  svg.attr('width', width).attr('height', height);


  const chartGroup = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

  chartGroup.append('g')
    .attr('transform', `translate(${chartWidth / 2 - 30 * widthRatio}, 0)`)
    .call(yAxis);

  chartGroup.append('g')
    .attr('transform', `translate(${chartWidth / 2 + 30 * widthRatio}, 0)`)
    .call(yAxis2);

  chartGroup.append("line")
    .attr("x1", chartWidth / 2 - 30 * widthRatio)
    .attr("x2", chartWidth / 2 + 30 * widthRatio)
    .attr("y1", plotPSI ? yScale2(0.5) : yScale(0))
    .attr("y2", plotPSI ? yScale2(0.5) : yScale(0))
    .attr("stroke", "black")
    .attr("stroke-width", 1);

  svg.append('text')
    .attr('x', (width / 2))
    .attr('y', (margin.top / 2))
    .attr('text-anchor', 'middle')
    .style('font-size', `${14 * widthRatio}px`)
    .text('Difference-to-Prediction');


  const tooltip1 = chartGroup.append('text')
    .attr('x', chartWidth / 2)
    .attr('y', height - margin.bottom - 20)
    .attr('text-anchor', 'middle')
    .attr('font-size', `${12 * heightRatio}px`)
    .attr('font-weight', 'bold')
    .attr('fill', 'black')
    .style('opacity', 0)
    .text('Δ Strength: ' + deltaForce.toFixed(2));;

  const tooltip2 = chartGroup.append('text')
    .attr('x', chartWidth / 2)
    .attr('y', height - margin.bottom - 20)
    .attr('text-anchor', 'middle')
    .attr('font-size', `${12 * heightRatio}px`)
    .attr('font-weight', 'bold')
    .attr('fill', 'black')
    .style('opacity', 0)
    .text('Predicted PSI: ' + predictedPSI.toFixed(2));

  const psi = chartGroup.append('text')
    .attr('transform', `translate(${chartWidth + 60}, ${chartHeight / 2}) rotate(-90)`)
    .attr("font-size", `${12 * heightRatio}px`)
    // .attr("x", -chartWidth / 2)
    .attr("y", -23)
    .style('text-anchor', 'middle')
    .text('Predicted PSI')

  /* Hover over Difference-to-Prediction psi axis */
  psi.on("mouseover", function (event, d) {
    tooltip2.style("opacity", .9);
  })
  psi.on("mouseout", function (event, d) {
    tooltip2.style("opacity", 0);
  });

  const strength = chartGroup.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -chartHeight / 2)
    .attr("y", -25)
    .attr("font-size", `${12 * heightRatio}px`)
    // .attr('dy', '-1.50em')
    .style('text-anchor', 'middle')
    .text('Δ Strength (a.u.)')
    /* Hover over Difference-to-Prediction strength axis */
    .on("mouseover", function (event, d) {
      tooltip1.style("opacity", .9);
    })
    .on("mouseout", function (event, d) {
      tooltip1.style("opacity", 0);
    });


  const barColor = deltaForce < 0 ? skipping_color : inclusion_color;
  // Plot by deltaForce
  var barPosition = yScale(Math.max(0, deltaForce));
  var barHeight = Math.abs(yScale(deltaForce) - yScale(0));
  if (plotPSI) {
    // Plot by predicted PSI
    barPosition = yScale2(Math.max(0.5, predictedPSI));
    barHeight = Math.abs((yScale2(predictedPSI) - yScale2(0.5)));
  }
  // to adjust the width of the bar in the graph we make the 
  // graph rectangle fixed and the make the margins dynamic. 
  const barWidth = 25*widthRatio;

  const bar = chartGroup.append('rect')
    .attr('x', (chartWidth / 2) - (barWidth / 2))
    .attr('width', barWidth)
    .attr('y', plotPSI ? yScale2(0.5) : yScale(0))
    .attr('height', barHeight)
    .attr('fill', barColor)
    .attr("stroke", "#000")
    .attr("stroke-width", 1)
    .on("click", function (event, d) {
      nucleotideView(data.sequence, data.structs, data.nucleotide_activations);
      // featureSelection()
      hierarchicalBarChart(data, data.feature_activations);
      d3.select("svg.feature-view-2").selectAll("*").remove();
      d3.select("svg.feature-view-3").selectAll("*").remove();
      selectedBar = null;
      selectedFeatureBar = null;
      resetHighlight();
    })

};
/**
 * Feature view 1 
 * OBS: The legend in this one doesnt adjust well on other screens
 */
function hierarchicalBarChart(parent, data) {
  const svgContainer = d3.select(".feature-view-1");
  const width = svgContainer.node().clientWidth;
  const height = svgContainer.node().clientHeight;
  const heightRatio = height / 370;

  const margin = { top: 40, right: 20, bottom: 30, left: 50 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const svg = d3.select("svg.feature-view-1")
    .attr("width", width)
    .attr("height", height);

  svg.selectAll("*").remove();

  const chart = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const root = d3.hierarchy(data).sum(d => d.strength);

  const xScale = d3.scaleBand()
    .domain(root.children ? root.children.map(d => d.data.name) : [])
    .range([0, chartWidth])
    .paddingInner(0.4)
    .paddingOuter(0.5);

  const yScale = d3.scaleLinear()
    .domain([0, 170])
    .range([chartHeight, 0]);

  const xAxis = d3.axisBottom(xScale).tickFormat("").tickSize(0);
  const yAxis = d3.axisLeft(yScale);

  chart.append("text")
    .attr("x", (chartWidth / 2) - 10)
    .attr("y", -margin.top / 2)
    .attr("text-anchor", "middle")
    .style('font-size', `${14 * widthRatio}px`)
    .text('Class Strengths');

  chart.append("text")
    .attr("class", "x-axis-label")
    .attr("text-anchor", "middle")
    .attr("x", chartWidth / 2)
    .attr("y", chartHeight + 15)
    .style('font-size', `${12 * widthRatio}px`)
    .text("Classes");

  chart.append("text")
    .attr("class", "y-axis-label")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("x", -chartHeight / 2)
    .attr("y", -32)
    .attr("font-size", `${12 * heightRatio}px`)
    .text("Strength (a.u.)");

  chart.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${chartHeight})`)
    .call(xAxis);

  chart.append("g")
    .attr("class", "y-axis")
    .call(yAxis);

  const barWidth = 25*widthRatio;

  const bars = chart.selectAll(".bar")
    .data(root.children ? root.children : [])
    .enter().append("rect")
    .attr("class", d => `bar ${d.data.name}`)
    .attr("x", d => xScale(d.data.name))
    .attr("y", d => yScale(d.value))
    .attr("height", d => chartHeight - yScale(d.value))
    .attr("width", barWidth)
    .attr("fill", d => getFillColor(d))
    .attr("stroke", "#000")
    .attr("stroke-width", 1);

  bars.on("click", function (event, d) {
    // Turn all bars into default color first
    chart.selectAll(".bar").attr("fill", d => getFillColor(d));
    selectedBar = this;
    selectedFeatureBar = null;
    d3.select(selectedBar).attr("fill", getHighlightColor(d));
    if (data.children[d].children) {
      const className = data.children[d].name;
      featuresParent = parent;
      featuresChildren = data.children[d];
      hierarchicalBarChart2(parent, data.children[d]);
      d3.select("svg.feature-view-3").selectAll("*").remove();
      // featureSelection(null, className);
      nucleotideView(parent.sequence, parent.structs, parent.nucleotide_activations, className);
    }
    resetHighlight();
  });

  /* Hover over Class strength */
  bars.on("mouseover", function (event, d) {
    d3.select(this).attr("fill", getHighlightColor(d));
  });

  bars.on("mouseout", function (event, d) { resetHighlight(); });

}
/**
 * hierarchicalBarChart2
 */
function hierarchicalBarChart2(parent, data) {
  const svgContainer = d3.select(".feature-view-2");
  const width = svgContainer.node().clientWidth;
  const height = svgContainer.node().clientHeight;
  const heightRatio = height / 370;
  const widthRatio = width / 491;

  const margin = { top: 40, right: 20, bottom: 30, left: 40 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const color = getFillColor(data);
  const highlightColor = getHighlightColor(data);

  const svg = d3.select("svg.feature-view-2")
    .attr("width", chartWidth + margin.left + margin.right)
    .attr("height", chartHeight + margin.top + margin.bottom);

  svg.selectAll("*").remove();

  const chart = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const root = d3.hierarchy(data).sum(d => d.strength);

  const fillerData = [
    {'data': { 'name': '1', 'strength': 0, 'length': 0 }, 'value': 0}, 
    {'data': { 'name': '2', 'strength': 0, 'length': 0 }, 'value': 0}, 
    {'data': { 'name': '3', 'strength': 0, 'length': 0 }, 'value': 0}, 
    {'data': { 'name': '4', 'strength': 0, 'length': 0 }, 'value': 0}, 
  ];
  const topChildren = root.children.sort((a, b) => b.value - a.value).concat(fillerData).slice(0, 12);

  const xScale = d3.scaleBand()
    .domain(topChildren.map(d => d.data.name))
    .range([0, chartWidth])
    .paddingInner(0.2)
    .paddingOuter(0.3);

  const yScale = d3.scaleLinear()
    .domain([0, 75])
    .range([chartHeight, 0]);

  const xAxis = d3.axisBottom(xScale).tickSize(0).tickFormat("");
  const yAxis = d3.axisLeft(yScale).ticks(5);

  chart.append("text")
    .attr("x", chartWidth / 2)
    .attr("y", -margin.top / 2)
    .attr("text-anchor", "middle")
    .style('font-size', `${14 * widthRatio}px`)
    .text((data.name == "incl" ? "Inclusion" : "Skipping") + ' Features');

  chart.append("text")
    .attr("class", "x-axis-label")
    .attr("text-anchor", "middle")
    .attr("x", chartWidth / 2)
    .attr("y", chartHeight + margin.bottom - 15)
    .attr("font-size", `${12 * widthRatio}px`)
    .text("Features");

  chart.append("text")
    .attr("class", "y-axis-label")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("x", -chartHeight / 2)
    .attr("y", -25)
    .attr("font-size", `${12 * heightRatio}px`)
    .text("Strength (a.u.)");

  chart.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${chartHeight})`)
    .call(xAxis)
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-30)");

  chart.append("g")
    .attr("class", "y-axis")
    .call(yAxis);

  const tooltip = chart.append("text")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("font-size", "12px")
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle");

  const barWidth = 25*widthRatio;
  // const barSpacing = 4*widthRatio;

  topChildren.forEach(ele => {
    if (ele.data.name === selected) {
      positionsChildren = ele;
      positionsParent = ele.data.name;
    }
  });

  if (positionsChildren) {
    hierarchicalBarChart3(positionsParent, positionsChildren);
  }

  const bars = chart.selectAll(".bar")
    .data(topChildren)
    .enter().append("rect")
    .attr("class", d => "bar " + d.data.name)
    // .attr("x", (d, i) => (i * barSpacing) + xScale(d.data.name))
    .attr("x", (d, i) => xScale(d.data.name))
    .attr("y", d => yScale(d.value))
    .attr("height", d => chartHeight - yScale(d.value))
    .attr("width", barWidth)
    .attr("fill", d => color)
    .attr("stroke", "#000")
    .attr("stroke-width", 1);

  bars.on("click", function (event, d) {
    if (topChildren[d].children) {
      // Turn all bars into default color first
      chart.selectAll(".bar").attr("fill", color);
      selectedFeatureBar = this;
      d3.select(selectedFeatureBar).attr("fill", highlightColor);
      featureSelected = topChildren[d].data.name;
      const className = topChildren[d].data.name.split('_')[0];
      selectedBar = d3.select('svg.feature-view-1').select('.bar.' + className)._groups[0][0];
      // Regenerate legend
      // featureSelection(featureSelected, className);
      positionsChildren = topChildren[d];
      positionsParent = topChildren[d].data.name;
      hierarchicalBarChart3(positionsParent, positionsChildren);
      if (topChildren[d].data.name.slice(-4) != "bias") {
        nucleotideFeatureView(parent, parent.feature_activations, topChildren[d].data.name);
      }
      resetHighlight();
    }
  });

  /* Hover over a Feature bar */
  bars.on("mouseover", function (event, d) {
    d3.select(this).attr("fill", highlightColor);
    d3.select('div.feature-legend-container')
      .select('.background.' + topChildren[d].data.name)
      .style("fill", color);
  });

  bars.on("mouseout", function (event, d) { resetHighlight() });
}
/**
 * hierarchicalBarChart3
 */
function hierarchicalBarChart3(parentName, data) {

  const svgContainer = d3.select(".feature-view-3");
  const width = svgContainer.node().clientWidth;
  const height = svgContainer.node().clientHeight;
  const heightRatio = height / 370;
  const widthRatio = width / 491;

  const margin = { top: 40, right: 20, bottom: 30, left: 40 };
  const charWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const color = getFillColor(parentName);
  const highlightColor = getHighlightColor(parentName);

  const svg = d3.select("svg.feature-view-3")
    .attr("width", charWidth + margin.left + margin.right)
    .attr("height", chartHeight + margin.top + margin.bottom);

  svg.selectAll("*").remove();

  const chart = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const fillerData = [
    {'data': { 'name': '1', 'strength': 0, 'length': 0 }, 'value': 0}, 
    {'data': { 'name': '2', 'strength': 0, 'length': 0 }, 'value': 0}, 
    {'data': { 'name': '3', 'strength': 0, 'length': 0 }, 'value': 0}, 
    {'data': { 'name': '4', 'strength': 0, 'length': 0 }, 'value': 0}, 
    {'data': { 'name': '5', 'strength': 0, 'length': 0 }, 'value': 0}, 
    {'data': { 'name': '6', 'strength': 0, 'length': 0 }, 'value': 0}, 
    {'data': { 'name': '7', 'strength': 0, 'length': 0 }, 'value': 0}, 
    {'data': { 'name': '8', 'strength': 0, 'length': 0 }, 'value': 0}, 
  ];
  const children = (data.children || []);
  const topChildren = children
    .sort((a, b) => b.value - a.value)
    .concat(fillerData)
    .slice(0, 10);

  const xScale = d3.scaleBand()
    .domain(topChildren.map(d => d.data.name))
    .range([0, charWidth])
    .paddingInner(0.1)
    .paddingOuter(0.4);

  const yScale = d3.scaleLinear()
    .domain([0, 18])
    .range([chartHeight, 0]);

  const xAxis = d3.axisBottom(xScale).tickSize(0).tickFormat("");
  const yAxis = d3.axisLeft(yScale).ticks(5);

  chart.append("text")
    .attr("x", charWidth / 2)
    .attr("y", -margin.top / 2)
    .attr("text-anchor", "middle")
    .style('font-size', `${14 * widthRatio}px`)
    .text("Strongest Positions for Given Feature");

  chart.append("text")
    .attr("class", "x-axis-label")
    .attr("text-anchor", "middle")
    .attr("x", charWidth / 2)
    .attr("y", chartHeight + 15)
    .attr("font-size", `${12 * widthRatio}px`)
    .text("Positions");

  chart.append("text")
    .attr("class", "y-axis-label")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("x", -chartHeight / 2)
    .attr("y", -25)
    .attr("font-size", `${12 * heightRatio}px`)
    .text("Strength (a.u.)");

  chart.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${chartHeight})`)
    .call(xAxis)
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-30)");

  chart.append("g")
    .attr("class", "y-axis")
    .call(yAxis);

  const barWidth = 25* widthRatio;
  // const barSpacing = 2.5* widthRatio;

  const bars = chart.selectAll(".bar")
    .data(topChildren)
    .enter().append("rect")
    .attr("class", d => "bar " + d.data.name)
    // .attr("x", (d, i) => (i * barSpacing) + xScale(d.data.name))
    .attr("x", (d, i) => xScale(d.data.name))
    .attr("y", d => yScale(d.value))
    .attr("height", d => chartHeight - yScale(d.value))
    .attr("width", barWidth)
    .attr("fill", color)
    .attr("stroke", "#000")
    .attr("stroke-width", 1);

  /* Hover over a Position bar */
  bars.on("mouseover", function (event, d) {
    d3.select(this).attr("fill", highlightColor);
    const data = d3.select(this).datum();
    d3.select("svg.nucleotide-view")
      .selectAll(".obj.bar." + data.data.name)
      .raise()
      .attr("fill", highlightColor);
  });

  bars.on("mouseleave", function (event, d) {
    d3.select(this).attr("fill", color);
    d3.select("svg.nucleotide-view").selectAll(".obj.bar").attr("fill", color);
  });
}
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
  const heightRatio = height / 622;
  const widthRatio = width / 1290;

  var margin = { top: 30, right: 10, bottom: 20, left: 50, middle: 22 };
  var svg_nucl = d3.select("svg.nucleotide-view");

  // Title
  svg_nucl.append("text")
    .attr("x", width / 2)
    .attr("y", margin.top / 2 + 5)
    .attr("text-anchor", "middle")
    .style('font-size', `${14 * widthRatio}px`)
    .text("Exon View");

  // Add X axis
  var positions = Array.from(new Array(sequence.length), (x, i) => i + 1);
  var x = d3.scaleBand()
    .range([margin.left, (width - margin.right)])
    .domain(positions)
    .paddingInner(0.2)
    .paddingOuter(0.25);
  var xInclAxis = d3.axisBottom(x)
    .tickSize(2 * widthRatio)
    .tickFormat(function (d) {
      return Array.from(structs)[d - 1];
    });
  var xSkipAxis = d3.axisTop(x)
    .tickSize(2 * widthRatio)
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
    .attr("font-size", `${12 * heightRatio}px`)
    .attr("transform", "translate(0," + (margin.top + (height - margin.top - margin.bottom) / 2 - margin.middle) + ")")
    .call(xInclAxis);
  var gxSkip = svg_nucl.append("g")
    .attr("class", "x axis")
    .attr("font-size", `${12 * heightRatio}px`)
    .attr("transform", "translate(0," + (margin.top + (height - margin.top - margin.bottom) / 2 + margin.middle) + ")")
    .call(xSkipAxis);
  var gxNu = svg_nucl.append("g")
    .attr("class", "x axis")
    .attr("font-size", `${12 * heightRatio}px`)
    .attr("transform", "translate(0," + (margin.top + (height - margin.top - margin.bottom) / 2 - 5) + ")")
    .call(xNuAxis);
  gxNu.selectAll("path")
    .style("stroke-width", 0);
  gxNu.selectAll(".tick")
    .each(function (d, i) {
      d3.select(this)
        .select("text")
        .attr("font-size", `${12 * widthRatio}px`)
        .attr("fill", (d <= 10 || d > 80) ? line_color : nucleotide_color)
    });

  // Add Y axis
  var max_incl = d3.max(d3.map(data.children[0].children, recursive_total_strength).keys());
  var max_skip = d3.max(d3.map(data.children[1].children, recursive_total_strength).keys());
  /* Change y range to a fix range */
  // var max_strength = d3.max([max_incl, max_skip]);
  var max_strength = 9;
  var yIncl = d3.scaleLinear()
    .domain([0, max_strength])
    .range([margin.top + (height - margin.top - margin.bottom) / 2 - margin.middle, margin.top]);
  var ySkip = d3.scaleLinear()
    .domain([0, max_strength])
    .range([margin.top + (height - margin.top - margin.bottom) / 2 + margin.middle, height - margin.bottom]);

  //I think we can revome this declarations and bring to inside the functions.
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
      .attr("font-size", `${12 * heightRatio}px`)
    gyIncl.call(d3.axisLeft(yIncl).ticks(4));

    svg_nucl.append("text")
      .attr("class", "ylabel_inclusion")
      .attr("text-anchor", "middle")
      .attr("x", -(margin.top + (height - margin.top - margin.bottom) / 4 - margin.middle / 2))
      .attr("y", margin.left)
      .attr("dy", "-2.25em")
      .attr("font-size", `${12 * heightRatio}px`)
      .attr("transform", "rotate(-90)")
      .text("Inclusion strength (a.u.)");

    svg_nucl.selectAll("nucleotide-incl-bar")
      .data(data.children[0].children)
      .enter()
      .append("rect")
      .datum(function (d) { return d; })
      .attr("class", function (d) { return "obj incl pos_" + d.name.slice(4); })
      .attr("x", function (d) { return x(parseInt(d.name.slice(4))); })
      .attr("y", function (d) { return yIncl(recursive_total_strength(d)); })
      .attr("width", x.bandwidth())
      .attr("height", function (d) { return (margin.top + (height - margin.top - margin.bottom) / 2 - margin.middle) - yIncl(recursive_total_strength(d)); })
      .attr("fill", barColor)
      .attr("stroke", line_color)
      .lower();
  }

  const SkipAxis = (color = false) => {
    const barColor = color ? lightOther : skipping_color;
    const barHighlightColor = color ? darkBackground : skipping_highlight_color;

    var gySkip = svg_nucl.append("g")
      .attr("class", "y axis")
      .attr("font-size", `${12 * heightRatio}px`)
      .attr("transform", "translate(" + margin.left + ",0)");
    gySkip.call(d3.axisLeft(ySkip).ticks(4));

    svg_nucl.append("text")
      .attr("class", "ylabel_skip")
      .attr("text-anchor", "middle")
      .attr("x", -(margin.top / 2 + (height - margin.top - margin.bottom) / 4 + margin.middle / 2 + height / 2 - margin.bottom / 2))
      .attr("y", margin.left)
      .attr("dy", "-2.25em")
      .attr("font-size", `${12 * heightRatio}px`)
      .attr("transform", "rotate(-90)")
      .text("Skipping strength (a.u.)");

    svg_nucl.selectAll("nucleotide-skip-bar")
      .data(data.children[1].children)
      .enter()
      .append("rect")
      .datum(function (d) { return d; })
      .attr("class", function (d) { return "obj skip pos_" + d.name.slice(4); })
      .attr("x", function (d) { return x(parseInt(d.name.slice(4))); })
      .attr("y", (margin.top + (height - margin.top - margin.bottom) / 2 + margin.middle))
      .attr("width", x.bandwidth())
      .attr("height",  function (d) { return ySkip(recursive_total_strength(d)) - (margin.top + (height - margin.top - margin.bottom) / 2 + margin.middle); })
      .attr("fill", barColor)
      .attr("stroke", line_color)
      .lower();
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

    /* Hover over a Exon view */
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
        nucleotideSort(pos, margin, sort_width, sort_height, svg_sort, svg_zoom, [skipBarColor, skipBarHighlightColor, inclBarColor, inclBarHighlightColor]);
        nucleotideZoom(sequence, structs, pos, margin, zoom_width, zoom_height, svg_zoom, max_strength, [skipBarColor, skipBarHighlightColor, inclBarColor, inclBarHighlightColor]);
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
  var flat_data =[]
  if (class_name == "incl") {
    flat_data = flatten_nested_json(data.children[0]).filter(function (d, i, arr) {
      return d.name.split(" ")[1] == feature_name;
    });
  } else {
    flat_data = flatten_nested_json(data.children[1]).filter(function (d, i, arr) {
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

  if (class_name == "incl") {
    svg.selectAll("text.ylabel_skip").remove();
    var yIncl = d3.scaleLinear()
      .domain([0, max_strength])
      .range([margin.top + (height - margin.top - margin.bottom) / 2 - margin.middle, margin.top]);
    var gyIncl = svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + margin.left + ",0)");
    gyIncl.call(d3.axisLeft(yIncl).ticks(3));
    svg.selectAll("nucleotide-incl-bar")
      .data(flat_data)
      .enter()
      .append("rect")
      .datum(function (d) { return d; })
      .attr("class", function (d) { return "obj bar " + d.name.slice(4); })
      .attr("x", function (d) { return x(parseInt(d.name.split(" ")[2].split("_")[1])); })
      .attr("width", function (d) { return x.bandwidth() * d.length; })
      .attr("y", function (d) { return yIncl(d.strength / d.length); })
      .attr("height", function (d) { return (margin.top + (height - margin.top - margin.bottom) / 2 - margin.middle) - yIncl(d.strength / d.length); })
      .attr("fill", inclusion_color)
      .attr("stroke", line_color)
      .attr("opacity", 0.8)
      .lower()
      /* Hover over Exon feature view */
      .on("mouseover", function (d) {
        const data = d3.select(this).datum();
        d3.select("svg.feature-view-3").selectAll(".bar." + data.name.split(' ')[2])
          .attr("fill", inclusion_highlight_color);
        d3.select(this).raise().attr("fill", inclusion_highlight_color);
      })
      .on("mouseleave", function (d) {
        d3.select(this).attr("fill", inclusion_color);
        d3.select(this).attr("fill", inclusion_color);
        d3.select("svg.feature-view-3").selectAll(".bar")
          .attr("fill", inclusion_color);
      })
      .attr("y", function (d) { return yIncl(d.strength / d.length); })
      .attr("height", function (d) { return (margin.top + (height - margin.top - margin.bottom) / 2 - margin.middle) - yIncl(d.strength / d.length); });
      // .delay(function (d, i) { return (i * 10); });
  }
  if (class_name == "skip") {
    svg.selectAll("text.ylabel_inclusion").remove();
    var ySkip = d3.scaleLinear()
      .domain([0, max_strength])
      .range([margin.top + (height - margin.top - margin.bottom) / 2 + margin.middle, height - margin.bottom]);
    var gySkip = svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + margin.left + ",0)");
    gySkip.call(d3.axisLeft(ySkip).ticks(3));


    svg.selectAll("nucleotide-skip-bar")
      .data(flat_data)
      .enter()
      .append("rect")
      .datum(function (d) { return d; })
      .attr("class", function (d) { return "obj bar " + d.name.slice(4); })
      .attr("x", function (d) { return x(parseInt(d.name.split(" ")[2].split("_")[1])); })
      .attr("width", function (d) { return x.bandwidth() * d.length; })
      .attr("y", (margin.top + (height - margin.top - margin.bottom) / 2 + margin.middle))
      .attr("height", function (d) { return ySkip(d.strength / d.length) - (margin.top + (height - margin.top - margin.bottom) / 2 + margin.middle); })
      .attr("fill", skipping_color)
      .attr("stroke", line_color)
      .attr("opacity", 0.8)
      .lower()
      /* Hover over Exon feature view */
      .on("mouseover", function (d) {
        const data = d3.select(this).datum();

        d3.select("svg.feature-view-3").selectAll(".bar." + data.name.split(' ')[2])
          .attr("fill", skipping_highlight_color);
        d3.select(this).raise().attr("fill", skipping_highlight_color);
      })
      .on("mouseleave", function (d) {
        d3.select(this).attr("fill", skipping_color);
        d3.select("svg.feature-view-3").selectAll(".bar")
          .attr("fill", skipping_color);
      })
      .attr("y", (margin.top + (height - margin.top - margin.bottom) / 2 + margin.middle))
      .attr("height", function (d) { return ySkip(d.strength / d.length) - (margin.top + (height - margin.top - margin.bottom) / 2 + margin.middle); });
      // .delay(function (d, i) { return (i * 10); });
  }
}
/**
 * nucleotideSort
 */
function nucleotideSort(pos, margin, width, height, svg_sort, svg_zoom, colors) {
  const inclusionColor = colors[2]
  const inclusionHighlightColor = colors[3]
  const skippingColor = colors[0]
  const skippingHighlightColor = colors[1]

  const heightRatio = height / 622;
  const widthRatio = width / 292;


  svg_sort.selectAll("*").remove(); // Clear SVG before redrawing

  // Add title
  svg_sort.append("text")
    .attr("x", width / 2)
    .attr("y", margin.top / 2 + 5)
    .attr("text-anchor", "middle")
    .style('font-size', `${14 * widthRatio}px`)
    .text("Nucleotide View");

  // Data preparation
  if (d3.selectAll(`.obj.incl.${pos}`).size() == 0) { var inclData = []; }
  else {
    var inclData = flatten_nested_json(d3.selectAll(`.obj.incl.${pos}`).datum());
  }
  if (d3.selectAll(`.obj.skip.${pos}`).size() == 0) { var skipData = []; }
  else {
    var skipData = flatten_nested_json(d3.selectAll(`.obj.skip.${pos}`).datum());
  }

  const maxStrength = 6;

  const fillerData = [
    { 'name': '1', 'strength': 0, 'length': 0 }, { 'name': '2', 'strength': 0, 'length': 0 },
    { 'name': '3', 'strength': 0, 'length': 0 }, { 'name': '4', 'strength': 0, 'length': 0 },
    { 'name': '5', 'strength': 0, 'length': 0 }, { 'name': '6', 'strength': 0, 'length': 0 },
    { 'name': '7', 'strength': 0, 'length': 0 }, { 'name': '8', 'strength': 0, 'length': 0 },
    { 'name': '9', 'strength': 0, 'length': 0 }, { 'name': '0', 'strength': 0, 'length': 0 },
  ];
  const topInclData = inclData.sort((a, b) => b.strength - a.strength).concat(fillerData).slice(0, 10);
  const topSkipData = skipData.sort((a, b) => b.strength - a.strength).concat(fillerData).slice(0, 10);

  // X axis setup
  const sortXIncl = d3.scaleBand()
    .range([margin.left, width - margin.right])
    .domain(topInclData.map(d => d.name))
    .paddingInner(0.2)
    .paddingOuter(0.25);

  const sortXSkip = d3.scaleBand()
    .range([margin.left, width - margin.right])
    .domain(topSkipData.map(d => d.name))
    .padding(0.2);

  const sortXInclAxis = d3.axisBottom(sortXIncl).tickSize(0);
  const sortXSkipAxis = d3.axisTop(sortXSkip).tickSize(0);

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
    .attr("font-size", `${12 * heightRatio}px`)
    .attr("transform", "rotate(-90)")
    .style("fill", background_color)
    .text("Inclusion strength (a.u.)");

  const sortSkipYLabel = svg_sort.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "middle")
    .attr("x", -(margin.top / 2 + (height - margin.top - margin.bottom) / 4 + margin.middle / 2 + height / 2 - margin.bottom / 2))
    .attr("y", margin.left)
    .attr("dy", "-2.25em")
    .attr("font-size", `${12 * heightRatio}px`)
    .attr("transform", "rotate(-90)")
    .style("fill", background_color)
    .text("Skipping strength (a.u.)");

  // X axis rendering
  sortXInclAxis.tickFormat(() => "");
  sortXSkipAxis.tickFormat(() => "");

  sortGxIncl.call(sortXInclAxis)
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-50)");

  sortGxSkip.call(sortXSkipAxis)
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-50)");

  // Y axis rendering
  sortInclYLabel.style("fill", "black");
  sortSkipYLabel.style("fill", "black");
  sortGYIncl.call(d3.axisLeft(sortYIncl).ticks(5));
  sortGYSkip.call(d3.axisLeft(sortYSkip).ticks(5));

  // Remove previous bars
  svg_sort.selectAll(".incl.narrow-bar")
    .attr("y", sortYIncl(0))
    .attr("height", 0)
    .remove();

  svg_sort.selectAll(".skip.narrow-bar")
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

  /* Hover over Nucleotide sort view */
  inclBars.on("mouseover", function (event, d) {
    d3.select(this).attr("fill", inclusionHighlightColor);
    const featureClass = d3.select(this).attr("class").split(" ")[3];
    var featureName = featureClass.split("-")[1];
    var className = featureName.split('_')[0];
    d3.select('div.feature-legend-container')
      .select('.background.' + featureName)
      .style("fill", getFillColor(className));
    d3.selectAll(`.incl.wide-bar.${featureClass}`)
      .raise()
      .attr("fill", inclusionHighlightColor)
      .attr("opacity", 1);
    d3.selectAll(`.annotate.incl.${featureClass}`)
      .raise()
      .attr("opacity", 0);
  });

  inclBars.on("mouseout", function (event, d) {
    d3.select(this).attr("fill", inclusionColor);
    svg_zoom.selectAll(".incl.wide-bar").attr("fill", inclusionColor).attr("opacity", 0.5);
    svg_zoom.selectAll(".incl.annotate").attr("opacity", 0);
    resetHighlight();
  });

  inclBars.attr("y", d => sortYIncl(d.strength))
    .attr("height", d => (margin.top + (height - margin.top - margin.bottom) / 2 - margin.middle) - sortYIncl(d.strength));
    // .delay((_, i) => i * 10);

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

  /* Hover over Nucleotide sort view */
  skipBars.on("mouseover", function (event, d) {
    d3.select(this).attr("fill", skippingHighlightColor);
    const featureClass = d3.select(this).attr("class").split(" ")[3];
    var featureName = featureClass.split("-")[1];
    var className = featureName.split('_')[0];
    d3.select('div.feature-legend-container')
      .select('.background.' + featureName)
      .style("fill", getFillColor(className));
    d3.selectAll(`.skip.wide-bar.${featureClass}`)
      .raise()
      .attr("fill", skippingHighlightColor)
      .attr("opacity", 1);
    d3.selectAll(`.annotate.skip.${featureClass}`)
      .raise()
      .attr("opacity", 0);
  });

  skipBars.on("mouseout", function (event, d) {
    d3.select(this).attr("fill", skippingColor);
    svg_zoom.selectAll(".skip.wide-bar").attr("fill", skippingColor).attr("opacity", 0.5);
    svg_zoom.selectAll(".skip.annotate").attr("opacity", 0);
    resetHighlight();
  });

  skipBars
    .attr("y", margin.top + (height - margin.top - margin.bottom) / 2 + margin.middle)
    .attr("height", d => sortYSkip(d.strength) - (margin.top + (height - margin.top - margin.bottom) / 2 + margin.middle));
    // .delay((_, i) => i * 10);
}
/**
 * nucleotideZoom
 */
function nucleotideZoom(sequence, structs, pos, margin, zoom_width, height, svg_zoom, max_strength, colors) {
  const heightRatio = height / 622;
  const widthRatio = zoom_width / 292;
  const int_pos = parseInt(pos.slice(4));
  const positions = Array.from({ length: 11 }, (_, i) => i - 5);

  const inclusionColor = colors[2]
  const skippingColor = colors[0]
  const zoom_x = d3.scaleBand()
    .range([margin.left, zoom_width - margin.right])
    .domain(positions)
    .padding(0);

  /* Change y range to a fix range */
  max_strength = 6;
  const zoom_yIncl = d3.scaleLinear()
    .domain([0, max_strength])
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

    // .style("font-size", "14px")
    .style('font-size', `${14 * widthRatio}px`)

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

  zoom_xAxis.tickFormat((d) => structs[int_pos - 1 + d])
  zoom_xSkipAxis.tickFormat((d) => (d % 5 === 0 && int_pos + d - 10 > 0 && int_pos + d - 10 < 71) ? int_pos + d - 10 : "");
  zoom_xNuAxis.tickFormat((d) => sequence[int_pos - 1 + d]);

  zoom_gxIncl.call(zoom_xAxis);
  zoom_gxSkip.call(zoom_xSkipAxis);
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
    .attr("font-size", `${12 * heightRatio}px`)
    .attr("transform", "rotate(-90)")
    .style("fill", background_color)
    .text("Inclusion strength (a.u.)");

  const zoom_skip_ylabel = svg_zoom.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "middle")
    .attr("x", -(margin.top / 2 + (height - margin.top - margin.bottom) / 4 + margin.middle / 2 + height / 2 - margin.bottom / 2))
    .attr("y", margin.left)
    .attr("dy", "-3.25em")
    .attr("font-size", `${12 * heightRatio}px`)
    .attr("transform", "rotate(-90)")
    .style("fill", background_color)
    .text("Skipping strength (a.u.)");

  zoom_incl_ylabel.style("fill", "black");
  zoom_skip_ylabel.style("fill", "black");
  zoom_gyIncl.call(d3.axisLeft(zoom_yIncl).ticks(5));
  zoom_gySkip.call(d3.axisLeft(zoom_ySkip).ticks(5));

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

  left_border.raise().attr("opacity", 1);
  right_border.raise().attr("opacity", 1);

  // Data
  if (d3.selectAll(`.obj.incl.${pos}`).size() == 0) { var incl_data = []; }
  else {
    var incl_data = flatten_nested_json(d3.selectAll(`.obj.incl.${pos}`).datum());
  }
  if (d3.selectAll(`.obj.skip.${pos}`).size() == 0) { var skip_data = []; }
  else {
    var skip_data = flatten_nested_json(d3.selectAll(`.obj.skip.${pos}`).datum());
  }
  const max_incl = d3.max(incl_data.map((d) => d.strength));
  const max_skip = d3.max(skip_data.map((d) => d.strength));
  max_strength = d3.max([max_incl, max_skip]);

  // Remove previous bars
  svg_zoom.selectAll(".incl.wide-bar")
    .attr("y", zoom_yIncl(0))
    .attr("height", 0)
    .remove();

  svg_zoom.selectAll(".skip.wide-bar")
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

  inclBars.attr("y", (d) => zoom_yIncl(d.strength))
    .attr("height", (d) => (margin.top + (height - margin.top - margin.bottom) / 2 - margin.middle) - zoom_yIncl(d.strength));
    // .delay((_, i) => i * 10);

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

  skipBars
    .attr("y", margin.top + (height - margin.top - margin.bottom) / 2 + margin.middle)
    .attr("height", (d) => zoom_ySkip(d.strength) - (margin.top + (height - margin.top - margin.bottom) / 2 + margin.middle));
    // .delay((_, i) => i * 10);

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

  inclFeatureText.attr("opacity", 0);

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

  skipFeatureText.attr("opacity", 0);
}