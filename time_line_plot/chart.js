function createAreaControl(index, controlsDiv, chartDiv, config) {
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
      createChartForSubplot(controlsDiv, chartDiv, config);
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
      createChartForSubplot(controlsDiv, chartDiv, config);
    };
    reader.onerror = function(error) {
      console.error("Error reading CSV file for Area:", error);
    };
    reader.readAsText(file);
  });

  // 为删除按钮绑定事件
  div.querySelector(".delete-area").addEventListener("click", function() {
    const idx = parseInt(div.dataset.index, 10);
    config.areasList.splice(idx, 1);
    div.remove();
    // 更新索引
    const controls = controlsDiv.querySelectorAll(".area-control");
    controls.forEach((ctrl, i) => ctrl.dataset.index = i);
    createChartForSubplot(controlsDiv, chartDiv, config);
  });

  return areaObj;
}

function createTextControl(index, controlsDiv, chartDiv, config) {
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
    config.textList.splice(idx, 1);
    div.remove();
    // 更新索引
    const controls = controlsDiv.querySelectorAll(".text-control");
    controls.forEach((ctrl, i) => ctrl.dataset.index = i);
    // 刷新当前子图
    createChartForSubplot(controlsDiv, chartDiv, config);
  });

  return div;
}

function createLineControl(index, controlsDiv, chartDiv, config) {
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
    config.linesList.splice(idx, 1);
    div.remove();
    // 更新索引
    const controls = controlsDiv.querySelectorAll(".line-control");
    controls.forEach((ctrl, i) => ctrl.dataset.index = i);
    // 关键：刷新当前子图
    createChartForSubplot(controlsDiv, chartDiv, config);
  });

  return div;
}

// 创建系列控制块，包含线条颜色、粗细、阴影参数
function createSeriesControl(index, controlsDiv, chartDiv, config) {
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
    const idx = parseInt(div.dataset.index, 10);
    config.seriesList.splice(idx, 1);
    div.remove();
    // 更新索引
    const controls = controlsDiv.querySelectorAll(".series-control");
    controls.forEach((ctrl, i) => ctrl.dataset.index = i);
    // 关键：刷新当前子图
    createChartForSubplot(controlsDiv, chartDiv, config);
  });

  return div;
}

// Conversion factor: 1 cm = 37.7952755906 pixels
const CM_TO_PX = 37.7952755906;
const PT_TO_PX = 1;
let subplots = [];

