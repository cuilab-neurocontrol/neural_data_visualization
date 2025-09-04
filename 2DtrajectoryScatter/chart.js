// 全局数组，用于存放添加的 area 配置
let scatterList = [];
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

function renderGroupStylePanel(seriesControl, groupNames) {
  const panel = seriesControl.querySelector('.group-style-panel');
  if (!panel) return;
  panel.innerHTML='';
  groupNames.forEach(g => {
    if (!g) return;
    const existing = groupStyleMap[g] || {};
    const lineColor = existing.lineColor || '#'+Math.floor(Math.random()*16777215).toString(16).padStart(6,'0');
    const lineWidth = existing.lineWidth != null ? existing.lineWidth : 2;
    const pointColor = existing.pointColor || lineColor;
    const pointSize = existing.pointSize != null ? existing.pointSize : 5;
    if (!groupStyleMap[g]) groupStyleMap[g] = { lineColor, lineWidth, pointColor, pointSize };
    const row = document.createElement('div');
    row.style.display='flex';
    row.style.alignItems='center';
    row.style.gap='4px';
    row.style.margin='2px 0';
    row.dataset.group = g;
    row.innerHTML = `
      <span style="min-width:60px;">${g}</span>
      <input type="color" class="grp-line-color" value="${lineColor}" style="width:34px;" title="Line Color">
      <input type="number" class="grp-line-width" value="${lineWidth}" step="0.1" min="0" style="width:46px;" title="Line Width">
      <input type="color" class="grp-point-color" value="${pointColor}" style="width:34px;" title="Point Color">
      <input type="number" class="grp-point-size" value="${pointSize}" step="0.5" min="0" style="width:46px;" title="Point Size">
    `;
    row.querySelectorAll('input').forEach(inp => {
      inp.addEventListener('input', () => {
        groupStyleMap[g] = {
          lineColor: row.querySelector('.grp-line-color').value,
          lineWidth: parseFloat(row.querySelector('.grp-line-width').value)||2,
          pointColor: row.querySelector('.grp-point-color').value,
          pointSize: parseFloat(row.querySelector('.grp-point-size').value)||5
        };
        createChart();
      });
    });
    panel.appendChild(row);
  });
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
    <div class="control-row">
      <label>Group Styles:</label>
      <button type="button" class="toggle-group-styles">Show</button>
    </div>
    <div class="group-style-panel" style="display:none; border:1px solid #ccc; padding:4px; margin:4px 0; font-size:12px; line-height:1.2;"></div>
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

// 添加散点图控制块创建函数
function createScatterControl(index) {
  const div = document.createElement("div");
  div.className = "scatter-control";
  div.dataset.index = index;
  div.innerHTML = `
    <h4>Scatter ${index + 1} <button class="delete-scatter">Delete</button></h4>
    <div class="control-row">
      <label>Data URL:</label>
      <input type="text" class="scatter-data-url" placeholder="Enter CSV URL">
      <button class="load-scatter-data-url">Load Data from URL</button>
    </div>
    <div class="control-row">
      <label>Upload CSV:</label>
      <input type="file" class="scatter-data-file" accept=".csv">
      <button class="load-scatter-data-file">Load Data from File</button>
    </div>
    <div class="control-row">
      <label>Point Color:</label>
      <input type="color" class="scatter-color" value="#ff0000">
      <label>Point Size (px):</label>
      <input type="number" class="scatter-size" value="5" min="1" step="0.1">
    </div>
    <div class="control-row">
      <label>Point Shape:</label>
      <select class="scatter-shape">
        <option value="circle">Circle</option>
        <option value="square">Square</option>
        <option value="triangle">Triangle</option>
        <option value="diamond">Diamond</option>
        <option value="cross">Cross</option>
        <option value="star">Star</option>
      </select>
      <label>Opacity:</label>
      <input type="number" class="scatter-opacity" value="0.8" min="0" max="1" step="0.1">
    </div>
    <div class="control-row">
      <label>Description:</label>
      <input type="text" class="scatter-description" placeholder="Enter description">
    </div>
    <div class="control-row">
      <label>Group Styles:</label>
      <button type="button" class="toggle-scatter-group-styles">Show</button>
    </div>
    <div class="scatter-group-style-panel" style="display:none; border:1px solid #ccc; padding:4px; margin:4px 0; font-size:12px; line-height:1.2;"></div>
  `;

  const scatterObj = { data: null, control: div };

  // 通过 URL 加载 CSV 数据
  div.querySelector(".load-scatter-data-url").addEventListener("click", function () {
    const url = div.querySelector(".scatter-data-url").value;
    if (!url) return;
    d3.csv(url).then(data => {
      scatterObj.data = data;
      createChart(); // 重新绘制图表来显示新加载的散点图
      const groups = Array.from(new Set(data.map(d=>d.group).filter(g=>g!=null)));
      if (groups.length>1) {
        const btn = div.querySelector('.toggle-scatter-group-styles');
        const panel = div.querySelector('.scatter-group-style-panel');
        if (btn && panel) {
          panel.style.display='block';
          btn.textContent='Hide';
          renderScatterGroupStylePanel(div, groups);
        }
      }
    }).catch(error => {
      console.error("Error loading CSV from URL for Scatter:", error);
    });
  });

  // 通过文件上传加载 CSV 数据
  div.querySelector(".load-scatter-data-file").addEventListener("click", function () {
    const fileInput = div.querySelector(".scatter-data-file");
    if (!fileInput.files || fileInput.files.length === 0) return;
    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
      const text = e.target.result;
      const data = d3.csvParse(text);
      scatterObj.data = data;
      createChart(); // 重新绘制图表以显示新加载的散点图
      const groups = Array.from(new Set(data.map(d=>d.group).filter(g=>g!=null)));
      if (groups.length>1) {
        const btn = div.querySelector('.toggle-scatter-group-styles');
        const panel = div.querySelector('.scatter-group-style-panel');
        if (btn && panel) {
          panel.style.display='block';
          btn.textContent='Hide';
          renderScatterGroupStylePanel(div, groups);
        }
      }
    };
    reader.onerror = function (error) {
      console.error("Error reading CSV file for Scatter:", error);
    };
    reader.readAsText(file);
  });

  // 为删除按钮绑定事件
  div.querySelector(".delete-scatter").addEventListener("click", function () {
    const idx = parseInt(div.dataset.index, 10);
    scatterList.splice(idx, 1);
    div.remove();
    // 更新剩余 scatter-control 的索引
    document.querySelectorAll(".scatter-control").forEach((ctrl, i) => {
      ctrl.dataset.index = i;
    });
    createChart();
  });

  return scatterObj;
}

