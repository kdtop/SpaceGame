

class TCamera extends T3DObject {
  constructor () {
    super(CAMERA_MASS);
    this.trackedObject = {};  //will be a TVehicle
    this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2500 );
    this.camera.position.set( 0, 200, 800 );
    this.orbit = {};
    this.orbit.xzAngle = 0;
    this.orbit.zyAngle = 0;
    this.orbit.xzAngleVelocity = 0.0; //0.1; //radians/sec
    this.animate = this.animateOrbit;
    this.springK = CAMERA_SPRING_CONST;
  }
  setMode(mode) {
    if (mode == CAMERA_MODE_ORBIT) {
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
      let dirV = {};
      switch (this.trackedObject.plane) {
        case PLANE_XY:  dirV = plusZV.clone();  break;
        case PLANE_XZ:  dirV = plusYV.clone();  break;
        case PLANE_YZ:  dirV = plusXV.clone();  break;
        default:        dirV = plusYV.clone();  break;
      }
      dirV.multiplyScalar(GRID_SIZE*2/3);
      this.camera.position.copy(dirV);
    }
  }
  animateFollow(deltaSec) {
    //deltaSec = 0.00125; //<-- temp!!!
    let attachDirV = ship.cameraAttachement.clone();
    attachDirV.sub(this.position);
    let distToAttach = attachDirV.length();

    //below was attempt to redirect all velocity to direction of attachement.
    //Not working, I'm not sure why.
    //let newVelocityV = attachDirV.normalize();
    //newVelocityV.multiplyScalar(this.velocity.length());
    //this.velocity.copy(newVelocityV);
    //----------------------------------------

    //First, project this.velocity onto vector towards target
    //   This will dump all velocity in other directions.
    //Math proof
    //
    //          /|
    //       A / |  a2
    //        /  |
    //    ___/___|________>  B
    //        a1
    // 1.  |a1| = |A| * cos(angle)     (note: |a1| means length of vector a1)
    //     Note: ● means dot product, defined below
    // 2.  def: a ● b = |a|*|b|*cos(angle)       (note: * means normal multiplication, aka scalar multiplication)
    // 3.  |a1| = |A| * (A●B)/(|A|*|B|) (by substitution of 2. into 1.)
    // 4.  |a1| = (A●B)/|B|  (by cancelling |A|)
    // 5.  |a1| =  (A●(B/|B|) (by distributive property of dot product)
    // 6.   def: B / |B| is same thing as B.normalize()
    // 7.  so |a1| = A ● B.normalize()  (by substitution of 6. into 5.)
    //     To turn |a1| back into a vector A1, scale B.normalize to length |a1|
    // 8.  A1 = B.normalize() * |a1|
    // 9.  A1 = B.normalize() * (A ● B.normalize())  (by substitution of 7. into 8.)
    // 10. A1 = B/|B|  * (A ● B/|B|)                 (by substitution of 6. into 9.)
    // 11. A1 = B * (A ● B) / |B|^2                  (by rearrangement)
    //My situation:  A = vector representing current camera velocity  (i.e. this.velocity)
    //               B = vector pointing at cameraAttachement  (i.e. attachDirV)
    //               A1 = desired new camera velocity
    let adjustmentScale = this.velocity.dot(attachDirV) / (distToAttach * distToAttach);
    this.velocity.multiplyScalar(adjustmentScale);  //All velocity should now be pointing to attachement point

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

    //I want to ensure the camera doesn't overshoot the target in the next animation frame.
    //  I will assume the next animation frame will be similar to this one.
    //  D=R*T,  R=D/T
    //  Rate that would overshoot target would be R > distToAttach/deltaSec
    let maxRate = (distToAttach / deltaSec);
    //maxRate = maxRate * 0.5;  //manual adjustment factor
    if (maxRate > CAMERA_MAX_VELOCITY) maxRate=CAMERA_MAX_VELOCITY;
    if (this.velocity.length() > maxRate) {
      this.velocity.setLength(maxRate);
    }

    //change in position = this.velocity * deltaSec
    let deltaPos = this.velocity.clone();
    deltaPos.multiplyScalar(deltaSec);
    this.position.add(deltaPos);
    wrapPosition(this.position);

    //dampen camera velocity
    var vel = this.velocity.clone();
    vel.multiplyScalar(1- (0.1 * deltaSec));   //dampen by 10%/sec
    this.velocity.copy(vel);
    this.camera.position.copy(this.position);
    this.camera.lookAt(this.trackedObject.position);
  }
  animateOrbit(deltaSec) {
    this.orbit.xzAngle += this.orbit.xzAngleVelocity * deltaSec;
    let radius = GRID_SIZE/2 + 400;
    this.position.x = Math.cos( this.orbit.xzAngle ) * radius;
    this.position.z = Math.sin( this.orbit.xzAngle ) * radius;
    this.position.y = 200;
    this.camera.position.copy(this.position);
    this.camera.lookAt( scene.position );
  }
  animateHighAbove(deltaSec) {
    this.camera.lookAt(this.trackedObject.position);
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
    let radius = GRID_SIZE/2 + 400;
    this.position.x = Math.cos(this.orbit.xzAngle) * radius;
    this.position.z = Math.sin(this.orbit.xzAngle) * radius;
    //this.position.y = 200;
    this.position.y = Math.sin(this.orbit.zyAngle) * radius;
    this.camera.position.copy(this.position);
    this.camera.lookAt( scene.position );
    //this.position.set(0,0,0);
  }
  animateCockpit(deltaSec) {
    this.camera.position.copy(this.trackedObject.cockpitPos);
    this.camera.lookAt(this.trackedObject.cockpitLookAt);
  }

}
