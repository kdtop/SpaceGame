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
  function lookingAtPos(distance)  {
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
    //  params.modelScale  -- optional, default = 1
    //  params.plane -- optional.  default PLANE_XZ
    //-----------------------
    super(params);
    this.rotationVelocity = new THREE.Vector3(); //units are delta radians/sec
    this.loaded = false;
    this.showPosMarker = false; 
    this.showCameraAttachmentMarker = false; 
    let modelScale = params.modelScale||1
    this.modelScaleV = new THREE.Vector3(modelScale, modelScale, modelScale);
    this.object = null;                          //this will be the THREE.Object3D for descendents
    this.objectOffset = new TOffset(0,0,0);      //this is an Offset displacing 3D model/object from game position.
    this.plane = params.plane||PLANE_XZ;
    this.visible = true;
    gameObjects.push(this);
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
  lookingAtPos(distance) {
  //Results: return point in front of object, based on current orientation
    this.calculateInUpLeft ();
    let forwardV = this.inV;
    forwardV.multiplyScalar(distance);
    return forwardV;
  }
  //=== Class Methods =====
  getInUpLeft(inV, upV, leftV) {
    //Input: object -- Object3D
    //       inV -- an OUT parameter.   Returns X axis vector (relative to Matrix)
    //       upV -- an OUT parameter.   Returns Y axis vector (relative to Matrix)
    //       leftV -- an OUT parameter. Returns Z axis vector (relative to Matrix)
    //NOTE: The in and left are relative to loaded ship.  I am unsure if the
    //      ship model is pre-rotated confusing the orientation.
    //results: none
      this.object.matrix.extractBasis (leftV, upV, inV);
  }
  calculateInUpLeft () {
    this.inVector = new THREE.Vector3();  //in is Z axis for loaded ship.
    this.upVector = new THREE.Vector3();  //up is Y axis.
    this.leftVector = new THREE.Vector3();//left is X axis for loaded ship.
    this.object.matrix.extractBasis (this.leftVector, this.upVector, this.inVector)
  }
  yaw(deltaAngle, deltaSec) {  //yaw is like a car turning left or right
    this.calculateInUpLeft ();
    this.object.rotateOnAxis(this.upV, deltaAngle * deltaSec);
  }
  pitch(deltaAngle, deltaSec)  {  //pitch is like a ship nosing up or nosing down.
  //Input: deltaAngle -- radians/sec.  Amount to change/sec
  //       deltaSec -- amount that has elapsed for this animation frame
  //results: none
    this.calculateInUpLeft ();
    this.object.rotateOnAxis(this.leftV, deltaAngle * deltaSec);
  }
  roll(deltaAngle, deltaSec)  {  //roll is like a barrel roll in an airplane.
  //Input: deltaAngle -- radians/sec.  Amount to change/sec
  //       deltaSec -- amount that has elapsed for this animation frame
  //results: none
    this.calculateInUpLeft ();
    this.object.rotateOnAxis(this.inV, deltaAngle * deltaSec);
  }
  lookAtVelocity () {  //orient in direction of velocity
    this.object.lookAt(this.futurePos);
  }
  rotateTowardsV (targetV, rotationRate, deltaSec)  {  //orient towards direction of targetV
    //Input: targetV -- vector to rotate orientation towards
    //       rotationRate -- radians/sec
    //       deltaSec: milliseconds for this frame
    //results: none
    let laV = this.lookingAtPos(10);
    let crossV = laV.cross(targetV);  //cross product is perpendicular to both other vectors
    crossV.normalize();
    let dotProd = laV.dot(targetV);   // = |laV| * |targetV| * cos(angle)  And angle is angle between vectors
    let rotRad = rotationRate * deltaSec;
    if (Math.abs(rotRad) > (1/360) * 2*Pi) {  //ignore rotation when within 1 degrees
      if (dotProd > 0) radRad *= -1;
      this.object.rotateOnAxis(crossV, rotRad);
    }
  }
  rotateTowardsVelocity (rotationRate, deltaSec)  {  //gradually orient towards direction of object's velocity
    //Input: rotationRate -- radians/sec
    //       deltaSec: milliseconds for this frame
    //results: none
    let fpV = this.futurePos;
    this.rotateTowardsV(fpV, rotationRate, deltaSec);
  }
  animate(deltaSec)  {
    super.animate(deltaSec);
    this.object.position.copy(this.position);
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
    //this.setScaleV(VERY_TINY_SCALE_V);  //perhaps not needed
    this.position.copy(nullV);
    this.velocity.copy(nullV);
    this.visible = false;
    if (this.object) scene.remove(this.object);
  }  
  unhide() {
    if (this.object) scene.add(this.object);
  }  
  explode() {  //override in descendants for points etc...
    //FINISH -- launch explosion
    this.hide();    
  }     
  setScaleV(scaleV) {
    if (this.object) this.object.scale.copy(scaleV);
    this.modelScaleV.copy(scaleV);
  }   
  setScale(scalar) {
    let scaleV = new THREE.Vector3(scalar, scalar, scalar);        
    this.setScaleV(scaleV);
  }          
}


