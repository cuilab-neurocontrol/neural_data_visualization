// Conversion factor: 1 cm = 37.7952755906 pixels
const CM_TO_PX = 37.7952755906;

// Get the container and dimensions in cm
const container = document.getElementById("my_dataviz");
let width = parseFloat(container.dataset.width) * CM_TO_PX; // Convert cm to pixels
let height = parseFloat(container.dataset.height) * CM_TO_PX; // Convert cm to pixels

// Get initial margins in cm and convert to pixels
let margin = {
  top: 1 * CM_TO_PX,
  right: 1 * CM_TO_PX,
  bottom: 1 * CM_TO_PX,
  left: 1.5 * CM_TO_PX,
};

// Axis margins in cm (converted to pixels)
let axisMargin = {
  x: 0.5 * CM_TO_PX,
  y: 0.5 * CM_TO_PX,
};

// Axis and tick styling
let tickCount = 10; // Number of ticks
let axisLineWidth = 2; // Axis line width in pixels
let tickLineWidth = 1; // Tick line width in pixels
let tickFontSize = 12; // Tick font size in pixels
let tickLength = 6; // Tick length in pixels

// Function to create or update the SVG
function createChart() {
  // Clear existing SVG
  d3.select("#my_dataviz").html("");

  // Append the SVG object to the body of the page
  const svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Read the data
  d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/data_IC.csv").then(function (data) {
    // Add X axis
    const x = d3.scaleLinear()
      .domain([1, 100]) // Specify the domain of the X axis
      .range([0, width]);

    const xAxis = d3.axisBottom(x)
      .ticks(tickCount) // Set the number of ticks
      .tickSize(tickLength) // Set the tick size (length of the tick lines)
      .tickFormat(d3.format(".0f")); // Format the tick labels (e.g., integers)

    svg.append("g")
      .attr("transform", `translate(${axisMargin.x}, ${height})`) // Translate X axis
      .call(xAxis)
      .selectAll("text") // Customize tick labels
      .style("font-size", `${tickFontSize}px`) // Set font size
      .style("font-family", "Arial"); // Set font family

    // Customize X axis line and ticks
    svg.selectAll(".domain") // Axis line
      .style("stroke-width", axisLineWidth + "px"); // Set axis line width

    svg.selectAll(".tick line") // Tick lines
      .style("stroke-width", tickLineWidth + "px"); // Set tick line width

    // Add Y axis
    const y = d3.scaleLinear()
      .domain([0, 13]) // Specify the domain of the Y axis
      .range([height, 0]);

    const yAxis = d3.axisLeft(y)
      .ticks(tickCount) // Set the number of ticks
      .tickSize(tickLength) // Set the tick size (length of the tick lines)
      .tickFormat(d => `${d} units`); // Customize tick labels (e.g., add units)

    svg.append("g")
      .attr("transform", `translate(0, ${-axisMargin.y})`) // Translate Y axis
      .call(yAxis)
      .selectAll("text") // Customize tick labels
      .style("font-size", `${tickFontSize}px`) // Set font size
      .style("font-family", "Arial"); // Set font family

    // Customize Y axis line and ticks
    svg.selectAll(".domain") // Axis line
      .style("stroke-width", axisLineWidth + "px"); // Set axis line width

    svg.selectAll(".tick line") // Tick lines
      .style("stroke-width", tickLineWidth + "px"); // Set tick line width

    // Show confidence interval
    svg.append("path")
      .datum(data)
      .attr("fill", "#cce5df")
      .attr("stroke", "none")
      .attr("d", d3.area()
        .x(function (d) { return x(d.x) + axisMargin.x; }) // 同步 X 平移
        .y0(function (d) { return y(d.CI_right) - axisMargin.y; }) // 同步 Y 平移
        .y1(function (d) { return y(d.CI_left) - axisMargin.y; }) // 同步 Y 平移
      );

    // Add the line
    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
        .x(function (d) { return x(d.x) + axisMargin.x; }) // 同步 X 平移
        .y(function (d) { return y(d.y) - axisMargin.y; }) // 同步 Y 平移
      );
  });
}

// Initial chart creation
createChart();

// Add event listener to the update button
document.getElementById("update").addEventListener("click", function () {
  // Get new width and height from input fields (in cm)
  const newWidth = parseFloat(document.getElementById("width").value) * CM_TO_PX; // Convert cm to pixels
  const newHeight = parseFloat(document.getElementById("height").value) * CM_TO_PX; // Convert cm to pixels

  // Get new margins from input fields (in cm)
  margin.top = parseFloat(document.getElementById("margin-top").value) * CM_TO_PX;
  margin.right = parseFloat(document.getElementById("margin-right").value) * CM_TO_PX;
  margin.bottom = parseFloat(document.getElementById("margin-bottom").value) * CM_TO_PX;
  margin.left = parseFloat(document.getElementById("margin-left").value) * CM_TO_PX;

  // Get new axis margins from input fields (in cm)
  axisMargin.x = parseFloat(document.getElementById("axis-margin-x").value) * CM_TO_PX;
  axisMargin.y = parseFloat(document.getElementById("axis-margin-y").value) * CM_TO_PX;

  // Get new axis and tick styling from input fields
  tickCount = parseInt(document.getElementById("tick-count").value);
  axisLineWidth = parseFloat(document.getElementById("axis-line-width").value);
  tickLineWidth = parseFloat(document.getElementById("tick-line-width").value);
  tickFontSize = parseFloat(document.getElementById("tick-font-size").value);

  // Update dimensions
  width = newWidth - margin.left - margin.right;
  height = newHeight - margin.top - margin.bottom;

  // Recreate the chart with the new settings
  createChart();
});