
function eventToLocalXY(x, y) {
  //Returns coordinates transformed to screen coordinates, 
  //(0,0) is center of screen
  let result = new THREE.Vector2(x - windowHalfX, y - windowHalfY);
  return result;
}  


function onDocumentMouseMove( event ) {
  mouse.copy(eventToLocalXY(event.clientX, event.clientY));
}

function onDocumentTouchStart( event ) {
  if ( event.touches.length == 1 ) {
    event.preventDefault();
    mouse.copy(eventToLocalXY(event.touches[0].pageX, event.touches[0].pageY));
  }
}
function onDocumentTouchMove( event ) {
  if ( event.touches.length == 1 ) {
    event.preventDefault();
    mouse.copy(eventToLocalXY(event.touches[0].pageX, event.touches[0].pageY));
  }
}

function onMouseDown(event) {
  mouseDown = true;
  mouseDownPos.copy(eventToLocalXY(event.clientX, event.clientY));
}        

function onMouseUp(event) {
  mouseDown = false;        
}        

function onMouseWheel(event) {
  gameCamera.radius += event.deltaY;
  if (gameCamera.radius < CAMERA_RADIUS_MIN) gameCamera.radius = CAMERA_RADIUS_MIN;
  if (gameCamera.radius > CAMERA_RADIUS_MAX) gameCamera.radius = CAMERA_RADIUS_MAX;
}

function onKeyDown(event) {
  keyDown[event.key] = true;
  //globalDebugMessage = 'last Key Pressed was: ' + event.key;
  //keyDown[event.code] = true;
  //event.preventDefault();
}

function onKeyUp(event) {
  let k = event.key;
  //let code = event.code;
  //for some reason Esc doesn't generate onKeyPress event, so I have to handle here in onKeyUp
  if ((k == 'Escape')&&(keyMapping[k])) handleMappedKey(k);
  delete keyDown[event.key];
  //delete keyDown[event.code];
  event.preventDefault();
}

function onKeyPress(event) {
  let k = event.key;
  //let code = event.code;
  if (keyMapping[k]) handleMappedKey(k);
}      

function getRemoteKeyShipAction(shipIndex) {
  //Result is an array of VEHICLE_ACTION's
  let resultArray = [];        
  //implement later after communication channels to other players set up. 
  return resultArray;  
}  

function handleMappedKey(k, arr, aMinMsg, aMaxMsg) {  //assumes key is mapped
  if (keyMapping[k].arr) arr = keyMapping[k].arr;
  let msg = keyMapping[k].msg;
  if ((aMinMsg)&&(msg < aMinMsg)) return;
  if ((aMaxMsg)&&(msg > aMaxMsg)) return;
  let fn = keyMapping[k].fn;
  if (arr) arr.push(msg); //Note: only stores message if an array is defined in mapping.  
  if (fn) fn();
  if (keyMapping[k].noRepeat == true) {
    delete keyDown[k];
    //globalDebugMessage = globalDebugMessage + '; removing: ' + k;
  }
}  

function checkHandleMappedKey(resultArray, aMinMsg, aMaxMsg) {  
  //for (var prop in keyMapping) {
  for (var prop in keyDown) {
    //if (!keyDown[prop]) continue;
    if (!keyMapping[prop]) continue;
    handleMappedKey(prop, resultArray, aMinMsg, aMaxMsg);
  }    
}

function getKeyVehicleAction(shipIndex)  {
  //Result is an array of VEHICLE_ACTION's
  if (shipIndex != localShipIndex) return getRemoteKeyShipAction(shipIndex);  
  
  let resultArray = bufferedUserGameActions.slice(); //copy array     
  bufferedUserGameActions.length = 0;  //reset buffer array  
  checkHandleMappedKey(resultArray, VEHICLE_ACTION_MIN, VEHICLE_ACTION_MAX);
  if (resultArray.indexOf(VEHICLE_ACTION.thrustMore) == -1) {
    if (shipsArray[shipIndex].throttle > 0) {    
      resultArray.push(VEHICLE_ACTION.thrustLess);
    }  
  }
  if (resultArray.indexOf(VEHICLE_ACTION.fireGatlingGun) == -1) {
    if (shipsArray[shipIndex].gatlingGunThrottle > 0) {
      resultArray.push(VEHICLE_ACTION.stopGatlingGun);
    }  
  }
  return resultArray;
}

function getKeyCameraAction() {
  //Result is an array of CAMERA_ACTION's
  let resultArray = bufferedUserCameraActions.slice(); //copy array     
  bufferedUserCameraActions.length = 0; //reset buffer array
  checkHandleMappedKey(resultArray, CAMERA_ACTION_MIN, CAMERA_ACTION_MAX);
  return resultArray;
}
  
function getKeyEnvironmentAction() {
  //Result is an array of ENV_ACTION's
  let resultArray = bufferedUserEnvironmentActions.slice(); //copy array     
  bufferedUserEnvironmentActions.length = 0;  
  //NOTE: I don't want to handle environmental key actions the same as I would
  //     other actions.  For example, if I handle PAUSE key here, then when the
  //    user presses the key, this handler might be called 30 times before they
  //   can release the key.  This would cause the action to be done too many
  //  times.  So I will handle those in the onKeyPress event, and just get the
  // buffered actions here.
  return resultArray;
}

