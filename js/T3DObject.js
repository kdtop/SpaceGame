
class T3DObject extends T3DPoint {
  constructor(params) {
    //Input:
    //  -- T3DPoint --
    //  params.mass                   -- default is 1
    //  params.name                   -- default is 'default name' 
    //  params.initPosition           -- default is (0,0,0)
    //  params.maxVelocity            -- Default = 500 deltaV/sec
    //  params.plane                  -- optional.  default ORBIT_PLANE.xz
    //  params.showArrows             -- default is false.  If true, this overrides the .showArrow# parameters
    //  params.showArrow1             -- default is false
    //  params.showArrow2             -- default is false
    //  params.showArrow3             -- default is false
    //  params.collisionBoxSize       -- default is 5 (this.position +/- 5 voxels/side)
    //  params.showCollisionBox       -- default is false
    //  -- T3DObject --
    //  params.modelScale             -- optional, default = 1
    //  params.showPosMarker          -- default is false
    //  params.excludeFromGameObjects -- default is false
    //  params.arrowsOffset           -- default is null (only applies if showArrow# is true)
    //  params.damageToExplode        -- default is 100
    //  params.rotationVelocity       -- default is (0,0,0)    
    //-----------------------
    super(params);
    this.rotationVelocity = params.rotationVelocity || new THREE.Vector3(); //units are delta radians/sec
    this.loaded = false;                         //default value, changed after loading
    let modelScale = params.modelScale||1
    this.modelScaleV = new THREE.Vector3(modelScale, modelScale, modelScale);
    this.object = null;                          //this will be the THREE.Object3D for descendents
    this.objectOffset = new TOffset(0,0,0);      //this is an Offset displacing 3D model/object from game position.
    this.showPosMarker = (params.showPosMarker == true);
    if (this.showPosMarker == true) {
      this.originIndicator = new THREE.AxisHelper(20);  //An Axis bars to visualize where location and orientation of object
      scene.add(this.originIndicator);
    }
    if (!params.excludeFromGameObjects) {
      gameObjects.push(this);
    }  
    if (params.arrowsOffset) this.arrowsOffset = params.arrowsOffset;
    this.damageToExplode = params.damageToExplode || 100;
    this.cumulativeDamageValue = 0; 
  }
  //=== Class Properties =====
  get inV() {
    this.calculateInUpLeft ();
    return this.inVector;
  }
  get upV() {
    this.calculateInUpLeft ();
    return this.upVector;
  }
  get leftV() {
    this.calculateInUpLeft ();
    return this.leftVector;
  }
  get futurePos() {
  //Results:  return where vehicle position will be 1 second in future at current velocity
    if (!this.object) return nullV;
    let p2 = this.object.position.clone();
    p2.add(this.velocity);  //will use velocity * 1 second
    return p2;
  }
  lookingAtPosAtOrigin(distance) {
  //Results: return point in front of object, based on current orientation, as if object is at origin
    this.calculateInUpLeft ();
    let forwardV = this.inV;
    forwardV.multiplyScalar(distance);
    return forwardV;
  }
  lookingAtPos(distance) {
  //Results: return point in front of object, based on current orientation
    let result = this.lookingAtPosAtOrigin(distance)
    result.add(this.position);
    return result;
  }
  //=== Class Methods =====
  getInUpLeft(inV, upV, leftV) {
    //Input: object -- Object3D
    //       inV -- an OUT parameter.   Returns X axis vector (relative to Matrix)
    //       upV -- an OUT parameter.   Returns Y axis vector (relative to Matrix)
    //       leftV -- an OUT parameter. Returns Z axis vector (relative to Matrix)
    //NOTE: The in, up, and left are relative to loaded object.
    //results: none
    if (this.object) this.object.matrix.extractBasis (leftV, upV, inV);
  }
  calculateInUpLeft () {
    this.inVector = new THREE.Vector3();  //in is Z axis for loaded object, initially
    this.upVector = new THREE.Vector3();  //up is Y axis, initially
    this.leftVector = new THREE.Vector3();//left is X axis for loaded object, initially
    if (this.object) this.object.matrix.extractBasis (this.leftVector, this.upVector, this.inVector)
    //this.inVector.copy(
    //Ensure that the object is aligned with it's specified orbit plane
    if (this.plane == ORBIT_PLANE.xy) {
      this.inVector.z = 0;                           //In
      this.leftVector.z = 0;                         //Left
      this.upVector.x = 0;  this.upVector.y = 0;     //Up
    } else if (this.plane == ORBIT_PLANE.xz) {
      this.inVector.y = 0;                           //In
      this.leftVector.y = 0;                         //Left
      this.upVector.x = 0;  this.upVector.z = 0;     //Up
    } else if (this.plane == ORBIT_PLANE.yz) {
      this.inVector.x = 0;                           //In
      this.leftVector.x = 0;                         //Left
      this.upVector.y = 0;  this.upVector.z = 0;     //Up
    }
  }
  rotateOnObjectAxisRadians(axis, radians) {
    if (this.object) this.object.rotateOnAxis(axis, radians);
    if (this.originIndicator) this.originIndicator.rotateOnAxis(axis, radians);
  }
  rotateOnObjectAxis(axis, deltaAngle, deltaSec) {
    this.rotateOnObjectAxisRadians(axis, deltaAngle * deltaSec);
  }
  yaw(deltaAngle, deltaSec) {  //yaw is like a car turning left or right
  //Input: deltaAngle -- radians/sec.  Amount to change/sec
  //       deltaSec -- amount that has elapsed for this animation frame
    this.rotateOnObjectAxis(axisUp, deltaAngle, deltaSec);
  }
  yawRadians(radians) {
    this.rotateOnObjectAxisRadians(axisUp, radians);
  }
  pitch(deltaAngle, deltaSec)  {  //pitch is like a ship nosing up or nosing down.
  //Input: deltaAngle -- radians/sec.  Amount to change/sec
  //       deltaSec -- amount that has elapsed for this animation frame
    this.rotateOnObjectAxis(axisLeft, deltaAngle, deltaSec);
  }
  pitchRadians(radians) {
    this.rotateOnObjectAxisRadians(axisLeft, radians);
  }
  roll(deltaAngle, deltaSec)  {  //roll is like a barrel roll in an airplane.
  //Input: deltaAngle -- radians/sec.  Amount to change/sec
  //       deltaSec -- amount that has elapsed for this animation frame
    this.rotateOnObjectAxis(axisIn, deltaAngle, deltaSec);
  }
  rollRadians(radians) {
    this.rotateOnObjectAxisRadians(axisIn, radians);
  }
  setPosition(P) {  //unify moving of this.position into one function
    super.setPosition(P);
    if (this.object) this.object.position.copy(P);
    if (this.originIndicator) this.originIndicator.position.copy(P);
    if ((this.object)&&(!this.object.tmgID)) this.object.tmgID = this.tmgID;
  }
  lookAtVelocity () {  //orient in direction of velocity
    if (this.object) this.object.lookAt(this.futurePos);
    if (this.originIndicator) this.originIndicator.lookAt(this.futurePos);
  }
  lookAtTarget(P) {  //instantly look at target vector P
    if (this.object) this.object.lookAt(P);
    if (this.originIndicator) this.originIndicator.lookAt(P);
  }
  rotateTowardsV (targetV, rotationRate, deltaSec)  {  //orient towards direction of targetV
    //Input: targetV -- vector to rotate orientation towards
    //       rotationRate -- radians/sec
    //       deltaSec: milliseconds for this frame
    //results: none
    //debugging=true; //temp!!!
    this.calculateInUpLeft ();
    this.laV = this.inVector;
    projectVectorOntoPlane(this.laV, this.plane)
    targetV.normalize();
    this.targetV = targetV;
    let crossV = this.laV.clone();
    crossV.cross(targetV);  //cross product is perpendicular to both other vectors (up or down)
    let dotProdToUp = this.upVector.dot(crossV);
    let yawLeft = (dotProdToUp > 0);
    let dotProd = this.laV.dot(targetV);   // = |laV| * |targetV| * cos(angle)  And angle is angle between vectors
    let angle = Math.acos(dotProd);
    if (angle > 0.05) {  //ignore rotation when within small angle
      let rotRad = rotationRate * deltaSec;
      if (!yawLeft) rotRad *= -1;  //NOTE: positive rotation does yaw LEFT
      this.yawRadians(rotRad);
    }
  }
  rotateTowardsVelocity(rotationRate, deltaSec)  {  //gradually orient towards direction of object's velocity
    //Input: rotationRate -- radians/sec
    //       deltaSec: milliseconds for this frame
    //results: none
    let fpV = this.velocity.clone();
    if (fpV.length() < 0.1) return;
    this.rotateTowardsV(fpV, rotationRate, deltaSec);
  }
  switchToPlane(targetPlane, silent) {
    //Input: aPlane: type ORBIT_PLANE
    //This assumes that a check has been done and it is appropriate to change planes
    //This rotates the object to parallel the new plane, and maps velocity into new plane.
    if (!this.object) return;
    let rot = this.object.rotation.clone();
    let yaw=rot.y;
    this.object.rotation.set(0,0,0); //this puts nose of ship in +Z direction, flat on xz plane
    switch(targetPlane) {
      case ORBIT_PLANE.xz:
        if (this.plane == ORBIT_PLANE.xy) {        //change y --> z
          this.velocity.z = this.velocity.y; this.velocity.y = 0;
          this.position.z = this.position.y; this.position.y = 0;
          //object already on xz plane, so no rotation needed.
        } else if (this.plane == ORBIT_PLANE.yz) { //change y --> x
          this.velocity.x = this.velocity.y; this.velocity.y = 0;
          this.position.x = this.position.y; this.position.y = 0;
          //object already on xz plane, so no rotation needed.
        }
        break;
      case ORBIT_PLANE.xy:
        this.object.rotation.x = -Pi/2; //change nose to +z into nose to +y
        this.object.rotation.z = Pi;    //roll onto belly
        if (this.plane == ORBIT_PLANE.xz) {        //change z --> y
          this.velocity.y = -this.velocity.z; this.velocity.z = 0;
          this.position.y = this.position.z; this.position.z = 0;
        } else if (this.plane == ORBIT_PLANE.yz) { //change z --> x
          this.velocity.x = this.velocity.z; this.velocity.z = 0;
          this.position.x = this.position.z; this.position.z = 0;
        }
        break;
      case ORBIT_PLANE.yz:
        this.object.rotation.z = -Pi/2; //keep nose to +z, but barrel-roll onto side
        if (this.plane == ORBIT_PLANE.xz) {        //change x--> y
          this.velocity.y = this.velocity.x; this.velocity.x = 0;
          this.position.y = this.position.x; this.position.x = 0;
        } else if (this.plane == ORBIT_PLANE.xy) { //change x --> z
          this.velocity.z = this.velocity.x; this.velocity.x = 0;
          this.position.z = this.position.x; this.position.x = 0;
        }
        break;
    } //switch
    this.yawRadians(yaw);
    this.plane = targetPlane;
    gameCamera.handlePlaneChange(this, silent);
  }
  allLoaded() {
    return this.loaded;
  }
  getGravityAccelV(aBody, deltaSec) {
    //Input -- aBody -- TCelestialBody
    //         deltaSec -- elapsed time for this frame
    //result: an acceleration vector (a deltaVelocity vector) -- NOT deltaV/sec

    // F = M*A
    // M1 * A1 = F = GRAV_CONST * M1 * M2 / (dist^2)
    // simplifies to:
    //      A1 = GRAV_CONST * M2 / (dist^2)   <-- A1 is acceleration of Mass1
    let distSquaredVoxel = this.position.distanceToSquared ( aBody.position );
    let distSquared = distSquaredVoxel * worldConvSquared * 1000 * 1000;  //meters^2
    let accel = (GRAV_CONST * aBody.mass) / distSquared; //units is delta meters/sec^2
    let deltaV = new THREE.Vector3(0,0,0);
    let deltaVScale = accel *  deltaSec / 1000; //units are delta km/sec
    deltaVScale = deltaVScale / worldConv; //units voxel/sec
    deltaV.subVectors(aBody.position, this.position);  //get vector pointing at sun
    deltaV.setLength(deltaVScale);  //units are delta voxels/sec
    return deltaV;
  }
  animateArrows(deltaSec) {
    //this is called from T3DPoint.animate()
    if (this.arrows.length == 0) return;
    if (!this.arrowsOffset) {
      super.animateArrows(deltaSec);
    } else {
      let position = this.arrowsOffset.combineWithObjectPosition(this);
      for (var i = 0; i < this.arrows.length; i++) {
        this.arrows[i].position.copy(position);
      }
    }
  }
  animate(deltaSec)  {
    super.animate(deltaSec);
    this.setPosition(this.position); //ensure everything with changes made by T3DPoint
    if (!disableGravity) {
      //Later I can make a loop that cycles through all other objects
      //  and gets force from each -- i.e. could have 2 suns...
      let deltaV = this.getGravityAccelV(sun, deltaSec);
      this.accelerate(deltaV)
    }
  }
  offsetPos(offset) {
    //input: offset -- a TOffset
    //Example use:  A value of (2, 1, -3) for offset means T3DObject's
    //            T3DObject.position + T3DObject.inV * 2
    //                               + T3DObject.upV * 1
    //                               + T3DObject.leftV * 1
    //Result: returns this.positon + offset
    let result = offset.combineWithObjectPosition(this);
    return result;
  }
  offsetVelocity(offset) {
    //input: offset -- a TOffset
    //Example use:  A value of (2, 1, -3) for offset means T3DObject's
    //            T3DObject.velocity + T3DObject.inV * 2
    //                               + T3DObject.upV * 1
    //                               + T3DObject.leftV * 1
    //Result: returns this.positon + offset
    let result = offset.combineWithObjectAddVector(this, this.velocity);
    return result;
  }
  acceptDamage(damageValue, otherObj) {
    this.cumulativeDamageValue += damageValue;
    if (this.cumulativeDamageValue > this.damageToExplode) {
      this.explode();
    }  
  }  
  hide() {
    this.position.copy(nullV);
    this.velocity.copy(nullV);
    this.visible = false;
    if (this.object) scene.remove(this.object);
    if (this.originIndicator) scene.remove(this.originIndicator);
  }
  unhide() {
    this.addToScene();
    if (this.originIndicator) scene.add(this.originIndicator);
    this.visible = true;
  }
  explode() {  //override in descendants for points etc...
    this.hide();
    this.cumulativeDamageValue = 0;
    explosionManager.emitByParams({
       initPosition: this.position,
       initVelocity: this.velocity,
    })
  }
  setScaleV(scaleV) {
    if (this.object) this.object.scale.copy(scaleV);
    this.modelScaleV.copy(scaleV);
  }
  setScale(scalar) {
    let scaleV = new THREE.Vector3(scalar, scalar, scalar);
    this.setScaleV(scaleV);
  }
  resetPositionToInit() {
    super.resetPositionToInit();
    if (this.object) this.object.rotation.set(0,0,0);
    this.plane = ORBIT_PLANE.xz;
    if (!this.visible) this.unhide();
  }

}
