

function onKeyDown(event) {
  keyDown[event.key] = true;
  keyDown[event.code] = true;
  //event.preventDefault();
}

function onKeyUp(event) {
  let k = event.key;
  let code = event.code;
  if (code == 'Escape') {
    ship.resetPositionToInit(sun);
  } else if (keyDown['s']) {
    gameCamera.orbit.xzAngleVelocity = 0;
    delete keyDown['s'];
  } else {
    delete keyDown[event.key];
    delete keyDown[event.code];
  }
  event.preventDefault();
}

function onKeyPress(event) {
  let k = event.key;
  let code = event.code;
  if (k == '1') {
    gameCamera.setMode(CAMERA_MODE_ORBIT);
    event.preventDefault();
  } else if (k == '2') {
    gameCamera.setMode(CAMERA_MODE_FOLLOW);
    event.preventDefault();
  } else if (k == '3') {
    gameCamera.setMode(CAMERA_MODE_HIGH_ABOVE);
    event.preventDefault();
  } else if (k == '4') {
    gameCamera.setMode(CAMERA_MODE_MOUSE);
    event.preventDefault();
  } else if (k == '5') {
    gameCamera.setMode(CAMERA_MODE_COCKPIT);
    event.preventDefault();
  } else if (k == 'p') {
    gamePaused = !gamePaused;
    if (!gamePaused) requestAnimationFrame(animate);
    gamePaused ? clock.stop() : clock.start();
  }
}



function handleKeyAction(vehicle, deltaSec)  {
  //handle key actions here for each animation cycle
  if ((keyDown['ArrowRight']) || (keyDown['Numpad6'])) {  //yaw right
    autoPointTowardsMotionDelay = AUTO_POINT_DELAY;
    if (vehicle.plane == PLANE_XZ) {
      //yawObject (vehicle.object, -Pi/2, deltaSec);
      vehicle.yaw(-Pi/2, deltaSec);
    }
  }
  if ((keyDown['ArrowLeft']) || (keyDown['Numpad4'])) {  //yaw left
    autoPointTowardsMotionDelay = AUTO_POINT_DELAY;
    if (vehicle.plane == PLANE_XZ) {
      vehicle.yaw(Pi/2, deltaSec);
      //yawObject (vehicle.object, Pi/2, deltaSec);
    }
  }
  if ((keyDown['ArrowUp']) || (keyDown['Numpad8'])) {   //pitch down
    autoPointTowardsMotionDelay = AUTO_POINT_DELAY;
    if (vehicle.plane == PLANE_UNK) {
      //pitchObject (vehicle.object, Pi/2, deltaSec);
      vehicle.pitch(Pi/2, deltaSec);
    }
  }
  if ((keyDown['ArrowDown']) || (keyDown['Numpad2'])) {  //pitch up
    autoPointTowardsMotionDelay = AUTO_POINT_DELAY;
    if (vehicle.plane == PLANE_UNK) {
      //pitchObject (vehicle.object, -Pi/2, deltaSec);
      vehicle.pitch(-Pi/2, deltaSec);
    }
  }
  if ((keyDown['PageUp']) || (keyDown['Numpad9'])) {  //roll right
    autoPointTowardsMotionDelay = AUTO_POINT_DELAY;
    if (vehicle.plane == PLANE_UNK) {
      //rollObject (vehicle.object, Pi/2, deltaSec);
      vehicle.roll(Pi/2, deltaSec);
    }
  }
  if ((keyDown['1']) || (keyDown['Numpad1'])) {  //roll left.
    autoPointTowardsMotionDelay = AUTO_POINT_DELAY;
    if (vehicle.plane == PLANE_UNK) {
      //rollObject (vehicle.object, -Pi/2, deltaSec);
      vehicle.roll(-Pi/2, deltaSec);
    }
  }
  if ((keyDown['Enter']) || (keyDown['Numpad5'])) {  //Orient towards current velocity
    //lookAtVelocity (vehicle);  //orient in direction of object's velocity
    vehicle.lookAtVelocity();  //orient in direction of object's velocity
  }
  if (keyDown['Space']) {  //thrust
    //thrustObject(vehicle, 100, deltaSec);
    vehicle.thrust(100, deltaSec);
  }
  if (keyDown['a']) {
    gameCamera.orbit.xzAngleVelocity -= 0.1 * deltaSec;
  }
  if (keyDown['d']) {
    gameCamera.orbit.xzAngleVelocity += 0.1 * deltaSec;
  }
}
