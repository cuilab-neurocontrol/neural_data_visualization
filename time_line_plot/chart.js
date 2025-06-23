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
      .domain([1, 100])
      .range([0, width]);

    svg.append("g")
      .attr("transform", `translate(${axisMargin.x}, ${height})`) // 平移 X 轴
      .call(d3.axisBottom(x));

    // Add Y axis
    const y = d3.scaleLinear()
      .domain([0, 13])
      .range([height, 0]);

    svg.append("g")
      .attr("transform", `translate(0, ${-axisMargin.y})`) // 平移 Y 轴
      .call(d3.axisLeft(y));

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

  // Update dimensions
  width = newWidth - margin.left - margin.right;
  height = newHeight - margin.top - margin.bottom;

  // Recreate the chart with the new dimensions and margins
  createChart();
});