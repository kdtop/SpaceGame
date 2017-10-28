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
  //constructor (aTrackedObject) {
  constructor(params) {
    //Input:           
    //  params.mass
    //  params.name
    //  params.initPosition
    //  params.trackedObject
    //-----------------------
    super(params);
    this.trackedObject = params.trackedObject||null;  //will be a TVehicle
    this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2500 );
    this.object = this.camera;
    this.setPosition(params.initPosition);
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
      this.setPosition(this.dirV);
    }
  }
  animateLookAtPos(deltaSec) {
    let deltaV = this.targetLookAtPos.clone();
    deltaV.sub(this.currentLookAtPos);
    let length = deltaV.length();
    let frameLength = CAMERA_MAX_PAN_VELOCITY * deltaSec;  //how far we could travel in this one frame
    if (length > frameLength) {
      deltaV.setLength(frameLength);
    }
    this.currentLookAtPos.add(deltaV);
    this.camera.lookAt(this.currentLookAtPos);
  }
  animateFollow(deltaSec) {
    let attachDirV = this.trackedObject.cameraAttachement.clone();
    attachDirV.sub(this.position);
    let distToAttach = attachDirV.length();
    let maxDist = CAMERA_MAX_FOLLOW_VELOCITY * deltaSec; 
    let newPos = this.position.clone();
    if (maxDist <= distToAttach ) {      
      attachDirV.setLength(maxDist);
      newPos.add(attachDirV);
    } else {
      newPos.copy(ship.cameraAttachement);
    }  
    this.setPosition(newPos);
    this.targetLookAtPos.copy(this.trackedObject.cockpitLookAt);
    this.animateLookAtPos(deltaSec);
  }
  setToOrbitParameters(deltaSec) {
    let newPos = new THREE.Vector3();
    newPos.x = Math.cos( this.orbit.xzAngle ) * this.radius;
    newPos.z = Math.sin( this.orbit.xzAngle ) * this.radius;
    newPos.y = Math.sin(this.orbit.zyAngle) * this.radius;
    this.setPosition(newPos);
    this.targetLookAtPos.copy(scene.position);
    this.animateLookAtPos(deltaSec);
    globalDebugMessage = 'gameCamera.radius = ' + this.radius.toString();
  }  
  animateOrbit(deltaSec) {
    this.orbit.xzAngle += this.orbit.xzAngleVelocity * deltaSec;
    this.orbit.zyAngle = Pi/16;
    this.setToOrbitParameters();
  }
  animateHighAbove(deltaSec) {
    let dirV2 = this.dirV.clone();
    dirV2.setLength(this.radius);
    this.setPosition(dirV2);
    this.targetLookAtPos.copy(this.trackedObject.position);
    this.animateLookAtPos(deltaSec);
  }
  animateMouseControl(deltaSec) {
    //NOTE: mouse (0,0) is center of screen.    
    if (mouseDown) {
      this.orbit.xzAngle = Pi * (mouseX / windowHalfX);
      this.orbit.zyAngle = Pi/2 * (mouseY / windowHalfY);
    }  
    this.setToOrbitParameters();    
  }
  animateCockpit(deltaSec) {
    this.setPosition(this.trackedObject.cockpitPos);
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
    this.setPosition(newPosition);
  }
}
