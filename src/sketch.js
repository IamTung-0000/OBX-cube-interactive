import * as THREE from 'three';
import { OrbitControls } from "three/addons/OrbitControls.js";
import { Flow } from "three/addons/CurveModifier.js";
import { Curve } from 'three';

let controls, camera, camera2, scene, scene2, renderer;

let cube2;

let cubeScaleVal = 1;
let lastMouseYicr = 0;

var cameraVal = 0;

const moPathCurve = [];
const flow = [];
let positionAttribute;

var mouseY = 0;
var mouseYicr = 1;
let boxSize = 1;


class AnimCurve {
  constructor(x,y,z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  createCurve() {

    // create curve
    this.curve = new THREE.CatmullRomCurve3( [
      new THREE.Vector3(0, 0, 0 ),
      // new THREE.Vector3(5, 10, 5 ),
      new THREE.Vector3(this.x, this.y, this.z )
    ] );
  
    this.curve.closed = false;
    const points = this.curve.getPoints( 50 );
    const geometryCurve = new THREE.BufferGeometry().setFromPoints( points );
    const materialCurve = new THREE.LineBasicMaterial( { color: 0xFFFFFF } );
  
    // Create the final object to add to the scene
    const curveObject = new THREE.Line( geometryCurve, materialCurve );
    // scene.add(curveObject);
  
  }
}
  

function lights() {




}

function createCamera() {

  const fov = 20;
  const aspect = window.innerWidth / window.innerHeight; // follow window size
  const near = 1;
  const far = 1000;

  camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
  camera.position.set( 10, 10, 10 );

  camera2 = new THREE.PerspectiveCamera( fov, aspect, near, far );
  camera2.position.set( 20, 20, 20 );

}

function init() {

  const canvas = document.querySelector("#c");
  // const canvas = document.createelement('canvas')
  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  createCamera();
  // controls
  controls = new OrbitControls( camera, renderer.domElement );
  controls.listenToKeyEvents( window ); // optional
  //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)
  controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = false;
  controls.minDistance = 100;
  controls.maxDistance = 500;
  controls.maxPolarAngle = Math.PI / 2;
  controls.enableZoom = false;
  controls.autoRotate = true;
  
  controls.update();
  
  scene = new THREE.Scene();
  scene2 = new THREE.Scene();

}

function Scene() {

  // Lights
  const color = 0xffffff;
  const intensity = 1;

  const light = new THREE.DirectionalLight(color, intensity);
  light.position.set(-1, 2, 4);

  const light2 = new THREE.AmbientLight( 0x003973 );
  light2.intensity = 1.0;

  scene.add(light);
  scene.add(light2);

  //--------

  const boxWidth = boxSize;
  const boxHeight = boxSize;
  const boxDepth = boxSize;

  const cubeGeometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
  const material = new THREE.MeshPhongMaterial({ color: 0x44aa88 }); // greenish blue
  const cube = new THREE.Mesh(cubeGeometry, material);
  // scene.add(cube);

  const sphereGeometry = new THREE.SphereGeometry( 30, 4, 4 );
  const sphere = new THREE.Mesh( sphereGeometry, material );
  // scene.add( sphere );

  positionAttribute = sphereGeometry.getAttribute( 'position' );
  let vertex = new THREE.Vector3();

  //create motion path curve
  for (let index = 0; index < positionAttribute.count; index++) {
    vertex.fromBufferAttribute( positionAttribute, index); // read vertex
    moPathCurve[index] = new AnimCurve(vertex.x, vertex.y, vertex.z);
    moPathCurve[index].createCurve();
    flow[index] = new Flow( cube );
    flow[index].updateCurve( 0, moPathCurve[index].curve);
    scene.add( flow[index].object3D );
  }

}

function Scene2() {

  const color = 0xffffff;
  const intensity = 1;

  const light = new THREE.DirectionalLight(color, intensity);
  light.position.set(-1, 2, 4);

  const light2 = new THREE.AmbientLight( 0x003973 );
  light2.intensity = 1.0;

  scene2.add(light);
  scene2.add(light2);

  const boxWidth = 5;
  const boxHeight = 5;
  const boxDepth = 5;

  const cubeGeometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
  const material = new THREE.MeshPhongMaterial({ color: 0x44aa88 }); // greenish blue
  cube2 = new THREE.Mesh(cubeGeometry, material);
  scene2.add(cube2);

}


function render() {

  //move cube
  for (let index = 0; index < positionAttribute.count; index++) {
      flow[index].moveAlongCurve( (-mouseY/1000) * 10); 
  }
  mouseY = 0;

  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (canvas.width !== width || canvas.height !== height) {
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  controls.update();
  renderer.render(scene, camera);

}

function render2() {

  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;


  if (canvas.width !== width || canvas.height !== height) {
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  
  cube2.scale.set(cubeScaleVal,cubeScaleVal,cubeScaleVal);

  controls.update();
  renderer.render(scene2, camera);

}

init();

window.addEventListener("mousewheel", function(e) {

  if (e.deltaY > 0) {
    mouseY = Math.sign(e.deltaY);
    mouseYicr +=1;
    cubeScaleVal+=0.01;
  }

  if (e.deltaY < 0) {
    mouseY = Math.sign(e.deltaY);
    mouseYicr -=1;
    cubeScaleVal-=0.01;
  }

  console.log(mouseYicr);

  if (mouseYicr > 0 && mouseYicr < 100) {
    requestAnimationFrame(render);
    console.log("Scene 01");
  }

  if (mouseYicr > 100 && mouseYicr < 200) {
    requestAnimationFrame(render2);
    console.log("Scene 02");
  }


});


Scene();
Scene2();

