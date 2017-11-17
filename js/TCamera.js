/*
class TCamera extends T3DObject {
  constructor () {
  setMode(mode) {
  calculateHorizFOV() {
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
    //  params.initMode       --default is CAMERA_MODE.mouse
    //  params.FOV            --default is CAMERA_FOV
    //  params.showArrow1     -- default is false
    //  params.showArrow2     -- default is false
    //  params.arrowLength    -- default is 25
    //-----------------------
    super(params);
    this.trackedObject = params.trackedObject||null;  //will be a TVehicle
    this.cameraDist = CAMERA_DIST;
    this.viewportWidth = window.innerWidth;
    this.viewportHeight = window.innerHeight;
    this.aspectRatio = window.innerWidth / window.innerHeight;
    this.vertFOV = params.FOV || CAMERA_FOV;  //units are degrees
    this.horizFOV = this.calculateHorizFOV(); //units are degrees
    this.camera = new THREE.PerspectiveCamera(this.vertFOV, this.aspectRatio, 1, this.cameraDist);
    this.object = this.camera;
    this.targetPos = this.position.clone();
    this.targetLookAtPos = new THREE.Vector3();
    this.currentLookAtPos = new THREE.Vector3();
    this.initPosition = params.initPosition.clone();
    this.initPlane = params.initPlane || ORBIT_PLANE.xz;
    this.resetPositionToInit();
    this.setMode(params.initMode || CAMERA_MODE.mouse);
  }
  resetPositionToInit() {
    this.setPosition(this.initPosition);
    this.targetPos.copy(nullV);
    this.targetLookAtPos.copy(nullV);
    this.currentLookAtPos.copy(nullV);
    this.plane = this.initPlane;
    this.targetInRotation = 0;
    this.currentInRotation = 0;
    this.orbit = {};
    this.orbit.onPlaneAngle = Pi/4;
    this.orbit.perpendicularToPlaneAngle = Pi/16;
    this.orbit.onPlaneAngleVelocity = 0.0; //0.1; //radians/sec
    this.radius = GRID_SIZE/2 + 400;
    this.stepBackRadius = 0;
  }  
  calculateInUpLeft() {
    super.calculateInUpLeft()
    //For some reason, the inV for the camera seems to be in opposite direction.
    //  Cameras set up differently??
    this.inVector.multiplyScalar(-1); 
  }  
  calculateHorizFOV() {
    let radVertFOV = this.vertFOV * Pi/180;
    let horizFOV = 2 * Math.atan( Math.tan(radVertFOV/2) * this.aspectRatio);
    horizFOV = horizFOV * 180/Pi;
    return horizFOV;
  }  
  setMode(mode) {
    this.mode = mode;
    if (mode == CAMERA_MODE.orbit) {
      this.radius = GRID_SIZE/2 + 400;
      this.animate = this.animateOrbit;
    } else if (mode == CAMERA_MODE.follow) {
      this.animate = this.animateFollow;
      this.velocity.set(0,0,0);
    } else if (mode == CAMERA_MODE.mouse) {
      this.animate = this.animateMouseControl;
      this.orbit.onPlaneAngleVelocity = 0;
    } else if (mode == CAMERA_MODE.cockpit) {
      this.animate = this.animateCockpit;
    } else if (mode == CAMERA_MODE.highAbove) {
      this.animate = this.animateHighAbove;
      switch (this.plane) {
        case ORBIT_PLANE.xy:  this.dirV = plusZV.clone();  break;
        case ORBIT_PLANE.xz:  this.dirV = plusYV.clone();  break;
        case ORBIT_PLANE.yz:  this.dirV = plusXV.clone();  break;
        default:        this.dirV = plusYV.clone();  break;
      }
      this.radius = GRID_SIZE*1/2;
      this.dirV.multiplyScalar(this.radius);
      this.targetPos.copy(this.dirV);
      //this.setPosition(this.dirV);
    }
  }
  checkAddStepBackRadius(deltaSec) {
    //Note:(The following discussion doesn't apply to modes: Follow, Cockpit, highAbove)
    //   The camera is positioned a distance away from the center, specified by 
    //   this.radius.  Sometimes the tracked object (i.e. the ship) might pass
    //   outside the field of view of the camera, causing the player to look sight
    //   of the ship, and have to then scroll out temporarily.  This function will
    //   cause this to happen automatically.  I will call this additional radius
    //   needed to keep the ship in view the "stepBackRadius", and it will be 
    //   added to the normal radius.
    //Output: this function modifies this.stepBackRadius
    if (!this.trackedObject) return;
    let trackedPos = this.trackedObject.position.clone();
    //maps world point to NCD viewport coordinates
    //See here: https://stackoverflow.com/questions/47184264/threejs-calculating-fov-for-perspective-camera-after-browser-window-resize
    let ndcPos = trackedPos.project(this.camera);  
    let x = Math.abs(ndcPos.x);
    let y = Math.abs(ndcPos.y);
    let max = Math.max(x,y);
    if (max>0.95) {
      this.stepBackRadius += CAMERA_STEP_BACK_RADIUS_CHANGE_RATE * deltaSec;
    } else if ((max<0.9) && (this.stepBackRadius > 0)) {
      this.stepBackRadius -= CAMERA_STEP_BACK_RADIUS_CHANGE_RATE * deltaSec;
      if (this.stepBackRadius < 0) this.stepBackRadius = 0;
    }      
  }  
  vectorToLookAt() {
    let anInV = this.currentLookAtPos.clone();
    anInV.sub(this.position);
    anInV.normalize();  //this is a vector pointing FROM cameraPos to currentLookAtPos
    return anInV;    
  }  
  vectorToTrackedObj() {
    let toObj = this.trackedObject.position.clone();
    toObj.sub(this.position);
    toObj.normalize();
    return toObj;
  }  
  animateArrows(deltaSec) {
    return;
    /*
    var arrow1,arrow2;

    //NOTE: this.inV for the camera seems to be in Camera Space coordinates rather than world Coordinates, so won't use
    //let anInV = this.currentLookAtPos.clone();
    //anInV.sub(this.position);
    //anInV.normalize();  //this is a vector pointing FROM cameraPos to currentLookAtPos
    
    let anInV = this.vectorToLookAt();    
    let toObjV = this.vectorToTrackedObj();
    let origin = this.position.clone();
    
    let originDelta = anInV.clone();
    originDelta.multiplyScalar(1); //move out away from camera by # voxels
    origin.add(originDelta);
    
    if (this.arrows.length > 0) {  //length here is array length, not actual arrow length
      //I will use arrow1 to point in the IN directon
      arrow1 = this.arrows[0];
      arrow1.position.copy(origin);
      arrow1.setDirection(anInV);
    }  
    if (this.arrows.length > 1) {  //length here is array length, not actual arrow length
      //I will use arrow2 to point in direction of tracked object.  
      if (this.trackedObject) {
        arrow2 = this.arrows[1];
        arrow2.position.copy(origin);
        arrow2.setDirection(toObjV);
      }         
    }  
    if (this.arrows.length > 1) {
      let angle = angleBetweenVectors(anInV, toObjV) ;
      let degAngle = angle * 360 / (2 *Pi);
      globalDebugMessage = 'radian angle between: ' + angle.toFixed(3) + 
        ', deg Angle = ' + degAngle.toFixed(1);
    }
    */
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
    this.camera.lookAt(this.currentLookAtPos); //NOTE: this sets camera's In rotation to 0
    
    let deltaRadians = this.targetInRotation - this.currentInRotation;
    if (Math.abs(deltaRadians/CAMERA_ROLL_RATE) < deltaSec) {
      this.currentInRotation = this.targetInRotation;
    } else {
      let mult = (deltaRadians < 0) ? -1 : 1;
      this.currentInRotation += CAMERA_ROLL_RATE * deltaSec * mult;
    }      
    this.rollRadians(this.currentInRotation);
  }
  animateMoveToTargetPos(deltaSec) {
    let attachDirV = this.targetPos.clone();
    attachDirV.sub(this.position);
    let distToAttach = attachDirV.length();
    let maxDist = CAMERA_MAX_FOLLOW_VELOCITY * deltaSec; 
    let newPos = this.position.clone();
    if (maxDist <= distToAttach ) {      
      attachDirV.setLength(maxDist);
      newPos.add(attachDirV);
    } else {
      newPos.copy(this.targetPos);
    }  
    this.setPosition(newPos);
  }  
  animateFollow(deltaSec) {
    this.targetPos = this.trackedObject.cameraAttachement.clone();
    this.animateMoveToTargetPos(deltaSec)
    this.targetLookAtPos.copy(this.trackedObject.cockpitLookAt);
    this.animateLookAtPos(deltaSec);
  }
  setToOrbitParameters(deltaSec) {
    let newPos = new THREE.Vector3();
    let netRadius = this.radius + this.stepBackRadius
    let aX = Math.cos( this.orbit.onPlaneAngle ) * netRadius;
    let aZ = Math.sin( this.orbit.onPlaneAngle ) * netRadius;
    let aY = Math.sin(this.orbit.perpendicularToPlaneAngle) * netRadius;
    switch(this.plane) {
      case ORBIT_PLANE.xy:
        newPos.set(aX, aZ, aY);  //switch Y <--> Z
        break;
      case ORBIT_PLANE.xz:
        newPos.set(aX, aY, aZ);
        break;
      case ORBIT_PLANE.yz:
        newPos.set(aY, aX, aZ); //switch Y <--> X
        break;
    } //switch    
    this.targetPos.copy(newPos);
    this.animateMoveToTargetPos(deltaSec)
    this.targetLookAtPos.copy(scene.position);
    this.animateLookAtPos(deltaSec);
    this.animateArrows(deltaSec);
  }  
  animateOrbit(deltaSec) {
    this.checkAddStepBackRadius(deltaSec);
    this.orbit.onPlaneAngle += this.orbit.onPlaneAngleVelocity * deltaSec;
    this.orbit.perpendicularToPlaneAngle = Pi/16;
    this.setToOrbitParameters();
  }
  animateHighAbove(deltaSec) {
    let dirV2 = this.dirV.clone();
    dirV2.setLength(this.radius);
    //this.setPosition(dirV2);
    this.targetPos.copy(dirV2);
    this.animateMoveToTargetPos(deltaSec)
    this.targetLookAtPos.copy(this.trackedObject.position);
    this.animateLookAtPos(deltaSec);
  }
  animateMouseControl(deltaSec) {
    //NOTE: mouse (0,0) is center of screen.    
    if (mouseDown) {
      let deltaMouse = mouse.clone();
      deltaMouse.sub(mouseDownPos)
      this.orbit.onPlaneAngle += deltaMouse.x / 100;
      this.orbit.onPlaneAngle = wrapRadians(this.orbit.onPlaneAngle);
      this.orbit.perpendicularToPlaneAngle += deltaMouse.y / 100;
      this.orbit.perpendicularToPlaneAngle = wrapRadians(this.orbit.perpendicularToPlaneAngle);
      mouseDownPos.copy(mouse);
    }  
    this.checkAddStepBackRadius(deltaSec) ;
    this.setToOrbitParameters(deltaSec);    
  }
  animateCockpit(deltaSec) {
    this.setPosition(this.trackedObject.cockpitPos);
    this.targetLookAtPos.copy(this.trackedObject.cockpitLookAt);
    this.animateLookAtPos(deltaSec);
  }
  objectWrapped(aObject, p, originalP) {
    if (aObject != this.trackedObject) return;  //ignore other objects camera is not tracking
    if ([CAMERA_MODE.follow, CAMERA_MODE.cockpit].indexOf(this.mode) == -1) return;  //wrapping only applies for certain modes
    let delta = this.position.clone();
    delta.sub(originalP);  //delta is vector from object position before it was wrapped to camera position
    let newPosition = p.clone();
    newPosition.add(delta);
    this.setPosition(newPosition);
  }  
  handleAction(actionArray, deltaSec)  {
    //Input: Action should be an array of entries from CAMERA_ACTION's
    while (actionArray.length > 0) {
      let action = actionArray.pop();
      switch (action) {
        case CAMERA_ACTION.setModeOrbit:
          this.setMode(CAMERA_MODE.orbit);
          break;
        case CAMERA_ACTION.setModeFollow:          
          this.setMode(CAMERA_MODE.follow);
          break;
        case CAMERA_ACTION.setModeHighAbove:
          this.setMode(CAMERA_MODE.highAbove);
          break;        
        case CAMERA_ACTION.setModeMouse:
          this.setMode(CAMERA_MODE.mouse);
          break;        
        case CAMERA_ACTION.setModeCockpit:
          this.setMode(CAMERA_MODE.cockpit);
          break;
        case CAMERA_ACTION.orbitAngleAdd:
          this.orbit.onPlaneAngleVelocity += 0.1 * deltaSec;          
          break;
        case CAMERA_ACTION.orbitAngleSub:
          this.orbit.onPlaneAngleVelocity -= 0.1 * deltaSec;
          break
        case CAMERA_ACTION.orbitAngleZero:
          this.orbit.onPlaneAngleVelocity = 0;          
          break
        case CAMERA_ACTION.rotateX:   //for debugging
          this.rotateOnObjectAxis(plusXV, SHIP_ROTATION_RATE, deltaSec);
          //this.object.rotation.x += Pi/16;
          break
        case CAMERA_ACTION.rotateY:   //for debugging
          this.rotateOnObjectAxis(plusYV, SHIP_ROTATION_RATE, deltaSec);
          //this.object.rotation.y += Pi/16;
          break
        case CAMERA_ACTION.rotateZ:   //for debugging
          this.rotateOnObjectAxis(plusZV, SHIP_ROTATION_RATE, deltaSec);
          //this.object.rotation.z += Pi/16;
          break     
        case CAMERA_ACTION.rollRight:  //for debugging
          this.targetInRotation += Pi/16;
          globalDebugMessage = 'target In Rotation = ' + this.targetInRotation.toFixed(3);
          break     
        case CAMERA_ACTION.rollLeft:  //for debugging
          this.targetInRotation -= Pi/16;
          globalDebugMessage = 'target In Rotation = ' + this.targetInRotation.toFixed(3);
          break               
      } //switch
    } //while  
  }
  handlePlaneChange(aVehicle) {
    if (aVehicle != this.trackedObject) return;
    let newPlane = aVehicle.plane;
    let oldPlane = this.plane;
    let p = this.position.clone();
    if (this.mode == CAMERA_MODE.highAbove) {
      this.plane = aVehicle.plane;
      this.setMode(CAMERA_MODE.highAbove); //sets to new plane
    } else if (this.mode == CAMERA_MODE.mouse) {
      if (newPlane != oldPlane) switch(newPlane) {
        case ORBIT_PLANE.xz:  this.targetInRotation = 0;               break;
        case ORBIT_PLANE.xy:  this.targetInRotation = Pi/2 + Pi/16;    break;
        case ORBIT_PLANE.yz:  this.targetInRotation = -(Pi/2 + Pi/16); break;
      } //switch
    } 
    //more here...
    this.plane = aVehicle.plane;
  }  
}
