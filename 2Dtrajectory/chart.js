// 监听文件上传并绘制轨迹
document.getElementById('file-input').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(evt) {
    const text = evt.target.result;
    const data = d3.csvParse(text, d3.autoType);
    // 按 group 分组
    const trajs = d3.groups(data, d => d.group).map(g => g[1]);
    const svg = d3.select("#svg");
    svg.selectAll("*").remove();

    // 画轨迹（全部黑色实线）
    svg.selectAll(".traj")
      .data(trajs)
      .enter()
      .append("path")
      .attr("class", "traj")
      .attr("stroke", "#000")
      .attr("d", d3.line()
        .x(p => p.x)
        .y(p => p.y)
        .curve(d3.curveCatmullRom.alpha(0.7))
      );

    // 画末端圆圈
    svg.selectAll(".traj-end")
      .data(trajs)
      .enter()
      .append("circle")
      .attr("class", "traj-end")
      .attr("r", 6)
      .attr("cx", d => d[d.length-1].x)
      .attr("cy", d => d[d.length-1].y)
      .attr("fill", "#000")
      .attr("opacity", 0.9)
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5);
  };
  reader.readAsText(file);
});