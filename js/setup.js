
function init() {
  container = document.createElement( 'div' );
  document.body.appendChild( container );

  // Grid -------------
  let helper = new THREE.GridHelper(GRID_SIZE, 40, 0xffff11, 0xffff99 );
  helper.position.y = 0;
  scene.add( helper );

  /*
  if (1==0) {
    //sub functions here...   (for OBJ ship)
    //------------------------------
      function onOBJTransvserseCallback(child) {
        if ( child instanceof THREE.Mesh ) {
          child.material.map = tempTexture;
        }
      };

      function onOBJLoadedCallback ( object) {
        object.traverse( onOBJTransvserseCallback );
        let shipScale = 1;
        ship.object = object;
        ship.object.name = 'ship';
        ship.object.scale.set(shipScale, shipScale, shipScale);
        ship.object.rotation.y = Pi/2;
        ship.objectOffset.set(5, 0, 0);
        ship.resetPositionToInit(sun);
        ship.loaded = true;
        //resetShipPositionToInit();
        scene.add( ship.object );

        if (SHOW_SHIP_POS_MARKER == true) {
          let originMaterial = new THREE.MeshBasicMaterial( { color: 0xffaa00, wireframe: true } );
          let originGeometry = new THREE.SphereGeometry( 30, 32, 16 );
          ship.originIndicator = new THREE.Mesh( originGeometry, originMaterial );
          scene.add(ship.originIndicator);
        }

        if (SHOW_CAMERA_ATTACHEMENT_MARKER == true) {
          let cameraTargetMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );
          let cameraTargetGeometry = new THREE.SphereGeometry( 8, 10, 10 );
          ship.cameraAttachementMarker = new THREE.Mesh(cameraTargetGeometry, cameraTargetMaterial );
          scene.add(ship.cameraAttachementMarker);
        }

        animate();  //<-- triggers main gameplay.  Each call tiggers the next one.
      };

      function onOBJLoadErrorCallback ( xhr ) {
        //any load error handler can go here
      };

      function onOBJLoadProgressCallback ( xhr ) {
        if ( xhr.lengthComputable ) {
          let percentComplete = xhr.loaded / xhr.total * 100;
          console.log( Math.round(percentComplete, 2) + '% downloaded' );
        }
      };
    //end sub functions  (for OBJ ship)
    //--------------------------------

  let tempTexture = new THREE.CanvasTexture( generateTexture( 0, 0.5, 1 ), THREE.UVMapping );
  let loadManager = new THREE.LoadingManager();
  loadManager.onProgress = function ( item, loaded, total ) {
      console.log( item, loaded, total );
  }; 
  
  let OBJloader = new THREE.OBJLoader( loadManager );
  OBJloader.load('models/galosha/galosha2.obj',
              onOBJLoadedCallback, //<-- handles putting into scene after load
              onOBJLoadProgressCallback,
              onOBJLoadErrorCallback);
  }  //if 1==1          
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

  window.addEventListener( 'resize',   onWindowResize, false );
  window.addEventListener( 'keydown',  onKeyDown);
  window.addEventListener( 'keyup',    onKeyUp);
  window.addEventListener( 'keypress', onKeyPress);
  window.addEventListener( 'mousewheel', onMouseWheel);

  document.addEventListener( 'mousemove', onDocumentMouseMove, false );
  document.addEventListener( 'touchstart', onDocumentTouchStart, false );
  document.addEventListener( 'touchmove', onDocumentTouchMove, false );

}  //init()
