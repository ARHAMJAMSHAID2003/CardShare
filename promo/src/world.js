import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

function rounded(w,h,r) {
  const s=new THREE.Shape(),x=-w/2,y=-h/2;
  s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);
  s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);
  s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;
}

// The face is a direct crop of the supplied splash screen, never a redrawn logo.
export async function createWorld(canvas, source) {
  const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,preserveDrawingBuffer:true});
  renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.4;
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(38,9/16,.1,60);
  const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();
  const env=pmrem.fromScene(room,.03);scene.environment=env.texture;room.dispose();pmrem.dispose();
  const group=new THREE.Group();scene.add(group);
  const body=new THREE.Mesh(new THREE.ExtrudeGeometry(rounded(3.1,2.17,.19),{depth:.12,bevelEnabled:true,bevelSize:.025,bevelThickness:.025,bevelSegments:4,steps:1,curveSegments:24}),new THREE.MeshPhysicalMaterial({color:0x386f55,metalness:.9,roughness:.22,clearcoat:1,transparent:true}));
  body.position.z=-.14;group.add(body);
  const crop=document.createElement('canvas');crop.width=400;crop.height=280;
  crop.getContext('2d').drawImage(source,160,350,400,280,0,0,400,280);
  const texture=new THREE.CanvasTexture(crop);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=renderer.capabilities.getMaxAnisotropy();
  const geo=new THREE.ShapeGeometry(rounded(3.08,2.15,.18),32),p=geo.attributes.position,u=geo.attributes.uv;
  for(let i=0;i<u.count;i++)u.setXY(i,(p.getX(i)+1.54)/3.08,(p.getY(i)+1.075)/2.15);
  const face=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({map:texture,transparent:true,toneMapped:false}));face.position.z=.012;group.add(face);
  const edge=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(rounded(3.1,2.17,.19).getPoints(100).map(v=>new THREE.Vector3(v.x,v.y,.019))),new THREE.LineBasicMaterial({color:0x71ffc0,transparent:true,opacity:.65}));group.add(edge);
  const light=new THREE.RectAreaLight(0xe5fff2,9,4,5);light.position.set(-4,3,4);light.lookAt(0,0,0);scene.add(light);
  scene.add(new THREE.AmbientLight(0xb9ffdc,1.3));
  const state={x:0,y:1.25,z:0,rx:.08,ry:-.55,rz:-.08,scale:.83,opacity:1,cameraX:.1,cameraZ:10,lightX:-4};
  function render(){
    if(state.opacity<=.001){renderer.clear();return;}
    camera.position.set(state.cameraX,0,state.cameraZ);camera.lookAt(0,0,0);
    group.position.set(state.x,state.y,state.z);group.rotation.set(state.rx,state.ry,state.rz);group.scale.setScalar(state.scale);group.visible=state.opacity>.001;
    body.material.opacity=face.material.opacity=state.opacity;edge.material.opacity=state.opacity*.55;
    light.position.x=state.lightX;light.lookAt(group.position);
    renderer.render(scene,camera);
  }
  function resize(w,h,dpr=1){renderer.setPixelRatio(Math.min(2,dpr));renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();render();}
  return{state,render,resize};
}
