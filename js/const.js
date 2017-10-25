

const Pi = 3.14159 ;
const CAMERA_SPRING_CONST = 40;  //units are N / voxel    <-- tweak number later
const CAMERA_MASS = 10;  //units are kg
const CAMERA_MAX_PAN_VELOCITY = 2500; //voxels/sec
const CAMERA_MAX_FOLLOW_VELOCITY = 800; //voxels/sec

const GRAV_CONST = 0.02;  // N * meters^2 /mass^2  //<-- Not consistent with real world.
//const GRAV_CONST = 0.0000000000667;  // N * meters^2 /mass^2  //<-- real world
const GRID_SIZE = 1600;  //- 2000 to + 2000 = 4000 true width
const SUN_MASS = 2e30;  //2e30 = 2x10^30 kg
const SUN_REAL_WORLD_SIZE = 700000;  //kilometers
const SUN_GAME_SIZE = 40;  //voxels of radius
const VERY_TINY_SCALE = 0.0001; //A number to scale objects such that they are not visible. 
const VERY_TINY_SCALE_V = THREE.Vector3(VERY_TINY_SCALE, VERY_TINY_SCALE, VERY_TINY_SCALE);

const SHIP_MASS = 9e5;  //900,000; //kg
const SHIP_ROTATION_RATE = Pi;  //radians/second
const SHIP_THROTTLE_DELTA_RATE = 200;  //100%/sec
const SHIP_THRUST_MAX = 100;  //deltaV/sec

const ROCKET_MASS = 9e3;  //9,000 kg
const ROCKET_THRUST_MAX = 500;  //deltaV/sec
const ROCKET_LIFESPAN = 4; //__ seconds between launch and explosion
const ROCKET_STRIKE_DIST = 20;
const ROCKET_STRIKE_DIST_SQUARED = ROCKET_STRIKE_DIST * ROCKET_STRIKE_DIST;


const RED_BLUE_SPRITE_COLORS = [
  {pct : 0.0, color: 'rgba(255, 255, 255, 1)'},  //white at center
  {pct : 0.2, color: 'rgba(255,   0,   0, 1)'},  //red at 20% radius
  {pct : 0.4, color: 'rgba(0  ,   0,  64, 1)'},  //dark blue 40% radius
];  

const GRAY_SPRITE_COLORS = [
  {pct : 0.0, color: 'rgba(255, 255, 255, 1)'},  //white at center
  {pct : 0.2, color: 'rgba(128, 128, 128, 1)'},  //gray at 20% radius
  {pct : 0.4, color: 'rgba(0  ,   0,   0, 1)'},  //black blue 40% radius
];  

const worldConv = SUN_REAL_WORLD_SIZE / SUN_GAME_SIZE; //km/voxel
const worldConvSquared = worldConv * worldConv;  //km^2 / voxel^2

const SHOW_CAMERA_ATTACHEMENT_MARKER = false;
const SHOW_SHIP_POS_MARKER = false;

const CAMERA_MODE_UNK = 0;
const CAMERA_MODE_ORBIT = 1;
const CAMERA_MODE_FOLLOW = 2;
const CAMERA_MODE_HIGH_ABOVE = 3;
const CAMERA_MODE_MOUSE = 4;
const CAMERA_MODE_COCKPIT = 5;

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
