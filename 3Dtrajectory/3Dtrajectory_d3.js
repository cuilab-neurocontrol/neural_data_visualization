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

  // 1. 画三面网格（底面 xz，左面 yz，后面 xy），都从原点出发
  const gridN = 5;
  for (let i = 0; i <= gridN; i++) {
    // x-z平面（y=最小）
    let tx = xdom[0] + (xdom[1] - xdom[0]) * i / gridN;
    let tz = zdom[0] + (zdom[1] - zdom[0]) * i / gridN;
    // x方向平行线（z变）
    let p1 = project3d(xdom[0], ydom[0], tz);
    let p2 = project3d(xdom[1], ydom[0], tz);
    g.append("line")
      .attr("x1", xScale(p1[0])).attr("y1", yScale(p1[1]))
      .attr("x2", xScale(p2[0])).attr("y2", yScale(p2[1]))
      .attr("stroke", "#ddd").attr("stroke-width", 1);
    // z方向平行线（x变）
    p1 = project3d(tx, ydom[0], zdom[0]);
    p2 = project3d(tx, ydom[0], zdom[1]);
    g.append("line")
      .attr("x1", xScale(p1[0])).attr("y1", yScale(p1[1]))
      .attr("x2", xScale(p2[0])).attr("y2", yScale(p2[1]))
      .attr("stroke", "#ddd").attr("stroke-width", 1);

    // y-z平面（x=最小）
    p1 = project3d(xdom[0], ydom[0], tz);
    p2 = project3d(xdom[0], ydom[1], tz);
    g.append("line")
      .attr("x1", xScale(p1[0])).attr("y1", yScale(p1[1]))
      .attr("x2", xScale(p2[0])).attr("y2", yScale(p2[1]))
      .attr("stroke", "#eee").attr("stroke-width", 1);
    // y方向平行线（z变）
    let ty = ydom[0] + (ydom[1] - ydom[0]) * i / gridN;
    p1 = project3d(xdom[0], ty, zdom[0]);
    p2 = project3d(xdom[0], ty, zdom[1]);
    g.append("line")
      .attr("x1", xScale(p1[0])).attr("y1", yScale(p1[1]))
      .attr("x2", xScale(p2[0])).attr("y2", yScale(p2[1]))
      .attr("stroke", "#eee").attr("stroke-width", 1);

    // x-y平面（z=最小）
    p1 = project3d(xdom[0], ydom[0], zdom[0]);
    p2 = project3d(xdom[1], ydom[0], zdom[0]);
    g.append("line")
      .attr("x1", xScale(p1[0])).attr("y1", yScale(p1[1]))
      .attr("x2", xScale(p2[0])).attr("y2", yScale(p2[1]))
      .attr("stroke", "#eee").attr("stroke-width", 1);
    p1 = project3d(xdom[0], ty, zdom[0]);
    p2 = project3d(xdom[1], ty, zdom[0]);
    g.append("line")
      .attr("x1", xScale(p1[0])).attr("y1", yScale(p1[1]))
      .attr("x2", xScale(p2[0])).attr("y2", yScale(p2[1]))
      .attr("stroke", "#eee").attr("stroke-width", 1);
  }

  // 2. 画三条主轴（matplotlib风格L型：PC1在前，PC2在右，PC3竖直）
  const axes = [
    // PC1: x轴，前沿
    { from: [xdom[0], ydom[0], zdom[1]], to: [xdom[1], ydom[0], zdom[1]], label: "PC 1" },
    // PC3: y轴，左前角竖直
    { from: [xdom[0], ydom[0], zdom[1]], to: [xdom[0], ydom[1], zdom[1]], label: "PC 3" },
    // PC2: z轴，右侧
    { from: [xdom[1], ydom[0], zdom[0]], to: [xdom[1], ydom[0], zdom[1]], label: "PC 2" }
  ];
  axes.forEach(axis => {
    const p1 = project3d(...axis.from), p2 = project3d(...axis.to);
    g.append("line")
      .attr("x1", xScale(p1[0])).attr("y1", yScale(p1[1]))
      .attr("x2", xScale(p2[0])).attr("y2", yScale(p2[1]))
      .attr("stroke", "#000").attr("stroke-width", 2);
    g.append("text")
      .attr("x", xScale(p2[0])).attr("y", yScale(p2[1]))
      .attr("dx", 8).attr("dy", -8)
      .text(axis.label).style("font-weight", "bold");
  });

  // 刻度线方向
  const tickLenPx = 10;
  const tickDirType = document.getElementById("tick-direction")?.value || "out";
  axes.forEach(axis => {
    const N = 5;
    for (let i = 1; i < N; i++) {
      const t = i / N;
      const tickPos = [
        axis.from[0] + t * (axis.to[0] - axis.from[0]),
        axis.from[1] + t * (axis.to[1] - axis.from[1]),
        axis.from[2] + t * (axis.to[2] - axis.from[2])
      ];
      const pt = project3d(...tickPos);

      // 刻度线方向
      let tickDir3d;
      if (axis.label === "PC 1") tickDir3d = [0, 1, 0]; // PC1朝+y（竖直向上）
      else if (axis.label === "PC 3") tickDir3d = [1, 0, 0]; // PC3朝+x（右）
      else tickDir3d = [0, 1, 0]; // PC2朝+y（竖直向上）
      if (tickDirType === "in") tickDir3d = tickDir3d.map(d => -d);

      const tickEnd3d = [
        tickPos[0] + tickDir3d[0],
        tickPos[1] + tickDir3d[1],
        tickPos[2] + tickDir3d[2]
      ];
      const ptEnd = project3d(...tickEnd3d);

      const dx = ptEnd[0] - pt[0], dy = ptEnd[1] - pt[1];
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const ux = dx / len, uy = dy / len;

      const px1 = xScale(pt[0]), py1 = yScale(pt[1]);
      const px2 = px1 + ux * tickLenPx, py2 = py1 + uy * tickLenPx;

      g.append("line")
        .attr("x1", px1).attr("y1", py1)
        .attr("x2", px2).attr("y2", py2)
        .attr("stroke", "#000").attr("stroke-width", 1);
    }
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