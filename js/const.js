

const Pi = 3.14159 ;
const CAMERA_SPRING_CONST = 40;  //units are N / voxel    <-- tweak number later
const CAMERA_MASS = 10;  //units are kg
const CAMERA_MAX_PAN_VELOCITY = 2500; //voxels/sec
const CAMERA_MAX_FOLLOW_VELOCITY = 800; //voxels/sec
const CAMERA_INIT_POSITION = new THREE.Vector3(0,200,800);

const CAMERA_MODE_UNK = 0;
const CAMERA_MODE_ORBIT = 1;
const CAMERA_MODE_FOLLOW = 2;
const CAMERA_MODE_HIGH_ABOVE = 3;
const CAMERA_MODE_MOUSE = 4;
const CAMERA_MODE_COCKPIT = 5;
const CAMERA_ACTION = {
  none:               0,
  setModeUnknown:     1,       
  setModeOrbit:       2,
  setModeFollow:      3,
  setModeHighAbove:   4,
  setModeMouse:       5,  
  setModeCockpit:     6,
  orbitAngleAdd:      7,
  orbitAngleSub:      8,
  orbitAngleZero:     9,
}  

const GRAV_CONST = 0.02;  // N * meters^2 /mass^2  //<-- Not consistent with real world.
//const GRAV_CONST = 0.0000000000667;  // N * meters^2 /mass^2  //<-- real world
const GRID_SIZE = 1600;  //- 2000 to + 2000 = 4000 true width
const GRID_DIVS = 40;
const GRID_COLOR = 0xffff99 ;
const GRID_COLOR_CENTRAL_LINE = 0xffff11;

const SUN_MASS = 2e30;  //2e30 = 2x10^30 kg
const SUN_REAL_WORLD_SIZE = 700000;  //kilometers
const SUN_GAME_SIZE = 40;  //voxels of radius
const VERY_TINY_SCALE = 0.0001; //A number to scale objects such that they are not visible. 
const VERY_TINY_SCALE_V = new THREE.Vector3(VERY_TINY_SCALE, VERY_TINY_SCALE, VERY_TINY_SCALE);

const DEBUG_SHOW_POSITION_MARKERS = false;

const SHIP_MODEL_FNAME = 'models/galosha/galosha2.obj';
const SHIP_MASS = 9e5;  //900,000; //kg
const SHIP_ROTATION_RATE = Pi;  //radians/second
const SHIP_THROTTLE_DELTA_RATE = 200;  //100%/sec
const SHIP_THRUST_MAX = 100;  //deltaV/sec
const SHIP_VELOCITY_MAX = 500;  //delta Voxels/sec
const SHIP_INIT_POSITION = new THREE.Vector3(0,0,250);
const SHIP_SHOW_POS_MARKER = DEBUG_SHOW_POSITION_MARKERS;
const SHIP_SHOW_CAMERA_ATTACHEMENT_MARKER = DEBUG_SHOW_POSITION_MARKERS;
const SHIP_SHOW_COCKPIT_LOOKAT = DEBUG_SHOW_POSITION_MARKERS;
const SHIP_SHOW_COCKPIT_POS = DEBUG_SHOW_POSITION_MARKERS;
const SHIP_NUM_ROCKETS = 4;
const SHIP_WING_SPREAD = 50; //used to evenly space out rocket firing positions. 
const SHIP_SOUND_ENGINE = 'audio/effects/Rocket-SoundBible.com-941967813.mp3';
const SHIP_SOUND_EXPLODE = 'audio/effects/Depth_Charge_Short-SoundBible.com-1303947570.mp3';

const SHIP_ACTION = {
  none:             0,
  yawRight:         1,
  yawLeft:          2,
  pitchUp:          3,
  pitchDn:          4,
  rollRight:        5,
  rollLeft:         6,
  orientToVelocity: 7,
  thrustMore:       8,
  thrustLess:       9,
  launchRocket:     10,
  stop:             11,
  resetPosToInit:   12,
}  

