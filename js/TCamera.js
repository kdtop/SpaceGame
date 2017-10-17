/*


class TCamera extends T3DObject {
  constructor () {
  setMode(mode) {
  animateFollow(deltaSec) {
  animateOrbit(deltaSec) {
  animateHighAbove(deltaSec) {
  animateMouseControl(deltaSec) {
  animateCockpit(deltaSec) {
  objectWrapped(aObject, p, originalP) {
}
*/


class TCamera extends T3DObject {
  constructor () {
    super(CAMERA_MASS);
    this.trackedObject = {};  //will be a TVehicle
    this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2500 );
    this.camera.position.set( 0, 200, 800 );
    this.targetLookAtPos = new THREE.Vector3();
    this.currentLookAtPos = new THREE.Vector3();
    this.orbit = {};
    this.orbit.xzAngle = 0;
    this.orbit.zyAngle = 0;
    this.orbit.xzAngleVelocity = 0.0; //0.1; //radians/sec
    this.radius = 100;
    this.setMode(CAMERA_MODE_ORBIT);
    this.springK = CAMERA_SPRING_CONST;
  }
  setMode(mode) {
    this.mode = mode;
    if (mode == CAMERA_MODE_ORBIT) {
      this.radius = GRID_SIZE/2 + 400;
      this.animate = this.animateOrbit;
    } else if (mode == CAMERA_MODE_FOLLOW) {
      this.animate = this.animateFollow;
      this.velocity.set(0,0,0);
    } else if (mode == CAMERA_MODE_MOUSE) {
      this.animate = this.animateMouseControl;
      this.orbit.xzAngleVelocity = 0;
    } else if (mode == CAMERA_MODE_COCKPIT) {
      this.animate = this.animateCockpit;
    } else if (mode == CAMERA_MODE_HIGH_ABOVE) {
      this.animate = this.animateHighAbove;
      switch (this.trackedObject.plane) {
        case PLANE_XY:  this.dirV = plusZV.clone();  break;
        case PLANE_XZ:  this.dirV = plusYV.clone();  break;
        case PLANE_YZ:  this.dirV = plusXV.clone();  break;
        default:        this.dirV = plusYV.clone();  break;
      }
      this.radius = GRID_SIZE*1/4;
      this.dirV.multiplyScalar(this.radius);
      this.camera.position.copy(this.dirV);
    }
  }
  animateLookAtPos(deltaSec) {
    let deltaV = this.targetLookAtPos.clone();
    deltaV.sub(this.currentLookAtPos);
    let length = deltaV.length();
    let frameLength = CAMERA_MAX_VELOCITY * deltaSec;  //how far we could travel in this one frame
    if (length > frameLength) {
      deltaV.setLength(frameLength);
    }
    this.currentLookAtPos.add(deltaV);
    this.camera.lookAt(this.currentLookAtPos);
  }
  animateFollow(deltaSec) {
    //deltaSec = 0.00125; //<-- temp!!!
    let attachDirV = ship.cameraAttachement.clone();
    attachDirV.sub(this.position);
    let distToAttach = attachDirV.length();
    let dampenFactor = 0.1;

    if (distToAttach > 10) {
      //Redirect all velocity to direction of attachement.
      let newVelocityV = attachDirV.clone()
      newVelocityV.setLength(this.velocity.length());
      this.velocity.copy(newVelocityV);

      //Next accelerate camera towards attachement
      attachDirV.normalize();

      //F = k * x;
      //F on camera = K * distToAttach
      //F = m * accleration
      //K * distToAttach = m * acceleration
      //acceleration = K * distToAttach / m
      //DeltaV = acceleration * deltaSec
      //DeltaV = K * distToAttach * deltaSec / m
      let scalar = this.springK * distToAttach * deltaSec / this.mass;
      attachDirV.multiplyScalar(scalar);
      this.velocity.add(attachDirV);
    } else {
      dampenFactor = 0.5;
    }

    //I want to ensure the camera doesn't overshoot the target in the next animation frame.
    //  I will assume the next animation frame will be similar to this one.
    //  D=R*T,  R=D/T
    //  Rate that would overshoot target would be R > distToAttach/deltaSec
    let maxRate = (distToAttach / deltaSec) ;
    //maxRate = maxRate * 0.5;  //manual adjustment factor
    if (maxRate > CAMERA_MAX_VELOCITY) maxRate=CAMERA_MAX_VELOCITY;
    if (this.velocity.length() > maxRate) {
      this.velocity.setLength(maxRate);
    }

    //change in position = this.velocity * deltaSec
    let deltaPos = this.velocity.clone();
    deltaPos.multiplyScalar(deltaSec);
    this.position.add(deltaPos);
    //wrapPosition(this.position);  <-- will wrap based on when trackedObject is wrapped

    //dampen camera velocity
    var vel = this.velocity.clone();
    vel.multiplyScalar(1- (dampenFactor * deltaSec));   //dampen by 10%/sec
    this.velocity.copy(vel);
    this.camera.position.copy(this.position);

    //this.camera.lookAt(this.trackedObject.cockpitLookAt);
    this.targetLookAtPos.copy(this.trackedObject.cockpitLookAt);
    this.animateLookAtPos(deltaSec);
  }
  animateOrbit(deltaSec) {
    this.orbit.xzAngle += this.orbit.xzAngleVelocity * deltaSec;
    this.position.x = Math.cos( this.orbit.xzAngle ) * this.radius;
    this.position.z = Math.sin( this.orbit.xzAngle ) * this.radius;
    this.position.y = 200;
    this.camera.position.copy(this.position);
    this.targetLookAtPos.copy(scene.position);
    //this.camera.lookAt( scene.position );
    this.animateLookAtPos(deltaSec);
  }
  animateHighAbove(deltaSec) {
    let dirV2 = this.dirV.clone();
    dirV2.setLength(this.radius);
    this.camera.position.copy(dirV2);
    //this.camera.lookAt(this.trackedObject.position);
    this.targetLookAtPos.copy(this.trackedObject.position);
    this.animateLookAtPos(deltaSec);
  }
  animateMouseControl(deltaSec) {
    //mouseX = 0;
    //this.orbit.xzAngleVelocity = 0;
    let maxXZAngularVelocity = Pi/2;  //radians/second
    let maxZYAngularVelocity = Pi/4;  //radians/second
    let deltaXZAngularVelocity = (mouseX / windowHalfX) * maxXZAngularVelocity * deltaSec;
    this.orbit.xzAngleVelocity += deltaXZAngularVelocity;

    globalDebugMessage = 'deltaXZAngularVelocity=' + deltaXZAngularVelocity.toString() + ', ' +
                         'this.orbit.xzAngleVelocity=' + this.orbit.xzAngleVelocity.toString();
    if (this.orbit.xzAngleVelocity < -maxXZAngularVelocity) this.orbit.xzAngleVelocity = -maxXZAngularVelocity;
    if (this.orbit.xzAngleVelocity > maxXZAngularVelocity) this.orbit.xzAngleVelocity = maxXZAngularVelocity;

    let deltaZYAngle = (mouseY / windowHalfY) * maxXZAngularVelocity * deltaSec;
    this.orbit.zyAngle += deltaZYAngle;
    if (this.orbit.zyAngle < -Pi/2) this.orbit.zyAngle = -Pi/2;
    if (this.orbit.zyAngle > Pi/2) this.orbit.zyAngle = Pi/2;

    this.orbit.xzAngle += this.orbit.xzAngleVelocity * deltaSec;
    //let radius = GRID_SIZE/2 + 400;
    this.position.x = Math.cos(this.orbit.xzAngle) * this.radius;
    this.position.z = Math.sin(this.orbit.xzAngle) * this.radius;
    //this.position.y = 200;
    this.position.y = Math.sin(this.orbit.zyAngle) * this.radius;
    this.camera.position.copy(this.position);
    //this.camera.lookAt( scene.position );
    this.targetLookAtPos.copy(scene.position);
    this.animateLookAtPos(deltaSec);
  }
  animateCockpit(deltaSec) {
    this.camera.position.copy(this.trackedObject.cockpitPos);
    //this.camera.lookAt(this.trackedObject.cockpitLookAt);
    this.targetLookAtPos.copy(this.trackedObject.cockpitLookAt);
    this.animateLookAtPos(deltaSec);
  }
  objectWrapped(aObject, p, originalP) {
    if (aObject != this.trackedObject) return;  //ignore other objects camera is not tracking
    if ([CAMERA_MODE_FOLLOW, CAMERA_MODE_COCKPIT].indexOf(this.mode) == -1) return;  //wrapping only applies for certain modes
    let delta = this.position.clone();
    delta.sub(originalP);  //delta is vector from object position before it was wrapped to camera position
    let newPosition = p.clone();
    newPosition.add(delta);
    this.position.copy(newPosition);
  }



}
