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

// Scale bar settings
let xScaleBarPositionx = 0; // Default X scale bar Y position
let xScaleBarPositiony = 20; // Default X scale bar Y position
let xScaleBarWidth = 2; // Default X scale bar width
let xScaleBarLength = 100; // Default X scale bar length in units
let xScaleBarLabel = "100 units"; // Default X scale bar label
let xScaleBarLabelOrientation = "outward"; // Default X scale bar label orientation

let yScaleBarPositionx = 20; // Default Y scale bar X position
let yScaleBarPositiony = 0; // Default Y scale bar X position
let yScaleBarWidth = 2; // Default Y scale bar width
let yScaleBarLength = 2; // Default Y scale bar length in units
let yScaleBarLabel = "100 units"; // Default Y scale bar label
let yScaleBarLabelOrientation = "outward"; // Default Y scale bar label orientation

// Scale bar settings
let xScaleBarFontSize = 12; // Default X scale bar font size
let xScaleBarLabelDistance = 20; // Default X scale bar label distance
let xScaleBarFontFamily = "Arial"; // Default X scale bar font family

let yScaleBarFontSize = 12; // Default Y scale bar font size
let yScaleBarLabelDistance = 20; // Default Y scale bar label distance
let yScaleBarFontFamily = "Arial"; // Default Y scale bar font family

