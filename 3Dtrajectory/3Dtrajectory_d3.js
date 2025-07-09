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
    project3d(xdom[0], ydom[0], zdom[0]),
    project3d(xdom[1], ydom[0], zdom[0]),
    project3d(xdom[0], ydom[1], zdom[0]),
    project3d(xdom[0], ydom[0], zdom[1]),
    project3d(xdom[1], ydom[1], zdom[1])
  ];
  const xs = corners.map(d=>d[0]), ys = corners.map(d=>d[1]);
  const xScale = d3.scaleLinear().domain([d3.min(xs), d3.max(xs)]).range([-width/2+margin, width/2-margin]);
  const yScale = d3.scaleLinear().domain([d3.min(ys), d3.max(ys)]).range([height/2-margin, -height/2+margin]);

  // 坐标轴
  const axes = [
    { from: [xdom[0], ydom[0], zdom[0]], to: [xdom[1], ydom[0], zdom[0]], label: "X" },
    { from: [xdom[0], ydom[0], zdom[0]], to: [xdom[0], ydom[1], zdom[0]], label: "Y" },
    { from: [xdom[0], ydom[0], zdom[0]], to: [xdom[0], ydom[0], zdom[1]], label: "Z" }
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
    // 刻度
    for(let i=1;i<=4;i++) {
      const t = i/5;
      const tick = [
        axis.from[0] + t*(axis.to[0]-axis.from[0]),
        axis.from[1] + t*(axis.to[1]-axis.from[1]),
        axis.from[2] + t*(axis.to[2]-axis.from[2])
      ];
      const pt = project3d(...tick);
      g.append("circle")
        .attr("cx", xScale(pt[0])).attr("cy", yScale(pt[1]))
        .attr("r", 2).attr("fill", "#000");
    }
  });

  // 画轨迹
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