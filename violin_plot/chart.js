// Conversion factor: 1 cm = 37.7952755906 pixels
const CM_TO_PX = 37.7952755906;
const PT_TO_PX = 1;
let seriesList = [];

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
function createSeriesControl(index) {
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
    // 获取当前系列的索引（字符串需转换为数字）
    const idx = parseInt(div.dataset.index, 10);
    // 从全局数组中移除该系列
    seriesList.splice(idx, 1);
    // 从DOM中删除该控制块
    div.remove();
    // 重新更新剩余控制块的索引（可选，对于展示编号）
    const controls = document.querySelectorAll(".series-control");
    controls.forEach((ctrl, i) => ctrl.dataset.index = i);
    // 重新绘制图表
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
      .style("font-size", `${tickFontSize}px`) // Set font size
      .style("font-family", tickFontFamily); // Set font family

      // Customize Y axis line and ticks
      svg.selectAll(".domain") // Axis line
      .style("stroke-width", axisLineWidth + "px"); // Set axis line width

      svg.selectAll(".tick line") // Tick lines
      .style("stroke-width", tickLineWidth + "px"); // Set tick line width
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
      const xLabelDistance = tickLength+tickFontSize+6 * PT_TO_PX;
      svg.append("text")
      .attr("x", (width) / 2 +axisMargin.x) // Center the label horizontally
      .attr("y", height + xLabelDistance) // Position below the X axis
      //.attr("y", height - xScaleBarPositiony+xLabelFontSize-3)
      .attr("dominant-baseline", "text-before-edge")  // 添加 hanging 属性
      .style("text-anchor", "middle")
      .style("font-size", `${xLabelFontSize}px`)
      .style("font-family", xLabelFontFamily)
      .text(xLabel);
    }
    // Add Y axis label
    const showYLabel = document.getElementById("show-y-label").checked;
    if (showYLabel) {
      const yLabelDistance = tickLength + tickFontSize+6 * PT_TO_PX;
      svg.append("text")
      .attr("x", -(height) / 2+axisMargin.y) // Center the label vertically
      .attr("y", -yLabelDistance) // Position to the left of the Y axis
      .attr("dominant-baseline", "ideographic")  // 使用下沿作为基线
      .attr("transform", "rotate(-90)") // Rotate the label
      .style("text-anchor", "middle")
      .style("font-size", `${yLabelFontSize}px`)
      .style("font-family", yLabelFontFamily)
      .text(yLabel);
    }

    // Function to create or update the SVG
    const showXAxis = document.getElementById("show-x-axis").checked;
    const seriesNames = seriesList.map((s, i) => `series${i}`);
    const xSeries = d3.scaleBand()
      .domain(seriesNames)
      .range([0, width])
      .padding(0.2);

    if (showXAxis) {
        // 自动生成 tick labels
        svg.selectAll(".x-axis").remove();
        const xTickLabels = seriesList.map((s, i) =>
          s.control?.querySelector('.series-description')?.value || `Series ${i + 1}`
        );
        const xAxis = d3.axisBottom(xSeries)
          .tickValues(seriesNames)
          .tickSize(tickLength * (tickOrientation === "inward" ? -1 : 1))
          .tickFormat((d, i) => xTickLabels[i])
          .tickSizeOuter(showOuterTicks ? tickLength : 0);

        svg.append("g")
          .attr("transform", `translate(${axisMargin.x}, ${height})`)
          .call(xAxis)
          .selectAll("text")
          .style("font-size", `${tickFontSize}px`)
          .style("font-family", tickFontFamily);

        svg.selectAll(".domain")
          .style("stroke-width", axisLineWidth + "px");
        svg.selectAll(".tick line")
          .style("stroke-width", tickLineWidth + "px");
    }

    seriesList.forEach((series, seriesIdx) => {
      const control = series.control;
      const lineColor = control.querySelector(".line-color").value;
      const lineThickness = parseFloat(control.querySelector(".line-thickness").value);
      const showShadow = control.querySelector(".show-shadow").checked;
      const shadowColor = control.querySelector(".shadow-color").value;
      const shadowOpacity = parseFloat(control.querySelector(".shadow-opacity").value);

      const groupNames = Array.from(new Set(series.data.map(d => d.Species)));
      const xGroup = d3.scaleBand()
        .domain(groupNames)
        .range([0, xSeries.bandwidth()])
        .padding(0.01); // 小分组间距小

      // 直方图设置
      const histogram = d3.histogram()
        .domain(y.domain())
        .thresholds(y.ticks(20))
        .value(d => d);

      // 分组数据
      const sumstatMap = d3.group(series.data, d => d.Species);
      const sumstat = Array.from(sumstatMap, ([key, values]) => {
        const input = values.map(g => +g.Sepal_Length);
        const bins = histogram(input);
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
            // 填充
            d3.select(this)
              .append("path")
              .datum(d.bins)
              .style("fill", shadowColor)
              .style("fill-opacity", shadowOpacity)
              .style("stroke", "none")
              .attr("d", d3.area()
                .defined(d => d.length > 0)
                .x0(() => xNum(0))
                .x1(d => xNum(d.length))
                .y(d => y(d.x0))
                .curve(d3.curveCatmullRom)
              );
            // 右边界线
            d3.select(this)
              .append("path")
              .datum(d.bins.filter(b => b.length > 0))
              .style("fill", "none")
              .style("stroke", lineColor)
              .style("stroke-width", lineThickness)
              .attr("d", d3.line()
                .x(d => xNum(d.length))
                .y(d => y(d.x0))
                .curve(d3.curveCatmullRom)
              );

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
              .style("stroke", "black")
              .style("stroke-width", 1);

            // 画中位线
            d3.select(this)
              .append("line")
              .attr("x1", -boxWidth*0.75)
              .attr("x2", 0)
              .attr("y1", y(median))
              .attr("y2", y(median))
              .style("stroke", "black")
              .style("stroke-width", 1);

            // 须横线（上，只画左半）
            d3.select(this)
              .append("line")
              .attr("x1", -boxWidth * 0.5)
              .attr("x2", -boxWidth * 0)
              .attr("y1", y(max))
              .attr("y2", y(max))
              .style("stroke", "black")
              .style("stroke-width", 1);

            // 须横线（下，只画左半）
            d3.select(this)
              .append("line")
              .attr("x1", -boxWidth * 0.5)
              .attr("x2", -boxWidth * 0)
              .attr("y1", y(min))
              .attr("y2", y(min))
              .style("stroke", "black")
              .style("stroke-width", 1);

            // 关键：补箱体右上角到须线的竖线
            d3.select(this)
              .append("line")
              .attr("x1", 0)
              .attr("x2", 0)
              .attr("y1", y(q3))
              .attr("y2", y(max))
              .style("stroke", "black")
              .style("stroke-width", 1);

            // 补箱体右下角到须线的竖线
            d3.select(this)
              .append("line")
              .attr("x1", 0)
              .attr("x2", 0)
              .attr("y1", y(q1))
              .attr("y2", y(min))
              .style("stroke", "black")
              .style("stroke-width", 1);

            // 画右半边提琴图（area + 边界线）
            d3.select(this)
              .append("path")
              .datum(d.bins)
              .style("fill", shadowColor)
              .style("fill-opacity", shadowOpacity)
              .style("stroke", "none")
              .attr("d", d3.area()
                .defined(d => d.length > 0)
                .x0(() => 0)
                .x1(d => xNum(d.length))
                .y(d => y(d.x0))
                .curve(d3.curveCatmullRom)
              );

            // 右边界线
            d3.select(this)
              .append("path")
              .datum(d.bins.filter(b => b.length > 0))
              .style("fill", "none")
              .style("stroke", lineColor)
              .style("stroke-width", lineThickness)
              .attr("d", d3.line()
                .x(d => xNum(d.length))
                .y(d => y(d.x0))
                .curve(d3.curveCatmullRom)
              );
          });

      // Add individual points with jitter
      const jitterWidth = xGroup.bandwidth() * 0.5;
      svg
        .selectAll(`.indPoints${seriesIdx}`)
        .data(series.data)
        .enter()
        .append("circle")
          .attr("cx", d => {
            return xSeries(`series${seriesIdx}`) + xGroup(d.Species) + xGroup.bandwidth()/2 + axisMargin.x - Math.random()*jitterWidth;
          })
          .attr("cy", d => y(d.Sepal_Length))
          .attr("r", 1)
          .style("fill", d => myColor(d.Sepal_Length))
          .attr("stroke", "white");
    });
}

// 处理通过文件上传的CSV
document.getElementById("data-files").addEventListener("change", function(e) {
  const files = e.target.files;
  Array.from(files).forEach(file => {
    const reader = new FileReader();
    reader.onload = function(evt) {
      const text = evt.target.result;
      const data = d3.csvParse(text); // 解析CSV数据
      // 创建一个系列控制块，该控制块只控制此数据系列
      const seriesControl = createSeriesControl(seriesList.length);
      // 保存数据与其控制块
      seriesList.push({ data, control: seriesControl });
      // 将该控制块添加到控制面板中
      document.getElementById("series-controls").appendChild(seriesControl);
    };
    reader.readAsText(file);
  });
});

// 处理通过URL添加CSV数据
document.getElementById("add-url").addEventListener("click", function() {
  const url = document.getElementById("data-url").value;
  if (!url) return;
  d3.csv(url).then(data => {
    const seriesControl = createSeriesControl(seriesList.length);
    seriesList.push({ data, control: seriesControl });
    document.getElementById("series-controls").appendChild(seriesControl);
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