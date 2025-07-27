// Conversion factor: 1 cm = 37.7952755906 pixels
const CM_TO_PX = 37.7952755906;
const PT_TO_PX = 1;
let seriesList = [];
let refLines = [];
let annotations = [];

// Get the container and dimensions in cm
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

// 创建系列控制块，包含线条颜色、粗细、阴影参数
function createSeriesControl(index, groupNames) {
  const div = document.createElement("div");
  div.className = "series-control";
  div.dataset.index = index;
  div.innerHTML = `
    <h3>
      <input type="text" class="series-description" value="Series ${index + 1}" style="width:120px;">
      <button class="delete-series">Delete</button>
    </h3>
    <div class="control-row">
      <label>Line Color:</label>
      <input type="color" class="line-color" value="#ff0000">
      <label>Line Thickness (px):</label>
      <input type="number" class="line-thickness" value="1" min="1" step="0.1">
    </div>
    <div class="control-row">
      <label>Show Shadow:</label>
      <input type="checkbox" class="show-shadow" checked>
      <label>Shadow Opacity:</label>
      <input type="number" class="shadow-opacity" value="0.3" min="0" max="1" step="0.1">
    </div>
    <div class="control-row">
      <label>Show Dots:</label>
      <input type="checkbox" class="show-dots" checked>
    </div>
  `;

  // 为每个分组添加颜色选择器
  if (groupNames && groupNames.length > 0) {
    groupNames.forEach((name, i) => {
      const color = ["#FF5C5C", "#5CFF5C", "#5C5CFF", "#FFD700", "#FF69B4"][i % 5];

      // 阴影和线的控制项
      const row1 = document.createElement("div");
      row1.className = "control-row";
      row1.innerHTML = `
        <label>${name} Shadow Color:</label>
        <input type="color" class="shadow-color-group" data-group="${name}" value="${color}">
        <label>Line Color:</label>
        <input type="color" class="line-color-group" data-group="${name}" value="#000000">
        <label>Line Width:</label>
        <input type="number" class="line-width-group" data-group="${name}" value="1" min="0.5" step="0.5" style="width:50px;">
      `;
      div.appendChild(row1);

      // 箱形图线宽单独一行
      const row3 = document.createElement("div");
      row3.className = "control-row";
      row3.innerHTML = `
        <label>Box Line Width:</label>
        <input type="number" class="box-line-width-group" data-group="${name}" value="1" min="0.5" step="0.5" style="width:50px;">
        <label>Box Line Color:</label>
        <input type="color" class="box-line-color-group" data-group="${name}" value="#000000">
      `;
      div.appendChild(row3);

      // 点的控制项单独一行
      const row2 = document.createElement("div");
      row2.className = "control-row";
      row2.innerHTML = `
        <label>Dot Color:</label>
        <input type="color" class="dot-color-group" data-group="${name}" value="#222222">
        <label>Dot Size:</label>
        <input type="number" class="dot-size-group" data-group="${name}" value="1" min="0.5" step="0.5" style="width:40px;">
        <label>Dot Opacity:</label>
        <input type="number" class="dot-opacity-group" data-group="${name}" value="0.5" min="0" max="1" step="0.05" style="width:40px;">
      `;
      div.appendChild(row2);
    });
  }

  // 删除按钮事件
  div.querySelector(".delete-series").addEventListener("click", function() {
    const idx = parseInt(div.dataset.index, 10);
    seriesList.splice(idx, 1);
    div.remove();
    const controls = document.querySelectorAll(".series-control");
    controls.forEach((ctrl, i) => ctrl.dataset.index = i);
    createChart();
  });

  return div;
}

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

document.getElementById("add-ref-line").addEventListener("click", function() {
  refLines.push({
    y: parseFloat(document.getElementById("ref-line-y").value),
    x1: parseFloat(document.getElementById("ref-line-x1").value),
    x2: parseFloat(document.getElementById("ref-line-x2").value),
    label: document.getElementById("ref-line-label").value,
    labelSize: parseFloat(document.getElementById("ref-line-label-size").value),
    labelDist: parseFloat(document.getElementById("ref-line-label-dist").value)
  });
  createChart();
});

function removeRefLine(idx) {
  refLines.splice(idx, 1);
  createChart();
}
window.removeRefLine = removeRefLine; // 让HTML按钮能调用

