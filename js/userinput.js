
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
    bufferedUserGameActions.push(VEHICLE_ACTION.resetPosToInit);
  }  
  delete keyDown[event.key];
  delete keyDown[event.code];
  event.preventDefault();
}

function onKeyPress(event) {
  let k = event.key;
  let code = event.code;
  if (onKeyPressMapping[k]) {
    let arr = onKeyPressMapping[k].arr;
    let msg = onKeyPressMapping[k].msg;
    let fn = onKeyPressMapping[k].fn;
    arr.push(msg);
    if (fn) fn();
  }      
}

function getRemoteKeyShipAction(shipIndex) {
  //Result is an arr9ay of VEHICLE_ACTION's
  let resultArray = [];        
  //implement later after communication channels to other players set up. 
  return resultArray;  
}  

function getKeyShipAction(shipIndex)  {
  //Result is an array of VEHICLE_ACTION's
  if (shipIndex != localShipIndex) return getRemoteKeyShipAction(shipIndex);  
  
  let resultArray = bufferedUserGameActions.slice(); //copy array     
  bufferedUserGameActions.length = 0;  //reset buffer array

  if ((keyDown['ArrowRight']) || (keyDown['Numpad6'])) {  //yaw right
    resultArray.push(VEHICLE_ACTION.yawRight);
  }
  if ((keyDown['ArrowLeft']) || (keyDown['Numpad4'])) {   //yaw left
    resultArray.push(VEHICLE_ACTION.yawLeft);
  }
  /*
  if ((keyDown['ArrowUp']) || (keyDown['Numpad8'])) {     //pitch down
    resultArray.push(VEHICLE_ACTION.pitchDn);
  }
  if ((keyDown['ArrowDown']) || (keyDown['Numpad2'])) {   //pitch up
    resultArray.push(VEHICLE_ACTION.pitchUp);
  }
  if ((keyDown['PageUp']) || (keyDown['Numpad9'])) {      //roll right
    resultArray.push(VEHICLE_ACTION.rollRight);
  }
  if ((keyDown['1']) || (keyDown['Numpad1'])) {           //roll left.
    resultArray.push(VEHICLE_ACTION.rollLeft);
  }
  */
  if ((keyDown['Enter']) || (keyDown['Numpad5'])) {       //Orient towards current velocity
    resultArray.push(VEHICLE_ACTION.orientToVelocity);
  }
  if (keyDown['Space']) {                                 //thrust
    resultArray.push(VEHICLE_ACTION.thrustMore);
  } else {
    resultArray.push(VEHICLE_ACTION.thrustLess);
  }
  return resultArray;
}

function getKeyCameraAction() {
  //Result is an array of CAMERA_ACTION's
  let resultArray = bufferedUserCameraActions.slice(); //copy array     
  bufferedUserCameraActions.length = 0; //reset buffer array
  if (keyDown['a']) resultArray.push(CAMERA_ACTION.orbitAngleSub);
  if (keyDown['d']) resultArray.push(CAMERA_ACTION.orbitAngleAdd);
  if (keyDown['s']) resultArray.push(CAMERA_ACTION.orbitAngleZeror);
  if (keyDown['1']) resultArray.push(CAMERA_ACTION.setModeOrbit);
  if (keyDown['2']) resultArray.push(CAMERA_ACTION.setModeFollow);
  if (keyDown['3']) resultArray.push(CAMERA_ACTION.setModeCockpit);
  if (keyDown['4']) resultArray.push(CAMERA_ACTION.setModeMouse);
  if (keyDown['5']) resultArray.push(CAMERA_ACTION.setModeHighAbove); 
  return resultArray;
}
  
function getKeyEnvironmentAction() {
  //Result is an array of ENV_ACTION's
  let resultArray = bufferedUserEnvironmentActions.slice(); //copy array     
  bufferedUserEnvironmentActions.length = 0;  
  //more here if needed
  return resultArray;
}

