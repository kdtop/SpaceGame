

function onMouseWheel(event) {
  //console.log(event);
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
  if (code == 'Escape') {
    ship.resetPositionToInit(sun);
  } else if (keyDown['s']) {
    gameCamera.orbit.xzAngleVelocity = 0;
  }
  delete keyDown[event.key];
  delete keyDown[event.code];
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
  } else if (k == 'g') {
    disableGravity = !disableGravity;
  } else if (k == 'f') {
    ship.launchRocket();
  }
}



function handleKeyAction(vehicle, deltaSec)  {
  //handle key actions here for each animation cycle
  if ((keyDown['ArrowRight']) || (keyDown['Numpad6'])) {  //yaw right
    autoPointTowardsMotionDelay = AUTO_POINT_DELAY;
    if (vehicle.plane == PLANE_XZ) {
      vehicle.yaw(-SHIP_ROTATION_RATE, deltaSec);
    }
  }
  if ((keyDown['ArrowLeft']) || (keyDown['Numpad4'])) {  //yaw left
    autoPointTowardsMotionDelay = AUTO_POINT_DELAY;
    if (vehicle.plane == PLANE_XZ) {
      vehicle.yaw(SHIP_ROTATION_RATE, deltaSec);
    }
  }
  if ((keyDown['ArrowUp']) || (keyDown['Numpad8'])) {   //pitch down
    autoPointTowardsMotionDelay = AUTO_POINT_DELAY;
    if (vehicle.plane == PLANE_UNK) {
      vehicle.pitch(SHIP_ROTATION_RATE, deltaSec);
    }
  }
  if ((keyDown['ArrowDown']) || (keyDown['Numpad2'])) {  //pitch up
    autoPointTowardsMotionDelay = AUTO_POINT_DELAY;
    if (vehicle.plane == PLANE_UNK) {
      vehicle.pitch(-SHIP_ROTATION_RATE, deltaSec);
    }
  }
  if ((keyDown['PageUp']) || (keyDown['Numpad9'])) {  //roll right
    autoPointTowardsMotionDelay = AUTO_POINT_DELAY;
    if (vehicle.plane == PLANE_UNK) {
      vehicle.roll(SHIP_ROTATION_RATE, deltaSec);
    }
  }
  if ((keyDown['1']) || (keyDown['Numpad1'])) {  //roll left.
    autoPointTowardsMotionDelay = AUTO_POINT_DELAY;
    if (vehicle.plane == PLANE_UNK) {
      vehicle.roll(-SHIP_ROTATION_RATE, deltaSec);
    }
  }
  if ((keyDown['Enter']) || (keyDown['Numpad5'])) {  //Orient towards current velocity
    //lookAtVelocity (vehicle);  //orient in direction of object's velocity
    vehicle.lookAtVelocity();  //orient in direction of object's velocity
  }
  if (keyDown['Space']) {  //thrust
    vehicle.throttle += SHIP_THROTTLE_DELTA_RATE * deltaSec
    //vehicle.thrust(100, deltaSec);
  } else {
    vehicle.throttle -= SHIP_THROTTLE_DELTA_RATE * deltaSec
  }

  if (keyDown['a']) {
    gameCamera.orbit.xzAngleVelocity -= 0.1 * deltaSec;
  }
  if (keyDown['d']) {
    gameCamera.orbit.xzAngleVelocity += 0.1 * deltaSec;
  }
}
