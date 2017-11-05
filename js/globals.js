
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
  trackedObject: null,   //<--- will set below. 
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
  textureFName: SUN_TEXTURE_FILE_NAME,
  atmosphereTextureFName: SUN_ATMOSPHERE_TEXTURE_FILE_NAME,
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


var gameGrids = new TGrids({
  size:                GRID_SIZE, 
  divs:                GRID_DIVS,
  centerLineColorXZ:   GRID1_COLOR_CENTRAL_LINE, 
  mainColorXZ:         GRID1_COLOR,    
  centerLineColorYZ:   GRID2_COLOR_CENTRAL_LINE, 
  mainColorYZ:         GRID2_COLOR,    
  centerLineColorXY:   GRID3_COLOR_CENTRAL_LINE, 
  mainColorXY:         GRID3_COLOR,                           
  excludeXZ:           false, //floor
  excludeYZ:           false,  
  excludeXY:           false,
  trackedObjects:      shipsArray,
  gridVisibilityDist:  25,
  glowVisibilityDist:  50,
});    

var mouse = new THREE.Vector2(0,0);
var mouseDownPos = new THREE.Vector2(0,0);

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


var keyMapping = {
  //-----Keys for onKeyPress handler ---------------------------
           //Note: because arr is define for this group, they will be handled in onKeyPress()
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
                   noRepeat: true,
                 },
           'k' : { arr: bufferedUserGameActions,
                   msg: VEHICLE_ACTION.stop,
                 },
           'o' : { arr: bufferedUserGameActions,
                   msg: VEHICLE_ACTION.dropBomb,
                 },          
      'Escape' : { arr: bufferedUserGameActions,
                   msg: VEHICLE_ACTION.resetPosToInit,
                 },    
  //--------Keys for getKeyCameraAction----------------------         
           'a' : { msg: CAMERA_ACTION.orbitAngleSub     },
           'd' : { msg: CAMERA_ACTION.orbitAngleAdd     },
           's' : { msg: CAMERA_ACTION.orbitAngleZeror   },
           '1' : { msg: CAMERA_ACTION.setModeOrbit      },
           '2' : { msg: CAMERA_ACTION.setModeFollow     },
           '3' : { msg: CAMERA_ACTION.setModeCockpit    },
           '4' : { msg: CAMERA_ACTION.setModeMouse      },
           '5' : { msg: CAMERA_ACTION.setModeHighAbove  },            
  //--------Keys for getKeyVehicleAction---------------------         
  'ArrowRight' : { msg: VEHICLE_ACTION.yawRight         },
   'ArrowLeft' : { msg: VEHICLE_ACTION.yawLeft          },
     'ArrowUp' : { msg: VEHICLE_ACTION.thrustMore       },
      'PageUp' : { msg: VEHICLE_ACTION.pitchDn          },
    'PageDown' : { msg: VEHICLE_ACTION.pitchUp          },
           ']' : { msg: VEHICLE_ACTION.rollRight        },
           '[' : { msg: VEHICLE_ACTION.rollLeft         },
       'Enter' : { msg: VEHICLE_ACTION.orientToVelocity },
  //---------------------------------------------------------
};  