// 添加形状绘制函数
function drawScatterShape(svg, shape, x, y, size, color, opacity) {
  const symbolSize = size * size * Math.PI;
  
  let symbolGenerator;
  switch (shape) {
    case 'circle':
      symbolGenerator = d3.symbol().type(d3.symbolCircle).size(symbolSize);
      break;
    case 'square':
      symbolGenerator = d3.symbol().type(d3.symbolSquare).size(symbolSize);
      break;
    case 'triangle':
      symbolGenerator = d3.symbol().type(d3.symbolTriangle).size(symbolSize);
      break;
    case 'diamond':
      symbolGenerator = d3.symbol().type(d3.symbolDiamond).size(symbolSize);
      break;
    case 'cross':
      symbolGenerator = d3.symbol().type(d3.symbolCross).size(symbolSize);
      break;
    case 'star':
      symbolGenerator = d3.symbol().type(d3.symbolStar).size(symbolSize);
      break;
    default:
      symbolGenerator = d3.symbol().type(d3.symbolCircle).size(symbolSize);
  }

  svg.append("path")
    .attr("d", symbolGenerator)
    .attr("transform", `translate(${x}, ${y})`)
    .attr("fill", color)
    .attr("stroke", "none") // 移除边框
    .attr("opacity", opacity);
}

