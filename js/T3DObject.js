//T3DPoint is defined in T3DPoint.js


/*
class T3DObject {
  //---- member properties/attributes -------
  this.rotationVelocity  //units are delta radians/sec
  this.loaded  
  this.showPosMarker  
  this.showCameraAttachmentMarker   
  this.modelScaleV  
  this.object   //this will be the THREE.Object3D for the vehicle
  this.objectOffset  //this is an Offset displacing 3D model from game position.
  this.plane 
  //--------- member functions --------------
  constructor() {
  get inV() {
  get upV() {
  get leftV() {
  get futurePos() {
  lookingAtPosAtOrigin(distance) {  
  lookingAtPos(distance)  {
  getInUpLeft(inV, upV, leftV) {
  calculateInUpLeft () {
  yaw(deltaAngle, deltaSec) {
  pitch(deltaAngle, deltaSec)  {
  roll(deltaAngle, deltaSec)  {
  lookAtVelocity () {
  rotateTowardsV (targetV, rotationRate, deltaSec)  {
  rotateTowardsVelocity (rotationRate, deltaSec)  {
  animate(deltaSec)  {
  offsetPos(offset) {
  offsetVelocity(offset) {
  handleRocketStrike(rocket) {
  otherObjetsInDistSq(objArray, distSq) {
  hide() {
  unhide() {
  explode() {  //override in descendants for points etc...
  setScaleV(scaleV) {
  setScale(scalar) {
}

*/

class T3DObject extends T3DPoint {
  constructor(params) {
    //Input:           
    //  params.mass
    //  params.name
    //  params.initPosition
    //  params.modelScale             -- optional, default = 1
    //  params.plane                  -- optional.  default ORBIT_PLANE.xz
    //  params.showPosMarker          -- default is false
    //  params.excludeFromGameObjects -- default is false
    //  params.showArrow1             -- default is false
    //  params.showArrow2             -- default is false
    //  params.showArrow3             -- default is false
    //  params.arrowsOffset           -- default is null (only applies if showArrow# is true)
    //-----------------------
    super(params);
    this.rotationVelocity = new THREE.Vector3(); //units are delta radians/sec
    this.loaded = false;
    let modelScale = params.modelScale||1
    this.modelScaleV = new THREE.Vector3(modelScale, modelScale, modelScale);
    this.object = null;                          //this will be the THREE.Object3D for descendents
    this.objectOffset = new TOffset(0,0,0);      //this is an Offset displacing 3D model/object from game position.
    this.plane = params.plane||ORBIT_PLANE.xz;
    this.visible = true;
    this.showPosMarker = (params.showPosMarker == true);
    if (this.showPosMarker == true) {
      this.originIndicator = new THREE.AxisHelper(20);  //An Axis bars to visualize where location and orientation of object
      scene.add(this.originIndicator);
    }
    if (!params.excludeFromGameObjects) gameObjects.push(this);
    if (params.arrowsOffset) this.arrowsOffset = params.arrowsOffset;
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
      this.object.matrix.extractBasis (leftV, upV, inV);
  }
  calculateInUpLeft () {
    this.inVector = new THREE.Vector3();  //in is Z axis for loaded object, initially
    this.upVector = new THREE.Vector3();  //up is Y axis, initially
    this.leftVector = new THREE.Vector3();//left is X axis for loaded object, initially
    this.object.matrix.extractBasis (this.leftVector, this.upVector, this.inVector)
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
  yaw(deltaAngle, deltaSec) {  //yaw is like a car turning left or right
    this.calculateInUpLeft ();
    this.object.rotateOnAxis(this.upV, deltaAngle * deltaSec);
    if (this.originIndicator) this.originIndicator.rotateOnAxis(this.upV, deltaAngle * deltaSec);
  }
  pitch(deltaAngle, deltaSec)  {  //pitch is like a ship nosing up or nosing down.
  //Input: deltaAngle -- radians/sec.  Amount to change/sec
  //       deltaSec -- amount that has elapsed for this animation frame
  //results: none
    this.calculateInUpLeft ();
    this.object.rotateOnAxis(this.leftV, deltaAngle * deltaSec);
    if (this.originIndicator) this.originIndicator.rotateOnAxis(this.leftV, deltaAngle * deltaSec);
  }
  roll(deltaAngle, deltaSec)  {  //roll is like a barrel roll in an airplane.
  //Input: deltaAngle -- radians/sec.  Amount to change/sec
  //       deltaSec -- amount that has elapsed for this animation frame
  //results: none
    this.calculateInUpLeft ();
    this.object.rotateOnAxis(this.inV, deltaAngle * deltaSec);
    if (this.originIndicator) this.originIndicator.rotateOnAxis(this.inV, deltaAngle * deltaSec);
  }
  setPosition(P) {  //unify moving of this.position into one function
    this.position.copy(P)          
    this.object.position.copy(P);
    if (this.originIndicator) this.originIndicator.position.copy(P);  
    if ((this.object)&&(!this.object.tmgID)) this.object.tmgID = this.tmgID;
  }          
  lookAtVelocity () {  //orient in direction of velocity
    this.object.lookAt(this.futurePos);
    if (this.originIndicator) this.originIndicator.lookAt(this.futurePos);
  }
  lookAtTarget(P) {  //instantly look at target vector P
    this.object.lookAt(P);
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
    //globalDebugMessage = 'dotProd = ' + dotProd.toFixed(4) +  
    //   ', angle = ' + angle.toFixed(4) + ', yawLeft: ' + yawLeft + ', crossProd length: ' + crossV.length().toFixed(4);
    if (angle > 0.1) {  //ignore rotation when within small angle
      let rotRad = rotationRate * deltaSec;
      //NOTE: positive rotation does yaw LEFT
      if (!yawLeft) rotRad *= -1;  //NOTE: positive rotation does yaw LEFT
      this.object.rotateOnAxis(this.upVector, rotRad);      
      if (this.originIndicator) this.originIndicator.rotateOnAxis(crossV, rotRad);
    }
  }
  rotateTowardsVelocity (rotationRate, deltaSec)  {  //gradually orient towards direction of object's velocity
    //Input: rotationRate -- radians/sec
    //       deltaSec: milliseconds for this frame
    //results: none
    let fpV = this.velocity.clone();
    if (fpV.length() < 0.1) return;
    this.rotateTowardsV(fpV, rotationRate, deltaSec);
  }
  allLoaded() {
    return this.loaded;
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
  handleRocketStrike(rocket) {
    //this can be overridden in descendents to handle missle strikes. 
    this.explode();
  }    
  otherObjetsInDistSq(objArray, distSq) {
    //Cycle through other objects and check distance to them, addding to 
    //  array all objects (T3DObjects) close enough
    //Input: objArray -- an OUT parameter
    //       distSq -- the square of the proximity distance
    let p = new THREE.Vector3();
    for (var i=0; i < gameObjects.length; i++) {
      if (gameObjects[i] == this) continue;            
      p.copy(gameObjects[i].position);
      p.sub(this.position);
      if (p.lengthSq() < distSq) objArray.push(gameObjects[i]);
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
    //if (this.object) scene.add(this.object);
    if (this.originIndicator) scene.add(this.originIndicator); 
    this.visible = true;
  }  
  explode() {  //override in descendants for points etc...
    //FINISH -- launch explosion animation
    this.hide(); 
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
    if (!this.visible) this.unhide();
  }
  
}


