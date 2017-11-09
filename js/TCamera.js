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
    this.vertFOV = params.FOV || CAMERA_FOV
    this.horizFOV = this.calculateHorizFOV();
    this.camera = new THREE.PerspectiveCamera(this.vertFOV, this.aspectRatio, 1, this.cameraDist);
    this.object = this.camera;
    this.setPosition(params.initPosition);
    this.targetLookAtPos = new THREE.Vector3();
    this.currentLookAtPos = new THREE.Vector3();
    this.orbit = {};
    this.orbit.xzAngle = Pi/4;
    this.orbit.zyAngle = Pi/16;
    this.orbit.xzAngleVelocity = 0.0; //0.1; //radians/sec
    this.radius = GRID_SIZE/2 + 400;
    this.stepBackRadius = 0;
    this.setMode(params.initMode || CAMERA_MODE.mouse);
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
      this.orbit.xzAngleVelocity = 0;
    } else if (mode == CAMERA_MODE.cockpit) {
      this.animate = this.animateCockpit;
    } else if (mode == CAMERA_MODE.highAbove) {
      this.animate = this.animateHighAbove;
      switch (this.trackedObject.plane) {
        case ORBIT_PLANE.xy:  this.dirV = plusZV.clone();  break;
        case ORBIT_PLANE.xz:  this.dirV = plusYV.clone();  break;
        case ORBIT_PLANE.yz:  this.dirV = plusXV.clone();  break;
        default:        this.dirV = plusYV.clone();  break;
      }
      this.radius = GRID_SIZE*1/4;
      this.dirV.multiplyScalar(this.radius);
      this.setPosition(this.dirV);
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
    //   The rule to see if an object is visible to the camera is to determine
    //   the angle between the "In" vector of the camera, and a vector towards
    //   the tracked object.  If this is > 1/2 the camera's this.FOV, then the 
    //   object is outside the field of view.
    //Output: this function modifies this.stepBackRadius
    if (!this.trackedObject) return;
    /*
    let anInV = this.vectorToLookAt();    
    let toObjV = this.vectorToTrackedObj();
    let angle = angleBetweenVectors(anInV, toObjV) ;
    let degAngle = angle * 360 / (2 *Pi);
        
     globalDebugMessage = 'radian angle between: ' + angle.toFixed(3) + 
        ', deg Angle = ' + degAngle.toFixed(1);
    
    let pctFOV = 2*degAngle/this.camera.fov;
    if (pctFOV>0.99) {
      if (pctFOV>1) pctFOV = 1;
      //this.stepBackRadius += CAMERA_STEP_BACK_RADIUS_CHANGE_RATE * pctFOV * deltaSec;
    } else if ((pctFOV<0.85) && (this.stepBackRadius > 0)) {
      this.stepBackRadius -= CAMERA_STEP_BACK_RADIUS_CHANGE_RATE * deltaSec;
      if (this.stepBackRadius < 0) this.stepBackRadius = 0;
    }  
    */
    let trackedPos = this.trackedObject.position.clone();
    let ndcPos = trackedPos.project(this.camera);  //maps world point to NCD coordinates
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
      newPos.copy(this.trackedObject.cameraAttachement);
    }  
    this.setPosition(newPos);
    this.targetLookAtPos.copy(this.trackedObject.cockpitLookAt);
    this.animateLookAtPos(deltaSec);
  }
  setToOrbitParameters(deltaSec) {
    let newPos = new THREE.Vector3();
    let netRadius = this.radius + this.stepBackRadius
    newPos.x = Math.cos( this.orbit.xzAngle ) * netRadius;
    newPos.z = Math.sin( this.orbit.xzAngle ) * netRadius;
    newPos.y = Math.sin(this.orbit.zyAngle) * netRadius;
    this.setPosition(newPos);
    this.targetLookAtPos.copy(scene.position);
    this.animateLookAtPos(deltaSec);
    //globalDebugMessage = 'gameCamera.radius = ' + this.radius.toString();
    this.animateArrows(deltaSec);
  }  
  animateOrbit(deltaSec) {
    this.checkAddStepBackRadius(deltaSec);
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
      let deltaMouse = mouse.clone();
      deltaMouse.sub(mouseDownPos)
      //this.orbit.xzAngle += Pi * (deltaMouse.x / windowHalfX);
      this.orbit.xzAngle += deltaMouse.x / 100;
      this.orbit.xzAngle = wrapRadians(this.orbit.xzAngle);
      //this.orbit.zyAngle += Pi/2 * (deltaMouse.y / windowHalfY);
      this.orbit.zyAngle += deltaMouse.y / 100;
      this.orbit.zyAngle = wrapRadians(this.orbit.zyAngle);
      mouseDownPos.copy(mouse);
    }  
    this.checkAddStepBackRadius(deltaSec) ;
    this.setToOrbitParameters();    
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
          this.orbit.xzAngleVelocity += 0.1 * deltaSec;          
          break;
        case CAMERA_ACTION.orbitAngleSub:
          this.orbit.xzAngleVelocity -= 0.1 * deltaSec;
          break
        case CAMERA_ACTION.orbitAngleZero:
          this.orbit.xzAngleVelocity = 0;          
          break
      } //switch
    } //while  
  }      
}
