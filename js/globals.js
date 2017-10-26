
//===== Globally scoped variables =========

var container, stats;
var renderer;
var pointLight;

var debugging = false;

var loadedStatus = {
  allLoaded : false,  //will be set to true when all others loaded.   
  ship : false,
  sun : false,
  skyBox : false, 
  rocket : false, 
  rocketSound : true
};

var gameObjects = []; //to be filled with T3DObjects or descendents during object constructors
var scene = new THREE.Scene();
var clock = new THREE.Clock(true);
var skyBox = new TSkybox();
var sun = new TCelestialBody({
  mass: SUN_MASS, 
  realSize: SUN_REAL_WORLD_SIZE,
  gameSize: SUN_GAME_SIZE,
  textureFName: 'textures/land_ocean_ice_cloud_2048.jpg',
  name: 'sun', 
  initPosition: nullV});

var ship = new TShip({
   mass:SHIP_MASS, 
   name: 'ship',
   modelFName: SHIP_MODEL_FNAME,
   initPosition: SHIP_INIT_POSITION});

//temp
const USING_SHIP2 = false;
if (USING_SHIP2) {
  const SHIP2_INIT_POSITION = new THREE.Vector3(0,0,-250);
  var ship2 = new TShip({
    mass: SHIP_MASS, 
    name: 'ship2',
    modelFName: ROCKET_MODEL_FNAME,
    initPosition: SHIP2_INIT_POSITION});
}  


//NOTE: Eventually, I want to make rocket(s) to be owned by ship, not in global scope
//   To do this, I need to figure out how to retain this context in callback functions
//var rocket = new TRocket(ROCKET_MASS, 'rocket', ship, ROCKET_MODEL_FNAME, nullV);
var rocket = new TRocket({
  mass: ROCKET_MASS,
  name: 'rocket', 
  ownerVehicle: ship, 
  modelFName: ROCKET_MODEL_FNAME, 
  initPosition: nullV});

var gameCamera = new TCamera({
  mass: CAMERA_MASS,
  name: 'camera',
  initPosition: CAMERA_INIT_POSITION,
  trackedObject: ship});

//var gameSounds = new TSounds(); //finish after figure out closures in classes, to have access to 'this'

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
