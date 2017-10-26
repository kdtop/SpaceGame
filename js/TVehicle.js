//TModelObject defined in TModelObject.js

/*
class TVehicle extends T3DObject {
  constructor (mass) {
  thrust(accel, deltaSec)  {
  orbit(aBody) {
  animate(deltaSec) {
  resetPositionToInit() {  //override
}

*/


class TVehicle extends TModelObject {
  constructor(params) {
    //Input:           
    //  params.mass
    //  params.name
    //  params.initPosition
    //  params.maxThrust                   -- optional.  Default = 100 deltaV/sec
    //  params.modelFName                  -- required for model loading
    //  params.modelBaseRotationY          -- optional.  default = 0
    //  params.autoAddToScene              -- optional.  Default = true;
    //  params.modelScale                  -- optional, default = 1
    //  params.plane                       -- optional.  default PLANE_XZ
    //  params.showCameraAttachmentMarker  -- default is false 
    //  params.showPosMarker               -- default is false
    //-----------------------
    super(params);
    //--- private stuff -----
    this.private_throttle = 0;
    //--- public stuff -----
    this.originIndicator = {};                           //An Object3D to visualize where location of ship.position is.
    this.cameraAttachmentOffset = new TOffset(-40,20,0); //location of camera attachemnt relative to object
    this.cameraAttachement = new THREE.Vector3();        //When camera is following vehicle, this will be it's target location
    this.cockpitOffset = new TOffset(20,10,0);           //location of cockpit relative to object
    this.cockpitPos = new THREE.Vector3();               //when in cockpit mode, this will be camera position
    this.cockpitLookAt = new THREE.Vector3();            //when in cockpit mode, this will be a point in front of ship to look towards
    this.engineSound = null;                             //will be THREE.Audio object
    this.engineSoundStartOffset = 0;
    this.maxThrust = params.maxThrust||100;              //deltaV/sec 
    this.enginePS = new TParticleSys({ aScene: scene, aParent: this, emitRate: 200,
                                     positionOffset : new TOffset(-7,7,0),
                                   velocityOffset: new TOffset(-80,0,0),
                                 decaySec: 1, initScale: 8, posVariance: 2,
                               decayVariance: 10, scaleVariance: 10,  velocityVariance: 10,
                             colors : RED_BLUE_SPRITE_COLORS,
                           });
    this.throttle = 0;
  }
  //=== properties ======
  set throttle(value) {
    if (value < 0) value = 0;
    if (value > 100) value = 100;
    this.private_throttle = value;
    if (this.engineSound) {
      if (value > 1) {
        if (!this.engineSound.isPlaying) {  
          this.engineSound.startTime = this.engineSoundStartOffset;  
          this.engineSound.play();  // play the audio
          this.engineSound.setLoop(true); 
        }  
        this.engineSound.setVolume(2*value/100);
      } else {
        if ((this.engineSound)&&(this.engineSound.isPlaying)) {
          this.engineSound.stop();
        }  
      }  
    }
    if (this.enginePS) this.enginePS.throttle = value;
  }
  get throttle() {
    return this.private_throttle;
  }
  //=== methods ========
  thrust(accel, deltaSec)  {   //add velocity in direction of IN vector
  //Input: accel  -- SCALAR deltaV/sec
  //       deltaSec -- elapsed time for this frame
    this.calculateInUpLeft ();
    let deltaV = this.inV.clone();
    deltaV.setLength(accel * deltaSec)
    this.accelerate(deltaV);
  }
  explode() {  
    super.explode(); 
    this.throttle = 0;
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
    orbitV.multiplyScalar(orbitVelocity * 0.0000000000125) ; //Manual adjustment factor found via trial and error
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
  accelerate(deltaV) {
    this.velocity.add (deltaV);            //units are delta voxels -- NOT deltaV/sec
    this.velocity.clampLength(-500,500);  //keep velocity length within -500 to 500 voxels/sec
  }
  animateParticles(deltaSec) {  //animate particle system
    this.enginePS.animate(deltaSec);        
  }    
  animate(deltaSec) {
    super.animate(deltaSec);  //First, change postion based on current velocity
    this.animateParticles(deltaSec);  //animate particle system 
    this.thrust(this.maxThrust  * this.private_throttle/100, deltaSec);

    if (!disableGravity) {
      //Later I can make a loop that cycles through all other objects
      //  and gets force from each -- i.e. could have 2 suns...
      let deltaV = this.getGravityAccelV(sun, deltaSec);
      this.accelerate(deltaV)
    }

    //set position of model relative to current object position
    this.object.position.copy(this.objectOffset.combineWithObjectPosition(this));

    autoPointTowardsMotionDelay -= deltaSec;
    if (autoPointTowardsMotionDelay <= 0) {
      //Below makes ship jitter.  Fix later...
      //this.rotateTowardsVelocity (2*Pi, deltaSec);   //gradually orient towards direction of object's velocity
    }

    this.cameraAttachement = this.cameraAttachmentOffset.combineWithObjectPosition(this); //position for following camera attachement
    this.cockpitPos = this.cockpitOffset.combineWithObjectPosition(this); //position for cockpit camera
    this.cockpitLookAt = this.lookingAtPos(100).add(this.cockpitPos); //postion for cockpit camera to look at

    if (this.showPosMarker) this.originIndicator.position.copy(this.position);
    if (this.showCameraAttachmentMarker) this.cameraAttachementMarker.position.copy(this.cameraAttachement);
    //debugShowXfrm(this);  //draw three lines showing matrix orientation    
  }
  
  resetPositionToInit() {
    super.resetPositionToInit()
    this.orbit(sun);  //<-- to do, make more generic...
  }
}
