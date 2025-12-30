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
  description: "",
  _id: 'sp_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2,8)
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
      addSeriesDataPossiblySplit(data, controlsDiv, chartDiv, config);
  // 立即重绘并快照
  createChartForSubplot(controlsDiv, chartDiv, config);
    });
  });
  controlsDiv.querySelector("#data-files").addEventListener("change", function(e) {
    const files = e.target.files;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = function(evt) {
        const text = evt.target.result;
        const data = d3.csvParse(text);
        addSeriesDataPossiblySplit(data, controlsDiv, chartDiv, config, file.name);
  // 重绘并快照
  createChartForSubplot(controlsDiv, chartDiv, config);
      };
      reader.readAsText(file);
    });
  });
  // 移除手动 update 按钮，改为自动更新：监听所有输入与复选框变化，采用防抖以避免频繁重绘
  const autoUpdate = (() => {
    let timer = null;
    return () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        createChartForSubplot(controlsDiv, chartDiv, config);
      }, 120); // 120ms 防抖
    };
  })();

  // 使用事件委托绑定自动更新事件（支持动态添加的控件）
  controlsDiv.addEventListener('input', (e) => {
    if (e.target.id === 'data-files' || e.target.id === 'data-url') return;
    autoUpdate();
  });
  controlsDiv.addEventListener('change', (e) => {
    if (e.target.id === 'data-files' || e.target.id === 'data-url') return;
    autoUpdate();
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

// 根据是否存在 condition 列拆分数据并创建系列
function addSeriesDataPossiblySplit(data, controlsDiv, chartDiv, config, sourceLabel) {
  if (!data || !data.length) return;
  const firstRow = data[0];
  const hasCondition = Object.prototype.hasOwnProperty.call(firstRow, 'condition');
  if (!hasCondition) {
    // 原逻辑：直接添加一个 series
    const seriesControl = createSeriesControl(
      config.seriesList.length,
      controlsDiv,
      chartDiv,
      config
    );
    if (sourceLabel) {
      const desc = seriesControl.querySelector('.series-description');
      if (desc && !desc.value) desc.value = sourceLabel;
    }
    const cleaned = data.map(r => ({
      x: +r.x,
      y: +r.y,
      CI_left: r.CI_left !== undefined && r.CI_left !== '' ? +r.CI_left : undefined,
      CI_right: r.CI_right !== undefined && r.CI_right !== '' ? +r.CI_right : undefined
    })).filter(d => isFinite(d.x) && isFinite(d.y));
    config.seriesList.push({ data: cleaned, control: seriesControl, condition: null });
    controlsDiv.querySelector('#series-controls').appendChild(seriesControl);
    return;
  }

  // 按 condition 分组
  const grouped = d3.group(data, d => d.condition);
  ensureConditionColorPanel(controlsDiv);
  grouped.forEach((rows, cond) => {
    const cleaned = rows.map(r => ({
      x: +r.x,
      y: +r.y,
      CI_left: r.CI_left !== undefined && r.CI_left !== '' ? +r.CI_left : undefined,
      CI_right: r.CI_right !== undefined && r.CI_right !== '' ? +r.CI_right : undefined,
      condition: r.condition
    })).filter(d => isFinite(d.x) && isFinite(d.y));
    const seriesControl = createSeriesControl(
      config.seriesList.length,
      controlsDiv,
      chartDiv,
      config
    );
    // 自动填充描述为 condition (可手动修改)
    const desc = seriesControl.querySelector('.series-description');
    if (desc) desc.value = String(cond);
    // 如果该 condition 尚无颜色输入，创建一个
    const wrapper = addOrReuseConditionColorInput(controlsDiv, cond, seriesControl.querySelector('.line-color').value);
    // 若已存在 condition 颜色条目，应用其颜色到新系列
    if (wrapper) {
      const cLine = wrapper.querySelector('.condition-line-color')?.value;
      const cShadow = wrapper.querySelector('.condition-shadow-color')?.value;
      if (cLine) seriesControl.querySelector('.line-color').value = cLine;
      if (cShadow) seriesControl.querySelector('.shadow-color').value = cShadow;
    }
  config.seriesList.push({ data: cleaned, control: seriesControl, condition: cond });
    controlsDiv.querySelector('#series-controls').appendChild(seriesControl);
    // 建立双向同步：系列颜色改动 -> condition 面板同步
    attachConditionBidirectionalSync(controlsDiv, seriesControl, cond);
  });
  // 分组添加后也触发重绘在调用者外部
}

function ensureConditionColorPanel(controlsDiv) {
  const panel = controlsDiv.querySelector('#condition-colors-panel');
  if (panel) panel.style.display = 'block';
}

function addOrReuseConditionColorInput(controlsDiv, conditionName, defaultColor) {
  const mapDiv = controlsDiv.querySelector('#condition-color-map');
  if (!mapDiv) return;
  const existing = mapDiv.querySelector(`[data-condition="${conditionName}"]`);
  if (existing) return existing; // already exists
  if (!defaultColor) {
    const palette = ['#1f77b4','#ff7f0e','#2ca02c','#d62728','#9467bd','#8c564b','#e377c2','#7f7f7f','#bcbd22','#17becf'];
    const used = mapDiv.querySelectorAll('[data-condition]').length;
    defaultColor = palette[used % palette.length];
  }
  const wrapper = document.createElement('div');
  wrapper.dataset.condition = conditionName;
  wrapper.style.display = 'flex';
  wrapper.style.alignItems = 'center';
  wrapper.style.gap = '6px';
  // Two color inputs: line & shadow
  wrapper.innerHTML = `
    <span style="min-width:70px;font-size:0.75em;">${conditionName}</span>
    <label style="font-size:0.65em;">Line</label>
    <input type="color" value="${defaultColor || '#ff0000'}" class="condition-line-color" style="width:36px;padding:0;border:none;">
    <label style="font-size:0.65em;">Shadow</label>
    <input type="color" value="#FF5C5C" class="condition-shadow-color" style="width:36px;padding:0;border:none;">
  `;
  mapDiv.appendChild(wrapper);
  // 同步 line color
  const lineInput = wrapper.querySelector('.condition-line-color');
  lineInput.addEventListener('input', () => {
    syncConditionColorsToSeries(controlsDiv, conditionName, lineInput.value, null);
  });
  // 同步 shadow color
  const shadowInput = wrapper.querySelector('.condition-shadow-color');
  shadowInput.addEventListener('input', () => {
    syncConditionColorsToSeries(controlsDiv, conditionName, null, shadowInput.value);
  });
  return wrapper;
}

function syncConditionColorsToSeries(controlsDiv, conditionName, lineColor, shadowColor) {
  const allSeries = controlsDiv.querySelectorAll('.series-control');
  allSeries.forEach(sc => {
    const desc = sc.querySelector('.series-description');
    if (desc && desc.value === conditionName) {
      if (lineColor) {
        const lc = sc.querySelector('.line-color');
        if (lc) lc.value = lineColor;
      }
      if (shadowColor) {
        const scCol = sc.querySelector('.shadow-color');
        if (scCol) scCol.value = shadowColor;
      }
    }
  });
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
  const xTickGap = parseFloat(controlsDiv.querySelector('#x-tick-gap')?.value || 0); // 正值: 与轴线脱离, 负值: 贯穿
  const yTickGap = parseFloat(controlsDiv.querySelector('#y-tick-gap')?.value || 0);

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
    svg.selectAll(".x-axis").remove();
    const xTickLabels = xtickPositions.map((pos, i) => xtickLabels[i] || pos);
    
    if (tickOrientation === "inward") {
      const xAxis = d3.axisBottom(x)
        .tickValues(xtickPositions)
        .tickSize(0)
        .tickPadding(tickLength)
        .tickFormat((d, i) => xtickLabels[i] || d);

      svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(${axisMargin.x}, ${height})`)
        .call(xAxis)
        .call(g => g.selectAll(".tick line")
          .attr("y1", -xTickGap)          // gap 控制起点
          .attr("y2", -xTickGap - tickLength) // 向上(轴内)延伸
        )
        .call(g => g.selectAll("text")
          .attr("fill", "#000")
          .style("font-size", `${tickFontSize}px`)
          .style("font-family", tickFontFamily)
        );
    } else { // outward
      const xAxis = d3.axisBottom(x)
        .tickValues(xtickPositions)
        .tickSize(0)
        .tickPadding(2 * tickLength)
        .tickFormat((d, i) => xtickLabels[i] || d);

      svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(${axisMargin.x}, ${height})`)
        .call(xAxis)
        .call(g => g.selectAll(".tick line")
          .attr("y1", xTickGap)
          .attr("y2", xTickGap + tickLength)
        )
        .call(g => g.selectAll("text")
          .attr("fill", "#000")
          .style("font-size", `${tickFontSize}px`)
          .style("font-family", tickFontFamily)
        );
    }

    svg.selectAll(".x-axis .domain")
       .style("stroke-width", axisLineWidth)
       .style("stroke", "#000");
    svg.selectAll(".x-axis .tick line")
       .style("stroke-width", tickLineWidth)
       .style("stroke", "#000");

    // 半像素对齐（避免不同 PPI 模糊）
    const xAxisGroup = svg.select(".x-axis");
    // 可选像素对齐（使用手动 offset + 0.5 辅助）
  if (axisLineWidth % 2 !== 0) xAxisGroup.attr('transform', xAxisGroup.attr('transform') + ' translate(0,0.5)');
  if (tickLineWidth % 2 !== 0) xAxisGroup.selectAll('.tick line').attr('transform', 'translate(0,0.5)');
    xAxisGroup.selectAll('.domain, .tick line')
      .attr('shape-rendering', 'crispEdges');
  }

  // Y轴
  if (showYAxis) {
    svg.selectAll(".y-axis").remove();
    
    const yAxis = d3.axisLeft(y)
      .tickValues(ytickPositions)
      .tickFormat((d, i) => ytickLabels[i] ?? d)
      .tickSize(0)
      .tickPadding(tickOrientation === "inward" ? tickLength : 2 * tickLength);

    svg.append("g")
      .attr("class", "y-axis")
      .attr("transform", `translate(0, ${-axisMargin.y})`)
      .call(yAxis)
      .call(g => g.selectAll(".tick line")
        .attr("x1", tickOrientation === "inward" ? yTickGap : -yTickGap)
        .attr("x2", tickOrientation === "inward" ? (yTickGap + tickLength) : (-yTickGap - tickLength))
      )
      .call(g => g.selectAll("text")
        .attr("fill", "#000")
        .style("font-size", `${tickFontSize}px`)
        .style("font-family", tickFontFamily)
      );

    svg.selectAll(".y-axis .domain")
       .style("stroke-width", axisLineWidth)
       .style("stroke", "#000");
    svg.selectAll(".y-axis .tick line")
       .style("stroke-width", tickLineWidth)
       .style("stroke", "#000");

    const yAxisGroup = svg.select('.y-axis');
  if (axisLineWidth % 2 !== 0) yAxisGroup.attr('transform', yAxisGroup.attr('transform') + ' translate(0.5,0)');
  if (tickLineWidth % 2 !== 0) yAxisGroup.selectAll('.tick line').attr('transform', 'translate(0.5,0)');
    yAxisGroup.selectAll('.domain, .tick line')
      .attr('shape-rendering','crispEdges');
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

  // 获取 X 和 Y 轴标签距离
  const xLabelDistance = parseFloat(controlsDiv.querySelector("#x-label-distance").value);
  const yLabelDistance = parseFloat(controlsDiv.querySelector("#y-label-distance").value);

  // X轴标签
  if (showXLabel) {
    svg.append("text")
      .attr("x", width / 2 + axisMargin.x)
      .attr("y", height + xLabelDistance) // 使用动态距离
      .style("text-anchor", "middle")
      .style("font-size", `${xLabelFontSize}px`)
      .style("font-family", xLabelFontFamily)
      .text(xLabel);
  }

  // Y轴标签
  if (showYLabel) {
    svg.append("text")
      .attr("x", -(height) / 2 + axisMargin.y)
      .attr("y", -yLabelDistance) // 使用动态距离
      .attr("transform", "rotate(-90)")
      .style("text-anchor", "middle")
      .style("font-size", `${yLabelFontSize}px`)
      .style("font-family", yLabelFontFamily)
      .text(yLabel);
  }

  // 绘制数据系列
  config.seriesList.forEach(series => {
    const control = series.control;
    const lineColor = control.querySelector('.line-color').value;
    const lineThickness = parseFloat(control.querySelector('.line-thickness').value);
    const showShadow = control.querySelector('.show-shadow').checked;
    const shadowColor = control.querySelector('.shadow-color').value;
    const shadowOpacity = parseFloat(control.querySelector('.shadow-opacity').value);
    const validLine = series.data.filter(d => isFinite(d.x) && isFinite(d.y));
    const validArea = series.data.filter(d => isFinite(d.x) && isFinite(d.CI_left) && isFinite(d.CI_right));
    if (showShadow && validArea.length) {
      svg.append('path')
        .datum(validArea)
        .attr('fill', shadowColor)
        .attr('fill-opacity', shadowOpacity)
        .attr('stroke', 'none')
        .attr('d', d3.area()
          .x(d => x(d.x) + axisMargin.x)
          .y0(d => y(d.CI_right) - axisMargin.y)
          .y1(d => y(d.CI_left) - axisMargin.y)
        );
    }
    if (validLine.length) {
      svg.append('path')
        .datum(validLine)
        .attr('fill', 'none')
        .attr('stroke', lineColor)
        .attr('stroke-width', lineThickness)
        .attr('d', d3.line()
          .x(d => x(d.x) + axisMargin.x)
          .y(d => y(d.y) - axisMargin.y)
        );
    }
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

  // 在每次渲染后快照当前控件参数，避免后续保存缺失（例如某些 DOM 被折叠或重新生成导致读取异常）
  if (controlsDiv && config) {
    config._snapshotControls = collectTopLevelControls(controlsDiv);
    // 快照每个 series 的可保存字段
    config.seriesList.forEach(s => {
      if (!s.control) return;
      s._snapshot = {
        lineColor: s.control.querySelector('.line-color')?.value,
        lineThickness: parseFloat(s.control.querySelector('.line-thickness')?.value || '0'),
        showShadow: !!s.control.querySelector('.show-shadow')?.checked,
        shadowColor: s.control.querySelector('.shadow-color')?.value,
        shadowOpacity: parseFloat(s.control.querySelector('.shadow-opacity')?.value || '0'),
        description: s.control.querySelector('.series-description')?.value || '',
        condition: s.condition || null
      };
    });
  }
}

// 绑定 add subplot 按钮
document.getElementById("add-subplot").onclick = function() {
  // 默认复制最后一个子图的参数
  const last = subplots.length ? subplots[subplots.length - 1].config : null;
  createSubplotInstance(last);
};

// 移除全局 Update All，改为任何控件改动自动触发对应子图渲染
// 重新加入一个全局 Update All：用于在加载 JSON 后或批量修改后统一强制刷新，且捕获潜在错误（例如第二个子图渲染失败）
function updateAllSubplots(forceLog=false) {
  subplots.forEach((sp, idx) => {
    try {
      if (!sp || !sp.controlsDiv || !sp.chartDiv || !sp.config) return;
      createChartForSubplot(sp.controlsDiv, sp.chartDiv, sp.config);
    } catch (err) {
      console.error('子图渲染错误 index=' + idx, err);
      if (forceLog) {
        const errDiv = document.getElementById('global-error-log') || (function(){
          const d=document.createElement('div');
          d.id='global-error-log';
          d.style.position='fixed';
          d.style.bottom='4px';
          d.style.left='4px';
          d.style.maxWidth='40vw';
          d.style.maxHeight='30vh';
          d.style.overflow='auto';
          d.style.background='rgba(255,0,0,0.08)';
          d.style.border='1px solid #f00';
          d.style.fontSize='11px';
          d.style.padding='4px 6px';
          d.style.zIndex=99999;
          document.body.appendChild(d);
          return d;
        })();
        const pre=document.createElement('pre');
        pre.textContent='Subplot '+idx+' Error: '+ (err && err.stack || err);
        errDiv.appendChild(pre);
      }
    }
  });
}

// 建立系列与 condition 面板的双向颜色同步
function attachConditionBidirectionalSync(controlsDiv, seriesControl, cond) {
  if (!cond || seriesControl.dataset.condSync === '1') return;
  // 移除 Series -> Condition 的反向同步，避免修改单个系列颜色时意外影响其他同 Condition 系列
  // 仅保留 Condition 面板 -> Series 的单向控制（已在 addOrReuseConditionColorInput 中实现）
  /*
  const wrapper = controlsDiv.querySelector(`#condition-color-map [data-condition="${cond}"]`);
  if (!wrapper) return;
  const lineInputSeries = seriesControl.querySelector('.line-color');
  const shadowInputSeries = seriesControl.querySelector('.shadow-color');
  const lineInputCond = wrapper.querySelector('.condition-line-color');
  const shadowInputCond = wrapper.querySelector('.condition-shadow-color');
  if (lineInputSeries && lineInputCond) {
    lineInputSeries.addEventListener('input', () => {
      if (lineInputCond.value !== lineInputSeries.value) {
        lineInputCond.value = lineInputSeries.value;
        // 触发面板到所有系列的同步
        syncConditionColorsToSeries(controlsDiv, cond, lineInputCond.value, null);
      }
    });
  }
  if (shadowInputSeries && shadowInputCond) {
    shadowInputSeries.addEventListener('input', () => {
      if (shadowInputCond.value !== shadowInputSeries.value) {
        shadowInputCond.value = shadowInputSeries.value;
        syncConditionColorsToSeries(controlsDiv, cond, null, shadowInputCond.value);
      }
    });
  }
  */
  seriesControl.dataset.condSync = '1';
}

// 重新建立所有系列的同步（在加载 state 后调用）
function ensureAllConditionSync(controlsDiv, config) {
  config.seriesList.forEach(s => {
    if (s.condition) attachConditionBidirectionalSync(controlsDiv, s.control, s.condition);
  });
}

const globalUpdateBtn = document.getElementById('update-all');
if (globalUpdateBtn) {
  globalUpdateBtn.addEventListener('click', () => updateAllSubplots(true));
}

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

// =========================
// Save/Load parameters (JSON)
// =========================

function collectTopLevelControls(controlsDiv) {
  const map = {};
  const nodes = controlsDiv.querySelectorAll('input[id], select[id], textarea[id]');
  nodes.forEach(el => {
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

function collectSubplotState(instance) {
  const { div, controlsDiv, chartDiv, config } = instance;
  const xInput = div.querySelector('.subplot-x');
  const yInput = div.querySelector('.subplot-y');
  const descInput = div.querySelector('.subplot-desc');

  const state = {
  id: instance.config?._id || null,
    position: {
      xCm: xInput ? Number(xInput.value) : 0,
      yCm: yInput ? Number(yInput.value) : 0
    },
    description: descInput ? descInput.value : (config.description || ''),
    controls: config._snapshotControls ? {...config._snapshotControls} : collectTopLevelControls(controlsDiv),
    series: [],
    lines: [],
    texts: [],
  areas: [],
  conditionColors: collectConditionColors(controlsDiv)
  };

  // Series
  (config.seriesList || []).forEach(series => {
    const c = series.control;
    if (!c) return;
    const snap = series._snapshot || {};
    const lineColor = c.querySelector('.line-color')?.value || snap.lineColor || '#ff0000';
    const lineThickness = Number(c.querySelector('.line-thickness')?.value || snap.lineThickness || 2);
    const showShadow = c.querySelector('.show-shadow') ? !!c.querySelector('.show-shadow').checked : (snap.showShadow ?? true);
    const shadowColor = c.querySelector('.shadow-color')?.value || snap.shadowColor || '#FF5C5C';
    const shadowOpacity = Number(c.querySelector('.shadow-opacity')?.value || snap.shadowOpacity || 0.3);
    const description = c.querySelector('.series-description')?.value || snap.description || '';
    state.series.push({
      options: { lineColor, lineThickness, showShadow, shadowColor, shadowOpacity, description },
      condition: series.condition || snap.condition || null,
      data: series.data || []
    });
  });

  // Lines
  (config.linesList || []).forEach(lineItem => {
    const c = lineItem.control;
    if (!c) return;
    state.lines.push({
      type: c.querySelector('.line-type')?.value || 'vertical',
      coordinateX: Number(c.querySelector('.line-coordinate-x')?.value || 0),
      coordinateY: Number(c.querySelector('.line-coordinate-y')?.value || 0),
      color: c.querySelector('.line-color')?.value || '#000000',
      thickness: Number(c.querySelector('.line-thickness')?.value || 1),
      style: c.querySelector('.line-style')?.value || 'solid',
      length: Number(c.querySelector('.line-length')?.value || 100)
    });
  });

  // Texts
  (config.textList || []).forEach(item => {
    const c = item.control;
    if (!c) return;
    state.texts.push({
      text: c.querySelector('.text-string')?.value || '',
      x: Number(c.querySelector('.text-coordinate-x')?.value || 0),
      y: Number(c.querySelector('.text-coordinate-y')?.value || 0),
      fontSize: Number(c.querySelector('.text-font-size')?.value || 16),
      fontFamily: c.querySelector('.text-font-family')?.value || 'Arial',
      fontColor: c.querySelector('.text-font-color')?.value || '#000000',
      fontWeight: c.querySelector('.text-bold')?.value || 'normal',
      orientation: c.querySelector('.text-orientation')?.value || 'horizontal'
    });
  });

  // Areas
  (config.areasList || []).forEach(areaObj => {
    const c = areaObj.control;
    if (!c) return;
    state.areas.push({
      options: {
        color: c.querySelector('.area-color')?.value || '#cce5df',
        opacity: Number(c.querySelector('.area-opacity')?.value || 0.5),
        orientation: c.querySelector('.area-orientation')?.value || 'horizontal'
      },
      data: areaObj.data || []
    });
  });

  return state;
}

function collectAllState() {
  const canvasWidthCm = Number(document.getElementById('canvas-width-cm')?.value || 0);
  const canvasHeightCm = Number(document.getElementById('canvas-height-cm')?.value || 0);

  // canvasTexts is const; gather a shallow copy
  const canvasTextsState = (Array.isArray(canvasTexts) ? canvasTexts.map(t => ({...t})) : []);

  const subplotsState = subplots.map(instance => collectSubplotState(instance));

  return {
    version: 1,
    savedAt: new Date().toISOString(),
    canvas: { widthCm: canvasWidthCm, heightCm: canvasHeightCm },
    canvasTexts: canvasTextsState,
    subplots: subplotsState
  };
}

// 保存前强制对所有子图做一次快照，避免未点击 Update 的最新加载数据丢失
function snapshotAllSubplots() {
  subplots.forEach(sp => {
    if (sp && sp.controlsDiv && sp.chartDiv && sp.config) {
      // 不重新布局，只更新 snapshot
      sp.config._snapshotControls = collectTopLevelControls(sp.controlsDiv);
      (sp.config.seriesList || []).forEach(s => {
        if (!s.control) return;
        s._snapshot = {
          lineColor: s.control.querySelector('.line-color')?.value,
          lineThickness: parseFloat(s.control.querySelector('.line-thickness')?.value || '0'),
          showShadow: !!s.control.querySelector('.show-shadow')?.checked,
          shadowColor: s.control.querySelector('.shadow-color')?.value,
          shadowOpacity: parseFloat(s.control.querySelector('.shadow-opacity')?.value || '0'),
          description: s.control.querySelector('.series-description')?.value || '',
          condition: s.condition || null
        };
      });
    }
  });
}

// Hook 保存按钮再次，确保先快照
const saveBtnPatched = document.getElementById('save-params');
if (saveBtnPatched) {
  const oldHandler = saveBtnPatched.onclick;
  saveBtnPatched.onclick = function(e) {
    snapshotAllSubplots();
    if (typeof oldHandler === 'function') oldHandler.call(this, e);
  };
}

function collectConditionColors(controlsDiv) {
  const mapDiv = controlsDiv.querySelector('#condition-color-map');
  if (!mapDiv) return null;
  const entries = mapDiv.querySelectorAll('[data-condition]');
  if (!entries.length) return null;
  const map = {};
  entries.forEach(w => {
    const cond = w.dataset.condition;
    if (!cond) return;
    const lineColor = w.querySelector('.condition-line-color')?.value || '#ff0000';
    const shadowColor = w.querySelector('.condition-shadow-color')?.value || '#FF5C5C';
    map[cond] = { line: lineColor, shadow: shadowColor };
  });
  return Object.keys(map).length ? map : null;
}

function downloadJSON(obj, fileName) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

function applyTopLevelControls(controlsDiv, controlsMap) {
  if (!controlsMap) return;
  Object.keys(controlsMap).forEach(id => {
  // Avoid CSS.escape for broader browser compatibility; IDs here are simple
  const el = controlsDiv.querySelector('#' + id);
    if (!el) return;
    const val = controlsMap[id];
    if (el.type === 'checkbox') {
      el.checked = !!val;
    } else {
      // file 输入框的 value 只能被置空，不能设置文件名，避免 InvalidStateError
      if (el.type === 'file') {
        if (val === '' || val == null) el.value = '';
      } else {
        el.value = val;
      }
    }
  });
}

function rebuildSubplotFromState(state) {
  // Create a fresh subplot instance
  createSubplotInstance(null);
  const instance = subplots[subplots.length - 1];
  const { div, controlsDiv, chartDiv, config } = instance;

  // Position
  const xInput = div.querySelector('.subplot-x');
  const yInput = div.querySelector('.subplot-y');
  if (xInput) xInput.value = state.position?.xCm ?? 0;
  if (yInput) yInput.value = state.position?.yCm ?? 0;
  chartDiv.style.left = (Number(xInput?.value || 0) * CM_TO_PX) + 'px';
  chartDiv.style.top = (Number(yInput?.value || 0) * CM_TO_PX) + 'px';

  // Description
  const descInput = div.querySelector('.subplot-desc');
  if (descInput) descInput.value = state.description || '';
  config.description = state.description || '';

  // Apply top-level controls
  applyTopLevelControls(controlsDiv, state.controls);

  // Series
  (state.series || []).forEach((s, idx) => {
    const control = createSeriesControl(config.seriesList.length, controlsDiv, chartDiv, config);
    // Set options
    if (s.options) {
      control.querySelector('.line-color').value = s.options.lineColor ?? '#ff0000';
      control.querySelector('.line-thickness').value = s.options.lineThickness ?? 2;
      control.querySelector('.show-shadow').checked = !!s.options.showShadow;
      control.querySelector('.shadow-color').value = s.options.shadowColor ?? '#FF5C5C';
      control.querySelector('.shadow-opacity').value = s.options.shadowOpacity ?? 0.3;
      const sd = control.querySelector('.series-description');
      if (sd) sd.value = s.options.description || '';
    }
    config.seriesList.push({ data: s.data || [], control, condition: s.condition || null });
    controlsDiv.querySelector('#series-controls').appendChild(control);
  });

  // Restore unique id
  if (state.id) {
    config._id = state.id;
  }

  // Rebuild condition colors (apply to matching descriptions)
  if (state.conditionColors) {
    ensureConditionColorPanel(controlsDiv);
    Object.entries(state.conditionColors).forEach(([cond, val]) => {
      // 向后兼容：val 可能是字符串
      let lineClr, shadowClr;
      if (typeof val === 'string') {
        lineClr = val; shadowClr = '#FF5C5C';
      } else {
        lineClr = val.line || '#ff0000';
        shadowClr = val.shadow || '#FF5C5C';
      }
      const entry = addOrReuseConditionColorInput(controlsDiv, cond, lineClr);
      const lineInput = entry.querySelector('.condition-line-color');
      const shadowInput = entry.querySelector('.condition-shadow-color');
      if (lineInput) lineInput.value = lineClr;
      if (shadowInput) shadowInput.value = shadowClr;
      // 同步到 series
      syncConditionColorsToSeries(controlsDiv, cond, lineClr, shadowClr);
    });
  }

  // Lines
  (state.lines || []).forEach((ln, idx) => {
    const control = createLineControl(config.linesList.length, controlsDiv, chartDiv, config);
    control.querySelector('.line-type').value = ln.type ?? 'vertical';
    control.querySelector('.line-coordinate-x').value = ln.coordinateX ?? 0;
    control.querySelector('.line-coordinate-y').value = ln.coordinateY ?? 0;
    control.querySelector('.line-color').value = ln.color ?? '#000000';
    control.querySelector('.line-thickness').value = ln.thickness ?? 1;
    control.querySelector('.line-style').value = ln.style ?? 'solid';
    control.querySelector('.line-length').value = ln.length ?? 100;
    config.linesList.push({ control });
    controlsDiv.querySelector('#line-controls').appendChild(control);
  });

  // Texts
  (state.texts || []).forEach((tx, idx) => {
    const control = createTextControl(config.textList.length, controlsDiv, chartDiv, config);
    control.querySelector('.text-string').value = tx.text || '';
    control.querySelector('.text-coordinate-x').value = tx.x ?? 0;
    control.querySelector('.text-coordinate-y').value = tx.y ?? 0;
    control.querySelector('.text-font-size').value = tx.fontSize ?? 16;
    control.querySelector('.text-font-family').value = tx.fontFamily ?? 'Arial';
    control.querySelector('.text-font-color').value = tx.fontColor ?? '#000000';
    control.querySelector('.text-bold').value = tx.fontWeight ?? 'normal';
    control.querySelector('.text-orientation').value = tx.orientation ?? 'horizontal';
    config.textList.push({ control });
    controlsDiv.querySelector('#text-controls').appendChild(control);
  });

  // Areas
  (state.areas || []).forEach((ar, idx) => {
    const areaObj = createAreaControl(config.areasList.length, controlsDiv, chartDiv, config);
    if (ar.options) {
      areaObj.control.querySelector('.area-color').value = ar.options.color ?? '#cce5df';
      areaObj.control.querySelector('.area-opacity').value = ar.options.opacity ?? 0.5;
      areaObj.control.querySelector('.area-orientation').value = ar.options.orientation ?? 'horizontal';
    }
    areaObj.data = ar.data || null;
    config.areasList.push(areaObj);
    controlsDiv.querySelector('#area-controls').appendChild(areaObj.control);
  });

  // Finally render
  createChartForSubplot(controlsDiv, chartDiv, config);

  // 如果没有保存具体的 series 数据但存在 data-url，则自动拉取 URL 数据生成系列
  try {
    const hasSavedSeries = (state.series && state.series.length > 0);
    const dataUrlFromState = state.controls && state.controls['data-url'];
    if (!hasSavedSeries && dataUrlFromState) {
      d3.csv(dataUrlFromState).then(data => {
        // 复用已有逻辑（不拆 condition 时直接一条）
        addSeriesDataPossiblySplit(data, controlsDiv, chartDiv, config, dataUrlFromState);
        createChartForSubplot(controlsDiv, chartDiv, config);
      }).catch(err => {
        console.error('自动加载 data-url 失败:', dataUrlFromState, err);
      });
    }
  } catch(fetchErr) {
    console.error('检查或加载 data-url 过程中出错', fetchErr);
  }
  // 确保加载后所有系列与 condition 面板颜色双向同步
  ensureAllConditionSync(controlsDiv, config);
}

function clearAllSubplots() {
  // Remove DOM nodes
  document.querySelectorAll('.subplot-instance').forEach(n => n.remove());
  document.querySelectorAll('.subplot-chart').forEach(n => n.remove());
  // Reset array
  subplots = [];
}

function loadState(obj) {
  if (!obj) return;

  // Canvas size
  const cw = document.getElementById('canvas-width-cm');
  const ch = document.getElementById('canvas-height-cm');
  if (cw && obj.canvas?.widthCm != null) cw.value = obj.canvas.widthCm;
  if (ch && obj.canvas?.heightCm != null) ch.value = obj.canvas.heightCm;

  // Apply to style
  const canvasArea = document.getElementById('canvas-area');
  if (canvasArea) {
    const wpx = Number(cw?.value || 0) * CM_TO_PX;
    const hpx = Number(ch?.value || 0) * CM_TO_PX;
    canvasArea.style.width = wpx + 'px';
    canvasArea.style.height = hpx + 'px';
  }

  // Canvas texts
  if (Array.isArray(obj.canvasTexts)) {
    // mutate the const array
    canvasTexts.length = 0;
    obj.canvasTexts.forEach(t => canvasTexts.push({ ...t }));
    renderCanvasTexts();
  }

  // Subplots
  clearAllSubplots();
  (obj.subplots || []).forEach((s,i) => {
    try {
      rebuildSubplotFromState(s);
    } catch(e){
      console.error('rebuildSubplotFromState error index='+i, e);
    }
  });
  // 加载完成后统一刷新一次（使用全局函数带错误抓取）
  setTimeout(()=>updateAllSubplots(true),0);
  // 额外：再次检测哪些子图没有 series 且有 data-url，尝试补拉取（防止异步顺序问题）
  setTimeout(()=>{
    subplots.forEach(sp => {
      try {
        if (sp.config.seriesList.length === 0) {
          const urlInput = sp.controlsDiv.querySelector('#data-url');
          const val = urlInput && urlInput.value;
          if (val) {
            console.log('补拉取 data-url:', val);
            d3.csv(val).then(data => {
              addSeriesDataPossiblySplit(data, sp.controlsDiv, sp.chartDiv, sp.config, val);
              createChartForSubplot(sp.controlsDiv, sp.chartDiv, sp.config);
            });
          } else {
            console.log('子图无数据且无URL, index=', subplots.indexOf(sp));
          }
        }
      } catch(e){
        console.error('补拉取检测出错', e);
      }
    });
  }, 50);
}

// Wire buttons
document.getElementById('save-params')?.addEventListener('click', () => {
  const state = collectAllState();
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  downloadJSON(state, `timeline_plot_params_${ts}.json`);
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
      loadState(obj);
    } catch (applyErr) {
      // Do not alert here since params may be mostly applied; just log for debugging
      console.error('Error applying loaded params:', applyErr);
    } finally {
      e.target.value = '';
    }
  };
  reader.readAsText(file);
});

