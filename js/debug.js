
/*
function debugAnimate(deltaSec) {
*/


function debugInfo(id, Msg) {
  let elem = document.getElementById(id);
  elem.innerHTML = Msg;
}

function debugAnimate(deltaSec) {

  debugInfoCounter +=1;
  if (debugInfoCounter > 2) {
    debugInfoCounter = 1;
    //let velocityInfo = 'camera.position = ' + vector3ToString(gameCamera.position);
    //debugInfo("info2", velocityInfo);
    //var deltaInfo = 'camera.velocity = ' + vector3ToString(gameCamera.velocity);
    //debugInfo("info3", deltaInfo);
    //var cameraSpeed = 'Camera speed = ' + gameCamera.velocity.length().toString();
    //debugInfo("info4", cameraSpeed);
    //var distToCamera = 'Camera distance to attachemet = ' + distToAttach.toString();
    //debugInfo("info5", distToCamera);
    var mousePos = 'MousePos (' + mouse.x.toString() + ', ' + mouse.y.toString() + ')';
    debugInfo("info1", mousePos);        
    debugInfo("info2", globalDebugMessage);
    
    /*
    let angle = angleBetweenVectors(debugArrow1.tmgDir, debugArrow2.tmgDir) ;    
    let degAngle = angle * 360 / (2 *Pi);
    let msg = 'radian angle between: ' + angle + ', deg Angle = ' + degAngle;
    debugInfo("info3", msg);    
    */

  }
}
