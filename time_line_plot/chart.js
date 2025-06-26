// 全局数组，用于存放添加的 area 配置
function createAreaControl(index) {
  const div = document.createElement("div");
  div.className = "area-control";
  div.dataset.index = index;
  div.innerHTML = `
    <h4>Area ${index + 1} <button class="delete-area">Delete</button></h4>
    <div class="control-row">
      <label>Data URL:</label>
      <input type="text" class="area-data-url" placeholder="Enter CSV URL">
      <button class="load-area-data-url">Load Data from URL</button>
    </div>
    <div class="control-row">
      <label>Upload CSV:</label>
      <input type="file" class="area-data-file" accept=".csv">
      <button class="load-area-data-file">Load Data from File</button>
    </div>
    <div class="control-row">
      <label>Area Color:</label>
      <input type="color" class="area-color" value="#cce5df">
      <label>Opacity:</label>
      <input type="number" class="area-opacity" value="0.5" min="0" max="1" step="0.1">
    </div>
    <div class="control-row">
      <label>Orientation:</label>
      <select class="area-orientation">
        <option value="horizontal">Horizontal</option>
        <option value="vertical">Vertical</option>
      </select>
      <label>Length (units):</label>
      <input type="number" class="area-length" value="100" min="0" step="1">
    </div>
  `;
  
  // 构造 area 对象，初始时 data 为空
  const areaObj = { data: null, control: div };

  // 通过 URL 加载 CSV 数据
  div.querySelector(".load-area-data-url").addEventListener("click", function() {
    const url = div.querySelector(".area-data-url").value;
    if (!url) return;
    d3.csv(url).then(data => {
      areaObj.data = data;
      createChart();  // 重新绘制图表来显示新加载的 area
    }).catch(error => {
      console.error("Error loading CSV from URL for Area:", error);
    });
  });

  // 通过文件上传加载 CSV 数据
  div.querySelector(".load-area-data-file").addEventListener("click", function() {
    const fileInput = div.querySelector(".area-data-file");
    if (!fileInput.files || fileInput.files.length === 0) return;
    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
      const text = e.target.result;
      const data = d3.csvParse(text);
      areaObj.data = data;
      createChart();  // 重新绘制图表以显示新加载的 area
    };
    reader.onerror = function(error) {
      console.error("Error reading CSV file for Area:", error);
    };
    reader.readAsText(file);
  });

  // 为删除按钮绑定事件
  div.querySelector(".delete-area").addEventListener("click", function() {
    const idx = parseInt(div.dataset.index, 10);
    areasList.splice(idx, 1);
    div.remove();
    // 更新剩余 area-control 的索引
    document.querySelectorAll(".area-control").forEach((ctrl, i) => {
      ctrl.dataset.index = i;
    });
    createChart();
  });

  return areaObj;
}

function createTextControl(index) {
  const div = document.createElement("div");
  div.className = "text-control";
  div.dataset.index = index;
  div.innerHTML = `
    <h4>Text ${index + 1} <button class="delete-text">Delete</button></h4>
    <div class="control-row">
      <label>String:</label>
      <input type="text" class="text-string" placeholder="Enter string" value="Sample Text">
    </div>
    <div class="control-row">
      <label>X Coordinate:</label>
      <input type="number" class="text-coordinate-x" value="0">
      <label>Y Coordinate:</label>
      <input type="number" class="text-coordinate-y" value="0">
    </div>
    <div class="control-row">
      <label>Font Size (px):</label>
      <input type="number" class="text-font-size" value="16" min="1" step="1">
      <label>Font Family:</label>
      <select class="text-font-family">
        <option value="Arial">Arial</option>
        <option value="Courier New">Courier New</option>
        <option value="Times New Roman">Times New Roman</option>
        <option value="Verdana">Verdana</option>
      </select>
    </div>
    <div class="control-row">
      <label>Font Color:</label>
      <input type="color" class="text-font-color" value="#000000">
      <label>Font Weight:</label>
      <select class="text-bold">
         <option value="normal">Normal</option>
         <option value="bold">Bold</option>
         <option value="bolder">Bolder</option>
         <option value="lighter">Lighter</option>
      </select>
      <label>Orientation:</label>
      <select class="text-orientation">
        <option value="horizontal">Horizontal</option>
        <option value="vertical">Vertical</option>
      </select>
    </div>
  `;
  
  // 绑定删除按钮事件
  div.querySelector(".delete-text").addEventListener("click", function() {
    const idx = parseInt(div.dataset.index, 10);
    textList.splice(idx, 1);
    div.remove();
    // 更新剩余的文本控制块索引
    document.querySelectorAll(".text-control").forEach((ctrl, i) => {
      ctrl.dataset.index = i;
    });
    createChart();
  });
  
  return div;
}

