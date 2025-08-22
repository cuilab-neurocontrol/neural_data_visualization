let trajGroups = []; // 存储每次上传的轨迹组
let groupCounter = 0; // 组计数器
let scatterGroups = []; // 新增：存储散点图组
let scatterGroupCounter = 0; // 新增：散点图组计数器
let projection = { alpha: Math.PI/6, beta: Math.PI/6 }; // 初始旋转角

// 单位换算：1cm = 37.8px (标准96dpi)
const PX_PER_CM = 96 / 2.54;

// 支持动态画布和 margin（单位cm）+ 保护
function getCanvasSize() {
  const MIN_CM = 2; // 防止被设成极小
  let w_cm = parseFloat(document.getElementById("canvas-width")?.value);
  let h_cm = parseFloat(document.getElementById("canvas-height")?.value);
  if (!isFinite(w_cm) || w_cm < MIN_CM) w_cm = 8;
  if (!isFinite(h_cm) || h_cm < MIN_CM) h_cm = 8;
  return { width: w_cm * PX_PER_CM, height: h_cm * PX_PER_CM, w_cm, h_cm };
}

// 兼容：如果只有旧的 canvas-margin 则四个方向一样；如果有四个则分别读取
function getMargins() {
  const single = document.getElementById("canvas-margin");
  if (single) {
    const m = parseFloat(single.value);
    const val = (isFinite(m) ? m : 1.5) * PX_PER_CM;
    return { top: val, right: val, bottom: val, left: val };
  }
  function gv(id, d=1.5){
    const v = parseFloat(document.getElementById(id)?.value);
    return (isFinite(v)? v : d) * PX_PER_CM;
  }
  return {
    top: gv('margin-top'),
    right: gv('margin-right'),
    bottom: gv('margin-bottom'),
    left: gv('margin-left')
  };
}

function clampMargins(margins, width, height){
  // 确保绘图区至少 40x40 像素
  const MIN_AREA_SIDE = 40;
  const maxLeft = width/2 - MIN_AREA_SIDE/2;
  const maxRight = maxLeft;
  const maxTop = height/2 - MIN_AREA_SIDE/2;
  const maxBottom = maxTop;
  margins.left = Math.min(margins.left, maxLeft);
  margins.right = Math.min(margins.right, maxRight);
  margins.top = Math.min(margins.top, maxTop);
  margins.bottom = Math.min(margins.bottom, maxBottom);
  return margins;
}

function sanitizeDomain(str, fallback=[-100,100]){
  if (!str) return fallback.slice();
  const parts = String(str).split(',').map(s=>parseFloat(s));
  if (parts.length<2 || !isFinite(parts[0]) || !isFinite(parts[1]) || parts[0]===parts[1]) return fallback.slice();
  return parts;
}

function resizeSVG() {
  const { width, height } = getCanvasSize();
  d3.select("#svg")
    .attr("width", width)
    .attr("height", height);
  g.attr("transform", `translate(${width/2},${height/2})`);
}

const svg = d3.select("#svg");
const g = svg.append("g");

// 伪3D投影
function project3d(x, y, z) {
  const { alpha, beta } = projection;
  const x1 = x * Math.cos(beta) + z * Math.sin(beta);
  const z1 = -x * Math.sin(beta) + z * Math.cos(beta);
  const y1 = y * Math.cos(alpha) - z1 * Math.sin(alpha);
  return [x1, y1];
}

