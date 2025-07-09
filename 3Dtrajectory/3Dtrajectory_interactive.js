let scene, camera, renderer, controls, rawTrajs = [];
initThree();

// 修复 FileReader 链式调用问题，确保 readAsText 在 reader 上调用
document.getElementById('file-input').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();                  // ← 改：先保存 reader
  reader.addEventListener('load', evt => {
    const data = d3.csvParse(evt.target.result, d3.autoType);
    rawTrajs = d3.groups(data, d => d.traj_id).map(g => g[1]);
    drawTrajectories();
  });
  reader.readAsText(file);                          // ← 改：在 reader 上调用
});

// 区域参数变化后重画
document.getElementById('update-region').addEventListener('click', drawTrajectories);

function initThree() {
  const container = document.getElementById('canvas-container');
  const w = container.clientWidth, h = container.clientHeight;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, w/h, 1, 1000);
  camera.position.set(200,200,200);
  renderer = new THREE.WebGLRenderer({ antialias:true });
  renderer.setSize(w,h);
  renderer.setClearColor(0xffffff,1);
  container.appendChild(renderer.domElement);
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.dampingFactor = 0.1;
  window.addEventListener('resize', () => {
    const W = container.clientWidth, H = container.clientHeight;
    camera.aspect = W/H; camera.updateProjectionMatrix();
    renderer.setSize(W,H);
  });
  animate();
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

function drawTrajectories() {
  if (!rawTrajs.length) return;
  // 读区域尺寸
  const regionW = parseFloat(document.getElementById('region-width-cm').value),
        regionD = parseFloat(document.getElementById('region-depth-cm').value);
  // 计算原始数据 XZ 范围
  const xs = rawTrajs.flatMap(t => t.map(p => p.x)),
        zs = rawTrajs.flatMap(t => t.map(p => p.z));
  const xMin = d3.min(xs), xMax = d3.max(xs),
        zMin = d3.min(zs), zMax = d3.max(zs);
  const dataW = xMax - xMin, dataD = zMax - zMin;
  const sX = regionW / dataW, sZ = regionD / dataD;
  const cX = (xMax + xMin)/2, cZ = (zMax + zMin)/2;

  // 清除旧轨迹
  scene.children.slice().forEach(obj => {
    if (obj.userData.isTraj) scene.remove(obj);
  });

  // 按比例缩放并居中后绘制
  const mat = new THREE.LineBasicMaterial({ color:0x000000 });
  rawTrajs.forEach(traj => {
    const pts = traj.map(p => new THREE.Vector3(
      (p.x - cX)*sX,
      p.y,                  // Y 原始单位不变，也可添加 scale
      (p.z - cZ)*sZ
    ));
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const line = new THREE.Line(geo, mat);
    line.userData.isTraj = true; scene.add(line);
  });
}