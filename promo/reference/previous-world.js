import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

function roundedShape(width, height, radius) {
  const x = -width / 2, y = -height / 2;
  const shape = new THREE.Shape();
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  return shape;
}

function cardTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1536;
  canvas.height = 960;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 1536, 960);
  gradient.addColorStop(0, '#303b34');
  gradient.addColorStop(0.45, '#0e1913');
  gradient.addColorStop(1, '#101c15');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1536, 960);
  // Fine, deterministic brushed-metal striations, not random per frame.
  for (let y = 0; y < 960; y += 2) {
    ctx.fillStyle = `rgba(189,217,196,${0.008 + (Math.sin(y * 1.618) + 1) * 0.008})`;
    ctx.fillRect(0, y, 1536, 1);
  }
  ctx.strokeStyle = '#9cbaa01a';
  ctx.lineWidth = 2;
  for (let i = 0; i < 16; i++) {
    ctx.beginPath();
    ctx.ellipse(1420, 690, 365 + i * 22, 365 + i * 22, -0.35, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = '#d6e2d7';
  ctx.font = '600 63px Poppins';
  ctx.fillText('CARD', 100, 160);
  ctx.fillStyle = '#28d68d';
  ctx.fillText('SHARE', 100, 228);
  ctx.fillStyle = '#779482';
  ctx.font = '400 18px Poppins';
  ctx.letterSpacing = '7px';
  ctx.fillText('A WORLD OF POSSIBILITY', 102, 279);
  ctx.letterSpacing = '3px';
  ctx.fillStyle = '#d2dfd5';
  ctx.font = '500 27px Poppins';
  ctx.fillText('ELIGIBLE CARD', 100, 797);
  ctx.fillStyle = '#6e927b';
  ctx.font = '400 17px Poppins';
  ctx.fillText('MEMBER / 01', 100, 842);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#b4cbb9';
  ctx.font = '500 22px Poppins';
  ctx.fillText('POSSIBILITY, CONNECTED.', 1435, 835);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function material(object, opacity = 1) {
  object.transparent = true;
  object.userData.baseOpacity = opacity;
  object.opacity = opacity;
  return object;
}

export async function createWorld(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 9 / 16, 0.1, 80);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const env = pmrem.fromScene(room, 0.025);
  scene.environment = env.texture;
  room.dispose();
  pmrem.dispose();

  const board = new THREE.Group();
  scene.add(board);
  const shape = roundedShape(3.55, 2.22, 0.16);
  const bodyGeometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.045, bevelEnabled: true, bevelThickness: 0.018,
    bevelSize: 0.018, bevelSegments: 3, steps: 1, curveSegments: 12,
  });
  bodyGeometry.translate(0, 0, -0.024);
  const bodyMaterial = material(new THREE.MeshPhysicalMaterial({ color: 0x243b2b, metalness: 0.96, roughness: 0.23, clearcoat: 0.5, clearcoatRoughness: 0.2 }));
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  board.add(body);

  const frontGeometry = new THREE.ShapeGeometry(roundedShape(3.51, 2.18, 0.155), 32);
  const uv = frontGeometry.attributes.uv;
  const position = frontGeometry.attributes.position;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (position.getX(i) + 1.755) / 3.51, (position.getY(i) + 1.09) / 2.18);
  const texture = cardTexture();
  const faceMaterial = material(new THREE.MeshPhysicalMaterial({ map: texture, metalness: 0.63, roughness: 0.28, clearcoat: 0.85, clearcoatRoughness: 0.18, envMapIntensity: 1.25 }));
  const face = new THREE.Mesh(frontGeometry, faceMaterial);
  face.position.z = 0.041;
  board.add(face);

  const chip = new THREE.Group();
  chip.position.set(-1.25, -0.03, 0.054);
  const chipMaterial = material(new THREE.MeshStandardMaterial({ color: 0xc7c6a3, metalness: 0.87, roughness: 0.3 }));
  const chipMesh = new THREE.Mesh(new THREE.ShapeGeometry(roundedShape(0.44, 0.34, 0.045)), chipMaterial);
  chip.add(chipMesh);
  const lineMaterial = material(new THREE.LineBasicMaterial({ color: 0x3e5541 }), 0.65);
  const chipLines = [[-0.08,-0.17,-0.08,0.17],[0.08,-0.17,0.08,0.17],[-0.22,0,-0.08,0],[0.08,0,0.22,0],[-0.22,0.08,-0.08,0.08],[-0.22,-0.08,-0.08,-0.08],[0.08,0.08,0.22,0.08],[0.08,-0.08,0.22,-0.08]];
  for (const [x1,y1,x2,y2] of chipLines) {
    const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x1,y1,0.002),new THREE.Vector3(x2,y2,0.002)]);
    chip.add(new THREE.Line(geometry, lineMaterial));
  }
  board.add(chip);

  const wirelessMaterial = material(new THREE.LineBasicMaterial({ color: 0x93b8a0 }), 0.8);
  for (let i = 0; i < 3; i++) {
    const points = [];
    const r = 0.08 + i * 0.05;
    for (let j = 0; j <= 24; j++) {
      const a = -0.75 + j / 24 * 1.5;
      points.push(new THREE.Vector3(-0.89 + Math.cos(a) * r, -0.03 + Math.sin(a) * r, 0.058));
    }
    board.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), wirelessMaterial));
  }

  const outline = shape.getPoints(160).map((p) => new THREE.Vector3(p.x,p.y,0.047));
  const edgeMaterial = material(new THREE.LineBasicMaterial({ color: 0x40ef9e }), 0.5);
  const edge = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(outline), edgeMaterial);
  board.add(edge);

  const disc = new THREE.Group();
  disc.position.set(1.05, 0.22, 0.06);
  const discCanvas = document.createElement('canvas');
  discCanvas.width = discCanvas.height = 256;
  const dc = discCanvas.getContext('2d');
  dc.fillStyle = '#25e493'; dc.font = '500 180px Poppins'; dc.textAlign = 'center'; dc.textBaseline = 'middle'; dc.fillText('%',128,142);
  const discTexture = new THREE.CanvasTexture(discCanvas); discTexture.colorSpace = THREE.SRGBColorSpace;
  const discMaterial = material(new THREE.MeshBasicMaterial({ map: discTexture, depthWrite: false, color: 0xbfffdc }));
  disc.add(new THREE.Mesh(new THREE.PlaneGeometry(0.72,0.72), discMaterial));
  board.add(disc);

  const ambient = new THREE.AmbientLight(0x77a78b, 0.05); scene.add(ambient);
  const key = new THREE.RectAreaLight(0xf1fff3, 5, 8, 2);
  key.position.set(-2,4,5); key.lookAt(0,0,0); scene.add(key);
  const sweep = new THREE.RectAreaLight(0xe5fff0, 4, 0.4, 7);
  sweep.position.set(-4,0,3); sweep.lookAt(0,0,0); scene.add(sweep);
  const rim = new THREE.PointLight(0x19e691, 14, 12, 2); rim.position.set(2.5,-1,2); scene.add(rim);
  const top = new THREE.DirectionalLight(0xdae6dc, 1.3); top.position.set(0,4,3); scene.add(top);

  const state = {
    cardX:0,cardY:-0.45,cardZ:0,cardRX:0.18,cardRY:1.45,cardRZ:-0.2,cardScale:1,cardOpacity:1,
    cameraX:0,cameraY:0,cameraZ:11,cameraTargetX:0,cameraTargetY:0.3,
    light:0.01,edge:0,percent:0,reflection:0,background:0,
  };
  const materials = new Set();
  board.traverse((object) => { if (object.material) materials.add(object.material); });

  function render() {
    camera.position.set(state.cameraX,state.cameraY,state.cameraZ);
    camera.lookAt(state.cameraTargetX,state.cameraTargetY,0);
    board.visible = state.cardOpacity > 0.001 && state.cardScale > 0.001;
    board.position.set(state.cardX,state.cardY,state.cardZ);
    board.rotation.set(state.cardRX,state.cardRY,state.cardRZ);
    board.scale.setScalar(state.cardScale);
    for (const m of materials) m.opacity = state.cardOpacity * (m.userData.baseOpacity ?? 1);
    edgeMaterial.opacity = state.cardOpacity * state.edge * 0.75;
    discMaterial.opacity = state.cardOpacity * state.percent;
    faceMaterial.envMapIntensity = 0.02 + state.light * 1.1;
    bodyMaterial.envMapIntensity = 0.04 + state.light * 1.6;
    chipMaterial.envMapIntensity = 0.02 + state.light;
    key.intensity = state.light * 7;
    sweep.intensity = state.light * 5;
    sweep.position.x = -5 + state.reflection * 10;
    sweep.lookAt(board.position);
    top.intensity = state.light * 2.2;
    ambient.intensity = state.light * 0.25;
    rim.intensity = state.edge * 12;
    renderer.render(scene,camera);
  }
  function resize(width,height,pixelRatio=1) {
    renderer.setPixelRatio(Math.min(pixelRatio,2));
    renderer.setSize(width,height,false);
    camera.aspect = width/height;
    camera.updateProjectionMatrix();
    render();
  }
  function dispose() {
    board.traverse((o) => o.geometry?.dispose());
    for (const m of materials) m.dispose();
    texture.dispose();discTexture.dispose();env.dispose();renderer.dispose();
  }
  return {state,render,resize,dispose};
}
