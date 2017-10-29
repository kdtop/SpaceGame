
/*
function debugAnimate(deltaSec) {
*/


function debugInfo(id, Msg) {
  let elem = document.getElementById(id);
  elem.innerHTML = Msg;
}

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