function createLineControl(index) {
  const div = document.createElement("div");
  div.className = "line-control";
  div.dataset.index = index;
  div.innerHTML = `
    <h4>Line ${index + 1} <button class="delete-line">Delete</button></h4>
    <div class="control-row">
      <label>Type:</label>
      <select class="line-type">
        <option value="vertical">Vertical</option>
        <option value="horizontal">Horizontal</option>
      </select>
      <label>X Coordinate:</label>
      <input type="number" class="line-coordinate-x" value="0">
      <label>Y Coordinate:</label>
      <input type="number" class="line-coordinate-y" value="0">
    </div>
    <div class="control-row">
      <label>Color:</label>
      <input type="color" class="line-color" value="#000000">
      <label>Thickness (px):</label>
      <input type="number" class="line-thickness" value="1" min="1" step="0.1">
    </div>
    <div class="control-row">
      <label>Style:</label>
      <select class="line-style">
        <option value="solid">Solid</option>
        <option value="dashed">Dashed</option>
      </select>
      <label>Length (unit):</label>
      <input type="number" class="line-length" value="100" min="0" step="1">
    </div>
  `;
  
  // 为删除按钮绑定事件
  div.querySelector(".delete-line").addEventListener("click", function() {
    const idx = parseInt(div.dataset.index, 10);
    linesList.splice(idx, 1);
    div.remove();
    document.querySelectorAll(".line-control").forEach((ctrl, i) => {
      ctrl.dataset.index = i;
    });
    createChart();
  });
  
  return div;
}

// 创建系列控制块，包含线条颜色、粗细、阴影参数
function createSeriesControl(index) {
  const div = document.createElement("div");
  div.className = "series-control";
  div.dataset.index = index;
  div.innerHTML = `
    <h3>Series ${index + 1} <button class="delete-series">Delete</button></h3>
    <div class="control-row">
      <label>Line Color:</label>
      <input type="color" class="line-color" value="#ff0000">
      <label>Line Thickness (px):</label>
      <input type="number" class="line-thickness" value="2" min="1" step="0.1">
    </div>
    <div class="control-row">
      <label>Show Shadow:</label>
      <input type="checkbox" class="show-shadow" checked>
      <label>Shadow Color:</label>
      <input type="color" class="shadow-color" value="#FF5C5C">
      <label>Shadow Opacity:</label>
      <input type="number" class="shadow-opacity" value="0.3" min="0" max="1" step="0.1">
    </div>
    <div class="control-row">
      <label>Description:</label>
      <input type="text" class="series-description" placeholder="Enter description">
    </div>
  `;

  // 为删除按钮绑定事件
  div.querySelector(".delete-series").addEventListener("click", function() {
    // 获取当前系列的索引（字符串需转换为数字）
    const idx = parseInt(div.dataset.index, 10);
    // 从全局数组中移除该系列
    seriesList.splice(idx, 1);
    // 从DOM中删除该控制块
    div.remove();
    // 重新更新剩余控制块的索引（可选，对于展示编号）
    const controls = document.querySelectorAll(".series-control");
    controls.forEach((ctrl, i) => ctrl.dataset.index = i);
    // 重新绘制图表
    createChart();
  });

  return div;
}

// Conversion factor: 1 cm = 37.7952755906 pixels
const CM_TO_PX = 37.7952755906;
const PT_TO_PX = 1.333;
let seriesList = [];
let linesList = [];
let textList = [];
let areasList = [];

// Get the container and dimensions in cm
const container = document.getElementById("my_dataviz");
let width = parseFloat(container.dataset.width) * CM_TO_PX; // Convert cm to pixels
let height = parseFloat(container.dataset.height) * CM_TO_PX; // Convert cm to pixels