function draw() {
  // 动态获取画布和 margin
  const { width, height } = getCanvasSize();
  let margins = getMargins();
  margins = clampMargins(margins, width, height);
  resizeSVG();
  g.selectAll("*").remove();

  // 读domain
  const xdom = sanitizeDomain(document.getElementById("x-domain")?.value);
  const ydom = sanitizeDomain(document.getElementById("y-domain")?.value);
  const zdom = sanitizeDomain(document.getElementById("z-domain")?.value);

  // 3D→2D投影后做缩放
  const corners = [
    project3d(xdom[0], ydom[0], zdom[0]), // 原点
    project3d(xdom[1], ydom[0], zdom[0]), // x轴终点
    project3d(xdom[0], ydom[1], zdom[0]), // y轴终点
    project3d(xdom[0], ydom[0], zdom[1])  // z轴终点
  ];
  const xs = corners.map(d=>d[0]), ys = corners.map(d=>d[1]);
  const xScale = d3.scaleLinear().domain([d3.min(xs), d3.max(xs)])
    .range([-width/2 + margins.left, width/2 - margins.right]);
  const yScale = d3.scaleLinear().domain([d3.min(ys), d3.max(ys)])
    .range([height/2 - margins.bottom, -height/2 + margins.top]);

  // 读取粗细参数（px），不改方向逻辑
  const axisWidth = parseFloat(document.getElementById("axis-width-px")?.value) || 2;
  const tickWidth = parseFloat(document.getElementById("tick-width-px")?.value) || 1;
  const gridWidth = parseFloat(document.getElementById("grid-width-px")?.value) || 1;

  // 读取用户指定的刻度位置
  const xTicks = document.getElementById("x-ticks").value.split(",").map(Number);
  const yTicks = document.getElementById("y-ticks").value.split(",").map(Number);
  const zTicks = document.getElementById("z-ticks").value.split(",").map(Number);

  // 1. 画三面网格（底面PC1-PC2，左面PC1-PC3，外面PC2-PC3）
  // 用刻度位置替代原来的均分
  
  // --- 底面 PC1-PC2 (y=ydom[0]) ---
  xTicks.forEach(xv => {
    let p1 = project3d(xv, ydom[0], zdom[0]);
    let p2 = project3d(xv, ydom[0], zdom[1]);
    g.append("line")
      .attr("x1", xScale(p1[0])).attr("y1", yScale(p1[1]))
      .attr("x2", xScale(p2[0])).attr("y2", yScale(p2[1]))
      .attr("stroke", "#ddd").attr("stroke-width", gridWidth);
  });
  zTicks.forEach(zv => {
    let p1 = project3d(xdom[0], ydom[0], zv);
    let p2 = project3d(xdom[1], ydom[0], zv);
    g.append("line")
      .attr("x1", xScale(p1[0])).attr("y1", yScale(p1[1]))
      .attr("x2", xScale(p2[0])).attr("y2", yScale(p2[1]))
      .attr("stroke", "#ddd").attr("stroke-width", gridWidth);
  });

  // --- 左面 PC1-PC3 (z=zdom[0]) ---
  xTicks.forEach(xv => {
    let p1 = project3d(xv, ydom[0], zdom[0]);
    let p2 = project3d(xv, ydom[1], zdom[0]);
    g.append("line")
      .attr("x1", xScale(p1[0])).attr("y1", yScale(p1[1]))
      .attr("x2", xScale(p2[0])).attr("y2", yScale(p2[1]))
      .attr("stroke", "#eee").attr("stroke-width", gridWidth);
  });
  yTicks.forEach(yv => {
    let p1 = project3d(xdom[0], yv, zdom[0]);
    let p2 = project3d(xdom[1], yv, zdom[0]);
    g.append("line")
      .attr("x1", xScale(p1[0])).attr("y1", yScale(p1[1]))
      .attr("x2", xScale(p2[0])).attr("y2", yScale(p2[1]))
      .attr("stroke", "#eee").attr("stroke-width", gridWidth);
  });

  // --- 外面 PC2-PC3 (x=xdom[0]) ---
  yTicks.forEach(yv => {
    let p1 = project3d(xdom[0], yv, zdom[0]);
    let p2 = project3d(xdom[0], yv, zdom[1]);
    g.append("line")
      .attr("x1", xScale(p1[0])).attr("y1", yScale(p1[1]))
      .attr("x2", xScale(p2[0])).attr("y2", yScale(p2[1]))
      .attr("stroke", "#eee").attr("stroke-width", gridWidth);
  });
  zTicks.forEach(zv => {
    let p1 = project3d(xdom[0], ydom[0], zv);
    let p2 = project3d(xdom[0], ydom[1], zv);
    g.append("line")
      .attr("x1", xScale(p1[0])).attr("y1", yScale(p1[1]))
      .attr("x2", xScale(p2[0])).attr("y2", yScale(p2[1]))
      .attr("stroke", "#eee").attr("stroke-width", gridWidth);
  });

  // 2. 画三条主轴
  const axes = [
    { from: [xdom[0], ydom[0], zdom[1]], to: [xdom[1], ydom[0], zdom[1]], label: "PC 1", index: 0 },
    { from: [xdom[0], ydom[0], zdom[1]], to: [xdom[0], ydom[1], zdom[1]], label: "PC 3", index: 1 },
    { from: [xdom[1], ydom[0], zdom[0]], to: [xdom[1], ydom[0], zdom[1]], label: "PC 2", index: 2 }
  ];

  // 读取轴标签样式参数
  const axisLabels = document.getElementById("axis-labels").value.split(",").map(s => s.trim());
  const axisLabelFontSize = parseFloat(document.getElementById("axis-label-font-size")?.value) || 14;
  const axisLabelFontFamily = document.getElementById("axis-label-font-family")?.value || "Arial";
  const axisLabelFontWeight = document.getElementById("axis-label-font-weight")?.value || "bold";
  const axisLabelDistance = parseFloat(document.getElementById("axis-label-distance")?.value) || 30;

  axes.forEach(axis => {
    const p1 = project3d(...axis.from), p2 = project3d(...axis.to);
    g.append("line")
      .attr("x1", xScale(p1[0])).attr("y1", yScale(p1[1]))
      .attr("x2", xScale(p2[0])).attr("y2", yScale(p2[1]))
      .attr("stroke", "#000").attr("stroke-width", axisWidth);
    
    // 1. 找轴的中点
    const midPoint3d = [
      (axis.from[0] + axis.to[0]) / 2,
      (axis.from[1] + axis.to[1]) / 2,
      (axis.from[2] + axis.to[2]) / 2
    ];
    
    // 2. 使用与刻度线相同的方向，但距离更远
    let dir3d;
    if (axis.label === "PC 1")      dir3d = [0, 0, 1];  // 与刻度线方向相同
    else if (axis.label === "PC 3") dir3d = [0, 0, 1];  // 与刻度线方向相同
    else                            dir3d = [1, 0, 0];  // 与刻度线方向相同
    
    // 3. 标签位置 = 轴中点 + 方向 * 距离
    const labelPos3d = [
      midPoint3d[0] + dir3d[0] * axisLabelDistance,
      midPoint3d[1] + dir3d[1] * axisLabelDistance,
      midPoint3d[2] + dir3d[2] * axisLabelDistance
    ];
    
    const [lx, ly] = project3d(...labelPos3d);
    
    // 获取自定义标签内容
    const labelText = axisLabels[axis.index] || axis.label;
    
    // PC3标签保持垂直，其他标签水平
    const transform = axis.label === "PC 3" ? `rotate(-90, ${xScale(lx)}, ${yScale(ly)})` : "";
    
    g.append("text")
      .attr("x", xScale(lx))
      .attr("y", yScale(ly))
      .attr("transform", transform)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .style("font-size", axisLabelFontSize + "px")
      .style("font-family", axisLabelFontFamily)
      .style("font-weight", axisLabelFontWeight)
      .style("fill", "#000")
      .text(labelText);
  });

  // 3. 刻度线：在指定位置画，方向完全不变
  const tickPx  = parseFloat(document.getElementById("tick-length-px")?.value) || 10;
  const dirSign = document.getElementById("tick-direction")?.value === "in" ? -1 : 1;
  const tickLen = tickPx * dirSign;

  // 读取刻度标签
  const xLabels = document.getElementById("x-labels").value.split(",").map(s => s.trim());
  const yLabels = document.getElementById("y-labels").value.split(",").map(s => s.trim());
  const zLabels = document.getElementById("z-labels").value.split(",").map(s => s.trim());

  // 读取标签样式参数
  const labelFontSize = parseFloat(document.getElementById("label-font-size")?.value) || 12;
  const labelFontFamily = document.getElementById("label-font-family")?.value || "Arial";
  const labelDistance = parseFloat(document.getElementById("label-distance")?.value) || 15;

  axes.forEach(axis => {
    const ticks = axis.label === "PC 1" ? xTicks
                : axis.label === "PC 3" ? yTicks
                : zTicks;
    const labels = axis.label === "PC 1" ? xLabels
                : axis.label === "PC 3" ? yLabels
                : zLabels;
    // 方向完全不变
    let dir3d;
    if (axis.label === "PC 1")      dir3d = [0, 0, 1];
    else if (axis.label === "PC 3") dir3d = [0, 0, 1];
    else                            dir3d = [1, 0, 0];

    ticks.forEach((val, i) => {
      // 根据轴的定义计算刻度基点
      let base3d;
      if (axis.label === "PC 1") {
        base3d = [val, ydom[0], zdom[1]];
      } else if (axis.label === "PC 3") {
        base3d = [xdom[0], val, zdom[1]];
      } else {
        base3d = [xdom[1], ydom[0], val];
      }
      
      const end3d = [
        base3d[0] + dir3d[0] * tickLen,
        base3d[1] + dir3d[1] * tickLen,
        base3d[2] + dir3d[2] * tickLen
      ];
      const [b0, b1] = project3d(...base3d),
            [e0, e1] = project3d(...end3d);
      
      // 画刻度线
      g.append("line")
        .attr("x1", xScale(b0)).attr("y1", yScale(b1))
        .attr("x2", xScale(e0)).attr("y2", yScale(e1))
        .attr("stroke", "#000").attr("stroke-width", tickWidth);
      
      // 添加刻度数值标签
      const labelPos = [
        base3d[0] + dir3d[0] * (tickLen + labelDistance),
        base3d[1] + dir3d[1] * (tickLen + labelDistance),
        base3d[2] + dir3d[2] * (tickLen + labelDistance)
      ];
      const [lx, ly] = project3d(...labelPos);
      
      g.append("text")
        .attr("x", xScale(lx))
        .attr("y", yScale(ly))
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .style("font-size", labelFontSize + "px")
        .style("font-family", labelFontFamily)
        .style("fill", "#000")
        .text(labels[i] !== undefined ? labels[i] : val); // 优先使用自定义标签，支持空字符串
    });
  });

  // 4. 画轨迹（支持每条轨迹单独样式）
  trajGroups.forEach(group => {
    if (!group.visible) return; // 如果组不可见，则跳过

    group.trajectories.forEach(traj => {
      // 兼容旧数据结构：traj 可能是数组，也可能是 {id, points, ...}
      const points = Array.isArray(traj) ? traj : (traj.points || []);
      const tStyle = (traj && traj.style !== undefined) ? traj.style : group.style;
      const tColor = (traj && traj.color !== undefined) ? traj.color : group.color;
      const tWidth = (traj && traj.width !== undefined) ? traj.width : group.width;
      const tVisible = (traj && traj.visible !== undefined) ? traj.visible : group.visible;
      if (!tVisible) return;

      let strokeDasharray = "none";
      if (tStyle === "dashed") strokeDasharray = "5,5";
      else if (tStyle === "dotted") strokeDasharray = "2,2";

      const lineData = points.map(d => {
        const [x2d, y2d] = project3d(d.x, d.y, d.z);
        return [xScale(x2d), yScale(y2d)];
      });
      g.append("path")
        .attr("d", d3.line()(lineData))
        .attr("stroke", tColor)
        .attr("stroke-width", tWidth)
        .attr("stroke-dasharray", strokeDasharray)
        .attr("fill", "none")
        .attr("pointer-events", "none")
        .attr("opacity", 0.85);
    });
  });

  // 5. 画散点图
  scatterGroups.forEach(group => {
    if (!group.visible) return;

    // Map string shape name to D3 symbol type
    const symbolTypes = {
      'circle': d3.symbolCircle,
      'cross': d3.symbolCross,
      'diamond': d3.symbolDiamond,
      'square': d3.symbolSquare,
      'star': d3.symbolStar,
      'triangle': d3.symbolTriangle,
      'wye': d3.symbolWye
    };

    // Create a symbol generator for the group
    const symbolGenerator = d3.symbol()
      .type(symbolTypes[group.shape] || d3.symbolCircle) // Fallback to circle
      .size(group.size * group.size * Math.PI); // Set area based on radius-like size

    group.points.forEach(point => {
      const [x2d, y2d] = project3d(point.x, point.y, point.z);
      // Use a path for the symbol instead of a circle
      g.append("path")
        .attr("d", symbolGenerator)
        .attr("transform", `translate(${xScale(x2d)}, ${yScale(y2d)})`)
        .attr("fill", group.color) // 使用组的颜色
        .attr("stroke", "none") // 移除边框
        .attr("opacity", 0.8);
    });
  });

  // 6. 画图例（可隐藏）
  const legendVisible = document.getElementById("legend-visible")?.checked;
  if (legendVisible) {
    const legendX = parseFloat(document.getElementById("legend-x").value);
    const legendY = parseFloat(document.getElementById("legend-y").value);
    const legendFontSize = parseFloat(document.getElementById("legend-font-size").value);
    const legendFontFamily = document.getElementById("legend-font-family").value;
    const legendTranslateX = legendX - width / 2;
    const legendTranslateY = legendY - height / 2;
    const legend = g.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${legendTranslateX}, ${legendTranslateY})`);
    let legendYOffset = 0;
    scatterGroups.forEach(group => {
      if (!group.visible) return;
      const legendItem = legend.append("g")
        .attr("transform", `translate(0, ${legendYOffset})`);
      const symbolTypes = {
        'circle': d3.symbolCircle,
        'cross': d3.symbolCross,
        'diamond': d3.symbolDiamond,
        'square': d3.symbolSquare,
        'star': d3.symbolStar,
        'triangle': d3.symbolTriangle,
        'wye': d3.symbolWye
      };
      const legendSymbol = d3.symbol()
        .type(symbolTypes[group.shape] || d3.symbolCircle)
        .size(100);
      legendItem.append("path")
        .attr("d", legendSymbol)
        .attr("transform", `translate(8, 8)`)
        .attr("fill", group.color)
        .attr("stroke", "none");
      legendItem.append("text")
        .attr("x", 20)
        .attr("y", 12)
        .text(group.name)
        .style("font-size", `${legendFontSize}px`)
        .style("font-family", legendFontFamily)
        .attr("alignment-baseline", "middle");
      legendYOffset += (legendFontSize + 8);
    });
  }

  // 7. 画图标
  const chartTitleVisible = document.getElementById("chart-title-visible").checked;
  if (chartTitleVisible) {
    const chartTitleText = document.getElementById("chart-title-text").value;
    const chartTitleX = parseFloat(document.getElementById("chart-title-x").value);
    const chartTitleY = parseFloat(document.getElementById("chart-title-y").value);
    const chartTitleFontSize = parseFloat(document.getElementById("chart-title-font-size").value);
    const chartTitleFontFamily = document.getElementById("chart-title-font-family").value;
    const chartTitleFontWeight = document.getElementById("chart-title-font-weight").value;

    // 坐标转换为相对于中心 g
    const chartTitleTranslateX = chartTitleX - width / 2;
    const chartTitleTranslateY = chartTitleY - height / 2;

    g.append("text")
      .attr("class", "chart-title")
      .attr("x", chartTitleTranslateX)
      .attr("y", chartTitleTranslateY)
      .attr("text-anchor", "middle")
      .style("font-size", `${chartTitleFontSize}px`)
      .style("font-family", chartTitleFontFamily)
      .style("font-weight", chartTitleFontWeight)
      .text(chartTitleText);
  }
}

// 拖拽旋转
svg.call(
  d3.drag()
    .on("start", function(event) {
      svg.style("cursor", "grabbing");
      this._last = [event.x, event.y];
    })
    .on("drag", function(event) {
      const [lx, ly] = this._last;
      const dx = event.x - lx, dy = event.y - ly;
      this._last = [event.x, event.y];
      projection.beta += dx * 0.01;
      projection.alpha += dy * 0.01;
      draw();
    })
    .on("end", function() {
      svg.style("cursor", "grab");
    })
);

svg.style("cursor", "grab");

// --- 新增：轨迹组和面板管理函数 ---

// 创建轨迹组控制面板
function createTrajectoryPanel(group) {
  const panelsContainer = document.getElementById('trajectory-panels');
  
  const panel = document.createElement('div');
  panel.className = 'trajectory-panel';
  panel.id = `panel-${group.id}`;
  
  panel.innerHTML = `
    <h4>
      <span>${group.name} (${group.trajectories.length}条轨迹)</span>
      <button class="delete-btn" onclick="deleteGroup(${group.id})">删除</button>
    </h4>
    <div class="trajectory-controls">
      <label>
        <span>线粗细 (px):</span>
        <input type="number" value="${group.width}" min="0.1" step="0.1" 
               onchange="updateGroup(${group.id}, 'width', this.value)">
      </label>
      <label>
        <span>颜色:</span>
        <input type="color" value="${group.color}" 
               onchange="updateGroup(${group.id}, 'color', this.value)">
      </label>
      <label>
        <span>线型:</span>
        <select onchange="updateGroup(${group.id}, 'style', this.value)">
          <option value="solid" ${group.style === 'solid' ? 'selected' : ''}>实线</option>
          <option value="dashed" ${group.style === 'dashed' ? 'selected' : ''}>虚线</option>
          <option value="dotted" ${group.style === 'dotted' ? 'selected' : ''}>点线</option>
        </select>
      </label>
      <label>
        <span>显示:</span>
        <input type="checkbox" ${group.visible ? 'checked' : ''} 
               onchange="updateGroup(${group.id}, 'visible', this.checked)">
      </label>
      <label class="description-input">
        <span>描述:</span>
        <input type="text" placeholder="输入描述..." value="${group.description}"
               onchange="updateGroup(${group.id}, 'description', this.value)">
      </label>
    </div>
    <details class="subtraj-section">
      <summary>每条轨迹样式（${group.trajectories.length} 条）</summary>
      <div class="trajectory-controls" id="subtraj-${group.id}"></div>
    </details>
  `;
  
  panelsContainer.appendChild(panel);
  renderSubTrajectoryControls(group);
}

// 更新轨迹组属性
function updateGroup(id, property, value) {
  const group = trajGroups.find(g => g.id === id);
  if (group) {
    if (property === 'width') group.width = parseFloat(value);
    else if (property === 'color') group.color = value;
    else if (property === 'style') group.style = value;
    else if (property === 'visible') group.visible = value;
    else if (property === 'description') group.description = value;
    
    draw();
  }
}

// 渲染每条轨迹的样式控制
function renderSubTrajectoryControls(group) {
  const container = document.getElementById(`subtraj-${group.id}`);
  if (!container) return;
  container.innerHTML = '';

  group.trajectories.forEach(traj => {
    const row = document.createElement('div');
    row.className = 'trajectory-controls';
    row.style.gridTemplateColumns = 'repeat(4, minmax(0, 1fr))';

    const resolvedWidth = (traj.width !== undefined) ? traj.width : group.width;
    const resolvedColor = (traj.color !== undefined) ? traj.color : group.color;
    const resolvedStyle = (traj.style !== undefined) ? traj.style : group.style;
    const resolvedVisible = (traj.visible !== undefined) ? traj.visible : group.visible;

    const label = document.createElement('div');
    label.style.gridColumn = '1 / -1';
    label.style.fontWeight = '600';
    label.style.margin = '0.25em 0';
    label.textContent = `轨迹ID: ${traj.id}`;

    const widthLabel = document.createElement('label');
    widthLabel.innerHTML = `<span>粗细(px):</span>`;
    const widthInput = document.createElement('input');
    widthInput.type = 'number';
    widthInput.min = '0.1';
    widthInput.step = '0.1';
    widthInput.value = resolvedWidth;
    widthInput.addEventListener('change', () => updateTrajectory(group.id, traj.id, 'width', widthInput.value));
    widthLabel.appendChild(widthInput);

    const colorLabel = document.createElement('label');
    colorLabel.innerHTML = `<span>颜色:</span>`;
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.value = resolvedColor || '#000000';
    colorInput.addEventListener('change', () => updateTrajectory(group.id, traj.id, 'color', colorInput.value));
    colorLabel.appendChild(colorInput);

    const styleLabel = document.createElement('label');
    styleLabel.innerHTML = `<span>线型:</span>`;
    const styleSelect = document.createElement('select');
    ['solid','dashed','dotted'].forEach(opt => {
      const o = document.createElement('option');
      o.value = opt; o.textContent = opt === 'solid' ? '实线' : opt === 'dashed' ? '虚线' : '点线';
      if (resolvedStyle === opt) o.selected = true;
      styleSelect.appendChild(o);
    });
    styleSelect.addEventListener('change', () => updateTrajectory(group.id, traj.id, 'style', styleSelect.value));
    styleLabel.appendChild(styleSelect);

    const visLabel = document.createElement('label');
    visLabel.innerHTML = `<span>显示:</span>`;
    const visInput = document.createElement('input');
    visInput.type = 'checkbox';
    visInput.checked = resolvedVisible;
    visInput.addEventListener('change', () => updateTrajectory(group.id, traj.id, 'visible', visInput.checked));
    visLabel.appendChild(visInput);

    container.appendChild(label);
    container.appendChild(widthLabel);
    container.appendChild(colorLabel);
    container.appendChild(styleLabel);
    container.appendChild(visLabel);
  });
}

// 更新单条轨迹属性（覆盖组默认）
function updateTrajectory(groupId, trajId, property, value) {
  const group = trajGroups.find(g => g.id === groupId);
  if (!group) return;
  const traj = group.trajectories.find(t => String(t.id) === String(trajId));
  if (!traj) return;

  if (property === 'width') traj.width = parseFloat(value);
  else if (property === 'color') traj.color = value;
  else if (property === 'style') traj.style = value;
  else if (property === 'visible') traj.visible = value;

  draw();
}

// 删除轨迹组
function deleteGroup(id) {
  const index = trajGroups.findIndex(g => g.id === id);
  if (index > -1) {
    trajGroups.splice(index, 1);
    document.getElementById(`panel-${id}`).remove();
    draw();
  }
}

// --- 新增：散点图组和面板管理函数 ---

// 创建散点图控制面板
function createScatterPanel(group) {
  const panelsContainer = document.getElementById('scatter-panels');
  
  const panel = document.createElement('div');
  panel.className = 'trajectory-panel'; // Re-use same style
  panel.id = `scatter-panel-${group.id}`;
  
  panel.innerHTML = `
    <h4>
      <span>${group.name} (${group.points.length}个点)</span>
      <button class="delete-btn" onclick="deleteScatterGroup(${group.id})">删除</button>
    </h4>
    <div class="trajectory-controls">
      <label>
        <span>点大小 (px):</span>
        <input type="number" value="${group.size}" min="1" step="0.5" 
               onchange="updateScatterGroup(${group.id}, 'size', this.value)">
      </label>
      <label>
        <span>颜色:</span>
        <input type="color" value="${group.color}" 
               onchange="updateScatterGroup(${group.id}, 'color', this.value)">
      </label>
      <label>
        <span>点形状:</span>
        <select onchange="updateScatterGroup(${group.id}, 'shape', this.value)">
          <option value="circle" ${group.shape === 'circle' ? 'selected' : ''}>Circle</option>
          <option value="cross" ${group.shape === 'cross' ? 'selected' : ''}>Cross</option>
          <option value="diamond" ${group.shape === 'diamond' ? 'selected' : ''}>Diamond</option>
          <option value="square" ${group.shape === 'square' ? 'selected' : ''}>Square</option>
          <option value="star" ${group.shape === 'star' ? 'selected' : ''}>Star</option>
          <option value="triangle" ${group.shape === 'triangle' ? 'selected' : ''}>Triangle</option>
          <option value="wye" ${group.shape === 'wye' ? 'selected' : ''}>Wye</option>
        </select>
      </label>
      <label>
        <span>显示:</span>
        <input type="checkbox" ${group.visible ? 'checked' : ''} 
               onchange="updateScatterGroup(${group.id}, 'visible', this.checked)">
      </label>
    </div>
  `;
  
  panelsContainer.appendChild(panel);
}

// 更新散点图组属性
function updateScatterGroup(id, property, value) {
  const group = scatterGroups.find(g => g.id === id);
  if (group) {
    if (property === 'size') group.size = parseFloat(value);
    else if (property === 'color') group.color = value;
    else if (property === 'visible') group.visible = value;
    else if (property === 'shape') group.shape = value; // Add shape handling
    
    draw();
  }
}

// 删除散点图组
function deleteScatterGroup(id) {
  const index = scatterGroups.findIndex(g => g.id === id);
  if (index > -1) {
    scatterGroups.splice(index, 1);
    document.getElementById(`scatter-panel-${id}`).remove();
    draw();
  }
}

document.getElementById("file-input").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = evt => {
  const data = d3.csvParse(evt.target.result, d3.autoType);
  const trajectories = d3.groups(data, d => d.traj_id).map(([id, rows]) => ({ id, points: rows }));
    
    // 创建新的轨迹组
    const newGroup = {
      id: ++groupCounter,
      name: file.name,
      trajectories: trajectories,
      width: 2,
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`, // 使用随机十六进制颜色
      style: 'solid',
      visible: true,
      description: ''
    };
    
  trajGroups.push(newGroup);
  createTrajectoryPanel(newGroup);
    draw();
  };
  reader.readAsText(file);
  // 清空文件输入，允许重复上传同一文件
  e.target.value = '';
});

