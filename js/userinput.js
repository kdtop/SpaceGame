
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

function onMouseDown(event) {
  mouseDown = true;        
}        

function onMouseUp(event) {
  mouseDown = false;        
}        

function onMouseWheel(event) {
  gameCamera.radius += event.deltaY;
  if (gameCamera.radius < 0) gameCamera.radius *= -1;
}

function onKeyDown(event) {
  keyDown[event.key] = true;
  keyDown[event.code] = true;
  //event.preventDefault();
}

function onKeyUp(event) {
  let k = event.key;
  let code = event.code;
  if (code == 'Escape') { //for some reason Esc doesn't generate onKeyPress event
    bufferedUserGameActions.push(SHIP_ACTION.resetPosToInit);
  }  
  delete keyDown[event.key];
  delete keyDown[event.code];
  event.preventDefault();
}

function onKeyPress(event) {
  let k = event.key;
  let code = event.code;
  if (k == '1') {
    bufferedUserCameraActions.push(CAMERA_ACTION.setModeOrbit);
    event.preventDefault();
  } else if (k == '2') {
    bufferedUserCameraActions.push(CAMERA_ACTION.setModeFollow);
    event.preventDefault();
  } else if (k == '3') {
    bufferedUserCameraActions.push(CAMERA_ACTION.setModeCockpit);
    event.preventDefault();
  } else if (k == '4') {
    bufferedUserCameraActions.push(CAMERA_ACTION.setModeMouse);
    event.preventDefault();
  } else if (k == '5') {
    bufferedUserCameraActions.push(CAMERA_ACTION.setModeHighAbove);
    event.preventDefault();
  } else if (k == 'p') {
    bufferedUserEnvironmentActions.push(ENV_ACTION.togglePause);    
    if (gamePaused) requestAnimationFrame(animate); //<-- required to trigger handling of input if game currently paused.  
  } else if (k == 'g') {
    bufferedUserEnvironmentActions.push(ENV_ACTION.toggleGravity);
  } else if (k == 'f') {
    bufferedUserGameActions.push(SHIP_ACTION.launchRocket);
  } else if (k == 'k') {
    bufferedUserGameActions.push(SHIP_ACTION.stop);
  }  
}

function getRemoteKeyShipAction(shipIndex) {
  //Result is an array of SHIP_ACTION's
  let resultArray = [];        
  //implement later after communication channels to other players set up. 
  return resultArray;  
}  

function getKeyShipAction(shipIndex)  {
  //Result is an array of SHIP_ACTION's
  if (shipIndex != localShipIndex) return getRemoteKeyShipAction(shipIndex);  
  
  let resultArray = bufferedUserGameActions.slice(); //copy array     
  bufferedUserGameActions = [];  //reset buffer array

  if ((keyDown['ArrowRight']) || (keyDown['Numpad6'])) {  //yaw right
    resultArray.push(SHIP_ACTION.yawRight);
  }
  if ((keyDown['ArrowLeft']) || (keyDown['Numpad4'])) {   //yaw left
    resultArray.push(SHIP_ACTION.yawLeft);
  }
  if ((keyDown['ArrowUp']) || (keyDown['Numpad8'])) {     //pitch down
    resultArray.push(SHIP_ACTION.pitchDn);
  }
  if ((keyDown['ArrowDown']) || (keyDown['Numpad2'])) {   //pitch up
    resultArray.push(SHIP_ACTION.pitchUp);
  }
  if ((keyDown['PageUp']) || (keyDown['Numpad9'])) {      //roll right
    resultArray.push(SHIP_ACTION.rollRight);
  }
  if ((keyDown['1']) || (keyDown['Numpad1'])) {           //roll left.
    resultArray.push(SHIP_ACTION.rollLeft);
  }
  if ((keyDown['Enter']) || (keyDown['Numpad5'])) {       //Orient towards current velocity
    resultArray.push(SHIP_ACTION.orientToVelocity);
  }
  if (keyDown['Space']) {                                 //thrust
    resultArray.push(SHIP_ACTION.thrustMore);
  } else {
    resultArray.push(SHIP_ACTION.thrustLess);
  }
  return resultArray;
}

function getKeyCameraAction() {
  //Result is an array of CAMERA_ACTION's
  let resultArray = bufferedUserCameraActions.slice(); //copy array     
  bufferedUserEnvironmentActions = []; //reset buffer array
  if (keyDown['a']) resultArray.push(CAMERA_ACTION.orbitAngleSub);
  if (keyDown['d']) resultArray.push(CAMERA_ACTION.orbitAngleAdd);
  if (keyDown['s']) resultArray.push(CAMERA_ACTION.orbitAngleZeror);
  return resultArray;
}
  
function getKeyEnvironmentAction() {
  //Result is an array of ENV_ACTION's
  let resultArray = bufferedUserEnvironmentActions.slice(); //copy array     
  bufferedUserEnvironmentActions = [];  
  //more here if needed
  return resultArray;
}

