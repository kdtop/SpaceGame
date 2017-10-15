

// ======= Types ================
class T3DPoint {
  constructor(aMass) {
    this.mass = aMass;                           //the mass of the point
    this.position = new THREE.Vector3();         //the is the location to be used for game physics
    this.velocity = new THREE.Vector3();         //vector of point's velocity
  }
  animate(deltaSec)  {
    let deltaPos = this.velocity.clone();
    deltaPos.multiplyScalar(deltaSec);  //units are now delta voxels.
    let newPosition = this.position.clone();
    newPosition.add(deltaPos);
    let wrapped = wrapPosition(newPosition);
    this.position.copy(newPosition);
  }
}
