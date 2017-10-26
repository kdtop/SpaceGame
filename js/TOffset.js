/*
class TOffset extends THREE.Vector3 {
  constructor (aIn, aUp, aLeft) {
  get in() {
  set in(value) {
  get up() {
  set up(value) {
  get left() {
  set left(value) {
  combineWithObject(a3DObject) {
  combineWithObjectAddVector(a3DObject, aVector) {
  combineWithObjectPosition(a3DObject) {
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

  combineWithObject(a3DObject) {
    //input: object -- A T3DObject
    //Example use:  A value of (2, 1, -3) for offset means object's...
    //              + this.in * 2
    //              + this.up * 1
    //              + this.leftV * 1
    //Result: returns THREE.VECTOR3.
    let inV = new THREE.Vector3();
    let upV = new THREE.Vector3();
    let leftV = new THREE.Vector3();
    a3DObject.object.matrix.extractBasis (leftV, upV, inV)
    let result = new THREE.Vector3();
    inV.multiplyScalar(this.in);
    upV.multiplyScalar(this.up);
    leftV.multiplyScalar(this.left);
    result.add(inV);
    result.add(upV);
    result.add(leftV);
    return result;
  }
  combineWithObjectAddVector(a3DObject, aVector) {
    //input: object -- A T3DObject
    //Result: a THREE.Vector3
    let result = this.combineWithObject(a3DObject);
    result.add(aVector);
    return result;
  }
  combineWithObjectPosition(a3DObject) {
    //input: object -- A T3DObject
    //Result: a THREE.Vector3
    let result = this.combineWithObject(a3DObject);
    result.add(a3DObject.position);
    return result;
  }
}