document.getElementById("add-anno-btn").addEventListener("click", function() {
  annotations.push({
    text: document.getElementById("anno-text").value,
    x: parseFloat(document.getElementById("anno-x").value),
    y: parseFloat(document.getElementById("anno-y").value),
    fontSize: parseFloat(document.getElementById("anno-font-size").value),
    fontFamily: document.getElementById("anno-font-family").value,
    color: document.getElementById("anno-color").value,
    fontWeight: document.getElementById("anno-font-weight").value
  });
  createChart();
});

function removeAnnotation(idx) {
  annotations.splice(idx, 1);
  createChart();
}
window.removeAnnotation = removeAnnotation;

function createChart() {
  
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
  // 标题与图表之间的距离，单位为pt，转换为px
  const titleDistancePt = parseFloat(document.getElementById("title-distance").value);
  const titleDistancePx = titleDistancePt * PT_TO_PX;

  // Get user-defined domains
  const xDomainMin = parseFloat(document.getElementById("x-domain-min").value);
  const xDomainMax = parseFloat(document.getElementById("x-domain-max").value);
  const yDomainMin = parseFloat(document.getElementById("y-domain-min").value);
  const yDomainMax = parseFloat(document.getElementById("y-domain-max").value);

  // Clear existing SVG
  d3.select("#my_dataviz").select("svg").remove();
  d3.select("#my_dataviz").html("");
  // Append the SVG object to the body of the page
  const svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Add Y axis
  const y = d3.scaleLinear()
      .domain([yDomainMin, yDomainMax]) // Specify the domain of the Y axis
      .range([height, 0]);

  // 添加标题文本（放在 SVG 顶部居中
  const showTitle = document.getElementById("show-title").checked;
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

  const showYAxis = document.getElementById("show-y-axis").checked;
  if (showYAxis) {
      const yAxis = d3.axisLeft(y)
      //.ticks(tickCount) // Set the number of ticks
      .tickValues(ytickPositions) // Set custom tick positions
      //.tickSize(tickLength) // Set the tick size (length of the tick lines)
      .tickSize(tickLength * (tickOrientation === "inward" ? -1 : 1))
      //.tickFormat(d => `${d} units`); // Customize tick labels (e.g., add units)
      .tickFormat((d, i) => ytickLabels[i] || d) // Set custom tick labels
      .tickSizeOuter(showOuterTicks ? tickLength : 0); // Control outer ticks

      svg.append("g")
      .attr("transform", `translate(0, ${-axisMargin.y})`) // Translate Y axis
      .call(yAxis)
      .selectAll("text") // Customize tick labels
      .attr("fill", "#000")
      .style("font-size", `${tickFontSize}px`) // Set font size
      .style("font-family", tickFontFamily); // Set font family

      svg.selectAll(".domain").style("stroke-width", axisLineWidth);
      svg.selectAll(".tick line").style("stroke-width", tickLineWidth);
      svg.selectAll(".domain").style("stroke", "#000");
      svg.selectAll(".tick line").style("stroke", "#000");
  }

  const showScaleBar = document.getElementById("show-scale-bar").checked;
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
    const showXLabel = document.getElementById("show-x-label").checked;
    if (showXLabel) {
      const xLabelDistance = tickLength + 1.8*tickFontSize + 6 * PT_TO_PX;
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
    const showYLabel = document.getElementById("show-y-label").checked;
    if (showYLabel) {
      const yLabelDistance = tickLength + 1.5*tickFontSize + 6 * PT_TO_PX;
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

    // Function to create or update the SVG
    const showXAxis = document.getElementById("show-x-axis").checked;
    const seriesNames = seriesList.map((s, i) => `series${i}`);
    const xSeriesPadding = parseFloat(document.getElementById("xseries-padding").value);
    const xGroupPadding = parseFloat(document.getElementById("xgroup-padding").value);
    const xSeries = d3.scaleBand()
      .domain(seriesNames)
      .range([0, width])
      .padding(xSeriesPadding);

    if (showXAxis) {
        // 自动生成 tick labels
        svg.selectAll(".x-axis").remove();
        const xTickLabels = seriesList.map((s, i) =>
          s.control?.querySelector('.series-description')?.value || `Series ${i + 1}`
        );
        // 1. 先把 axisBottom 的内外刻度长度都设为 0
        
        if (tickOrientation === "inward"){
          const xAxis = d3.axisBottom(xSeries)
          .tickValues(seriesNames)
          .tickSizeInner(0)
          .tickSizeOuter(0)
          //.tickPadding(6)
          .tickPadding(tickLength)
          .tickFormat((d, i) => xTickLabels[i]);

          svg.selectAll(".x-axis").remove();

          svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(${axisMargin.x}, ${height})`)
            .call(xAxis)
            // 2. 调整刻度线的位置：所有 tick line 的起点 y1 上移 halfLine，
            //    然后 y2 再往内/外延伸 tickLength
            .call(g => g.selectAll(".tick line")
              .attr("y1", -axisLineWidth / 2)
              .attr("y2", - tickLength)
            )
            .call(g => g.selectAll("text")
              .attr("fill", "#000")
              .style("font-size", `${tickFontSize}px`)
              .style("font-family", tickFontFamily)
            );
        } else {
          const xAxis = d3.axisBottom(xSeries)
            .tickValues(seriesNames)
            .tickSizeInner(0)
            .tickSizeOuter(0)
            //.tickPadding(6)
            .tickPadding(2*tickLength)
            .tickFormat((d, i) => xTickLabels[i]);

          svg.selectAll(".x-axis").remove();

          svg.append("g")
          .attr("class", "x-axis")
          .attr("transform", `translate(${axisMargin.x}, ${height})`)
          .call(xAxis)
          // 2. 调整刻度线的位置：所有 tick line 的起点 y1 上移 halfLine，
          //    然后 y2 再往内/外延伸 tickLength
          .call(g => g.selectAll(".tick line")
            .attr("y1", axisLineWidth / 2)
            .attr("y2", tickLength)  // 向下（图外）延伸
          )
          .call(g => g.selectAll("text")
            .attr("fill", "#000")
            .style("font-size", `${tickFontSize}px`)
            .style("font-family", tickFontFamily)
          );
        }

        // 3. 最后恢复 domain 和 tick 的线宽/颜色
        svg.selectAll(".x-axis .domain")
           .style("stroke-width", axisLineWidth)
           .style("stroke", "#000");
        svg.selectAll(".x-axis .tick line")
           .style("stroke-width", tickLineWidth)
           .style("stroke", "#000");
    }

    seriesList.forEach((series, seriesIdx) => {
      const control = series.control;
      const lineColor = control.querySelector(".line-color").value;
      const lineThickness = parseFloat(control.querySelector(".line-thickness").value);
      const showShadow = control.querySelector(".show-shadow").checked;
      const shadowOpacity = parseFloat(control.querySelector(".shadow-opacity").value);

      const groupNames = Array.from(new Set(series.data.map(d => d.group_name))); // 修改
      const xGroup = d3.scaleBand()
        .domain(groupNames)
        .range([0, xSeries.bandwidth()])
        .padding(xGroupPadding); // 小分组间距小

      // 直方图设置
      const histogram = d3.histogram()
        .domain(y.domain())
        .thresholds(y.ticks(20))
        .value(d => d);

      // 分组数据
      const sumstatMap = d3.group(series.data, d => d.group_name); // 修改
      const sumstat = Array.from(sumstatMap, ([key, values]) => {
        const input = values.map(g => +g.group_value);
        let bins = histogram(input); // 使用 let 允许修改

        // --- 修复开始：为提琴图添加闭合点 ---
        // 为了确保提琴图的形状是闭合的，我们在其数据范围的上下两端添加密度为0的点。
        if (bins.length > 0) {
            const dataMin = d3.min(input);
            const dataMax = d3.max(input);
            const verySmallValue = 0.001;
            
            // 在数据最小值处添加一个零点
            if (bins[0].x0 > dataMin) {
                bins.unshift({x0: dataMin, x1: dataMin, length: verySmallValue});
            }
            // 在数据最大值处添加一个零点
            if (bins[bins.length - 1].x1 < dataMax) {
                bins.push({x0: dataMax, x1: dataMax, length: verySmallValue});
            }
        }
        // --- 修复结束 ---

        return { key, bins };
      });

      // 计算最大 bin 数
      let maxNum = 0;
      for (const group of sumstat) {
        const allBins = group.bins;
        const lengths = allBins.map(a => a.length);
        const longest = d3.max(lengths);
        if (longest > maxNum) maxNum = longest;
      }

      // xNum 用于小提琴宽度
      const xNum = d3.scaleLinear()
        .range([0, xGroup.bandwidth() / 2])
        .domain([0, maxNum]);

      // 画小提琴图
      svg
        .selectAll(`.myViolin${seriesIdx}`)
        .data(sumstat)
        .enter()
        .append("g")
          .attr("transform", d => `translate(${xSeries(`series${seriesIdx}`)+ xGroup.bandwidth()/2 + xGroup(d.key) + axisMargin.x},0)`)
          // 画填充（无描边）
          .each(function(d) {
            // 获取当前分组的阴影颜色
            let groupShadowColor = "#FF5C5C";
            let groupLineColor = "#000000";
            let groupLineWidth = 2;
            let boxLineWidth = 1;
            let boxLineColor = "#000000";
            if (control) {
              const colorInput = control.querySelector(`.shadow-color-group[data-group="${d.key}"]`);
              if (colorInput) groupShadowColor = colorInput.value;
              const lineColorInput = control.querySelector(`.line-color-group[data-group="${d.key}"]`);
              if (lineColorInput) groupLineColor = lineColorInput.value;
              const lineWidthInput = control.querySelector(`.line-width-group[data-group="${d.key}"]`);
              if (lineWidthInput) groupLineWidth = parseFloat(lineWidthInput.value);
              const boxLineWidthInput = control.querySelector(`.box-line-width-group[data-group="${d.key}"]`);
              if (boxLineWidthInput) boxLineWidth = parseFloat(boxLineWidthInput.value);
              const boxLineColorInput = control.querySelector(`.box-line-color-group[data-group="${d.key}"]`);
              if (boxLineColorInput) boxLineColor = boxLineColorInput.value;
            }

            // 计算箱形图五数
            const values = d.bins.flatMap(bin => bin.map(v => v));
            const sorted = values.slice().sort((a, b) => a - b);
            const q1 = d3.quantileSorted(sorted, 0.25);
            const median = d3.quantileSorted(sorted, 0.5);
            const q3 = d3.quantileSorted(sorted, 0.75);
            const min = d3.min(sorted);
            const max = d3.max(sorted);

            const boxWidth = xGroup.bandwidth() / 2;

            // 画左半边箱体
            d3.select(this)
              .append("rect")
              .attr("x", -(boxWidth*0.75))
              .attr("y", y(q3))
              .attr("width", boxWidth*0.75)
              .attr("height", Math.abs(y(q1) - y(q3)))
              .style("fill", "white")
              .style("stroke", boxLineColor)
              .style("stroke-width", boxLineWidth);

            // 画中位线
            d3.select(this)
              .append("line")
              .attr("x1", -boxWidth*0.75)
              .attr("x2", 0)
              .attr("y1", y(median))
              .attr("y2", y(median))
              .style("stroke", boxLineColor)
              .style("stroke-width", boxLineWidth);

            // 须横线（上，只画左半）
            d3.select(this)
              .append("line")
              .attr("x1", -boxWidth * 0.5)
              .attr("x2", -boxWidth * 0)
              .attr("y1", y(max))
              .attr("y2", y(max))
              .style("stroke", boxLineColor)
              .style("stroke-width", boxLineWidth);

            // 须横线（下，只画左半）
            d3.select(this)
              .append("line")
              .attr("x1", -boxWidth * 0.5)
              .attr("x2", -boxWidth * 0)
              .attr("y1", y(min))
              .attr("y2", y(min))
              .style("stroke", boxLineColor)
              .style("stroke-width", boxLineWidth);

            // 关键：补箱体右上角到须线的竖线
            d3.select(this)
              .append("line")
              .attr("x1", 0)
              .attr("x2", 0)
              .attr("y1", y(q3))
              .attr("y2", y(max))
              .style("stroke", boxLineColor)
              .style("stroke-width", boxLineWidth);

            // 补箱体右下角到须线的竖线
            d3.select(this)
              .append("line")
              .attr("x1", 0)
              .attr("x2", 0)
              .attr("y1", y(q1))
              .attr("y2", y(min))
              .style("stroke", boxLineColor)
              .style("stroke-width", boxLineWidth);

              // 右边界线
            const binsForLine = d.bins.filter((bin, i, arr) =>
                bin.length > 0
              );
            
            const minX0 = d3.min(binsForLine, b => b.x0);
            const minX1 = d3.min(binsForLine, b => b.x1);
            const deltaY = minX1 - minX0;
            const verySmallValue = 0.001;
            binsForLine.unshift({
              x0: minX0 - deltaY,
              x1: minX1 - deltaY,
              length: verySmallValue
            });

            const maxX0 = d3.max(binsForLine, b => b.x0);
            const maxX1 = d3.max(binsForLine, b => b.x1);
            binsForLine.push({
              x0: maxX0 + deltaY,
              x1: maxX1 + deltaY,
              length: verySmallValue
            });

            binsForLine.forEach(bin => {
              bin.x0 += deltaY;
              bin.x1 += deltaY;
            });

            // 画右半边提琴图（area + 边界线）
            d3.select(this)
              .append("path")
              //.datum(d.bins)
              .datum(binsForLine)
              .style("fill", groupShadowColor)
              .style("fill-opacity", shadowOpacity)
              .style("stroke", "none")
              .attr("d", d3.area()
                .x0(() => 0)
                .x1(d => xNum(d.length))
                .y(d => y(d.x0))
                .curve(d3.curveBasis) // 建议改用更平滑的 curveBasis
              );

            d3.select(this)
              .append("path")
              //.datum(d.bins.filter(b => b.length > 0))
              .datum(binsForLine)
              .style("fill", "none")
              .style("stroke", groupLineColor)
              .style("stroke-width", groupLineWidth)
              .attr("d", d3.line()
                .x(d => xNum(d.length))
                .y(d => y(d.x0))
                .curve(d3.curveBasis)
            );
          });
      
      // Add individual points with jitter
      const showDots = control.querySelector(".show-dots")?.checked ?? true;
      if (showDots) {
        const jitterWidth = xGroup.bandwidth() * 0.5;
        svg
          .selectAll(`.indPoints${seriesIdx}`)
          .data(series.data)
          .enter()
          .append("circle")
            .attr("cx", d => {
              return xSeries(`series${seriesIdx}`) + xGroup(d.group_name) + xGroup.bandwidth()/2 + axisMargin.x - Math.random()*jitterWidth;
            })
            .attr("cy", d => y(d.group_value)) // 修复：散点图的值也应来自 group_value
            .attr("r", d => {
              const dotSizeInput = control.querySelector(`.dot-size-group[data-group="${d.group_name}"]`);
              return dotSizeInput ? parseFloat(dotSizeInput.value) : 2;
            })
            .style("fill", d => {
              const dotColorInput = control.querySelector(`.dot-color-group[data-group="${d.group_name}"]`);
              return dotColorInput ? dotColorInput.value : "#222222";
            })
            .style("opacity", d => {
              const dotOpacityInput = control.querySelector(`.dot-opacity-group[data-group="${d.group_name}"]`);
              return dotOpacityInput ? parseFloat(dotOpacityInput.value) : 1;
            })
            .attr("stroke", "none");
      }
    });

    // 计算所有提琴图中轴线绝对位置
    const violinCenters = [];
    seriesList.forEach((series, seriesIdx) => {
      // 获取当前series的名称
      const seriesName = series.control?.querySelector('.series-description')?.value || `Series ${seriesIdx + 1}`;
      const groupNames = Array.from(new Set(series.data.map(d => d.group_name))); // 修改
      const xGroup = d3.scaleBand()
        .domain(groupNames)
        .range([0, xSeries.bandwidth()])
        .padding(xGroupPadding);

      groupNames.forEach(groupName => {
        const center = xSeries(`series${seriesIdx}`) + xGroup(groupName) + xGroup.bandwidth() / 2 + axisMargin.x;
        violinCenters.push({
          series: seriesName, // 用当前输入框的值
          group: groupName,
          positionPx: center,
          positionCm: center / CM_TO_PX
        });
      });
    });

    // 清除旧参考线
    svg.selectAll(".ref-hline").remove();
    svg.selectAll(".ref-hline-label").remove();

    // 绘制所有参考线
    refLines.forEach((line, idx) => {
      svg.append("line")
        .attr("class", "ref-hline")
        .attr("x1", line.x1)
        .attr("x2", line.x2)
        .attr("y1", y(line.y))
        .attr("y2", y(line.y))
        .style("stroke", "#000")
        .style("stroke-width", 2)
        //.style("stroke-dasharray", "4,2");

      svg.append("text")
        .attr("class", "ref-hline-label")
        .attr("x", (line.x1 + line.x2) / 2)
        .attr("y", y(line.y) - line.labelDist)
        .attr("text-anchor", "middle")
        .style("font-size", `${line.labelSize}px`)
        .style("fill", "#000")
        .text(line.label);
    });

    // 控制面板展示和删除参考线
    const refListDiv = document.getElementById("ref-lines-list");
    if (refListDiv) {
      refListDiv.innerHTML = refLines.map((line, idx) =>
        `<div style="margin-bottom:2px;">
          <span style="color:#d62728;">y=${line.y}, x1=${line.x1}, x2=${line.x2}, label="${line.label}"</span>
          <button onclick="removeRefLine(${idx})" style="margin-left:8px;">Delete</button>
        </div>`
      ).join("");
    }

    // 展示到控制面板
    const panel = document.getElementById("violin-centers-panel");
    if (panel) {
      panel.innerHTML = "<b>Violin Centers:</b><br>" + violinCenters.map(
        v => `Series ${v.series} - ${v.group}: ${v.positionPx.toFixed(2)} px (${v.positionCm.toFixed(2)} cm)`
      ).join("<br>");
    }

    // 清除旧注释
    svg.selectAll(".custom-annotation").remove();

    // 绘制所有注释
    annotations.forEach((anno, idx) => {
      svg.append("text")
        .attr("class", "custom-annotation")
        .attr("x", anno.x)
        .attr("y", anno.y)
        .attr("text-anchor", "middle")
        .style("font-size", `${anno.fontSize}px`)
        .style("font-family", anno.fontFamily)
        .style("fill", anno.color)
        .style("font-weight", anno.fontWeight)
        .text(anno.text);
    });

    // 控制面板展示和删除注释
    const annoListDiv = document.getElementById("annotations-list");
    if (annoListDiv) {
      annoListDiv.innerHTML = annotations.map((anno, idx) =>
        `<div style="margin-bottom:2px;">
          <span style="color:${anno.color};font-family:${anno.fontFamily};font-size:${anno.fontSize}px;font-weight:${anno.fontWeight};">
            "${anno.text}" (x=${anno.x}, y=${anno.y})
          </span>
          <button onclick="removeAnnotation(${idx})" style="margin-left:8px;">Delete</button>
        </div>`
      ).join("");
    }
}

// 处理通过文件上传的CSV
document.getElementById("data-files").addEventListener("change", function(e) {
  const files = e.target.files;
  Array.from(files).forEach(file => {
    const reader = new FileReader();
    reader.onload = function(evt) {
      const text = evt.target.result;
      const data = d3.csvParse(text); // 解析CSV数据
      // 修复：统一使用 'group_name' 作为分组列名
      const groupNames = Array.from(new Set(data.map(d => d.group_name)));
      // 创建一个系列控制块，该控制块只控制此数据系列
      const seriesControl = createSeriesControl(seriesList.length, groupNames);
      // 保存数据与其控制块
      seriesList.push({ data, control: seriesControl, groupNames });
      // 将该控制块添加到控制面板中
      document.getElementById("series-controls").appendChild(seriesControl);
      createChart(); // 新增：重新绘制图表以显示新数据
    };
    reader.readAsText(file);
  });
});

// 处理通过URL添加CSV数据
document.getElementById("add-url").addEventListener("click", function() {
  const url = document.getElementById("data-url").value;
  if (!url) return;
  d3.csv(url).then(data => {
    const groupNames = Array.from(new Set(data.map(d => d.group_name)));
    const seriesControl = createSeriesControl(seriesList.length, groupNames);
    seriesList.push({ data, control: seriesControl, groupNames });
    document.getElementById("series-controls").appendChild(seriesControl);
    createChart(); // 新增：重新绘制图表以显示新数据
  }).catch(error => {
    console.error("Error loading CSV from URL:", error);
  });
});

// Initial chart creation
createChart();

// Add event listener to the update button
document.getElementById("update").addEventListener("click", function () {
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
  xtickPositions = document
    .getElementById("x-tick-positions")
    .value.split(",")
    .map(Number);
  xtickLabels = document
    .getElementById("x-tick-labels")
    .value.split(",");

  ytickPositions = document
    .getElementById("y-tick-positions")
    .value.split(",")
    .map(Number);
  ytickLabels = document
    .getElementById("y-tick-labels")
    .value.split(",");

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
  a.download = "violin_plot.svg";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});