
function init() {
  container = document.createElement( 'div' );
  document.body.appendChild( container );

  // Grid -------------
           
  gridXZ.rotation.y = 0;     scene.add(gridXZ);
  //gridXY.rotation.x = Pi/2;  scene.add(gridXY);
  //gridYZ.rotation.z = Pi/2;  scene.add(gridYZ); 
    
  /*
  //--- debug test ----- 
  var gridplaneSize = 20;
  var color = 0xFFDCBB;
  var plGeometry = new THREE.PlaneGeometry(GRID_SIZE, GRID_SIZE, GRID_DIVS, GRID_DIVS);
  var plMaterial = new THREE.MeshBasicMaterial({
          color:GRID_COLOR, 
          ambient:GRID_COLOR, 
          side:THREE.DoubleSide, 
          opacity:0.2, 
          transparent:true, 
          depthWrite: false 
  });
  var planeXY = new THREE.Mesh(plGeometry, plMaterial);
  planeXY.rotation.x = 0;;
  scene.add(planeXY);
  planeXY.receiveShadow = true;  
  //--- end debug test ----- 
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
  
  //debug stuff below ----------
  
  /*
  // MESHES WITH ANIMATED TEXTURES!
  var explosionMultiTexture = new THREE.ImageUtils.loadTexture(EXPLOSION_FILE_NAME);
  annie = new TextureAnimator(explosionMultiTexture, 8, 4, 24, 75 ); // texture, #horiz, #vert, #total, duration.
  
  var aMaterial = new THREE.SpriteMaterial({
    map: explosionMultiTexture, //flameTexture,  //textureMap,
    blending: THREE.AdditiveBlending
  });
  var explosionSprite = new THREE.Sprite(aMaterial);
  explosionSprite.position.set(150,0,100);
  explosionSprite.scale.x = 80;
  explosionSprite.scale.y = 80;
  explosionSprite.scale.z = 80;
  scene.add(explosionSprite);
  */
}  //init()

/*
//Debug below

function TextureAnimator(texture, tilesHoriz, tilesVert, numTiles, tileDispDuration) {  
  this.tilesHorizontal = tilesHoriz;
  this.tilesVertical = tilesVert;
  this.numberOfTiles = numTiles;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping; 
  texture.repeat.set( 1 / this.tilesHorizontal, 1 / this.tilesVertical );
  this.tileDisplayDuration = tileDispDuration;
  this.currentDisplayTime = 0;
  this.currentTile = 0;
    
  this.update = function( milliSec ) {
    this.currentDisplayTime += milliSec;
    while (this.currentDisplayTime > this.tileDisplayDuration) {
      this.currentDisplayTime -= this.tileDisplayDuration;
      this.currentTile++;
      if (this.currentTile == this.numberOfTiles)
        this.currentTile = 0;
      var currentColumn = this.currentTile % this.tilesHorizontal;
      var currentRow = Math.floor( this.currentTile / this.tilesHorizontal );

      texture.offset.x = currentColumn / this.tilesHorizontal;
      texture.offset.y = (this.tilesVertical - currentRow - 1) / this.tilesVertical;

      //  debugInfo("info1", 'Tile#: ' + this.currentTile + ', Row: ' + currentRow + ', Column: ' + 
      //            currentColumn + ', Offset: (' + texture.offset.x + ',' + texture.offset.y + ')' );
    }
  };
}    
*/