// Get initial margins in cm and convert to pixels
let margin = {
  top: 2 * CM_TO_PX,
  right: 2 * CM_TO_PX,
  bottom: 2 * CM_TO_PX,
  left: 2 * CM_TO_PX,
};

// Axis margins in cm (converted to pixels)
let axisMargin = {
  x: 0.3 * CM_TO_PX,
  y: 0 * CM_TO_PX,
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
let tickLineWidth = 2; // Tick line width in pixels
let tickFontSize = 18; // Tick font size in pixels
let tickLength = 6; // Tick length in pixels
let xtickPositions = [0,10,20,30,40,50,60,70,80,90,100]; // Default tick positions
let xtickLabels = ['0',' ','20',' ','40',' ','60',' ','80',' ','100']; // Default tick labels
let ytickPositions = [-2,0,2,4,6,8,10,12,14]; // Default Y tick positions
let ytickLabels = ['-2',' ','2',' ','6',' ','10',' ','14']; // Default Y tick labels
let tickFontFamily = "Arial"; // Default font family
let tickOrientation = "outward"; // Default tick orientation

// Get user-defined domains
const xDomainMin = parseFloat(document.getElementById("x-domain-min").value);
const xDomainMax = parseFloat(document.getElementById("x-domain-max").value);
const yDomainMin = parseFloat(document.getElementById("y-domain-min").value);
const yDomainMax = parseFloat(document.getElementById("y-domain-max").value);
const showOuterTicks = document.getElementById("show-outer-ticks").checked;
const xLabel = document.getElementById("x-label").value;
const xLabelFontSize = parseFloat(document.getElementById("x-label-font-size").value);
const xLabelFontFamily = document.getElementById("x-label-font-family").value;
const yLabel = document.getElementById("y-label").value;
const yLabelFontSize = parseFloat(document.getElementById("y-label-font-size").value);
const yLabelFontFamily = document.getElementById("y-label-font-family").value;
const chartTitle = document.getElementById("chart-title").value;
const titleFontSize = parseFloat(document.getElementById("title-font-size").value);
const titleFontFamily = document.getElementById("title-font-family").value;
const titleFontWeight = document.getElementById("title-font-weight").value;
const titleDistancePt = parseFloat(document.getElementById("title-distance").value);
const titleDistancePx = titleDistancePt * PT_TO_PX;
const showTitle = document.getElementById("show-title").checked;
const showXAxis = document.getElementById("show-x-axis").checked;
const showYAxis = document.getElementById("show-y-axis").checked;
const showScaleBar = document.getElementById("show-scale-bar").checked;
const showXLabel = document.getElementById("show-x-label").checked;
const showYLabel = document.getElementById("show-y-label").checked;

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
tickLength = parseFloat(document.getElementById("tick-length").value);

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
xtickPositions = document.getElementById("x-tick-positions").value.split(",").map(Number);
xtickLabels = document.getElementById("x-tick-labels").value.split(",");
ytickPositions = document.getElementById("y-tick-positions").value.split(",").map(Number);
ytickLabels = document.getElementById("y-tick-labels").value.split(",");

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

  // Add X axis
  const x = d3.scaleLinear()
      .domain([xDomainMin, xDomainMax]) // Specify the domain of the X axis
      .range([0, width]);
  // Add Y axis
  const y = d3.scaleLinear()
      .domain([yDomainMin, yDomainMax]) // Specify the domain of the Y axis
      .range([height, 0]);

  if (showTitle) {
    svg.append("text")
    .attr("x", (width) / 2)
    .attr("y", -titleDistancePx-axisMargin.y)
    .attr("dominant-baseline", "ideographic")  // 使用下沿作为基线
    .style("text-anchor", "middle")
    .style("font-size", `${titleFontSize}px`)
    .style("font-family", titleFontFamily)
    .style("font-weight", titleFontWeight)
    .text(chartTitle);
  }

  if (showXAxis) {
      const xAxis = d3.axisBottom(x)
      //.ticks(tickCount) // Set the number of ticks
      .tickValues(xtickPositions) // Set custom tick positions
      //.tickSize(tickLength) // Set the tick size (length of the tick lines)
      .tickSize(tickLength * (tickOrientation === "inward" ? -1 : 1))
      //.tickFormat(d3.format(".0f")); // Format the tick labels (e.g., integers)
      .tickFormat((d, i) => xtickLabels[i] || d) // Set custom tick labels
      .tickSizeOuter(showOuterTicks ? tickLength : 0); // Control outer ticks

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
  }
  
  if (showYAxis) {
      const yAxis = d3.axisLeft(y)
      //.ticks(tickCount) // Set the number of ticks
      .tickValues(ytickPositions) // Set custom tick positions
      //.tickSize(tickLength) // Set the tick size (length of the tick lines)
      .tickSize(tickLength * (tickOrientation === "inward" ? -1 : 1))
      //.tickFormat(d => `${d} units`); // Customize tick labels (e.g., add units)
      .tickFormat((d, i) => ytickLabels[i] || d) // Set custom tick labels
      .tickSizeOuter(showOuterTicks ? tickLength : 0); // Control outer ticks

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
  // Add X axis label
  //const xLabelDistance = 26;
  if (showXLabel) {
    const xLabelDistance = tickLength+tickFontSize+6 * PT_TO_PX;
    svg.append("text")
    .attr("x", (width) / 2 +axisMargin.x) // Center the label horizontally
    .attr("y", height + xLabelDistance) // Position below the X axis
    //.attr("y", height - xScaleBarPositiony+xLabelFontSize-3)
    .attr("dominant-baseline", "text-before-edge")  // 添加 hanging 属性
    .style("text-anchor", "middle")
    .style("font-size", `${xLabelFontSize}px`)
    .style("font-family", xLabelFontFamily)
    .text(xLabel);
  }
  // Add Y axis label
  if (showYLabel) {
    const yLabelDistance = tickLength + tickFontSize+6 * PT_TO_PX;
    svg.append("text")
    .attr("x", -(height) / 2+axisMargin.y) // Center the label vertically
    .attr("y", -yLabelDistance) // Position to the left of the Y axis
    .attr("dominant-baseline", "ideographic")  // 使用下沿作为基线
    .attr("transform", "rotate(-90)") // Rotate the label
    .style("text-anchor", "middle")
    .style("font-size", `${yLabelFontSize}px`)
    .style("font-family", yLabelFontFamily)
    .text(yLabel);
  }

  seriesList.forEach(series => {
    const control = series.control;
    const lineColor = control.querySelector(".line-color").value;
    const lineThickness = parseFloat(control.querySelector(".line-thickness").value);
    const showShadow = control.querySelector(".show-shadow").checked;
    const shadowColor = control.querySelector(".shadow-color").value;
    const shadowOpacity = parseFloat(control.querySelector(".shadow-opacity").value);

    // Show confidence interval
    if (showShadow){
    svg.append("path")
      .datum(series.data)
      .attr("fill", shadowColor)
      .attr("fill-opacity", shadowOpacity)
      .attr("stroke", "none")
      .attr("d", d3.area()
        .x(function (d) { return x(d.x) + axisMargin.x; }) // 同步 X 平移
        .y0(function (d) { return y(d.CI_right) - axisMargin.y; }) // 同步 Y 平移
        .y1(function (d) { return y(d.CI_left) - axisMargin.y; }) // 同步 Y 平移
      );
    }
    // Add the line
    svg.append("path")
      .datum(series.data)
      .attr("fill", "none")
      .attr("stroke", lineColor)
      .attr("stroke-width", lineThickness)
      .attr("d", d3.line()
        .x(function (d) { return x(d.x) + axisMargin.x; }) // 同步 X 平移
        .y(function (d) { return y(d.y) - axisMargin.y; }) // 同步 Y 平移
      );
  });

  // 在 createChart() 中，绘制新增的线条
  linesList.forEach(lineItem => {
    const control = lineItem.control;
    const type = control.querySelector(".line-type").value;
    const coordinateX = parseFloat(control.querySelector(".line-coordinate-x").value);
    const coordinateY = parseFloat(control.querySelector(".line-coordinate-y").value);
    const color = control.querySelector(".line-color").value;
    const thickness = parseFloat(control.querySelector(".line-thickness").value);
    const style = control.querySelector(".line-style").value; // "solid" 或 "dashed"
    const length = parseFloat(control.querySelector(".line-length").value);
    const dasharray = style === "dashed" ? "5,5" : null;
    const ylength = y(0) - y(length);
    if(type === "vertical"){
      // 垂直线：X 坐标固定；Y 坐标从设定值开始，向上延伸 length 像素
      const xPos = x(coordinateX) + axisMargin.x;
      const yPos = y(coordinateY);
      svg.append("line")
        .attr("x1", xPos)
        .attr("y1", yPos)
        .attr("x2", xPos)
        .attr("y2", yPos - ylength)
        .attr("stroke", color)
        .attr("stroke-width", thickness)
        .attr("stroke-dasharray", dasharray);
    }
    else if(type === "horizontal"){
      // 水平线：Y 坐标固定；X 坐标从设定值开始，向右延伸 length 像素
      const xLength = x(length) - x(0);
      const xPos = x(coordinateX) + axisMargin.x;
      const yPos = y(coordinateY);
      svg.append("line")
        .attr("x1", xPos)
        .attr("y1", yPos)
        .attr("x2", xPos + xLength)
        .attr("y2", yPos)
        .attr("stroke", color)
        .attr("stroke-width", thickness)
        .attr("stroke-dasharray", dasharray);
    }
  });

  // 绘制文本（字符串）
  textList.forEach(item => {
    const control = item.control;
    const textStr = control.querySelector(".text-string").value;
    const xPos = parseFloat(control.querySelector(".text-coordinate-x").value);
    const yPos = parseFloat(control.querySelector(".text-coordinate-y").value);
    const fontSize = control.querySelector(".text-font-size").value;
    const fontFamily = control.querySelector(".text-font-family").value;
    const fontColor = control.querySelector(".text-font-color").value;
    const fontWeight = control.querySelector(".text-bold").value;
    const orientation = control.querySelector(".text-orientation").value;
    
    // 根据 orientation 设置 transform（垂直时旋转 -90°）
    const transform = orientation === "vertical" ? `rotate(-90, ${xPos}, ${yPos})` : null;
    
    svg.append("text")
      .attr("x", x(xPos) + margin.left)  // 可根据实际需求调整位置转换
      .attr("y", y(yPos) + margin.top)
      .attr("transform", transform)
      .text(textStr)
      .style("font-size", `${fontSize}px`)
      .style("font-family", fontFamily)
      .style("fill", fontColor)
      .style("font-weight", fontWeight)
      .style("text-anchor", "middle");
  });
  
}

document.getElementById("add-text").addEventListener("click", function(){
  const index = textList.length;
  const textControl = createTextControl(index);
  textList.push({ control: textControl });
  document.getElementById("text-controls").appendChild(textControl);
});

document.getElementById("add-line").addEventListener("click", function() {
    const index = linesList.length;
    const lineControl = createLineControl(index);
    linesList.push({ control: lineControl });
    document.getElementById("line-controls").appendChild(lineControl);
});

// 处理通过文件上传的CSV
document.getElementById("data-files").addEventListener("change", function(e) {
  const files = e.target.files;
  Array.from(files).forEach(file => {
    const reader = new FileReader();
    reader.onload = function(evt) {
      const text = evt.target.result;
      const data = d3.csvParse(text); // 解析CSV数据
      // 创建一个系列控制块，该控制块只控制此数据系列
      const seriesControl = createSeriesControl(seriesList.length);
      // 保存数据与其控制块
      seriesList.push({ data, control: seriesControl });
      // 将该控制块添加到控制面板中
      document.getElementById("series-controls").appendChild(seriesControl);
    };
    reader.readAsText(file);
  });
});

// 处理通过URL添加CSV数据
document.getElementById("add-url").addEventListener("click", function() {
  const url = document.getElementById("data-url").value;
  if (!url) return;
  d3.csv(url).then(data => {
    const seriesControl = createSeriesControl(seriesList.length);
    seriesList.push({ data, control: seriesControl });
    document.getElementById("series-controls").appendChild(seriesControl);
  }).catch(error => {
    console.error("Error loading CSV from URL:", error);
  });
});

// 绑定 Add Area 按钮事件（确保 DOM 加载后运行）
document.getElementById("add-area").addEventListener("click", function() {
  const index = areasList.length;
  const areaObj = createAreaControl(index);
  areasList.push(areaObj);
  document.getElementById("area-controls").appendChild(areaObj.control);
});

// Initial chart creation
createChart();

// Add event listener to the update button
document.getElementById("update").addEventListener("click", function () {

  // Recreate the chart with the new settings
  createChart();
});