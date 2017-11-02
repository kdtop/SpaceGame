
/*
class T3DPoint {
  constructor(params) {
  animate(deltaSec)  {
  resetPositionToInit() {
}
*/

var globalIDCounter = 0;

// ======= Types ================
class T3DPoint {
  constructor(params) {
    //Input:           
    //  params.mass
    //  params.name
    //  params.initPosition
    //-----------------------
    this.name = params.name||'default name';
    this.mass = params.mass||1;                  //the mass of the point
    this.initPosition = new THREE.Vector3();     //Initial position
    this.position = new THREE.Vector3();         //the is the location to be used for game physics
    if (params.initPosition) {
      this.initPosition.copy(params.initPosition);
      this.position.copy(params.initPosition); //set position to initial position, if provided.
    }  
    this.velocity = new THREE.Vector3();         //vector of point's velocity
    this.tmgID = globalIDCounter++;
  }
  addToScene() {  //add this to scene, **if** not already present
    if (!this.object) return;
    let found = false;
    for (var i=0; i < scene.children.length; i++) {
      if (!scene.children[i].tmgID) continue;
      if (scene.children[i].tmgID == this.tmgID) {
        found = true;
        break;
      }  
    };
    if (!found) scene.add(this.object);
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
