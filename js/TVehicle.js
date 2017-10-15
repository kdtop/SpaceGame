//T3DObject defined in T3DObject.js

/*
class TVehicle extends T3DObject {
  constructor (mass) {
  thrust(accel, deltaSec)  {
  orbit(aBody) {
  animate(deltaSec) {
  resetPositionToInit(sun) {
}

*/


class TVehicle extends T3DObject {
  constructor (mass) {
    super(mass);
    this.originIndicator = {};                   //An Object3D to visualize where location of ship.position is.
    this.plane = PLANE_UNK;                      //either "xy", or "xz", or "yz" depending on which plane the ship is orbiting in.
    this.cameraTrailing = 30;                    //how far behind object cameraAttachement should be set
    this.cameraAbove = 20;                       //how far above object cameraAttachement should be set
    this.cameraAttachement = new THREE.Vector3();//When camera is following vehicle, this will be it's target location
    this.cockpitForward = 20;                    //When in cockpit mode, this will be how far ahead of object cockpit position is
    this.cockpitAbove = 10;                      //When in cockpit mode, this will be how far above object cockpit position is
    this.cockpitPos = new THREE.Vector3();       //when in cockpit mode, this will be camera position
    this.cockpitLookAt = new THREE.Vector3();    //when in cockpit mode, this will be a point in front of shipt to look towards
    this.PS1 = new TParticleSys(scene, this, 500, new TOffset(0,0,0), new TOffset(0,0,0), 1, 1, 10,10,10, 10);
  }
  thrust(accel, deltaSec)  {   //add velocity in direction of IN vector
  //Input: accel  -- deltaV/sec
  //       deltaSec -- elapsed time for this frame
    this.calculateInUpLeft ();
    this.inV.setLength(accel * deltaSec)
    this.velocity.add(this.inV);
  }
  orbit(aBody) {
  //Input: aBody - TCelestialBody
  //NOTE: formula found here: http://www.physicsclassroom.com/class/circles/Lesson-4/Mathematics-of-Satellite-Motion
  //      V^2 = G * aBody.mass / R
    let aBodyDirV = aBody.position.clone();
    aBodyDirV.sub(ship.position);
    let distToaBody = aBodyDirV.length();  //radius of orbit
    let orbitVelocity = Math.sqrt(GRAV_CONST * aBody.mass / distToaBody);  //scalar speed
    aBodyDirV.normalize();
    let orbitV = aBodyDirV.clone();  //This is a unit length vector
    //The cross product of two vectors gives a third vector at right angles to both.
    //NOTE: Later, when on a different plane, will need to use a different "up" vector
    //      instead of just plusY
    orbitV.cross(plusYV);  //result should be unit length
    orbitV.multiplyScalar(orbitVelocity * 0.0000000000125) ; //Manual adjustment factor found experimentally
    this.velocity.copy(orbitV);
  }
  animate(deltaSec) {
    //Later I can make a loop that cycles through all other objects
    //  and gets force from each -- i.e. could have 2 suns...
    this.PS1.animate(deltaSec);

    //First, change postion based on current velocity
    //Below we will later alter current velocity based on acceleration forces
    super.animate(deltaSec);

    // F = M*A
    // M1 * A1 = F = GRAV_CONST * M1 * M2 / (dist^2)
    // simplifies to:
    //      A1 = GRAV_CONST * M2 / (dist^2)   <-- A1 is acceleration of Mass1

    let distSquaredVoxel = this.position.distanceToSquared ( sun.object.position );
    let distSquared = distSquaredVoxel * worldConvSquared * 1000 * 1000;  //meters^2
    let accel = (GRAV_CONST * sun.mass) / distSquared; //units is delta meters/sec^2

    let deltaV = new THREE.Vector3(0,0,0);
    let deltaVScale = accel *  deltaSec / 1000; //units are delta km/sec
    deltaVScale = deltaVScale / worldConv; //units voxel/sec
    deltaV.subVectors(sun.object.position, this.position);  //get vector pointing at sun
    deltaV.setLength(deltaVScale);  //units are delta voxels/sec
    this.velocity.add (deltaV);     //units are delta voxels/sec
    this.velocity.clampLength(-500, 500);  //keep velocity length within -500 to 500 voxels/sec

    //let deltaPos = this.velocity.clone();
    //deltaPos.multiplyScalar(deltaSec);  //units are now delta voxels.
    //let newPosition = new THREE.Vector3(0,0,0);
    //newPosition.copy(this.position);
    //newPosition.add(deltaPos);
    //let wrapped = wrapPosition(newPosition);
    //this.position.copy(newPosition);

    let newPosition = this.position.clone();
    newPosition.add (this.objectOffset);
    this.object.position.copy (newPosition);
    if (SHOW_SHIP_POS_MARKER == true) {
      this.originIndicator.position.copy (this.position);
    }

    autoPointTowardsMotionDelay -= deltaSec;
    if (autoPointTowardsMotionDelay <= 0) {
      //Below makes ship jitter.  Fix later...
      //this.rotateTowardsVelocity (2*Pi, deltaSec);   //gradually orient towards direction of object's velocity
    }

    this.calculateInUpLeft ();
    let inV = this.inVector;
    let upV = this.upVector;
    let leftV = this.leftVector;

    //Calculate position for following camera attachement
    let cameraV = inV.clone();
    cameraV.multiplyScalar(-1);
    cameraV.setLength(this.cameraTrailing);  //put camera _x_ voxels behind vehicle
    let cameraVUp = upV.clone();
    cameraVUp.setLength(this.cameraAbove);  //and then _x voxels above vehicle
    cameraV.add(cameraVUp);
    cameraV.add(this.position);
    this.cameraAttachement.copy(cameraV);
    //if (SHOW_CAMERA_ATTACHEMENT_MARKER == true) {
    //  this.cameraAttachementMarker.position.copy(cameraV);
    //}

    //Calculate position for cockpit camera
    cameraV = inV.clone();
    cameraV.setLength(this.cockpitForward);  //put cockpit _x_ voxels ahead vehicle
    cameraVUp = upV.clone();
    cameraVUp.setLength(this.cockpitAbove);  //and then _x voxels above vehicle
    cameraV.add(cameraVUp);
    cameraV.add(this.position);
    this.cockpitPos.copy(cameraV);
    //Now calculate a postion for cockpit camera to look at
    cameraV = inV.clone();
    cameraV.setLength(100);
    cameraV.add(this.cockpitPos);
    this.cockpitLookAt.copy(cameraV);
    if (SHOW_CAMERA_ATTACHEMENT_MARKER == true) {
      this.cameraAttachementMarker.position.copy(this.cockpitLookAt);
    }

    //debugShowXfrm(this);  //draw three lines showing matrix orientation

  }
  resetPositionToInit(sun) {
    this.position.set(0, 0, 250);
    this.velocity.set(0, 0,   0);
    this.orbit(sun);
  }


}
