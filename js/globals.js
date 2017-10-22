
//===== Globally scoped variables =========

var container, stats;
var renderer;
var pointLight;

var loadedStatus = {
  allLoaded : false,  //will be set to true when all others loaded.   
  ship : false,
  sun : false,
  skyBox : false, 
  rocket : true, //change to FALSE when implementing rocket load
  rocketSound : true
};

var gameObjects = []; //to be filled with T3DObjects or descendents during object constructors
var scene = new THREE.Scene();
var clock = new THREE.Clock(true);
var skyBox = new TSkybox();
var sun = new TCelestialBody(SUN_MASS, SUN_REAL_WORLD_SIZE, SUN_GAME_SIZE, 'textures/land_ocean_ice_cloud_2048.jpg', 'sun');
var ship = new TShip(SHIP_MASS, 'ship');

//NOTE: Eventually, I want to make rocket(s) to be owned by ship, not in global scope
//   To do this, I need to figure out how to retain this context in callback functions
var rocket = new TRocket(ROCKET_MASS, 'rocket', ship);

var gameCamera = new TCamera(ship);
//var gameSounds = new TSounds(); //finish after figure out closures in classes, to have access to 'this'

var mouseX = 0;  //maybe later turn into Vector2
var mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var globalDebugMessage = '';
var autoPointTowardsMotionDelay = 0;  //When user turns ship, then this delay is set to ~1 second, preventing ship from pointing towards motion

var keyDown = {};  //object to hold which keys are currently pressed down

var gameLoaded = false;

var gamePaused = false;
var disableGravity  = false;
var debugInfoCounter = 0;