function createSubplotInstance(baseConfig) {
  const subplotIndex = subplots.length + 1;

  // 子图容器
  const subplotDiv = document.createElement("div");
  subplotDiv.className = "subplot-instance";
  subplotDiv.style.position = "static";

  // 删除按钮
  const btnBar = document.createElement("div");
  btnBar.style.textAlign = "right";
  btnBar.innerHTML = `<button class="subplot-delete" style="color:#fff;background:#e74c3c;border:none;padding:4px 10px;border-radius:3px;cursor:pointer;">Delete</button>`;
  subplotDiv.appendChild(btnBar);

  // 位置控制区
  const posBar = document.createElement("div");
  posBar.style.display = "flex";
  posBar.style.alignItems = "center";
  posBar.style.gap = "8px";
  posBar.style.marginBottom = "4px";
  posBar.innerHTML = `
    <label style="font-size:0.95em;">X (cm):</label>
    <input type="number" class="subplot-x" value="2" min="0" step="0.00001" style="width:60px;">
    <label style="font-size:0.95em;">Y (cm):</label>
    <input type="number" class="subplot-y" value="${1 + subplotIndex}" min="0" step="0.00001" style="width:60px;">
    <span style="color:#aaa;font-size:0.9em;">(拖动或输入坐标)</span>
  `;
  subplotDiv.appendChild(posBar);

  document.getElementById("subplots-panel").appendChild(subplotDiv);

  // 标题（不可编辑）
  const titleBar = document.createElement("div");
  titleBar.style.display = "flex";
  titleBar.style.alignItems = "center";
  titleBar.style.gap = "10px";
  titleBar.style.marginBottom = "8px";
  titleBar.innerHTML = `
    <h3 style="margin:0;">Time Series Line Plot ${subplotIndex}</h3>
    <input type="text" class="subplot-desc" value="" style="width:30%;" placeholder="Description (可注释)">
  `;
  subplotDiv.appendChild(titleBar);

  // 可折叠菜单包裹所有控件
  const details = document.createElement("details");
  details.open = true;
  const summary = document.createElement("summary");
  summary.textContent = "Settings";
  details.appendChild(summary);

  // 控件区
  const controlsDiv = document.createElement("div");
  controlsDiv.className = "subplot-controls";
  controlsDiv.innerHTML = document.getElementById("control-panel").innerHTML;
  details.appendChild(controlsDiv);

  subplotDiv.appendChild(details);

  // 图表区
  const chartDiv = document.createElement("div");
  chartDiv.className = "subplot-chart";
  chartDiv.style.position = "absolute";
  chartDiv.style.left = posBar.querySelector(".subplot-x").value * CM_TO_PX + "px";
  chartDiv.style.top = posBar.querySelector(".subplot-y").value * CM_TO_PX + "px";
  subplotDiv.appendChild(chartDiv);

  // 默认位置设置（使用厘米）
  const defaultX = 2;  // 2cm from left
  const defaultY = subplotIndex * 3;  // 每个图表间隔3cm
  chartDiv.style.left = (defaultX * CM_TO_PX) + "px";
  chartDiv.style.top = (defaultY * CM_TO_PX) + "px";
  document.getElementById("canvas-area").appendChild(chartDiv);

  // 删除按钮事件
  btnBar.querySelector(".subplot-delete").onclick = function() {
    subplotDiv.remove();
    chartDiv.remove();
    // 如果你有 subplots 数组，也同步移除
    subplots = subplots.filter(s => s.div !== subplotDiv);
  };


  // config 增加 description 字段
  const config = baseConfig ? JSON.parse(JSON.stringify(baseConfig)) : {
    seriesList: [],
    linesList: [],
    textList: [],
    areasList: [],
    description: ""
  };

  // 绑定 description 输入框事件
  const descInput = titleBar.querySelector(".subplot-desc");
  descInput.value = config.description || "";
  descInput.addEventListener("input", () => { config.description = descInput.value; });

  // 克隆参数和控件
  controlsDiv.innerHTML = document.getElementById("control-panel").innerHTML;

  // 创建控件区和图表区
  controlsDiv.querySelector("#add-line").addEventListener("click", function() {
    const index = config.linesList.length;
    const lineControl = createLineControl(index, controlsDiv, chartDiv, config);
    config.linesList.push({ control: lineControl });
    controlsDiv.querySelector("#line-controls").appendChild(lineControl);
  });
  controlsDiv.querySelector("#add-text").addEventListener("click", function() {
    const index = config.textList.length;
    const textControl = createTextControl(index, controlsDiv, chartDiv, config);
    config.textList.push({ control: textControl });
    controlsDiv.querySelector("#text-controls").appendChild(textControl);
  });
  controlsDiv.querySelector("#add-area").addEventListener("click", function() {
    const index = config.areasList.length;
    const areaObj = createAreaControl(index, controlsDiv, chartDiv, config);
    config.areasList.push(areaObj);
    controlsDiv.querySelector("#area-controls").appendChild(areaObj.control);
  });
  controlsDiv.querySelector("#add-url").addEventListener("click", function() {
    const url = controlsDiv.querySelector("#data-url").value;
    if (!url) return;
    d3.csv(url).then(data => {
      const seriesControl = createSeriesControl(
        config.seriesList.length,
        controlsDiv,
        chartDiv,
        config
      );
      config.seriesList.push({ data, control: seriesControl });
      controlsDiv.querySelector("#series-controls").appendChild(seriesControl);
    });
  });
  controlsDiv.querySelector("#data-files").addEventListener("change", function(e) {
    const files = e.target.files;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = function(evt) {
        const text = evt.target.result;
        const data = d3.csvParse(text);
        const seriesControl = createSeriesControl(
          config.seriesList.length,
          controlsDiv,
          chartDiv,
          config
        );
        config.seriesList.push({ data, control: seriesControl });
        controlsDiv.querySelector("#series-controls").appendChild(seriesControl);
      };
      reader.readAsText(file);
    });
  });
  controlsDiv.querySelector("#update").addEventListener("click", function() {
    createChartForSubplot(controlsDiv, chartDiv, config);
  });

  // 位置输入框事件只影响 chartDiv
  const xInput = posBar.querySelector(".subplot-x");
  const yInput = posBar.querySelector(".subplot-y");
  xInput.addEventListener("input", () => {
    chartDiv.style.left = xInput.value * CM_TO_PX + "px";
  });
  yInput.addEventListener("input", () => {
    chartDiv.style.top = yInput.value * CM_TO_PX + "px";
  });

  // 支持鼠标拖拽只作用于 chartDiv
  chartDiv.onmousedown = function(e) {
    let startX = e.clientX, startY = e.clientY;
    let origLeft = parseInt(chartDiv.style.left), origTop = parseInt(chartDiv.style.top);
    function onMove(ev) {
      let dx = ev.clientX - startX, dy = ev.clientY - startY;
      chartDiv.style.left = (origLeft + dx) + "px";
      chartDiv.style.top = (origTop + dy) + "px";
      xInput.value = ((origLeft + dx)/CM_TO_PX).toFixed(5);
      yInput.value = ((origTop + dy)/CM_TO_PX).toFixed(5);
    }
    function onUp() {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    }
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  // 保存并渲染
  subplots.push({div: subplotDiv, config, controlsDiv, chartDiv});
  document.getElementById("subplots-container").appendChild(subplotDiv);
  createChartForSubplot(controlsDiv, chartDiv, config);
}

