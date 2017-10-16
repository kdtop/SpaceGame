
//===== Globally scoped variables =========

var container, stats;
var renderer;
var pointLight;

var scene = new THREE.Scene();
var clock = new THREE.Clock(true);

var autoPointTowardsMotionDelay = 0;  //When user turns ship, then this delay is set to ~1 second, preventing ship from pointing towards motion
var sun = new TCelestialBody(SUN_MASS, SUN_REAL_WORLD_SIZE, SUN_GAME_SIZE, 'textures/land_ocean_ice_cloud_2048.jpg');
sun.object.name = 'sun';

var debugInfoCounter = 0;

var ship = new TVehicle(SHIP_MASS);
ship.position.set(150,0,0);
ship.plane = 'xz';

var keyDown = {};  //object to hold which keys are currently pressed down

var gameCamera = new TCamera();
gameCamera.trackedObject = ship;

var mouseX = 0;  //maybe later turn into Vector2
var mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var globalDebugMessage = '';

var gamePaused = false;
var disableGravity  = false;
