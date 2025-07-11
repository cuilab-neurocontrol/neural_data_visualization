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

  // 1. 画三面网格（底面PC1-PC2，左面PC1-PC3，外面PC2-PC3）
  const gridN = 5;
  for (let i = 0; i <= gridN; i++) {
    // --- 底面 PC1-PC2 (y=ydom[0]) ---
    let tx = xdom[0] + (xdom[1] - xdom[0]) * i / gridN;
    let tz = zdom[0] + (zdom[1] - zdom[0]) * i / gridN;
    // PC1方向平行线（PC2变）
    let p1 = project3d(tx, ydom[0], zdom[0]);
    let p2 = project3d(tx, ydom[0], zdom[1]);
    g.append("line")
      .attr("x1", xScale(p1[0])).attr("y1", yScale(p1[1]))
      .attr("x2", xScale(p2[0])).attr("y2", yScale(p2[1]))
      .attr("stroke", "#ddd").attr("stroke-width", 1);
    // PC2方向平行线（PC1变）
    p1 = project3d(xdom[0], ydom[0], tz);
    p2 = project3d(xdom[1], ydom[0], tz);
    g.append("line")
      .attr("x1", xScale(p1[0])).attr("y1", yScale(p1[1]))
      .attr("x2", xScale(p2[0])).attr("y2", yScale(p2[1]))
      .attr("stroke", "#ddd").attr("stroke-width", 1);

    // --- 左面 PC1-PC3 (z=zdom[0]) ---
    let ty = ydom[0] + (ydom[1] - ydom[0]) * i / gridN;
    // PC1方向平行线（PC3变）
    p1 = project3d(xdom[0], ty, zdom[0]);
    p2 = project3d(xdom[1], ty, zdom[0]);
    g.append("line")
      .attr("x1", xScale(p1[0])).attr("y1", yScale(p1[1]))
      .attr("x2", xScale(p2[0])).attr("y2", yScale(p2[1]))
      .attr("stroke", "#eee").attr("stroke-width", 1);
    // PC3方向平行线（PC1变）
    p1 = project3d(tx, ydom[0], zdom[0]);
    p2 = project3d(tx, ydom[1], zdom[0]);
    g.append("line")
      .attr("x1", xScale(p1[0])).attr("y1", yScale(p1[1]))
      .attr("x2", xScale(p2[0])).attr("y2", yScale(p2[1]))
      .attr("stroke", "#eee").attr("stroke-width", 1);

    // --- 外面 PC2-PC3 (x=xdom[0]) ---
    // PC2方向平行线（PC3变）
    p1 = project3d(xdom[0], ty, zdom[0]);
    p2 = project3d(xdom[0], ty, zdom[1]);
    g.append("line")
      .attr("x1", xScale(p1[0])).attr("y1", yScale(p1[1]))
      .attr("x2", xScale(p2[0])).attr("y2", yScale(p2[1]))
      .attr("stroke", "#eee").attr("stroke-width", 1);
    // PC3方向平行线（PC2变）
    p1 = project3d(xdom[0], ydom[0], tz);
    p2 = project3d(xdom[0], ydom[1], tz);
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

  // 3. 刻度线：只在各自轴所在的平面内画入格内的短线
  const tickPx  = parseFloat(document.getElementById("tick-length-px")?.value) || 10;
  const dirSign = document.getElementById("tick-direction")?.value === "in" ? -1 : 1;
  const tickLen = tickPx * dirSign;

  axes.forEach(axis => {
    const N = 5;
    // 根据轴 label 决定 3D 刻度方向（单位向量）
    // PC1（前沿 x 轴） 在 z = zdom[1] 平面，刻度朝内/外沿 -z 方向
    // PC3（左前直立 y 轴）在 x = xdom[0] 平面，刻度沿 +x 方向
    // PC2（右侧直立 z 轴）在 x = xdom[1]、y = ydom[0] 角，刻度沿 -y 方向
    let dir3d;
    if (axis.label === "PC 1")      dir3d = [0, 0, 1];
    else if (axis.label === "PC 3") dir3d = [0, 0, 1];
    else                            dir3d = [1, 0, 0];

    for (let i = 1; i < N; i++) {
      const t = i / N;
      // 刻度基点
      const base3d = [
        axis.from[0] + t * (axis.to[0] - axis.from[0]),
        axis.from[1] + t * (axis.to[1] - axis.from[1]),
        axis.from[2] + t * (axis.to[2] - axis.from[2])
      ];
      // 刻度终点
      const end3d = [
        base3d[0] + dir3d[0] * tickLen,
        base3d[1] + dir3d[1] * tickLen,
        base3d[2] + dir3d[2] * tickLen
      ];
      // 投影
      const [b0, b1] = project3d(...base3d),
            [e0, e1] = project3d(...end3d);
      g.append("line")
        .attr("x1", xScale(b0)).attr("y1", yScale(b1))
        .attr("x2", xScale(e0)).attr("y2", yScale(e1))
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

// 让新的输入也能触发重绘
document.getElementById("tick-length-px")?.addEventListener("change", draw);
document.getElementById("update")?.addEventListener("click", draw);