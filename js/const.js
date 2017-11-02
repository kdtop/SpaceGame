

const Pi = 3.14159 ;
const CAMERA_SPRING_CONST = 40;  //units are N / voxel    <-- tweak number later
const CAMERA_MASS = 10;  //units are kg
const CAMERA_MAX_PAN_VELOCITY = 2500; //voxels/sec
const CAMERA_MAX_FOLLOW_VELOCITY = 800; //voxels/sec
const CAMERA_INIT_POSITION = new THREE.Vector3(0,200,800);
                    
const CAMERA_MODE_OFFSET = 0;
const CAMERA_MODE = {
  unknown:    CAMERA_MODE_OFFSET + 10,
  orbit:      CAMERA_MODE_OFFSET + 11,
  follow:     CAMERA_MODE_OFFSET + 12,
  highAbove:  CAMERA_MODE_OFFSET + 13,
  mouse:      CAMERA_MODE_OFFSET + 14,  
  cockpit:    CAMERA_MODE_OFFSET + 15,
}  
             
const CAMERA_ACTION_OFFSET = 20;
const CAMERA_ACTION = {
  none:               CAMERA_ACTION_OFFSET + 0,
  setModeUnknown:     CAMERA_ACTION_OFFSET + 1,       
  setModeOrbit:       CAMERA_ACTION_OFFSET + 2,
  setModeFollow:      CAMERA_ACTION_OFFSET + 3,
  setModeHighAbove:   CAMERA_ACTION_OFFSET + 4,
  setModeMouse:       CAMERA_ACTION_OFFSET + 5,  
  setModeCockpit:     CAMERA_ACTION_OFFSET + 6,
  orbitAngleAdd:      CAMERA_ACTION_OFFSET + 7,
  orbitAngleSub:      CAMERA_ACTION_OFFSET + 8,
  orbitAngleZero:     CAMERA_ACTION_OFFSET + 9,
}  

const GRAV_CONST = 2e-2;  // N * meters^2 /mass^2  //<-- Real world is 6.67e-11
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

const ORBIT_PLANE = {
  unknown:  0,
  xy:       1,
  xz:       2,
  yz:       3,  
}  

const EXPLOSION_FILE_NAME = '/textures/flame_combined.png';

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

const VEHICLE_ACTION_OFFSET = 30;
const VEHICLE_ACTION = {
  none:             VEHICLE_ACTION_OFFSET + 0,
  yawRight:         VEHICLE_ACTION_OFFSET + 1,
  yawLeft:          VEHICLE_ACTION_OFFSET + 2,
  pitchUp:          VEHICLE_ACTION_OFFSET + 3,
  pitchDn:          VEHICLE_ACTION_OFFSET + 4,
  rollRight:        VEHICLE_ACTION_OFFSET + 5,
  rollLeft:         VEHICLE_ACTION_OFFSET + 6,
  orientToVelocity: VEHICLE_ACTION_OFFSET + 7,
  thrustMore:       VEHICLE_ACTION_OFFSET + 8,
  thrustLess:       VEHICLE_ACTION_OFFSET + 9,
  launchRocket:     VEHICLE_ACTION_OFFSET + 10,
  stop:             VEHICLE_ACTION_OFFSET + 11,
  resetPosToInit:   VEHICLE_ACTION_OFFSET + 12,
  dropBomb:         VEHICLE_ACTION_OFFSET + 13,
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
                
const ENV_ACTION_OFFSET = 50;
const ENV_ACTION = {
  none:               ENV_ACTION_OFFSET + 0,
  toggleGravity:      ENV_ACTION_OFFSET + 1,  
  togglePause:        ENV_ACTION_OFFSET + 2,
}  

const RED_BLUE_SPRITE_COLORS = [
  {pct : 0.0, color: 'rgba(255, 255, 255, 1)'},  //white at center
  {pct : 0.2, color: 'rgba(255,   0,   0, 1)'},  //red at 20% radius
  {pct : 0.4, color: 'rgba(0  ,   0,  64, 1)'},  //dark blue 40% radius
];  

const RED_ORANGE_BROWN_SPRITE_COLORS = [
  {pct : 0.0,  color: 'rgba(255, 255, 255, 1)'},   //white at center
  {pct : 0.05, color: 'rgba(255,   0,   0, 1)'},   //red at 5% radius
  {pct : 0.15, color: 'rgba(255, 153,   0, 1)'},   //orange at 15% radius
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

const AUTO_POINT_DELAY = 2;  //2000 milliseconds

