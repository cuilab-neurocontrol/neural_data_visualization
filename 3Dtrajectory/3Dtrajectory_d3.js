let trajs = [];
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
    { from: [xdom[0], ydom[0], zdom[1]], to: [xdom[1], ydom[0], zdom[1]], label: "PC 1" },
    { from: [xdom[0], ydom[0], zdom[1]], to: [xdom[0], ydom[1], zdom[1]], label: "PC 3" },
    { from: [xdom[1], ydom[0], zdom[0]], to: [xdom[1], ydom[0], zdom[1]], label: "PC 2" }
  ];

  // 读取轴标题样式参数（单独的控制项）
  const axisLabelFontSize = parseFloat(document.getElementById("axis-label-font-size")?.value) || 14;
  const axisLabelFontFamily = document.getElementById("axis-label-font-family")?.value || "Arial";
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
    
    g.append("text")
      .attr("x", xScale(lx))
      .attr("y", yScale(ly))
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .style("font-size", axisLabelFontSize + "px")
      .style("font-family", axisLabelFontFamily)
      .style("font-weight", "bold")
      .style("fill", "#000")
      .text(axis.label);
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
        .text(labels[i] || val);
    });
  });

  // 4. 画轨迹
  trajs.forEach(traj => {
    const lineData = traj.map(d => {
      const [x2d, y2d] = project3d(d.x, d.y, d.z);
      return [xScale(x2d), yScale(y2d)];
    });
    g.append("path")
      .attr("d", d3.line()(lineData))
      .attr("stroke", "#007")
      .attr("fill", "none")
      .attr("opacity", 0.7);
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

document.getElementById("file-input").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = evt => {
    const data = d3.csvParse(evt.target.result, d3.autoType);
    trajs = d3.groups(data, d => d.traj_id).map(g => g[1]);
    draw();
  };
  reader.readAsText(file);
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
 "axis-label-font-size","axis-label-font-family","axis-label-distance"].forEach(id =>
  document.getElementById(id)?.addEventListener("change", draw)
);