
function init() {
  container = document.createElement( 'div' );
  document.body.appendChild( container );

  // Grid -------------
  let helper = new THREE.GridHelper(GRID_SIZE, 40, 0xffff11, 0xffff99 );
  helper.position.y = 0;
  scene.add( helper );
  
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

  //Sound setup
  var audioListener = new THREE.AudioListener();  // instantiate a listener
  gameCamera.camera.add( audioListener );  // add the listener to the camera
  ship.engineSound = new THREE.Audio( audioListener );  // instantiate audio object
  scene.add( ship.engineSound );  // add the audio object to the scene
  var audioLoader = new THREE.AudioLoader();  // instantiate a loader
  audioLoader.load(     // load a resource
    'audio/effects/Rocket-SoundBible.com-941967813.mp3',  // resource URL
    function ( audioBuffer ) {   // Function when resource is loaded
      ship.engineSound.setBuffer( audioBuffer );  // set the audio object buffer to the loaded object
      //ship.engineSound.play();  // play the audio
    //ship.engineSound.setLoop(true);
    //ship.engineSound.setVolume(0.5);
    },
    // Function called when download progresses
    function ( xhr ) {
      console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
    },
    // Function called when download errors
    function ( xhr ) {
      console.log( 'An error happened during audio loading' );
    }
  );


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
