

const Pi = Math.PI ;

const GRAV_CONST = 2e-2;  // N * meters^2 /mass^2  //<-- Real world is 6.67e-11
const GRID_SIZE = 2000;  //- 2000 to + 2000 = 4000 true width
const GRID_DIV_SIZE = 100;
const GRID_DIVS = GRID_SIZE/GRID_DIV_SIZE;

const CAMERA_DIST = GRID_SIZE*5;
const CAMERA_FOV = 45;  //field of view, 45 degrees.  
const CAMERA_MASS = 10;  //units are kg
const CAMERA_MAX_PAN_VELOCITY = 2500; //voxels/sec
const CAMERA_MAX_FOLLOW_VELOCITY = 800; //voxels/sec
const CAMERA_INIT_POSITION = new THREE.Vector3(200,200,800);
const CAMERA_RADIUS_MIN = 100;
const CAMERA_RADIUS_MAX = 2500;
const CAMERA_STEP_BACK_RADIUS_CHANGE_RATE = 500; //voxels/sec
                    
const CAMERA_MODE_MIN = 10
const CAMERA_MODE = {
  unknown:    CAMERA_MODE_MIN + 0,
  orbit:      CAMERA_MODE_MIN + 1,
  follow:     CAMERA_MODE_MIN + 2,
  highAbove:  CAMERA_MODE_MIN + 3,
  mouse:      CAMERA_MODE_MIN + 4,  
  cockpit:    CAMERA_MODE_MIN + 5,
}  
const CAMERA_MODE_MAX = CAMERA_MODE_MIN + 19;
             
const CAMERA_ACTION_MIN = CAMERA_MODE_MAX + 1;
const CAMERA_ACTION = {
  none:               CAMERA_ACTION_MIN + 0,
  setModeUnknown:     CAMERA_ACTION_MIN + 1,       
  setModeOrbit:       CAMERA_ACTION_MIN + 2,
  setModeFollow:      CAMERA_ACTION_MIN + 3,
  setModeHighAbove:   CAMERA_ACTION_MIN + 4,
  setModeMouse:       CAMERA_ACTION_MIN + 5,  
  setModeCockpit:     CAMERA_ACTION_MIN + 6,
  orbitAngleAdd:      CAMERA_ACTION_MIN + 7,
  orbitAngleSub:      CAMERA_ACTION_MIN + 8,
  orbitAngleZero:     CAMERA_ACTION_MIN + 9, 
  
  rotateX:            CAMERA_ACTION_MIN + 10,   //temp, debugging
  rotateY:            CAMERA_ACTION_MIN + 11,   //temp, debugging
  rotateZ:            CAMERA_ACTION_MIN + 12,   //temp, debugging
}  
const CAMERA_ACTION_MAX = CAMERA_ACTION_MIN + 29;

const VEHICLE_ACTION_MIN = CAMERA_ACTION_MAX+1
const VEHICLE_ACTION = {
  none:             VEHICLE_ACTION_MIN + 0,
  yawRight:         VEHICLE_ACTION_MIN + 1,
  yawLeft:          VEHICLE_ACTION_MIN + 2,
  pitchUp:          VEHICLE_ACTION_MIN + 3,
  pitchDn:          VEHICLE_ACTION_MIN + 4,
  rollRight:        VEHICLE_ACTION_MIN + 5,
  rollLeft:         VEHICLE_ACTION_MIN + 6,
  orientToVelocity: VEHICLE_ACTION_MIN + 7,
  thrustMore:       VEHICLE_ACTION_MIN + 8,
  thrustLess:       VEHICLE_ACTION_MIN + 9,
  launchRocket:     VEHICLE_ACTION_MIN + 10,
  stop:             VEHICLE_ACTION_MIN + 11,
  resetPosToInit:   VEHICLE_ACTION_MIN + 12,
  dropBomb:         VEHICLE_ACTION_MIN + 13,
  switchPlane:      VEHICLE_ACTION_MIN + 14,
  
  rotateX:          VEHICLE_ACTION_MIN + 15,   //temp, debugging
  rotateY:          VEHICLE_ACTION_MIN + 16,   //temp, debugging
  rotateZ:          VEHICLE_ACTION_MIN + 17,   //temp, debugging
}  
const VEHICLE_ACTION_MAX = VEHICLE_ACTION_MIN + 29;


const ENV_ACTION_MIN = VEHICLE_ACTION_MAX+1
const ENV_ACTION = {
  none:               ENV_ACTION_MIN + 0,
  toggleGravity:      ENV_ACTION_MIN + 1,  
  togglePause:        ENV_ACTION_MIN + 2,
}  
const ENV_ACTION_MAX = ENV_ACTION_MIN + 19; 


const GRID_COLOR = 0xffffff ;              //white          -- 16777215
const GRID_COLOR_CENTRAL_LINE = 0xe6e6e6;  //gray           -- 15132390

const GRID1_COLOR = 0xffff99 ;              //light yellow  -- 16777113
const GRID1_COLOR_CENTRAL_LINE = 0xffff11;  //darker yellow -- 16776977

const GRID2_COLOR = 0x3399ff ;              //light blue    -- 3381759
const GRID2_COLOR_CENTRAL_LINE = 0x0080ff;  //darker blue   -- 33023

const GRID3_COLOR = 0xff80ff ;              //light purple  -- 16744703
const GRID3_COLOR_CENTRAL_LINE = 0xff1aff;  //darker purple  --16718591

const SUN_MASS = 2e30;  //2e30 = 2x10^30 kg
const SUN_REAL_WORLD_SIZE = 700000;  //kilometers
const SUN_GAME_SIZE = 40;  //voxels of radius
//const SUN_TEXTURE_FILE_NAME = 'textures/land_ocean_ice_cloud_2048.jpg';
const SUN_TEXTURE_FILE_NAME = 'textures/land_ocean_ice_8192_resized_1024x512.png';
const SUN_ATMOSPHERE_TEXTURE_FILE_NAME = 'textures/Earth-clouds.png';

const DEBUG_SHOW_POSITION_MARKERS = false;

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
const SHIP_SOUND_ENGINE_MAX_VOLUME = 0.3;
const SHIP_SOUND_EXPLODE = 'audio/effects/Depth_Charge_Short-SoundBible.com-1303947570.mp3';
const SHIP_SOUND_EXPLODE_MAX_VOLUME = 0.5;

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

//const TELEPORT_SOUND = 'audio/effects/teleport.mp3';
const TELEPORT_SOUND = 'audio/effects/150950__outroelison__teleport.mp3';
const TELEPORT_SOUND_VOLUME = 0.3;
const TELEPORT_PORTAL_FNAME = 'textures/portal_combined.png';
                
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

const ORBIT_PLANE = {
  unknown:  0,
  xy:       1,
  yx:       1,
  xz:       2,
  zx:       2,
  yz:       3,  
  zy:       3,  
}

const ORBIT_PLANE_NAME = {
  1: 'xy',   //Index should match value in ORBIT_PLANE
  2: 'xz',   //Index should match value in ORBIT_PLANE
  3: 'yz',   //Index should match value in ORBIT_PLANE
}  

const plusXV = new THREE.Vector3(1,0,0);
const plusYV = new THREE.Vector3(0,1,0);
const plusZV = new THREE.Vector3(0,0,1);

const nullV  = new THREE.Vector3(0,0,0);

const AUTO_POINT_DELAY = 1;  //2000 milliseconds

