

const Pi = 3.14159 ;
const CAMERA_SPRING_CONST = 40;  //units are N / voxel    <-- tweak number later
const CAMERA_MASS = 10;  //units are kg
const CAMERA_MAX_VELOCITY = 2000; //voxels/sec

const GRAV_CONST = 0.02;  // N * meters^2 /mass^2  //<-- Not consistent with real world.
//const GRAV_CONST = 0.0000000000667;  // N * meters^2 /mass^2  //<-- real world
const GRID_SIZE = 1600;  //- 2000 to + 2000 = 4000 true width
const SUN_MASS = 2e30;  //2e30 = 2x10^30 kg
const SUN_REAL_WORLD_SIZE = 700000;  //kilometers
const SUN_GAME_SIZE = 40;  //voxels of radius
const SHIP_MASS = 9e7;  //90000000; //kg
const SHIP_ROTATION_RATE = Pi/2;  //radians/second
const SHIP_THROTTLE_DELTA_RATE = 100;  //100%/sec
const SHIP_THRUST_MAX = 100;  //deltaV/sec

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
