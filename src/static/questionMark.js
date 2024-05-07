const questionMark = svg
.append("g")
.attr("class", "question-mark");

questionMark
.append("circle")
.attr("class", "tooltip-question")
.attr("cx", width - 15)
.attr("cy", height - 15)
.attr("r", 7)
.style("fill", "whitesmoke")
.style("stroke", "black")
.style("stroke-width", "1px");

questionMark
.append("text")
.attr("x", width - 15)
.attr("y", height - 15)
.attr("text-anchor", "middle")
.attr("alignment-baseline", "middle")
.style("font-size", "10px")
.style("font-weight", "bold")
.text("?");