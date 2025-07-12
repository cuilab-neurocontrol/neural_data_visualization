let trajGroups = []; // 存储每次上传的轨迹组
let groupCounter = 0; // 组计数器
let scatterGroups = []; // 新增：存储散点图组
let scatterGroupCounter = 0; // 新增：散点图组计数器
let projection = { alpha: Math.PI/6, beta: Math.PI/6 }; // 初始旋转角

// 单位换算：1cm = 37.8px (标准96dpi)
const PX_PER_CM = 96 / 2.54;

// 支持动态画布和margin（单位cm）
function getCanvasSize() {
  const w_cm = parseFloat(document.getElementById("canvas-width")?.value) || 18.5;
  const h_cm = parseFloat(document.getElementById("canvas-height")?.value) || 15.9;
  return { width: w_cm * PX_PER_CM, height: h_cm * PX_PER_CM };
}
function getMargin() {
  const m_cm = parseFloat(document.getElementById("canvas-margin")?.value) || 1.5;
  return m_cm * PX_PER_CM;
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
  // 动态获取画布和margin
  const { width, height } = getCanvasSize();
  const margin = getMargin();
  resizeSVG();
  g.selectAll("*").remove();

  // 读domain
  const xdom = document.getElementById("x-domain").value.split(",").map(Number);
  const ydom = document.getElementById("y-domain").value.split(",").map(Number);
  const zdom = document.getElementById("z-domain").value.split(",").map(Number);

  // 3D→2D投影后做缩放
  const corners = [
    project3d(xdom[0], ydom[0], zdom[0]), // 原点
    project3d(xdom[1], ydom[0], zdom[0]), // x轴终点
    project3d(xdom[0], ydom[1], zdom[0]), // y轴终点
    project3d(xdom[0], ydom[0], zdom[1])  // z轴终点
  ];
  const xs = corners.map(d=>d[0]), ys = corners.map(d=>d[1]);
  const xScale = d3.scaleLinear().domain([d3.min(xs), d3.max(xs)]).range([-width/2+margin, width/2-margin]);
  const yScale = d3.scaleLinear().domain([d3.min(ys), d3.max(ys)]).range([height/2-margin, -height/2+margin]);

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

  // 4. 画轨迹
  trajGroups.forEach(group => {
    if (!group.visible) return; // 如果组不可见，则跳过

    // 设置虚线样式
    let strokeDasharray = "none";
    if (group.style === "dashed") strokeDasharray = "5,5";
    else if (group.style === "dotted") strokeDasharray = "2,2";

    group.trajectories.forEach(traj => {
      const lineData = traj.map(d => {
        const [x2d, y2d] = project3d(d.x, d.y, d.z);
        return [xScale(x2d), yScale(y2d)];
      });
      g.append("path")
        .attr("d", d3.line()(lineData))
        .attr("stroke", group.color) // 使用组的颜色
        .attr("stroke-width", group.width) // 使用组的线宽
        .attr("stroke-dasharray", strokeDasharray) // 使用组的线型
        .attr("fill", "none")
        .attr("opacity", 0.7);
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
        .attr("opacity", 0.8);
    });
  });

  // 6. 画图例
  // 读取图例设置
  const legendX = parseFloat(document.getElementById("legend-x").value);
  const legendY = parseFloat(document.getElementById("legend-y").value);
  const legendFontSize = parseFloat(document.getElementById("legend-font-size").value);
  const legendFontFamily = document.getElementById("legend-font-family").value;

  // 计算相对于中心g的坐标
  const legendTranslateX = legendX - width / 2;
  const legendTranslateY = legendY - height / 2;

  const legend = g.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${legendTranslateX}, ${legendTranslateY})`);

  let legendYOffset = 0;
  scatterGroups.forEach((group, i) => {
    if (!group.visible) return;

    const legendItem = legend.append("g")
      .attr("transform", `translate(0, ${legendYOffset})`);
    
    // Also draw the correct symbol in the legend
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
      .size(100); // A fixed size for the legend

    legendItem.append("path")
      .attr("d", legendSymbol)
      .attr("transform", `translate(8, 8)`) // Center the symbol in a 15x15 area
      .attr("fill", group.color);
      
    legendItem.append("text")
      .attr("x", 20)
      .attr("y", 12)
      .text(group.name)
      .style("font-size", `${legendFontSize}px`) // 应用字体大小
      .style("font-family", legendFontFamily) // 应用字体
      .attr("alignment-baseline", "middle");
      
    legendYOffset += (legendFontSize + 8); // 根据字体大小动态调整行间距
  });
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
  `;
  
  panelsContainer.appendChild(panel);
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
    const trajectories = d3.groups(data, d => d.traj_id).map(g => g[1]);
    
    // 创建新的轨迹组
    const newGroup = {
      id: ++groupCounter,
      name: file.name,
      trajectories: trajectories,
      width: 2,
      color: `hsl(${(groupCounter * 60) % 360}, 70%, 50%)`, // 自动分配不同颜色
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
      const newGroup = {
        id: ++scatterGroupCounter,
        name: category || file.name, // Use category for legend, fallback to filename
        points: points,
        size: 4, // Default point size
        shape: 'circle', // Add default shape
        color: `hsl(${(scatterGroupCounter * 100) % 360}, 70%, 50%)`,
        visible: true,
      };
      scatterGroups.push(newGroup);
      createScatterPanel(newGroup);
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
document.getElementById("canvas-margin")?.addEventListener("change", draw);

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
 "legend-x", "legend-y", "legend-font-size", "legend-font-family"].forEach(id => // 添加新控件ID
  document.getElementById(id)?.addEventListener("change", draw)
);

// 初始化
draw();