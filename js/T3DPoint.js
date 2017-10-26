
/*
class T3DPoint {
  constructor() {
  animate(deltaSec)  {
  resetPositionToInit() {
}
*/


// ======= Types ================
class T3DPoint {
  constructor(params) {
    //Input:           
    //  params.mass
    //  params.name
    //  params.initPosition
    //-----------------------
    this.name = params.name||'default name';
    this.mass = params.mass||1;                           //the mass of the point
    this.initPosition = new THREE.Vector3();     //Initial position
    this.position = new THREE.Vector3();         //the is the location to be used for game physics
    if (params.initPosition) {
      this.initPosition.copy(params.initPosition);
      this.position.copy(params.initPosition); //set position to initial position, if provided.
    }  
    this.velocity = new THREE.Vector3();         //vector of point's velocity
  }
  animate(deltaSec)  {
    let deltaPos = this.velocity.clone();
    deltaPos.multiplyScalar(deltaSec);  //units are now delta voxels.
    let newPosition = this.position.clone();
    newPosition.add(deltaPos);
    let wrapped = wrapPosition(this, newPosition);
    this.position.copy(newPosition);
  }
  resetPositionToInit() {
    this.position.copy(this.initPosition);
    this.velocity.copy(nullV);
  }
  
}