// Axis and tick styling
//let tickCount = 10; // Number of ticks
let axisLineWidth = 2; // Axis line width in pixels
let tickLineWidth = 1; // Tick line width in pixels
let tickFontSize = 12; // Tick font size in pixels
let tickLength = 6; // Tick length in pixels
let xtickPositions = [20,40,60,80,100]; // Default tick positions
let xtickLabels = ["20", "40", "60", "80", "100"]; // Default tick labels
let ytickPositions = [0, 2, 4, 6, 8, 10]; // Default Y tick positions
let ytickLabels = ["0", "2", "4", "6", "8", "10"]; // Default Y tick labels
let tickFontFamily = "Arial"; // Default font family
let tickOrientation = "outward"; // Default tick orientation

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
      // Add Y axis
    const y = d3.scaleLinear()
        .domain([0, 13]) // Specify the domain of the Y axis
        .range([height, 0]);

    const showAxis = document.getElementById("show-axis").checked;
    
    if (showAxis) {
        const xAxis = d3.axisBottom(x)
        //.ticks(tickCount) // Set the number of ticks
        .tickValues(xtickPositions) // Set custom tick positions
        //.tickSize(tickLength) // Set the tick size (length of the tick lines)
        .tickSize(tickLength * (tickOrientation === "inward" ? -1 : 1))
        //.tickFormat(d3.format(".0f")); // Format the tick labels (e.g., integers)
        .tickFormat((d, i) => xtickLabels[i] || d); // Set custom tick labels

        svg.append("g")
        .attr("transform", `translate(${axisMargin.x}, ${height})`) // Translate X axis
        .call(xAxis)
        .selectAll("text") // Customize tick labels
        .style("font-size", `${tickFontSize}px`) // Set font size
        .style("font-family", tickFontFamily); // Set font family
        

        // Customize X axis line and ticks
        svg.selectAll(".domain") // Axis line
        .style("stroke-width", axisLineWidth + "px"); // Set axis line width

        svg.selectAll(".tick line") // Tick lines
        .style("stroke-width", tickLineWidth + "px"); // Set tick line width

        const yAxis = d3.axisLeft(y)
        //.ticks(tickCount) // Set the number of ticks
        .tickValues(ytickPositions) // Set custom tick positions
        //.tickSize(tickLength) // Set the tick size (length of the tick lines)
        .tickSize(tickLength * (tickOrientation === "inward" ? -1 : 1))
        //.tickFormat(d => `${d} units`); // Customize tick labels (e.g., add units)
        .tickFormat((d, i) => ytickLabels[i] || d); // Set custom tick labels

        svg.append("g")
        .attr("transform", `translate(0, ${-axisMargin.y})`) // Translate Y axis
        .call(yAxis)
        .selectAll("text") // Customize tick labels
        .style("font-size", `${tickFontSize}px`) // Set font size
        .style("font-family", tickFontFamily); // Set font family

        // Customize Y axis line and ticks
        svg.selectAll(".domain") // Axis line
        .style("stroke-width", axisLineWidth + "px"); // Set axis line width

        svg.selectAll(".tick line") // Tick lines
        .style("stroke-width", tickLineWidth + "px"); // Set tick line width
    }
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

    const showScaleBar = document.getElementById("show-scale-bar").checked;
    if (showScaleBar) {
        const xScaleBarPixelLength = x(xScaleBarLength) - x(0);
        // Add scale bar for X axis
        svg.append("line")
        .attr("x1", xScaleBarPositionx)
        .attr("x2", xScaleBarPositionx+xScaleBarPixelLength) // Length of the scale bar in pixels
        .attr("y1", height - xScaleBarPositiony) // Position below the X axis
        .attr("y2", height - xScaleBarPositiony)
        .style("stroke", "black")
        .style("stroke-width", xScaleBarWidth);
        
        svg.append("text")
        .attr("x", xScaleBarPositionx+xScaleBarPixelLength / 2) // Center of the scale bar
        .attr(
            "y",
            height -
            xScaleBarPositiony +
            (xScaleBarLabelOrientation === "outward" ? xScaleBarLabelDistance : -xScaleBarLabelDistance)
        ) // Adjust label position based on orientation
        .style("text-anchor", "middle")
        .style("font-size", `${xScaleBarFontSize}px`)
        .style("font-family", xScaleBarFontFamily)
        .text(xScaleBarLabel);

        const yScaleBarPixelLength = y(0) - y(yScaleBarLength); // Convert units to pixels
        // Add scale bar for Y axis
        svg.append("line")
        .attr("x1", yScaleBarPositionx) // Position to the left of the Y axis
        .attr("x2", yScaleBarPositionx)
        .attr("y1", height-yScaleBarPositiony)
        .attr("y2", height-yScaleBarPositiony - yScaleBarPixelLength) // Length of the scale bar in pixels
        .style("stroke", "black")
        .style("stroke-width", yScaleBarWidth);

        const x_scaleLabelPosition = yScaleBarPositionx + (yScaleBarLabelOrientation === "outward" ? -yScaleBarLabelDistance : yScaleBarLabelDistance)
        svg.append("text")
        .attr("x",x_scaleLabelPosition) // Adjust label position based on orientation
        .attr("y", height -yScaleBarPositiony - yScaleBarPixelLength / 2) // Center of the scale bar
        .style("text-anchor", "middle")
        .style("font-size", `${yScaleBarFontSize}px`)
        .style("font-family", yScaleBarFontFamily)
        .attr("transform", `rotate(-90, ${x_scaleLabelPosition}, ${height-yScaleBarPositiony - yScaleBarPixelLength / 2})`) // Rotate text for Y axis
        .text(yScaleBarLabel);
    }
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
  //tickCount = parseInt(document.getElementById("tick-count").value);
  axisLineWidth = parseFloat(document.getElementById("axis-line-width").value);
  tickLineWidth = parseFloat(document.getElementById("tick-line-width").value);
  tickFontSize = parseFloat(document.getElementById("tick-font-size").value);
  tickFontFamily = document.getElementById("tick-font-family").value;
  tickOrientation = document.getElementById("tick-orientation").value;

  // Get new scale bar settings from input fields
  xScaleBarPositionx = parseFloat(document.getElementById("x-scale-bar-position-x").value);
  xScaleBarPositiony = parseFloat(document.getElementById("x-scale-bar-position-y").value);
  xScaleBarWidth = parseFloat(document.getElementById("x-scale-bar-width").value);
  xScaleBarLength = parseFloat(document.getElementById("x-scale-bar-length").value);
  xScaleBarLabel = document.getElementById("x-scale-bar-label").value;
  xScaleBarLabelOrientation = document.getElementById("x-scale-bar-label-orientation").value;

  yScaleBarPositionx = parseFloat(document.getElementById("y-scale-bar-position-x").value);
  yScaleBarPositiony = parseFloat(document.getElementById("y-scale-bar-position-y").value);
  yScaleBarWidth = parseFloat(document.getElementById("y-scale-bar-width").value);
  yScaleBarLength = parseFloat(document.getElementById("y-scale-bar-length").value);
  yScaleBarLabel = document.getElementById("y-scale-bar-label").value;
  yScaleBarLabelOrientation = document.getElementById("y-scale-bar-label-orientation").value;

  xScaleBarFontSize = parseFloat(document.getElementById("x-scale-bar-font-size").value);
  xScaleBarLabelDistance = parseFloat(document.getElementById("x-scale-bar-label-distance").value);
  xScaleBarFontFamily = document.getElementById("x-scale-bar-font-family").value;

  yScaleBarFontSize = parseFloat(document.getElementById("y-scale-bar-font-size").value);
  yScaleBarLabelDistance = parseFloat(document.getElementById("y-scale-bar-label-distance").value);
  yScaleBarFontFamily = document.getElementById("y-scale-bar-font-family").value;


  // Update dimensions
  width = newWidth - margin.left - margin.right;
  height = newHeight - margin.top - margin.bottom;

  // Get custom tick positions and labels
  xtickPositions = document
    .getElementById("x-tick-positions")
    .value.split(",")
    .map(Number);
  xtickLabels = document
    .getElementById("x-tick-labels")
    .value.split(",");

  ytickPositions = document
    .getElementById("y-tick-positions")
    .value.split(",")
    .map(Number);
  ytickLabels = document
    .getElementById("y-tick-labels")
    .value.split(",");

  // Recreate the chart with the new settings
  createChart();
});