const ROCKET_MODEL_FNAME = 'models/AVMT300/AVMT300.obj';
const ROCKET_MASS = 9e3;  //9,000 kg
const ROCKET_THRUST_MAX = 500;  //deltaV/sec
const ROCKET_VELOCITY_MAX = 800;  //delta Voxels/sec
const ROCKET_LIFESPAN = 5; // # seconds between launch and explosion
const ROCKET_STRIKE_DIST = 20;
const ROCKET_STRIKE_DIST_SQUARED = ROCKET_STRIKE_DIST * ROCKET_STRIKE_DIST;
const ROCKET_SHOW_POS_MARKER = DEBUG_SHOW_POSITION_MARKERS;
const ROCKET_SHOW_CAMERA_ATTACHEMENT_MARKER = DEBUG_SHOW_POSITION_MARKERS;
const ROCKET_SHOW_COCKPIT_LOOKAT = DEBUG_SHOW_POSITION_MARKERS;
const ROCKET_SHOW_COCKPIT_POS = DEBUG_SHOW_POSITION_MARKERS;
const ROCKET_SOUND_LAUNCH = 'audio/effects/250154__robinhood76__05433-stinger-rocket-deploy.mp3';
const ROCKET_SOUND_ENGINE = 'audio/effects/158894__primeval-polypod__rocket-launch.mp3';
const ROCKET_SOUND_EXPLODE = 'audio/effects/Depth_Charge_Short-SoundBible.com-1303947570.mp3';

const ENV_ACTION = {
  none:               0,
  toggleGravity:      1,  
  togglePause:        1,
}  

const RED_BLUE_SPRITE_COLORS = [
  {pct : 0.0, color: 'rgba(255, 255, 255, 1)'},  //white at center
  {pct : 0.2, color: 'rgba(255,   0,   0, 1)'},  //red at 20% radius
  {pct : 0.4, color: 'rgba(0  ,   0,  64, 1)'},  //dark blue 40% radius
];  

const RED_ORANGE_BROWN_SPRITE_COLORS = [
  {pct : 0.0,  color: 'rgba(255, 255, 255, 1)'},   //white at center
  {pct : 0.05, color: 'rgba(255,   0,   0, 1)'},  //red at 5% radius
  {pct : 0.15, color: 'rgba(255, 153,   0, 1)'},  //orange at 15% radius
  {pct : 0.3,  color: 'rgba(153, 102,  51, 1)'},   //dark brown 30% radius
  {pct : 0.4,  color: 'rgba(0  ,   0,  0, 1)'},    //black 40% radius];  
];  

const GRAY_SPRITE_COLORS = [
  {pct : 0.0, color: 'rgba(255, 255, 255, 1)'},  //white at center
  {pct : 0.2, color: 'rgba(128, 128, 128, 1)'},  //gray at 20% radius
  {pct : 0.4, color: 'rgba(0  ,   0,   0, 1)'},  //black blue 40% radius
];  

const PARTICLES_MODE = {normal : 1, animated : 2};  

const worldConv = SUN_REAL_WORLD_SIZE / SUN_GAME_SIZE; //km/voxel
const worldConvSquared = worldConv * worldConv;  //km^2 / voxel^2


//NOTE: y axis is pointing from grid plane up to sky, x & z are on the horizontal plane.
//          +y *
//             |  / -z
//             | /
//    -x ______|/______*  +x
//             /
//            /
//           * +z
const plusXV = new THREE.Vector3(1,0,0);
const plusYV = new THREE.Vector3(0,1,0);
const plusZV = new THREE.Vector3(0,0,1);

const nullV  = new THREE.Vector3(0,0,0);

const PLANE_XY = 'xy';
const PLANE_XZ = 'xz';
const PLANE_YZ = 'yz';
const PLANE_UNK = '??';

const AUTO_POINT_DELAY = 2;  //2000 milliseconds
