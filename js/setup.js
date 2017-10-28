
function init() {
  container = document.createElement( 'div' );
  document.body.appendChild( container );

  // Grid -------------
           
  gridXY.rotation.y = 0;     scene.add(gridXZ);
  //gridXY.rotation.x = Pi/2;  scene.add(gridXY);
  //gridYZ.rotation.z = Pi/2;  scene.add(gridYZ); 
  
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

  window.addEventListener( 'resize',     onWindowResize, false );
  window.addEventListener( 'keydown',    onKeyDown);
  window.addEventListener( 'keyup',      onKeyUp);
  window.addEventListener( 'keypress',   onKeyPress);
  window.addEventListener( 'mousewheel', onMouseWheel);
  window.addEventListener( 'mousedown',  onMouseDown);
  window.addEventListener( 'mouseup',    onMouseUp);
  

  document.addEventListener( 'mousemove',  onDocumentMouseMove, false );
  document.addEventListener( 'touchstart', onDocumentTouchStart, false );
  document.addEventListener( 'touchmove',  onDocumentTouchMove, false );

}  //init()
