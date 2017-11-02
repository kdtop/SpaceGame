
//===== Globally scoped variables =========

var container, stats;
var renderer;
var pointLight;

var debugging = false;
var debugCameraTargetGeometry = new THREE.SphereGeometry( 4, 5, 5 );
var debugCameraTargetMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );
var debugPositionMarker = new THREE.Mesh(debugCameraTargetGeometry, debugCameraTargetMaterial);

var gameObjects = []; //to be filled with T3DObjects or descendents during object constructors

var gameCamera = new TCamera({
  mass: CAMERA_MASS,
  name: 'camera',
  initPosition: CAMERA_INIT_POSITION,
  //trackedObject: ship,   //<--- will set below. 
});

var gameSounds = new TSounds(); 

var loadedStatus = {
  allLoaded :   false,  //<-- will be set to true when all others loaded.   
  ships :       false,
  sun :         false,
  skyBox :      false, 
  rocketSound : true   //<--- implement later.
};

var scene = new THREE.Scene();
var clock = new THREE.Clock(true);
var skyBox = new TSkybox();

var sun = new TCelestialBody({                            
  mass: SUN_MASS, 
  realSize: SUN_REAL_WORLD_SIZE,
  gameSize: SUN_GAME_SIZE,
  textureFName: 'textures/land_ocean_ice_cloud_2048.jpg',
  name: 'sun', 
  initPosition: nullV
});
    
var aShip = new TShip({
  mass:SHIP_MASS, 
  name: 'ship',
  modelFName: SHIP_MODEL_FNAME,
  initPosition: SHIP_INIT_POSITION,
  //excludeWingSmokePS: true,   //<--- debug, remove later
  //excludeEnginePS: true,      //<--- debug, remove later

});

var shipsArray = [aShip]; //<-- will contain all ships (i.e. multiple if multiplayer)
var localShipIndex = 0;
gameCamera.trackedObject = aShip;

var explosionManager = new TParticleSys({ 
  name:                  'Explosion_Manager',                                  
  parent:                null,
  emitRate:              0,
  positionOffset:        new TOffset(0,0,0),
  velocityOffset:        new TOffset(0,0,0),
  decaySec:              99999,
  initScale:             80,
  posVariance:           0,
  velocityVariance:      0,
  decayVariance:         0,                                             
  scaleVariance:         0,
  animationTextureFName: EXPLOSION_FILE_NAME,
  numTilesHoriz:         8,  
  numTilesVert:          4,
  numTiles:              24,    
  cycleTime:             3,                                                      
  loop:                  false,
});    
                                                                  
//gameObjects.push(explosionManager);

var gridXZ = new THREE.GridHelper(GRID_SIZE, GRID_DIVS, GRID_COLOR_CENTRAL_LINE, GRID_COLOR);
var gridXY = new THREE.GridHelper(GRID_SIZE, GRID_DIVS, GRID_COLOR_CENTRAL_LINE, GRID_COLOR);
var gridYZ = new THREE.GridHelper(GRID_SIZE, GRID_DIVS, GRID_COLOR_CENTRAL_LINE, GRID_COLOR);

var mouseX = 0;  //maybe later turn into Vector2
var mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var globalDebugMessage = '';
var autoPointTowardsMotionDelay = 0;  //When user turns ship, then this delay is set to ~1 second, preventing ship from pointing towards motion

var keyDown = {};  //object to hold which keys are currently pressed down
var mouseDown = false;

var gameLoaded = false;
var gamePaused = false;
var disableGravity  = false;
var debugInfoCounter = 0;

var bufferedUserGameActions = []; //This will hold actions from onKey events etc, until next cycle.
var bufferedUserCameraActions = []; //This will hold actions from onKey events etc, until next cycle. 
var bufferedUserEnvironmentActions = []; //This will hold actions from onKey events etc, until next cycle. 


var onKeyPressMapping = {
  'p' : { arr: bufferedUserEnvironmentActions,
          msg: ENV_ACTION.togglePause,
          fn: function() {
                if (gamePaused) requestAnimationFrame(animate); //<-- required to trigger handling of input if game currently paused. 
              }           
        },
  'g' : { arr: bufferedUserEnvironmentActions,
          msg: ENV_ACTION.toggleGravity,
        },
  'f' : { arr: bufferedUserGameActions,
          msg: VEHICLE_ACTION.launchRocket,
        },
  'k' : { arr: bufferedUserGameActions,
          msg: VEHICLE_ACTION.stop,
        },
  'o' : { arr: bufferedUserGameActions,
          msg: VEHICLE_ACTION.dropBomb,
        },          
};  

