
/*
Contents:
  function onWindowResize()
  function wrapPosition( p )    //p is Vector3
  function wrapRadians (Rad)
  function generateTexture( r, g, b )
  function generateSprite() {
  function vector3ToString(v)   //v is Vector3
  function debugInfo(id, Msg)
  function getLine(p1, p2, aColor)
*/


function onWindowResize() {
  gameCamera.camera.aspect = window.innerWidth / window.innerHeight;
  gameCamera.camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
} //onWindowResize()


function onDocumentMouseMove( event ) {
		mouseX = event.clientX - windowHalfX;
		mouseY = event.clientY - windowHalfY;
}

function onDocumentTouchStart( event ) {
	if ( event.touches.length == 1 ) {
		event.preventDefault();
		mouseX = event.touches[ 0 ].pageX - windowHalfX;
		mouseY = event.touches[ 0 ].pageY - windowHalfY;
	}
}
function onDocumentTouchMove( event ) {
	if ( event.touches.length == 1 ) {
		event.preventDefault();
		mouseX = event.touches[ 0 ].pageX - windowHalfX;
		mouseY = event.touches[ 0 ].pageY - windowHalfY;
	}
}


function wrapPosition( p ) {   //p is Vector3
//Input: p -- Vector3
  let wrapped = false;
  let max = GRID_SIZE/2;
  if (p.x < -max) { p.x = max;   wrapped = true;  }
  if (p.y < -max) { p.y = max;   wrapped = true;  }
  if (p.z < -max) { p.z = max;   wrapped = true;  }
  if (p.x > max)  { p.x = -max;  wrapped = true;  }
  if (p.y > max)  { p.y = -max;  wrapped = true;  }
  if (p.z > max)  { p.z = -max;  wrapped = true;  }
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

function generateSprite() {
  var canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  var context = canvas.getContext('2d');
  var halfWidth = canvas.width / 2;
  var halfHeight = canvas.height / 2;
  var gradient = context.createRadialGradient(halfWidth, halfHeight, 0, halfWidth, halfHeight, halfWidth*2 );
  gradient.addColorStop(   0, 'rgba(255, 255, 255, 1)' );  //white at center
  gradient.addColorStop( 0.2, 'rgba(255,   0,   0, 1)' );  //red 20% of way out
  gradient.addColorStop( 0.4, 'rgba(0  ,   0,  64, 1)' );  //dark blue 40% way out
  gradient.addColorStop(   1, 'rgba(0  ,   0,   0, 1)' );  //black at rim (100% way out)
  context.fillStyle = gradient;
  context.fillRect( 0, 0, canvas.width, canvas.height );
  return canvas;
}

function vector3ToString(v) {  //v is Vector3
  let s = '(' + v.x.toFixed(5) + ', ' + v.y.toFixed(5) + ', ' + v.z.toFixed(5) + ')';
  return s;
}

function debugInfo(id, Msg) {
  let elem = document.getElementById(id);
  elem.innerHTML = Msg;
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
