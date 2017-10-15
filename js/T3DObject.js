//T3DPoint is defined in T3DPoint.js

/*
class TOffset extends THREE.Vector3 {
  constructor (aIn, aUp, aLeft) {
  get in() {
  set in(value) {
  get up() {
  set up(value) {
  get left() {
  set left(value) {
}

class T3DObject {
  constructor(mass) {
  get inV() {
  get upV() {
  get leftV() {
  get futurePos() {
  get lookingAtPos() {
  getInUpLeft(inV, upV, leftV) {
  calculateInUpLeft () {
  yaw(deltaAngle, deltaSec) {
  pitch(deltaAngle, deltaSec)  {
  roll(deltaAngle, deltaSec)  {
  lookAtVelocity () {
  rotateTowardsV (targetV, rotationRate, deltaSec)  {
  rotateTowardsVelocity (rotationRate, deltaSec)  {
}

*/

// ======= Types ================
class TOffset extends THREE.Vector3 {
  //NOTE: this maps (in, up, left)  to the (x, y, z)  values a Vector3
  //Example use:  A value of (2, 1, -3) for offset means T3DObject's
  //            T3DObject.position + T3DObject.inV * 2
  //                               + T3DObject.upV * 1
  //                               + T3DObject.leftV * -3
  //
  constructor (aIn, aUp, aLeft) {
    super(aIn, aUp, aLeft);
  }
  get in() { return this.x; }
  set in(value) { this.x = value;}
  get up() { return this.y; }
  set up(value) { this.y = value;}
  get left() { return this.z; }
  set left(value) { this.z = value;}

  combineWithObjectVector(object, aVector) {
    //input: object -- A THREE.Object3D
    //       aVector  -- a THREE.Vector3
    //Example use:  A value of (2, 1, -3) for offset means T3DObject's
    //      aVector + this.in * 2
    //              + this.up * 1
    //              + this.leftV * 1
    //Result: returns this.positon + offset
    let inV = new THREE.Vector3();
    let upV = new THREE.Vector3();
    let leftV = new THREE.Vector3();
    object.matrix.extractBasis (leftV, upV, inV)
    let result = aVector.clone();
    inV.multiplyScalar(this.in);
    upV.multiplyScalar(this.up);
    leftV.multiplyScalar(this.left);
    result.add(inV);
    result.add(upV);
    result.add(leftV);
    return result;
  }


}

class T3DObject extends T3DPoint {
  constructor(mass) {
    super(mass);
    this.rotationVelocity = new THREE.Vector3(); //units are delta radians/sec
    this.object = {};                            //this will be the THREE.Object3D for the vehicle
    this.objectOffset = new THREE.Vector3();     //this is a vector displacing 3D model from objects game position.
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
  get lookingAtPos() {
  //Results: return point in front of object, based on current orientation
    this.calculateInUpLeft ();
    let forwardV = this.inV;
    forwardV.multiplyScalar(10);
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
  pitch(deltaAngle, deltaSec)  {  //pitch is like a plane nosing up or nosing down.
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
    let laV = this.lookingAtPos;
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
  }
  offsetPos(offset) {
    //input: offset -- a TOffset
    //Example use:  A value of (2, 1, -3) for offset means T3DObject's
    //            T3DObject.position + T3DObject.inV * 2
    //                               + T3DObject.upV * 1
    //                               + T3DObject.leftV * 1
    //Result: returns this.positon + offset
    let result = offset.combineWithObjectVector(this.object, this.position);
    return result;
  }
  offsetVelocity(offset) {
    //input: offset -- a TOffset
    //Example use:  A value of (2, 1, -3) for offset means T3DObject's
    //            T3DObject.velocity + T3DObject.inV * 2
    //                               + T3DObject.upV * 1
    //                               + T3DObject.leftV * 1
    //Result: returns this.positon + offset
    let result = offset.combineWithObjectVector(this.object, this.velocity);
    return result;
  }

}