// 子图专用绘图函数（参数与主图一致，但用自己的config）
function createChartForSubplot(controlsDiv, chartDiv, config) {
  // 获取参数
  const CM_TO_PX = 37.7952755906;
  //const PT_TO_PX = 1.333;

  // 获取输入参数
  const xDomainMin = parseFloat(controlsDiv.querySelector("#x-domain-min").value);
  const xDomainMax = parseFloat(controlsDiv.querySelector("#x-domain-max").value);
  const yDomainMin = parseFloat(controlsDiv.querySelector("#y-domain-min").value);
  const yDomainMax = parseFloat(controlsDiv.querySelector("#y-domain-max").value);
  const showOuterTicks = controlsDiv.querySelector("#show-outer-ticks").checked;
  const xLabel = controlsDiv.querySelector("#x-label").value;
  const xLabelFontSize = parseFloat(controlsDiv.querySelector("#x-label-font-size").value);
  const xLabelFontFamily = controlsDiv.querySelector("#x-label-font-family").value;
  const yLabel = controlsDiv.querySelector("#y-label").value;
  const yLabelFontSize = parseFloat(controlsDiv.querySelector("#y-label-font-size").value);
  const yLabelFontFamily = controlsDiv.querySelector("#y-label-font-family").value;
  const chartTitle = controlsDiv.querySelector("#chart-title").value;
  const titleFontSize = parseFloat(controlsDiv.querySelector("#title-font-size").value);
  const titleFontFamily = controlsDiv.querySelector("#title-font-family").value;
  const titleFontWeight = controlsDiv.querySelector("#title-font-weight").value;
  const titleDistancePt = parseFloat(controlsDiv.querySelector("#title-distance").value);
  const titleDistancePx = titleDistancePt * PT_TO_PX;
  const showTitle = controlsDiv.querySelector("#show-title").checked;
  const showXAxis = controlsDiv.querySelector("#show-x-axis").checked;
  const showYAxis = controlsDiv.querySelector("#show-y-axis").checked;
  const showScaleBar = controlsDiv.querySelector("#show-scale-bar").checked;
  const showXLabel = controlsDiv.querySelector("#show-x-label").checked;
  const showYLabel = controlsDiv.querySelector("#show-y-label").checked;

  const newWidth = parseFloat(controlsDiv.querySelector("#width").value) * CM_TO_PX;
  const newHeight = parseFloat(controlsDiv.querySelector("#height").value) * CM_TO_PX;

  let margin = {
    top: parseFloat(controlsDiv.querySelector("#margin-top").value) * CM_TO_PX,
    right: parseFloat(controlsDiv.querySelector("#margin-right").value) * CM_TO_PX,
    bottom: parseFloat(controlsDiv.querySelector("#margin-bottom").value) * CM_TO_PX,
    left: parseFloat(controlsDiv.querySelector("#margin-left").value) * CM_TO_PX
  };

  let axisMargin = {
    x: parseFloat(controlsDiv.querySelector("#axis-margin-x").value) * CM_TO_PX,
    y: parseFloat(controlsDiv.querySelector("#axis-margin-y").value) * CM_TO_PX
  };

  let axisLineWidth = parseFloat(controlsDiv.querySelector("#axis-line-width").value);
  let tickLineWidth = parseFloat(controlsDiv.querySelector("#tick-line-width").value);
  let tickFontSize = parseFloat(controlsDiv.querySelector("#tick-font-size").value);
  let tickFontFamily = controlsDiv.querySelector("#tick-font-family").value;
  let tickOrientation = controlsDiv.querySelector("#tick-orientation").value;
  let tickLength = parseFloat(controlsDiv.querySelector("#tick-length").value);

  let xScaleBarPositionx = parseFloat(controlsDiv.querySelector("#x-scale-bar-position-x").value);
  let xScaleBarPositiony = parseFloat(controlsDiv.querySelector("#x-scale-bar-position-y").value);
  let xScaleBarWidth = parseFloat(controlsDiv.querySelector("#x-scale-bar-width").value);
  let xScaleBarLength = parseFloat(controlsDiv.querySelector("#x-scale-bar-length").value);
  let xScaleBarLabel = controlsDiv.querySelector("#x-scale-bar-label").value;
  let xScaleBarLabelOrientation = controlsDiv.querySelector("#x-scale-bar-label-orientation").value;

  let yScaleBarPositionx = parseFloat(controlsDiv.querySelector("#y-scale-bar-position-x").value);
  let yScaleBarPositiony = parseFloat(controlsDiv.querySelector("#y-scale-bar-position-y").value);
  let yScaleBarWidth = parseFloat(controlsDiv.querySelector("#y-scale-bar-width").value);
  let yScaleBarLength = parseFloat(controlsDiv.querySelector("#y-scale-bar-length").value);
  let yScaleBarLabel = controlsDiv.querySelector("#y-scale-bar-label").value;
  let yScaleBarLabelOrientation = controlsDiv.querySelector("#y-scale-bar-label-orientation").value;

  let xScaleBarFontSize = parseFloat(controlsDiv.querySelector("#x-scale-bar-font-size").value);
  let xScaleBarLabelDistance = parseFloat(controlsDiv.querySelector("#x-scale-bar-label-distance").value);
  let xScaleBarFontFamily = controlsDiv.querySelector("#x-scale-bar-font-family").value;

  let yScaleBarFontSize = parseFloat(controlsDiv.querySelector("#y-scale-bar-font-size").value);
  let yScaleBarLabelDistance = parseFloat(controlsDiv.querySelector("#y-scale-bar-label-distance").value);
  let yScaleBarFontFamily = controlsDiv.querySelector("#y-scale-bar-font-family").value;

  // Update dimensions
  let width = newWidth - margin.left - margin.right;
  let height = newHeight - margin.top - margin.bottom;

  // Get custom tick positions and labels
  let xtickPositions = controlsDiv.querySelector("#x-tick-positions").value.split(",").map(Number);
  let xtickLabels = controlsDiv.querySelector("#x-tick-labels").value.split(",");
  let ytickPositions = controlsDiv.querySelector("#y-tick-positions").value.split(",").map(Number);
  let ytickLabels = controlsDiv.querySelector("#y-tick-labels").value.split(",");

  // 清空SVG
  d3.select(chartDiv).html("");

  // 创建SVG
  const svg = d3.select(chartDiv)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // X/Y轴
  const x = d3.scaleLinear()
    .domain([xDomainMin, xDomainMax])
    .range([0, width]);
  const y = d3.scaleLinear()
    .domain([yDomainMin, yDomainMax])
    .range([height, 0]);

  // 标题
  if (showTitle) {
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -titleDistancePx - axisMargin.y)
      .attr("dominant-baseline", "ideographic")
      .style("text-anchor", "middle")
      .style("font-size", `${titleFontSize}px`)
      .style("font-family", titleFontFamily)
      .style("font-weight", titleFontWeight)
      .text(chartTitle);
  }

  // X轴
  if (showXAxis) {
    const xAxis = d3.axisBottom(x)
      .tickValues(xtickPositions)
      .tickSize(tickLength * (tickOrientation === "inward" ? -1 : 1))
      .tickFormat((d, i) => xtickLabels[i] || d)
      .tickSizeOuter(showOuterTicks ? tickLength : 0);

    svg.append("g")
      .attr("transform", `translate(${axisMargin.x}, ${height})`)
      .call(xAxis)
      .selectAll("text")
      .attr("fill", "#000")
      .style("font-size", `${tickFontSize}px`)
      .style("font-family", tickFontFamily);

    svg.selectAll(".domain").style("stroke-width", axisLineWidth);
    svg.selectAll(".tick line").style("stroke-width", tickLineWidth);
    svg.selectAll(".domain").style("stroke", "#000");
    svg.selectAll(".tick line").style("stroke", "#000");
  }

  // Y轴
  if (showYAxis) {
    const yAxis = d3.axisLeft(y)
      .tickValues(ytickPositions)
      .tickSize(tickLength * (tickOrientation === "inward" ? -1 : 1))
      .tickFormat((d, i) => ytickLabels[i] || d)
      .tickSizeOuter(showOuterTicks ? tickLength : 0);

    svg.append("g")
      .attr("transform", `translate(0, ${-axisMargin.y})`)
      .call(yAxis)
      .selectAll("text")
      .attr("fill", "#000")
      .style("font-size", `${tickFontSize}px`)
      .style("font-family", tickFontFamily);

    svg.selectAll(".domain").style("stroke-width", axisLineWidth);
    svg.selectAll(".tick line").style("stroke-width", tickLineWidth);
    svg.selectAll(".domain").style("stroke", "#000");
    svg.selectAll(".tick line").style("stroke", "#000");
  }

  // Scale Bar
  if (showScaleBar) {
    const xScaleBarPixelLength = x(xScaleBarLength) - x(0);
    svg.append("line")
      .attr("x1", xScaleBarPositionx)
      .attr("x2", xScaleBarPositionx + xScaleBarPixelLength)
      .attr("y1", height - xScaleBarPositiony)
      .attr("y2", height - xScaleBarPositiony)
      .style("stroke", "black")
      .style("stroke-width", xScaleBarWidth);

    svg.append("text")
      .attr("x", xScaleBarPositionx + xScaleBarPixelLength / 2)
      .attr("y", height - xScaleBarPositiony + (xScaleBarLabelOrientation === "outward" ? xScaleBarLabelDistance : -xScaleBarLabelDistance))
      .style("text-anchor", "middle")
      .style("font-size", `${xScaleBarFontSize}px`)
      .style("font-family", xScaleBarFontFamily)
      .text(xScaleBarLabel);

    const yScaleBarPixelLength = y(0) - y(yScaleBarLength);
    svg.append("line")
      .attr("x1", yScaleBarPositionx)
      .attr("x2", yScaleBarPositionx)
      .attr("y1", height - yScaleBarPositiony)
      .attr("y2", height - yScaleBarPositiony - yScaleBarPixelLength)
      .style("stroke", "black")
      .style("stroke-width", yScaleBarWidth);

    const x_scaleLabelPosition = yScaleBarPositionx + (yScaleBarLabelOrientation === "outward" ? -yScaleBarLabelDistance : yScaleBarLabelDistance);
    svg.append("text")
      .attr("x", x_scaleLabelPosition)
      .attr("y", height - yScaleBarPositiony - yScaleBarPixelLength / 2)
      .style("text-anchor", "middle")
      .style("font-size", `${yScaleBarFontSize}px`)
      .style("font-family", yScaleBarFontFamily)
      .attr("transform", `rotate(-90, ${x_scaleLabelPosition}, ${height - yScaleBarPositiony - yScaleBarPixelLength / 2})`)
      .text(yScaleBarLabel);
  }

  // X轴标签
  if (showXLabel) {
    const xLabelDistance = tickLength + 1.8*tickFontSize + 6 * PT_TO_PX;
    svg.append("text")
      .attr("x", width / 2 + axisMargin.x)
      .attr("y", height + xLabelDistance)
      //.attr("dominant-baseline", "text-before-edge")
      .style("text-anchor", "middle")
      .style("font-size", `${xLabelFontSize}px`)
      .style("font-family", xLabelFontFamily)
      .text(xLabel);
  }
  // Y轴标签
  if (showYLabel) {
    const yLabelDistance = tickLength + 1.5*tickFontSize + 6 * PT_TO_PX;
    svg.append("text")
      .attr("x", -(height) / 2 + axisMargin.y)
      .attr("y", -yLabelDistance)
      //.attr("dominant-baseline", "ideographic")
      .attr("transform", "rotate(-90)")
      .style("text-anchor", "middle")
      .style("font-size", `${yLabelFontSize}px`)
      .style("font-family", yLabelFontFamily)
      .text(yLabel);
  }

  // 绘制数据系列
  config.seriesList.forEach(series => {
    const control = series.control;
    const lineColor = control.querySelector(".line-color").value;
    const lineThickness = parseFloat(control.querySelector(".line-thickness").value);
    const showShadow = control.querySelector(".show-shadow").checked;
    const shadowColor = control.querySelector(".shadow-color").value;
    const shadowOpacity = parseFloat(control.querySelector(".shadow-opacity").value);

    if (showShadow) {
      svg.append("path")
        .datum(series.data)
        .attr("fill", shadowColor)
        .attr("fill-opacity", shadowOpacity)
        .attr("stroke", "none")
        .attr("d", d3.area()
          .x(d => x(d.x) + axisMargin.x)
          .y0(d => y(d.CI_right) - axisMargin.y)
          .y1(d => y(d.CI_left) - axisMargin.y)
        );
    }
    svg.append("path")
      .datum(series.data)
      .attr("fill", "none")
      .attr("stroke", lineColor)
      .attr("stroke-width", lineThickness)
      .attr("d", d3.line()
        .x(d => x(d.x) + axisMargin.x)
        .y(d => y(d.y) - axisMargin.y)
      );
  });

  // 绘制线
  config.linesList.forEach(lineItem => {
    const control = lineItem.control;
    const type = control.querySelector(".line-type").value;
    const coordinateX = parseFloat(control.querySelector(".line-coordinate-x").value);
    const coordinateY = parseFloat(control.querySelector(".line-coordinate-y").value);
    const color = control.querySelector(".line-color").value;
    const thickness = parseFloat(control.querySelector(".line-thickness").value);
    const style = control.querySelector(".line-style").value;
    const length = parseFloat(control.querySelector(".line-length").value);
    const dasharray = style === "dashed" ? "5,5" : null;
    const ylength = y(0) - y(length);
    if (type === "vertical") {
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
    } else if (type === "horizontal") {
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

  // 绘制文本
  config.textList.forEach(item => {
    const control = item.control;
    const textStr = control.querySelector(".text-string").value;
    const xPos = parseFloat(control.querySelector(".text-coordinate-x").value);
    const yPos = parseFloat(control.querySelector(".text-coordinate-y").value);
    const fontSize = control.querySelector(".text-font-size").value;
    const fontFamily = control.querySelector(".text-font-family").value;
    const fontColor = control.querySelector(".text-font-color").value;
    const fontWeight = control.querySelector(".text-bold").value;
    const orientation = control.querySelector(".text-orientation").value;
    const transform = orientation === "vertical" ? `rotate(-90, ${xPos}, ${yPos})` : null;

    svg.append("text")
      .attr("x", x(xPos) + margin.left)
      .attr("y", y(yPos) + margin.top)
      .attr("transform", transform)
      .text(textStr)
      .style("font-size", fontSize)
      .style("font-family", fontFamily)
      .style("fill", fontColor)
      .style("font-weight", fontWeight)
      .style("text-anchor", "middle");
  });

  // 绘制 area
  config.areasList.forEach(areaObj => {
    const control = areaObj.control;
    if (!areaObj.data) return;
    const areaColor = control.querySelector(".area-color").value;
    const areaOpacity = parseFloat(control.querySelector(".area-opacity").value);
    const orientation = control.querySelector(".area-orientation").value;
    // const length = parseFloat(control.querySelector(".area-length").value);

    if (orientation === "horizontal") {
      svg.append("path")
        .datum(areaObj.data)
        .attr("fill", areaColor)
        .attr("fill-opacity", areaOpacity)
        .attr("stroke", "none")
        .attr("d", d3.area()
          .x(d => x(+d.x) + axisMargin.x)
          .y0(d => y(+d.y0) - axisMargin.y)
          .y1(d => y(+d.y1) - axisMargin.y)
        );
    } else {
      svg.append("path")
        .datum(areaObj.data)
        .attr("fill", areaColor)
        .attr("fill-opacity", areaOpacity)
        .attr("stroke", "none")
        .attr("d", d3.area()
          .y(d => y(+d.y) - axisMargin.y)
          .x0(d => x(+d.x0) + axisMargin.x)
          .x1(d => x(+d.x1) + axisMargin.x)
        );
    }
  });
}

// 绑定 add subplot 按钮
document.getElementById("add-subplot").onclick = function() {
  // 默认复制最后一个子图的参数
  const last = subplots.length ? subplots[subplots.length - 1].config : null;
  createSubplotInstance(last);
};

// 页面初始化时可自动加一个子图
document.getElementById("add-subplot").click();

document.addEventListener('DOMContentLoaded', function() {
  const canvasArea = document.getElementById('canvas-area');
  const widthInput = document.getElementById('canvas-width-cm');
  const heightInput = document.getElementById('canvas-height-cm');

  // 输入框 -> 画布
  function updateCanvasSize() {
    canvasArea.style.width = (parseFloat(widthInput.value) * CM_TO_PX)+"px";
    canvasArea.style.height = (parseFloat(heightInput.value) * CM_TO_PX)+"px";
  }
  widthInput.addEventListener('input', updateCanvasSize);
  heightInput.addEventListener('input', updateCanvasSize);

  // 初始化一次
  updateCanvasSize();
});

const canvasTexts = [];
const CANVAS_CM_TO_PX = 37.7952755906;

function renderCanvasTexts() {
  const canvasArea = document.getElementById('canvas-area');
  // 清除旧的
  canvasArea.querySelectorAll('.canvas-text-label').forEach(e => e.remove());
  // 渲染文字
  canvasTexts.forEach((item, idx) => {
    const span = document.createElement('span');
    span.className = 'canvas-text-label';
    span.style.left = (item.x * CM_TO_PX) + 'px';
    span.style.top = (item.y * CM_TO_PX) + 'px';
    span.style.fontSize = item.fontSize + 'px';
    span.style.fontFamily = item.fontFamily;
    span.style.color = item.color;
    span.style.fontWeight = item.bold;
    span.style.transform = item.orientation === 'vertical' ? 'rotate(-90deg)' : '';
    span.textContent = item.text;

    // 拖拽
    span.onmousedown = function(e) {
      e.preventDefault();
      let startX = e.clientX, startY = e.clientY;
      let origX = item.x, origY = item.y;
      function onMove(ev) {
        let dx = (ev.clientX - startX) / CM_TO_PX;
        let dy = (ev.clientY - startY) / CM_TO_PX;
        item.x = origX + dx;
        item.y = origY + dy;
        span.style.left = (item.x * CM_TO_PX) + 'px';
        span.style.top = (item.y * CM_TO_PX) + 'px';
      }
      function onUp() {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      }
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    };

    // 点击弹出编辑面板
    span.onclick = function(e) {
      e.stopPropagation();
      showCanvasTextEditPanel(item, idx);
    };

    canvasArea.appendChild(span);
  });
}

document.getElementById('add-canvas-text').onclick = function() {
  canvasTexts.push({
    text: 'word',
    x: 2,
    y: 2,
    fontSize: 18,
    fontFamily: 'Arial',
    color: '#000000',
    bold: 'normal',
    orientation: 'horizontal'
  });
  renderCanvasTexts();
};

function showCanvasTextEditPanel(item, idx) {
  const panel = document.getElementById('canvas-text-edit-panel');
  panel.innerHTML = `
    <div style="font-size:14px; border:1px solid #ccc; padding:12px; background:#fafbfc; max-width:420px;">
      <b>编辑画布文字</b><br>
      <label>内容: <input id="ctext" value="${item.text}"></label><br>
      <label>X (cm): <input id="cx" type="number" step="0.1" value="${item.x}"></label>
      <label>Y (cm): <input id="cy" type="number" step="0.1" value="${item.y}"></label><br>
      <label>字号: <input id="csize" type="number" value="${item.fontSize}"></label>
      <label>字体: <select id="cfamily">
        <option ${item.fontFamily==='Arial'?'selected':''}>Arial</option>
        <option ${item.fontFamily==='Courier New'?'selected':''}>Courier New</option>
        <option ${item.fontFamily==='Times New Roman'?'selected':''}>Times New Roman</option>
        <option ${item.fontFamily==='Verdana'?'selected':''}>Verdana</option>
      </select></label><br>
      <label>颜色: <input id="ccolor" type="color" value="${item.color}"></label>
      <label>加粗: <select id="cbold">
        <option value="normal" ${item.bold==='normal'?'selected':''}>Normal</option>
        <option value="bold" ${item.bold==='bold'?'selected':''}>Bold</option>
      </select></label>
      <label>方向: <select id="corient">
        <option value="horizontal" ${item.orientation==='horizontal'?'selected':''}>水平</option>
        <option value="vertical" ${item.orientation==='vertical'?'selected':''}>垂直</option>
      </select></label>
    </div>
  `;
  // 绑定事件，实时更新
  panel.querySelector('#ctext').oninput = function() {
    item.text = this.value;
    renderCanvasTexts();
  };
  panel.querySelector('#cx').oninput = function() {
    item.x = parseFloat(this.value);
    renderCanvasTexts();
  };
  panel.querySelector('#cy').oninput = function() {
    item.y = parseFloat(this.value);
    renderCanvasTexts();
  };
  panel.querySelector('#csize').oninput = function() {
    item.fontSize = parseInt(this.value);
    renderCanvasTexts();
  };
  panel.querySelector('#cfamily').onchange = function() {
    item.fontFamily = this.value;
    renderCanvasTexts();
  };
  panel.querySelector('#ccolor').oninput = function() {
    item.color = this.value;
    renderCanvasTexts();
  };
  panel.querySelector('#cbold').onchange = function() {
    item.bold = this.value;
    renderCanvasTexts();
  };
  panel.querySelector('#corient').onchange = function() {
    item.orientation = this.value;
    renderCanvasTexts();
  };
}

document.getElementById('export-svg').onclick = function() {
  const canvasArea = document.getElementById('canvas-area');
  const widthPx = canvasArea.offsetWidth;
  const heightPx = canvasArea.offsetHeight;

  // 创建SVG根节点
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("xmlns", svgNS);
  svg.setAttribute("width", widthPx);
  svg.setAttribute("height", heightPx);

  // 1. 合并所有子图SVG
  canvasArea.querySelectorAll('.subplot-chart svg').forEach(subsvg => {
    // 复制节点
    const g = document.createElementNS(svgNS, "g");
    // 获取父div的left/top
    const parentDiv = subsvg.closest('.subplot-chart');
    const left = parseFloat(parentDiv.style.left) || 0;
    const top = parseFloat(parentDiv.style.top) || 0;
    g.setAttribute("transform", `translate(${left},${top})`);
    g.appendChild(subsvg.cloneNode(true));
    svg.appendChild(g);
  });

  // 2. 合并所有画布文字
  canvasArea.querySelectorAll('.canvas-text-label').forEach(span => {
    const text = document.createElementNS(svgNS, "text");
    text.textContent = span.textContent;
    text.setAttribute("x", parseFloat(span.style.left) || 0);
    text.setAttribute("y", (parseFloat(span.style.top) || 0) + (parseFloat(span.style.fontSize) || 18));
    text.setAttribute("font-size", span.style.fontSize || "18px");
    text.setAttribute("font-family", span.style.fontFamily || "Arial");
    text.setAttribute("fill", span.style.color || "#000");
    text.setAttribute("font-weight", span.style.fontWeight || "normal");
    if (span.style.transform && span.style.transform.includes('rotate')) {
      text.setAttribute("transform", `rotate(-90,${span.style.left.replace('px','')},${span.style.top.replace('px','')})`);
    }
    svg.appendChild(text);
  });

  // 3. 导出SVG
  const serializer = new XMLSerializer();
  let source = serializer.serializeToString(svg);
  // 补全命名空间
  if(!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)){
    source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  const blob = new Blob([source], {type: 'image/svg+xml;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'canvas_area.svg';
  a.click();
  URL.revokeObjectURL(url);
};

document.getElementById('export-pdf').onclick = function() {
  const canvasArea = document.getElementById('canvas-area');
  const widthPx = canvasArea.offsetWidth;
  const heightPx = canvasArea.offsetHeight;

  // 生成SVG（同上）
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("xmlns", svgNS);
  svg.setAttribute("width", widthPx);
  svg.setAttribute("height", heightPx);

  canvasArea.querySelectorAll('.subplot-chart svg').forEach(subsvg => {
    const g = document.createElementNS(svgNS, "g");
    const parentDiv = subsvg.closest('.subplot-chart');
    const left = parseFloat(parentDiv.style.left) || 0;
    const top = parseFloat(parentDiv.style.top) || 0;
    g.setAttribute("transform", `translate(${left},${top})`);
    g.appendChild(subsvg.cloneNode(true));
    svg.appendChild(g);
  });

  canvasArea.querySelectorAll('.canvas-text-label').forEach(span => {
    const text = document.createElementNS(svgNS, "text");
    text.textContent = span.textContent;
    text.setAttribute("x", parseFloat(span.style.left) || 0);
    text.setAttribute("y", (parseFloat(span.style.top) || 0) + (parseFloat(span.style.fontSize) || 18));
    text.setAttribute("font-size", span.style.fontSize || "18px");
    text.setAttribute("font-family", span.style.fontFamily || "Arial");
    text.setAttribute("fill", span.style.color || "#000");
    text.setAttribute("font-weight", span.style.fontWeight || "normal");
    if (span.style.transform && span.style.transform.includes('rotate')) {
      text.setAttribute("transform", `rotate(-90,${span.style.left.replace('px','')},${span.style.top.replace('px','')})`);
    }
    svg.appendChild(text);
  });

  // 用 svg2pdf.js + jsPDF 导出 PDF
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({
    orientation: widthPx > heightPx ? 'l' : 'p',
    unit: 'pt',
    format: [widthPx, heightPx]
  });
  svg2pdf(svg, pdf, {
    xOffset: 0,
    yOffset: 0,
    scale: 1
  }).then(() => {
    pdf.save('canvas_area.pdf');
  });
};

// 像素到厘米的换算因子
//const CM_TO_PX = 37.7952755906;

// 初始化换算计算器
function initConversionCalculator() {
  const pxInput = document.getElementById("px-input");
  const cmOutput = document.getElementById("cm-output");
  const cmInput = document.getElementById("cm-input");
  const pxOutput = document.getElementById("px-output");

  // 像素转厘米
  pxInput.addEventListener("input", () => {
    const pxValue = parseFloat(pxInput.value) || 0;
    cmOutput.value = (pxValue / CM_TO_PX).toFixed(2);
  });

  // 厘米转像素
  cmInput.addEventListener("input", () => {
    const cmValue = parseFloat(cmInput.value) || 0;
    pxOutput.value = (cmValue * CM_TO_PX).toFixed(0);
  });
}

// 页面加载时初始化换算计算器
document.addEventListener("DOMContentLoaded", () => {
  initConversionCalculator();
});

renderCanvasTexts();

