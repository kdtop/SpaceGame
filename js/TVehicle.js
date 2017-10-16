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
    this.cameraAttachmentOffset = new TOffset(-30,20,0); //location of camera attachemnt relative to object
    //this.cameraTrailing = 30;                    //how far behind object cameraAttachement should be set
    //this.cameraAbove = 20;                       //how far above object cameraAttachement should be set
    this.cameraAttachement = new THREE.Vector3();//When camera is following vehicle, this will be it's target location
    this.cockpitOffset = new TOffset(20,10,0);   //location of cockpit relative to object
    //this.cockpitForward = 20;                    //When in cockpit mode, this will be how far ahead of object cockpit position is
    //this.cockpitAbove = 10;                      //When in cockpit mode, this will be how far above object cockpit position is
    this.cockpitPos = new THREE.Vector3();       //when in cockpit mode, this will be camera position
    this.cockpitLookAt = new THREE.Vector3();    //when in cockpit mode, this will be a point in front of ship to look towards
    //this.PS1 = new TParticleSys(scene, this, 500, new TOffset(0,0,0), new TOffset(0,0,0), 1, 1, 10,10,10, 10);
    this.PS1 = new TParticleSys({ aScene: scene, aParent: this, emitRate: 200,
                                positionOffset : new TOffset(-7,7,0),
                              velocityOffset: new TOffset(-40,0,0),
                            decaySec: 2, initScale: 8, posVariance: 2,
                          decayVariance: 10, scaleVariance: 10,  velocityVariance: 10 });
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
    let accel = (GRAV_CONST * sun.mass) / distSquared; //units is delta meters/sec^2
    let deltaV = new THREE.Vector3(0,0,0);
    let deltaVScale = accel *  deltaSec / 1000; //units are delta km/sec
    deltaVScale = deltaVScale / worldConv; //units voxel/sec
    deltaV.subVectors(aBody.position, this.position);  //get vector pointing at sun
    deltaV.setLength(deltaVScale);  //units are delta voxels/sec
    return deltaV;
  }
  thrust(accel, deltaSec)  {   //add velocity in direction of IN vector
  //Input: accel  -- SCALAR deltaV/sec
  //       deltaSec -- elapsed time for this frame
    this.calculateInUpLeft ();
    let deltaV = this.inV.clone();
    deltaV.setLength(accel * deltaSec)
    this.accelerate(deltaV);
  }
  accelerate(deltaV) {
    this.velocity.add (deltaV);            //units are delta voxels -- NOT deltaV/sec
    this.velocity.clampLength(-500, 500);  //keep velocity length within -500 to 500 voxels/sec
  }
  animate(deltaSec) {

    this.PS1.animate(deltaSec);  //animate particle system
    super.animate(deltaSec);  //First, change postion based on current velocity

    if (!disableGravity) {
      //Later I can make a loop that cycles through all other objects
      //  and gets force from each -- i.e. could have 2 suns...
      let deltaV = this.getGravityAccelV(sun, deltaSec);
      this.accelerate(deltaV)
    }

    //set position of model relative to current position
    this.object.position.copy(this.objectOffset.combineWithObjectAddVector(this,this.position));

    autoPointTowardsMotionDelay -= deltaSec;
    if (autoPointTowardsMotionDelay <= 0) {
      //Below makes ship jitter.  Fix later...
      //this.rotateTowardsVelocity (2*Pi, deltaSec);   //gradually orient towards direction of object's velocity
    }

    //Calculate position for following camera attachement
    this.cameraAttachement = this.cameraAttachmentOffset.combineWithObjectAddVector(this,this.position);

    //Calculate position for cockpit camera
    this.cockpitPos = this.cockpitOffset.combineWithObjectAddVector(this,this.position);

    //Now calculate a postion for cockpit camera to look at
    this.cockpitLookAt = this.lookingAtPos(100).add(this.cockpitPos);

    //debugShowXfrm(this);  //draw three lines showing matrix orientation
    //if (SHOW_SHIP_POS_MARKER == true) this.originIndicator.position.copy (this.position);
    if (SHOW_CAMERA_ATTACHEMENT_MARKER == true)
      this.cameraAttachementMarker.position.copy(this.cockpitLookAt);
  }
  resetPositionToInit(sun) {
    this.position.set(0, 0, 250);
    this.velocity.set(0, 0,   0);
    this.orbit(sun);
  }


}
