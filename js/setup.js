
//var debugArrow1, debugArrow2;
var debugPos = 0;
var stats = {};

function init() {
  container = document.createElement( 'div' );
  document.body.appendChild( container );
  
  //Debug stuff
  /*
  let origin = new THREE.Vector3(200,20,50);
  let dir1 = new THREE.Vector3(1,0,0);
  let dir2 = new THREE.Vector3(-1,0,1);
  dir2.normalize();
  debugArrow1 = new THREE.ArrowHelper(
    dir1,
    origin, 50, 0xff0000
  );
  debugArrow1.tmgDir = dir1.clone();
  debugArrow1.name='arrow-debug1';
  scene.add(debugArrow1);

  debugArrow2 = new THREE.ArrowHelper(
    dir2, 
    origin, 50, 0x00ff00
  );
  debugArrow2.tmgDir = dir2.clone();
  debugArrow2.name='arrow-debug2';
  scene.add(debugArrow2);
  */
  
  // Lights
  scene.add( new THREE.AmbientLight( 0xffff99 ) );
  let directionalLight = new THREE.DirectionalLight( 0xffffff, 0.125 );
  directionalLight.position.x = Math.random() - 0.5;
  directionalLight.position.y = Math.random() - 0.5;
  directionalLight.position.z = Math.random() - 0.5;
  directionalLight.position.normalize();
  scene.add( directionalLight );
  pointLight = new THREE.PointLight( 0xffffff, 1 );
  scene.add( pointLight );
  pointLight.add( new THREE.Mesh( new THREE.SphereGeometry( 4, 8, 8 ), new THREE.MeshBasicMaterial( { color: 0xffffff } ) ) );

  // Other setup
  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  container.appendChild( renderer.domElement );
  
  stats = new Stats();
	container.appendChild( stats.dom );

  window.addEventListener('resize',     onWindowResize, false );
  window.addEventListener('keydown',    onKeyDown);
  window.addEventListener('keyup',      onKeyUp);
  window.addEventListener('keypress',   onKeyPress);
  window.addEventListener('mousewheel', onMouseWheel);
  window.addEventListener('mousedown',  onMouseDown);
  window.addEventListener('mouseup',    onMouseUp);  
  document.addEventListener('mousemove',  onDocumentMouseMove, false );
  document.addEventListener('touchstart', onDocumentTouchStart, false );
  document.addEventListener('touchmove',  onDocumentTouchMove, false );  
  
}  //init()