function renderScatterGroupStylePanel(scatterControl, groupNames) {
  const panel = scatterControl.querySelector('.scatter-group-style-panel');
  if (!panel) return;
  panel.innerHTML='';
  groupNames.forEach(g => {
    if (!g) return;
    const existing = scatterGroupStyleMap[g] || {};
    const pointColor = existing.pointColor || '#'+Math.floor(Math.random()*16777215).toString(16).padStart(6,'0');
    const pointSize = existing.pointSize != null ? existing.pointSize : 5;
    const shape = existing.shape || 'circle';
    const opacity = existing.opacity != null ? existing.opacity : 0.8;
    if (!scatterGroupStyleMap[g]) scatterGroupStyleMap[g] = { pointColor, pointSize, shape, opacity };
    const row = document.createElement('div');
    row.style.display='flex';
    row.style.alignItems='center';
    row.style.gap='4px';
    row.style.margin='2px 0';
    row.dataset.group = g;
    row.innerHTML = `
      <span style="min-width:60px;">${g}</span>
      <input type="color" class="scg-point-color" value="${pointColor}" style="width:34px;" title="Point Color">
      <input type="number" class="scg-point-size" value="${pointSize}" step="0.5" min="0" style="width:46px;" title="Point Size">
      <select class="scg-shape" title="Shape" style="height:24px;">
        <option value="circle" ${shape==='circle'?'selected':''}>Circle</option>
        <option value="square" ${shape==='square'?'selected':''}>Square</option>
        <option value="triangle" ${shape==='triangle'?'selected':''}>Triangle</option>
        <option value="diamond" ${shape==='diamond'?'selected':''}>Diamond</option>
        <option value="cross" ${shape==='cross'?'selected':''}>Cross</option>
        <option value="star" ${shape==='star'?'selected':''}>Star</option>
      </select>
      <input type="number" class="scg-opacity" value="${opacity}" step="0.05" min="0" max="1" style="width:52px;" title="Opacity">
    `;
    row.querySelectorAll('input, select').forEach(inp => {
      inp.addEventListener('input', () => {
        scatterGroupStyleMap[g] = {
          pointColor: row.querySelector('.scg-point-color').value,
          pointSize: parseFloat(row.querySelector('.scg-point-size').value)||5,
          shape: row.querySelector('.scg-shape').value,
          opacity: parseFloat(row.querySelector('.scg-opacity').value)||0.8
        };
        createChart();
      });
    });
    panel.appendChild(row);
  });
}

// Conversion factor: 1 cm = 37.7952755906 pixels
const CM_TO_PX = 37.7952755906;
const PT_TO_PX = 1;
let seriesList = [];
let linesList = [];
let textList = [];
let areasList = [];
// group 样式映射：groupName -> { lineColor, lineWidth, pointColor, pointSize }
let groupStyleMap = {};
// scatter group 样式映射：groupName -> { pointColor, pointSize, shape, opacity }
let scatterGroupStyleMap = {};

