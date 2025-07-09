// 1) 监听文件上传
document.getElementById('file-input').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = evt => {
    const data = d3.csvParse(evt.target.result, d3.autoType);
    const trajs = d3.groups(data, d => d.traj_id).map(g => g[1]);
    draw(trajs);
  };
  reader.readAsText(file);
});

// 2) 绘制函数：3D→2D 投影 + 画每条轨迹
function draw(trajs) {
  const svg = d3.select('#svg');
  svg.selectAll('*').remove();
  const width = +svg.attr('width'), height = +svg.attr('height');
  const margin = 40;

  // 投影参数：绕水平轴倾斜 30°
  const angle = Math.PI / 6;
  const cosA = Math.cos(angle), sinA = Math.sin(angle);
  function project(p) {
    // 简单等轴投影：x2 = x·cosA − z·cosA; y2 = y + x·sinA + z·sinA
    return [
      p.x * cosA - p.z * cosA,
      p.y + p.x * sinA + p.z * sinA
    ];
  }

  // 汇集所有投影点做缩放
  const allProj = trajs.flatMap(traj => traj.map(project));
  const xs = allProj.map(d => d[0]), ys = allProj.map(d => d[1]);
  const xScale = d3.scaleLinear()
    .domain(d3.extent(xs)).nice()
    .range([margin, width - margin]);
  const yScale = d3.scaleLinear()
    .domain(d3.extent(ys)).nice()
    .range([height - margin, margin]);

  // 画每条轨迹
  trajs.forEach(traj => {
    const lineData = traj.map(project).map(p => [ xScale(p[0]), yScale(p[1]) ]);
    svg.append('path')
      .attr('class', 'traj')
      .attr('d', d3.line()(lineData));
  });
}