// 新增：散点图文件上传处理
document.getElementById("scatter-file-input").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = evt => {
    const data = d3.csvParse(evt.target.result, d3.autoType);
    
    // 按 'category' 分组，为每个类别创建一个散点图组
    const groupedByCategory = d3.groups(data, d => d.category);
    
    groupedByCategory.forEach(([category, points]) => {
      const newScatterGroup = {
        id: ++scatterGroupCounter,
        name: category || file.name, // Use category for legend, fallback to filename
        points: points,
        size: 4, // Default point size
        shape: 'circle', // Add default shape
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`, // 使用随机十六进制颜色
        visible: true,
      };
      scatterGroups.push(newScatterGroup);
      createScatterPanel(newScatterGroup);
    });

    draw();
  };
  reader.readAsText(file);
  
  // 清空文件输入
  e.target.value = '';
});

document.getElementById("update").addEventListener("click", draw);

// 新增：监听画布和margin输入变化，自动重绘
document.getElementById("canvas-width")?.addEventListener("change", draw);
document.getElementById("canvas-height")?.addEventListener("change", draw);

// 新增：监听margin输入
// 监听 margin（兼容旧版本）
document.getElementById("canvas-margin")?.addEventListener("change", draw);
["margin-top","margin-right","margin-bottom","margin-left"].forEach(id =>
  document.getElementById(id)?.addEventListener("change", draw)
);

// 让新的输入也能触发重绘
document.getElementById("tick-length-px")?.addEventListener("change", draw);
document.getElementById("update")?.addEventListener("click", draw);

// 确保这三个新的输入也能触发 draw()
["axis-width-px","tick-width-px","grid-width-px"].forEach(id =>
  document.getElementById(id)?.addEventListener("change", draw)
);

// 监听新的输入
["x-ticks","y-ticks","z-ticks","x-labels","y-labels","z-labels",
 "label-font-size","label-font-family","label-distance",
 "axis-labels","axis-label-font-size","axis-label-font-family","axis-label-font-weight","axis-label-distance",
 "legend-visible", "legend-x", "legend-y", "legend-font-size", "legend-font-family",
 "chart-title-visible", "chart-title-text", "chart-title-x", "chart-title-y", "chart-title-font-size", "chart-title-font-family", "chart-title-font-weight"].forEach(id => // 添加新控件ID
  document.getElementById(id)?.addEventListener("change", draw)
);

// 新增：保存 SVG 功能
document.getElementById("save-svg").addEventListener("click", () => {
  const svgElement = document.getElementById("svg");

  // 确保 SVG 根元素包含必要的命名空间
  svgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svgElement.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");

  // 序列化 SVG 内容
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgElement);

  // 创建一个 Blob 对象
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });

  // 创建一个下载链接
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "chart.svg";
  link.style.display = "none";

  // 添加到文档并触发下载
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// 初始化
draw();

// ================= 参数保存 & 加载 =================
function collectAllParams() {
  const controls = {};
  document.querySelectorAll('#ui-panel input, #ui-panel select, #ui-panel textarea').forEach(el => {
    if (!el.id) return;
    if (el.type === 'checkbox') controls[el.id] = el.checked; else controls[el.id] = el.value;
  });
  // 深拷贝（避免后续修改影响保存的对象）
  const trajCopy = trajGroups.map(g => ({
    ...g,
    trajectories: g.trajectories.map(t => ({ ...t, points: (t.points||[]).map(p => ({...p})) }))
  }));
  const scatterCopy = scatterGroups.map(g => ({
    ...g,
    points: g.points.map(p => ({...p}))
  }));
  return {
    version: 1,
    timestamp: Date.now(),
    controls,
    trajGroups: trajCopy,
    groupCounter,
    scatterGroups: scatterCopy,
    scatterGroupCounter,
    projection
  };
}

function applyAllParams(state) {
  if (!state) return;
  // 控件
  if (state.controls) {
    Object.entries(state.controls).forEach(([id,val]) => {
      const el = document.getElementById(id);
      if (!el) return;
      if (el.type === 'checkbox') el.checked = !!val; else el.value = val;
    });
    // 迁移：如果当前页面存在四个 margin 输入但加载文件只有单一 canvas-margin（或反之）
    const hasFour = document.getElementById('margin-top');
    const single = document.getElementById('canvas-margin');
    if (hasFour && single && state.controls['canvas-margin']) {
      // 用单值填充四方向（如果四方向本身没在 state.controls 里）
      ['margin-top','margin-right','margin-bottom','margin-left'].forEach(id=>{
        if (!state.controls[id]) {
          const el2 = document.getElementById(id);
          if (el2) el2.value = state.controls['canvas-margin'];
        }
      });
    }
  }
  // 数据结构
  trajGroups = (state.trajGroups||[]).map(g => ({
    ...g,
    trajectories: (g.trajectories||[]).map(t => ({...t, points: (t.points||[]).map(p=>({...p})) }))
  }));
  groupCounter = state.groupCounter || trajGroups.length;
  scatterGroups = (state.scatterGroups||[]).map(g => ({...g, points: (g.points||[]).map(p=>({...p})) }));
  scatterGroupCounter = state.scatterGroupCounter || scatterGroups.length;
  projection = state.projection || projection;

  // 重建UI
  const trajContainer = document.getElementById('trajectory-panels');
  if (trajContainer) {
    trajContainer.innerHTML = '<h3>轨迹控制面板</h3>';
    trajGroups.forEach(createTrajectoryPanel);
  }
  const scatterContainer = document.getElementById('scatter-panels');
  if (scatterContainer) {
    scatterContainer.innerHTML = '<h3>散点图控制面板</h3>';
    scatterGroups.forEach(createScatterPanel);
  }
  draw();
}

// 绑定按钮
document.getElementById('save-params')?.addEventListener('click', () => {
  const state = collectAllParams();
  const blob = new Blob([JSON.stringify(state,null,2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = '3Dtrajectory_params.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
});

document.getElementById('load-params-btn')?.addEventListener('click', () => {
  document.getElementById('load-params-file')?.click();
});

document.getElementById('load-params-file')?.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = evt => {
    let parsed;
    try {
      parsed = JSON.parse(evt.target.result);
    } catch (err) {
      alert('JSON 解析失败');
      return;
    }
    try {
      applyAllParams(parsed);
    } catch (err) {
      console.error(err);
      alert('参数应用时出错');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
});