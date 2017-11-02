
/*
Contents:
  function onWindowResize()
  function wrapPosition(aObject,  p)    //p is Vector3
  function wrapRadians (Rad)
  function generateTexture( r, g, b )
  function generateSpriteCanvas() {
  function vector3ToString(v)   //v is Vector3
  function debugInfo(id, Msg)
  function getLine(p1, p2, aColor)
*/


function onWindowResize() {
  gameCamera.camera.aspect = window.innerWidth / window.innerHeight;
  gameCamera.camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;
} //onWindowResize()


function wrapPosition(aObject, p) {   //p is Vector3
//Input:  aObject -- a T3DObject
//        p -- Vector3
  let wrapped = false;
  let max = GRID_SIZE/2;
  let originalP = p.clone();
  if (p.x < -max) { p.x = max;   wrapped = true;  }
  if (p.y < -max) { p.y = max;   wrapped = true;  }
  if (p.z < -max) { p.z = max;   wrapped = true;  }
  if (p.x > max)  { p.x = -max;  wrapped = true;  }
  if (p.y > max)  { p.y = -max;  wrapped = true;  }
  if (p.z > max)  { p.z = -max;  wrapped = true;  }
  if (wrapped) gameCamera.objectWrapped(aObject, p, originalP);
  return wrapped;
}

function wrapRadians (Rad) {
//Input: Rad -- andle in radians
  while (Rad > 2*Pi)  { Rad -= 2*Pi; }
  while (Rad < -2*Pi) { Rad += 2*Pi; }
  return Rad;
}

function generateTexture( r, g, b ) {
  let canvas = document.createElement( 'canvas' );
  canvas.width = 256;
  canvas.height = 256;
  let context = canvas.getContext( '2d' );
  let image = context.getImageData( 0, 0, 256, 256 );
  let x = 0, y = 0, p;
  for ( let i = 0, j = 0, l = image.data.length; i < l; i += 4, j ++ ) {
    x = j % 256;
    y = x == 0 ? y + 1 : y;
    p = Math.floor( x ^ y );
    image.data[ i ] = ~~ p * r;
    image.data[ i + 1 ] = ~~ p * g;
    image.data[ i + 2 ] = ~~ p * b;
    image.data[ i + 3 ] = 255;
  }
  context.putImageData( image, 0, 0 );
  return canvas;
}

function generateSpriteCanvas(colors) {
  //Input: Colors: -- array of JSON objects with colors -- e.g. 
  //             [{pct:0.4, color:'rgba(128,2,15,1)'},...] 
  var canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  var context = canvas.getContext('2d');
  var halfWidth = canvas.width / 2;
  var halfHeight = canvas.height / 2;
  var gradient = context.createRadialGradient(halfWidth, halfHeight, 0, halfWidth, halfHeight, halfWidth*2 );
  for (var i = 0; i < colors.length; i++) {
    let aColor = colors[i];     
    gradient.addColorStop(aColor.pct, aColor.color);  
  }    
  context.fillStyle = gradient;
  context.fillRect( 0, 0, canvas.width, canvas.height );
  return canvas;
}

function vector3ToString(v) {  //v is Vector3
  let s = '(' + v.x.toFixed(5) + ', ' + v.y.toFixed(5) + ', ' + v.z.toFixed(5) + ')';
  return s;
}

function getLine(p1, p2, aColor) {
/*Input: p1, p2 -- Vector3
         aColor -- a color, RRGGBB  e.g. 0x0000ff
*/
  let material = new THREE.LineBasicMaterial({color: aColor });
  let geometry = new THREE.Geometry();
  geometry.vertices.push(p1, p2);
  let line = new THREE.Line( geometry, material );
  return line;
}

function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}
function randomizeNum(N, variance) {
  //Input: N -- a number
  //       variance -- a % +/-, e.g. 5 --> +/- 5% of values;
  //results: returns altered number
  let delta = N * variance/100;
  let result = getRandom(N - delta, N + delta);
  return result;
}

function randomizeVector(V, variance) {
  //Input: V -- a THREE.Vector3
  //       variance -- a % +/-, e.g. 5 --> +/- 5% of values;
  let result = V.clone();
  result.x = randomizeNum(result.x, variance);
  result.y = randomizeNum(result.y, variance);
  result.z = randomizeNum(result.z, variance);
  return result;
}

function projectVectorOntoPlane(V, plane)  {
  //Input: V -- THREE.Vector3 -- modified by reference
  //       plane -- ORBIT_PLANE
  if (plane == ORBIT_PLANE.xy) {
    V.z = 0;
  } else if (plane == ORBIT_PLANE.xz) {
    V.y = 0;
  } else if (plane == ORBIT_PLANE.yz) {
    V.x = 0;
  }    
}  
