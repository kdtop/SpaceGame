
/*
function debugAnimate(deltaSec) {
function debugShowXfrm(A3DObject)  {  //draw three lines showing matrix orientation
*/


function debugAnimate(deltaSec) {

  debugInfoCounter +=1;
  if ((1==0) && (debugInfoCounter > 80)) {
    debugInfoCounter = 1;
    let posInfo = 'ship.position = ' + vector3ToString(ship.position);
    //debugInfo("info1", posInfo);
    let velocityInfo = 'ship.velocity = ' + vector3ToString(ship.velocity);
    //debugInfo("info2", velocityInfo);
    let vectInfo = 'deltaV = ' + vector3ToString(deltaV);
    debugInfo("info3", vectInfo);
    vectInfo = 'Rotation = ' + vector3ToString(ship.object.rotation);
    debugInfo("info4", vectInfo);
    debugInfo("info5", JSON.stringify(keyDown));
  }

  debugInfoCounter +=1;
  if (debugInfoCounter > 60) {
    debugInfoCounter = 1;
    //let posInfo = 'ship.position = ' + vector3ToString(ship.position);
    //debugInfo("info1", posInfo);
    //let velocityInfo = 'camera.position = ' + vector3ToString(gameCamera.position);
    //debugInfo("info2", velocityInfo);
    //var deltaInfo = 'camera.velocity = ' + vector3ToString(gameCamera.velocity);
    //debugInfo("info3", deltaInfo);
    //var cameraSpeed = 'Camera speed = ' + gameCamera.velocity.length().toString();
    //debugInfo("info4", cameraSpeed);
    //var distToCamera = 'Camera distance to attachemet = ' + distToAttach.toString();
    //debugInfo("info5", distToCamera);
    var mousePos = 'MousePos (' + mouseX.toString() + ', ' + mouseY.toString() + ')';
    debugInfo("info1", mousePos);
    debugInfo("info2", globalDebugMessage);

  }
}

function debugShowXfrm(A3DObject)  {  //draw three lines showing matrix orientation
//Input: A3DObject -- T3DObject

  //return; //remove to actually use this debug function.

  if (typeof A3DObject.object.lineIn != "undefined") {
    scene.remove (A3DObject.object.lineIn);
  }
  if (typeof A3DObject.object.lineUp != "undefined") {
    scene.remove (A3DObject.object.lineUp);
  }
  if (typeof A3DObject.object.lineLeft != "undefined") {
    scene.remove (A3DObject.object.lineLeft);
  }
  let showLength = 60;
  let inV = new THREE.Vector3();   //in is Z axis for object.
  let upV = new THREE.Vector3();   //up is Y axis for object.
  let leftV = new THREE.Vector3(); //left is X axis for object.
  A3DObject.getInUpLeft(inV, upV, leftV);
  let p2 = new THREE.Vector3();

  if (1 == 1) {
    p2.copy(A3DObject.object.position);
    p2.addScaledVector(inV, showLength);  // this is actual a IN vector for the ship.
    let inLine = getLine(A3DObject.object.position, p2, 0x0000ff);
    A3DObject.object.lineIn = inLine;
    scene.add(inLine);
  }

  if (1 == 0) {
    p2.copy(A3DObject.object.position);
    p2.addScaledVector(upV, showLength);  //up vector is correct
    let upLine = getLine(A3DObject.object.position, p2, 0x00ff00);
    A3DObject.object.lineUp = upLine;
    scene.add(upLine);
  }

  if (1 == 0) {
    p2.copy(A3DObject.object.position);
    p2.addScaledVector(leftV, showLength); //this is actually an LEFT vector.
    let leftLine = getLine(A3DObject.object.position, p2, 0xff0000);
    A3DObject.object.lineLeft = leftLine;
    scene.add(leftLine);
  }
}