function createChart() {
  // Get the container and dimensions in cm
  const xLabelDistancePlus = parseFloat(document.getElementById("x-label-distance").value);
  const yLabelDistancePlus = parseFloat(document.getElementById("y-label-distance").value);

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

      const xG = svg.append("g")
      .attr("transform", `translate(${axisMargin.x}, ${height})`)
      .call(xAxis)
      .selectAll("text") // Customize tick labels
      .attr("fill", "#000")
      .style("font-size", `${tickFontSize}px`) // Set font size
      .style("font-family", tickFontFamily); // Set font family

      if (!showOuterTicks) {
        // 移除最外侧两端的刻度线（不仅仅是长度为0，彻底隐藏）
        const ticks = svg.selectAll('g.tick');
        ticks.filter((d,i,n)=> i===0 || i===n.length-1).select('line').style('stroke-width',0);
      }

      svg.selectAll(".domain").style("stroke-width", axisLineWidth);
      svg.selectAll(".tick line").style("stroke-width", tickLineWidth);
      svg.selectAll(".domain").style("stroke", "#000");
      svg.selectAll(".tick line").style("stroke", "#000");
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

      const yG = svg.append("g")
      .attr("transform", `translate(0, ${-axisMargin.y})`)
      .call(yAxis)
      .selectAll("text") // Customize tick labels
      .attr("fill", "#000")
      .style("font-size", `${tickFontSize}px`) // Set font size
      .style("font-family", tickFontFamily); // Set font family

      if (!showOuterTicks) {
        const ticksY = svg.selectAll('g.tick');
        ticksY.filter((d,i,n)=> i===0 || i===n.length-1).select('line').style('stroke-width',0);
      }

      svg.selectAll(".domain").style("stroke-width", axisLineWidth);
      svg.selectAll(".tick line").style("stroke-width", tickLineWidth);
      svg.selectAll(".domain").style("stroke", "#000");
      svg.selectAll(".tick line").style("stroke", "#000");
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
    // const xLabelDistance = tickLength + 1.8*tickFontSize + (xLabelDistancePlus) * PT_TO_PX;
    const xLabelDistance = xLabelDistancePlus;
    svg.append("text")
    .attr("x", (width) / 2 +axisMargin.x) // Center the label horizontally
    .attr("y", height + xLabelDistance) // Position below the X axis
    //.attr("y", height - xScaleBarPositiony+xLabelFontSize-3)
    //.attr("dominant-baseline", "text-before-edge")  // 添加 hanging 属性
    .style("text-anchor", "middle")
    .style("font-size", `${xLabelFontSize}px`)
    .style("font-family", xLabelFontFamily)
    .text(xLabel);
  }
  // Add Y axis label
  if (showYLabel) {
    //const yLabelDistance = tickLength + 1.5*tickFontSize + (yLabelDistancePlus) * PT_TO_PX;
    const yLabelDistance = yLabelDistancePlus;
    svg.append("text")
    .attr("x", -(height) / 2+axisMargin.y) // Center the label vertically
    .attr("y", -yLabelDistance) // Position to the left of the Y axis
    //.attr("dominant-baseline", "ideographic")  // 使用下沿作为基线
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

    // 按 group 分组
    const grouped = d3.groups(series.data, d=>d.group).filter(g=>g[0]!=null);
    const panel = control.querySelector('.group-style-panel');
    if (panel && panel.style.display !== 'none') {
      const names = grouped.map(g=>g[0]);
      renderGroupStylePanel(control, names);
    }
    grouped.forEach(([gName, traj]) => {
      const style = groupStyleMap[gName] || { lineColor, lineWidth: lineThickness, pointColor: lineColor, pointSize: 5 };
      svg.append('path')
        .attr('fill','none')
        .attr('stroke', style.lineColor)
        .attr('stroke-width', style.lineWidth)
        .attr('d', d3.line()
          .x(d=>x(d.x)+axisMargin.x)
          .y(d=>y(d.y)-axisMargin.y)
          .curve(d3.curveCatmullRom.alpha(0.7))
        (traj));
      const last = traj[traj.length-1];
      if (last) {
        drawScatterShape(svg, 'circle', x(last.x)+axisMargin.x, y(last.y)-axisMargin.y, style.pointSize, style.pointColor, 1.0);
      }
    });
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

  // 绘制散点图
  scatterList.forEach(scatterItem => {
    if (!scatterItem.data) return; // 如果没有数据，跳过
    
    const control = scatterItem.control;
    const color = control.querySelector(".scatter-color").value;
    const size = parseFloat(control.querySelector(".scatter-size").value);
    const shape = control.querySelector(".scatter-shape").value;
    const opacity = parseFloat(control.querySelector(".scatter-opacity").value);

    scatterItem.data.forEach(point => {
      const xPos = x(parseFloat(point.x)) + axisMargin.x;
      const yPos = y(parseFloat(point.y)) - axisMargin.y;
      const gName = point.group;
      if (gName && scatterGroupStyleMap[gName]) {
        const gs = scatterGroupStyleMap[gName];
        drawScatterShape(svg, gs.shape || shape, xPos, yPos, gs.pointSize ?? size, gs.pointColor || color, gs.opacity ?? opacity);
      } else {
        drawScatterShape(svg, shape, xPos, yPos, size, color, opacity);
      }
    });
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
document.getElementById("data-files")
  .addEventListener("change", function(e) {
    const names = Array.from(this.files).map(f => f.name).join(", ");
    const disp = document.getElementById("data-files-names");
    disp.textContent = names;
    disp.title = names;    // ← 让它悬停时 tooltip 显示完整名
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
        const groups = Array.from(new Set(data.map(d=>d.group).filter(g=>g!=null)));
        if (groups.length>1) {
          const btn = seriesControl.querySelector('.toggle-group-styles');
          const panel = seriesControl.querySelector('.group-style-panel');
          if (btn && panel) {
            panel.style.display='block';
            btn.textContent='Hide';
            renderGroupStylePanel(seriesControl, groups);
          }
        }
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
    // auto-open group styles if multiple groups detected
    const groups = Array.from(new Set(data.map(d=>d.group).filter(g=>g!=null)));
    if (groups.length>1) {
      const btn = seriesControl.querySelector('.toggle-group-styles');
      const panel = seriesControl.querySelector('.group-style-panel');
      if (btn && panel) {
        panel.style.display='block';
        btn.textContent='Hide';
        renderGroupStylePanel(seriesControl, groups);
      }
    }
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

// 绑定 Add Scatter 按钮事件（在文件末尾添加）
document.getElementById("add-scatter").addEventListener("click", function () {
  const index = scatterList.length;
  const scatterObj = createScatterControl(index);
  scatterList.push(scatterObj);
  document.getElementById("scatter-controls").appendChild(scatterObj.control);
});

// Initial chart creation
createChart();

// Add event listener to the update button
document.getElementById("update").addEventListener("click", function () {

  // Recreate the chart with the new settings
  createChart();
});

document.getElementById("save-svg-btn").addEventListener("click", function () {
  // 获取SVG元素
  const svgNode = document.querySelector("#my_dataviz svg");
  if (!svgNode) return;

  // 克隆SVG节点，去除可能的d3事件
  const clone = svgNode.cloneNode(true);

  // 添加命名空间（兼容性更好）
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");

  // 获取SVG字符串
  const serializer = new XMLSerializer();
  let source = serializer.serializeToString(clone);

  // 修复部分浏览器可能缺失的命名空间
  if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
    source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  // 生成Blob并下载
  const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "scatter_plot.svg";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

// =========================
// Save/Load parameters (JSON)
// =========================

function collectAllInputsUnder(root) {
  const map = {};
  root.querySelectorAll('input[id], select[id], textarea[id]').forEach(el => {
    const id = el.id;
    if (!id) return;
    if (el.type === 'checkbox') {
      map[id] = !!el.checked;
    } else if (el.type === 'number') {
      const v = el.value;
      map[id] = v === '' ? null : Number(v);
    } else {
      map[id] = el.value;
    }
  });
  return map;
}

function collectSeriesState2D() {
  return seriesList.map(s => {
    const c = s.control;
    return {
      options: {
        lineColor: c?.querySelector('.line-color')?.value || '#ff0000',
        lineThickness: Number(c?.querySelector('.line-thickness')?.value || 2),
        showShadow: !!c?.querySelector('.show-shadow')?.checked,
        shadowColor: c?.querySelector('.shadow-color')?.value || '#FF5C5C',
        shadowOpacity: Number(c?.querySelector('.shadow-opacity')?.value || 0.3),
        description: c?.querySelector('.series-description')?.value || ''
      },
      data: s.data || []
    };
  });
}

function collectLinesState() {
  return linesList.map(item => {
    const c = item.control;
    return {
      type: c.querySelector('.line-type')?.value || 'vertical',
      coordinateX: Number(c.querySelector('.line-coordinate-x')?.value || 0),
      coordinateY: Number(c.querySelector('.line-coordinate-y')?.value || 0),
      color: c.querySelector('.line-color')?.value || '#000000',
      thickness: Number(c.querySelector('.line-thickness')?.value || 1),
      style: c.querySelector('.line-style')?.value || 'solid',
      length: Number(c.querySelector('.line-length')?.value || 100)
    };
  });
}

function collectTextsState() {
  return textList.map(item => {
    const c = item.control;
    return {
      text: c.querySelector('.text-string')?.value || '',
      x: Number(c.querySelector('.text-coordinate-x')?.value || 0),
      y: Number(c.querySelector('.text-coordinate-y')?.value || 0),
      fontSize: Number(c.querySelector('.text-font-size')?.value || 16),
      fontFamily: c.querySelector('.text-font-family')?.value || 'Arial',
      fontColor: c.querySelector('.text-font-color')?.value || '#000000',
      fontWeight: c.querySelector('.text-bold')?.value || 'normal',
      orientation: c.querySelector('.text-orientation')?.value || 'horizontal'
    };
  });
}

function collectAreasState() {
  return areasList.map(area => {
    const c = area.control;
    return {
      options: {
        color: c.querySelector('.area-color')?.value || '#cce5df',
        opacity: Number(c.querySelector('.area-opacity')?.value || 0.5),
        orientation: c.querySelector('.area-orientation')?.value || 'horizontal'
      },
      data: area.data || []
    };
  });
}

function collectScattersState() {
  return scatterList.map(sc => {
    const c = sc.control;
    return {
      options: {
        color: c.querySelector('.scatter-color')?.value || '#ff0000',
        size: Number(c.querySelector('.scatter-size')?.value || 5),
        shape: c.querySelector('.scatter-shape')?.value || 'circle',
        opacity: Number(c.querySelector('.scatter-opacity')?.value || 0.8),
        description: c.querySelector('.scatter-description')?.value || ''
      },
      data: sc.data || []
    };
  });
}

function collectState2D() {
  const controlsRoot = document.getElementById('control-panel');
  const controls = collectAllInputsUnder(controlsRoot);
  return {
    version: 1,
    savedAt: new Date().toISOString(),
    controls,
    series: collectSeriesState2D(),
    lines: collectLinesState(),
    texts: collectTextsState(),
    areas: collectAreasState(),
  scatters: collectScattersState(),
  groupStyles: { ...groupStyleMap },
  scatterGroupStyles: { ...scatterGroupStyleMap }
  };
}

function applyInputs2D(controlsMap) {
  if (!controlsMap) return;
  Object.keys(controlsMap).forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const val = controlsMap[id];
    if (el.type === 'checkbox') {
      el.checked = !!val;
    } else {
      el.value = val;
    }
  });
}

function clearUILists() {
  // reset arrays
  seriesList = [];
  linesList = [];
  textList = [];
  areasList = [];
  scatterList = [];
  // clear containers
  const ids = ['series-controls', 'line-controls', 'text-controls', 'area-controls', 'scatter-controls'];
  ids.forEach(id => { const el = document.getElementById(id); if (el) el.innerHTML = ''; });
}

function rebuildFromState2D(state) {
  if (!state) return;
  applyInputs2D(state.controls);

  clearUILists();
  groupStyleMap = state.groupStyles ? { ...state.groupStyles } : {};
  scatterGroupStyleMap = state.scatterGroupStyles ? { ...state.scatterGroupStyles } : {};

  // series
  (state.series || []).forEach(s => {
    const seriesControl = createSeriesControl(seriesList.length);
    if (s.options) {
      seriesControl.querySelector('.line-color').value = s.options.lineColor || '#ff0000';
      seriesControl.querySelector('.line-thickness').value = s.options.lineThickness ?? 2;
      seriesControl.querySelector('.show-shadow').checked = !!s.options.showShadow;
      seriesControl.querySelector('.shadow-color').value = s.options.shadowColor || '#FF5C5C';
      seriesControl.querySelector('.shadow-opacity').value = s.options.shadowOpacity ?? 0.3;
      const sd = seriesControl.querySelector('.series-description');
      if (sd) sd.value = s.options.description || '';
    }
    seriesList.push({ data: s.data || [], control: seriesControl });
    document.getElementById('series-controls').appendChild(seriesControl);
    // auto-open and populate if saved data has multiple groups and groupStyles exist
    const groups = Array.from(new Set((s.data||[]).map(d=>d.group).filter(g=>g!=null)));
    if (groups.length>1) {
      const btn = seriesControl.querySelector('.toggle-group-styles');
      const panel = seriesControl.querySelector('.group-style-panel');
      if (btn && panel) {
        panel.style.display='block';
        btn.textContent='Hide';
        renderGroupStylePanel(seriesControl, groups);
      }
    }
  });

  // lines
  (state.lines || []).forEach(ln => {
    const control = createLineControl(linesList.length);
    control.querySelector('.line-type').value = ln.type ?? 'vertical';
    control.querySelector('.line-coordinate-x').value = ln.coordinateX ?? 0;
    control.querySelector('.line-coordinate-y').value = ln.coordinateY ?? 0;
    control.querySelector('.line-color').value = ln.color ?? '#000000';
    control.querySelector('.line-thickness').value = ln.thickness ?? 1;
    control.querySelector('.line-style').value = ln.style ?? 'solid';
    control.querySelector('.line-length').value = ln.length ?? 100;
    linesList.push({ control });
    document.getElementById('line-controls').appendChild(control);
  });

  // texts
  (state.texts || []).forEach(tx => {
    const control = createTextControl(textList.length);
    control.querySelector('.text-string').value = tx.text || '';
    control.querySelector('.text-coordinate-x').value = tx.x ?? 0;
    control.querySelector('.text-coordinate-y').value = tx.y ?? 0;
    control.querySelector('.text-font-size').value = tx.fontSize ?? 16;
    control.querySelector('.text-font-family').value = tx.fontFamily ?? 'Arial';
    control.querySelector('.text-font-color').value = tx.fontColor ?? '#000000';
    control.querySelector('.text-bold').value = tx.fontWeight ?? 'normal';
    control.querySelector('.text-orientation').value = tx.orientation ?? 'horizontal';
    textList.push({ control });
    document.getElementById('text-controls').appendChild(control);
  });

  // areas
  (state.areas || []).forEach(ar => {
    const areaObj = createAreaControl(areasList.length);
    if (ar.options) {
      areaObj.control.querySelector('.area-color').value = ar.options.color ?? '#cce5df';
      areaObj.control.querySelector('.area-opacity').value = ar.options.opacity ?? 0.5;
      areaObj.control.querySelector('.area-orientation').value = ar.options.orientation ?? 'horizontal';
    }
    areaObj.data = ar.data || null;
    areasList.push(areaObj);
    document.getElementById('area-controls').appendChild(areaObj.control);
  });

  // scatters
  (state.scatters || []).forEach(sc => {
    const scatterObj = createScatterControl(scatterList.length);
    if (sc.options) {
      scatterObj.control.querySelector('.scatter-color').value = sc.options.color || '#ff0000';
      scatterObj.control.querySelector('.scatter-size').value = sc.options.size ?? 5;
      scatterObj.control.querySelector('.scatter-shape').value = sc.options.shape || 'circle';
      scatterObj.control.querySelector('.scatter-opacity').value = sc.options.opacity ?? 0.8;
      const sd = scatterObj.control.querySelector('.scatter-description');
      if (sd) sd.value = sc.options.description || '';
    }
    scatterObj.data = sc.data || null;
    scatterList.push(scatterObj);
    document.getElementById('scatter-controls').appendChild(scatterObj.control);
    const groups = Array.from(new Set((scatterObj.data||[]).map(d=>d.group).filter(g=>g!=null)));
    if (groups.length>1) {
      const btn = scatterObj.control.querySelector('.toggle-scatter-group-styles');
      const panel = scatterObj.control.querySelector('.scatter-group-style-panel');
      if (btn && panel) {
        panel.style.display='block';
        btn.textContent='Hide';
        renderScatterGroupStylePanel(scatterObj.control, groups);
      }
    }
  });

  // Render with the rebuilt state
  createChart();
}

function downloadJSON2D(obj, fileName) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

document.getElementById('save-params')?.addEventListener('click', () => {
  const state = collectState2D();
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  downloadJSON2D(state, `scatter2d_params_${ts}.json`);
});

document.getElementById('load-params-btn')?.addEventListener('click', () => {
  document.getElementById('load-params-file')?.click();
});

document.getElementById('load-params-file')?.addEventListener('change', (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    let obj = null;
    try {
      obj = JSON.parse(ev.target.result);
    } catch (parseErr) {
      console.error('JSON parse error:', parseErr);
      alert('Invalid JSON file.');
      e.target.value = '';
      return;
    }
    try {
      rebuildFromState2D(obj);
    } catch (applyErr) {
      console.error('Error applying loaded params:', applyErr);
    } finally {
      e.target.value = '';
    }
  };
  reader.readAsText(file);
});

// 事件委托：展开/隐藏 group 样式面板
document.getElementById('series-controls').addEventListener('click', e => {
  const btn = e.target.closest('.toggle-group-styles');
  if (!btn) return;
  const seriesControl = btn.closest('.series-control');
  if (!seriesControl) return;
  const panel = seriesControl.querySelector('.group-style-panel');
  if (!panel) return;
  if (panel.style.display === 'none') {
    const idx = parseInt(seriesControl.dataset.index, 10);
    const series = seriesList[idx];
    if (series) {
      const groups = Array.from(new Set((series.data || []).map(d => d.group).filter(g => g != null)));
      renderGroupStylePanel(seriesControl, groups);
    }
    panel.style.display='block';
    btn.textContent='Hide';
  } else {
    panel.style.display='none';
    btn.textContent='Show';
  }
});

// 事件委托：展开/隐藏 scatter group 样式面板
document.getElementById('scatter-controls').addEventListener('click', e => {
  const btn = e.target.closest('.toggle-scatter-group-styles');
  if (!btn) return;
  const scControl = btn.closest('.scatter-control');
  if (!scControl) return;
  const panel = scControl.querySelector('.scatter-group-style-panel');
  if (!panel) return;
  if (panel.style.display === 'none') {
    const idx = parseInt(scControl.dataset.index, 10);
    const scItem = scatterList[idx];
    if (scItem) {
      const groups = Array.from(new Set((scItem.data||[]).map(d=>d.group).filter(g=>g!=null)));
      renderScatterGroupStylePanel(scControl, groups);
    }
    panel.style.display='block';
    btn.textContent='Hide';
  } else {
    panel.style.display='none';
    btn.textContent='Show';
  }
});