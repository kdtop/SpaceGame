//TModelObject defined in TModelObject.js

/*
class TVehicle extends TModelObject {
  constructor(params) {
  set throttle(value) {
  get throttle() {
  thrust(accel, deltaSec)  {   //add velocity in direction of IN vector
  explode() {  
  orbit(aBody) {
  getGravityAccelV(aBody, deltaSec) {
  accelerate(deltaV) {
  animateParticles(deltaSec) {  //animate particle system
  animate(deltaSec) {
  resetPositionToInit() {
  hide() {
  unhide() {
  handleAction(actionArray, deltaSec)  {
}

*/


class TVehicle extends TModelObject {
  //NOTe: This class introduces an engine and responds to gravity
  constructor(params) {
    //Input:           
    //  params.mass
    //  params.name
    //  params.initPosition
    //  params.maxThrust                   -- Default = 100 deltaV/sec
    //  params.maxVelocity                 -- Default = 500 deltaV/sec
    //  params.modelFName                  -- required for model loading
    //  params.modelBaseRotationY          -- default = 0  <-- removed
    //  params.autoAddToScene              -- Default = true;
    //  params.modelScale                  -- default = 1
    //  params.plane                       -- default ORBIT_PLANE.xz
    //  params.showCameraAttachmentMarker  -- default is false 
    //  params.showPosMarker               -- default is false
    //  params.showCockpitLookat           -- default is false
    //  params.showCockpitPosition         -- default is false   
    //  params.engineColors                -- default is RED_BLUE_SPRITE_COLORS
    //  params.engineSoundFName            -- required if sound wanted
    //  params.engineSoundMaxVolume        -- default = 1 (0.8 means max volume 80% normal)
    //  params.explodeSoundFName           -- required if sound wanted 
    //  params.excludeEnginePS             -- default is false
    //-----------------------
    super(params);
    //--- private stuff -----
    this.private_throttle = 0;
    //--- public stuff -----
    this.cameraAttachmentOffset = new TOffset(-40,20,0); //Default location of camera attachemnt relative to object
    this.cameraAttachement = new THREE.Vector3();        //When camera is following vehicle, this will be it's target location
    this.cockpitOffset = new TOffset(20,10,0);           //Default location of cockpit relative to object
    this.cockpitPos = new THREE.Vector3();               //when in cockpit mode, this will be camera position
    this.cockpitLookAt = new THREE.Vector3();            //when in cockpit mode, this will be a point in front of ship to look towards
    this.engineSound = null;                             //will be THREE.Audio object
    this.engineSoundStartOffset = 0;
    this.engineSoundMaxVolume = params.engineSoundMaxVolume||1;
    this.maxThrust = params.maxThrust||100;              //deltaV/sec
    this.maxVelocity = params.maxVelocity||500;          //max delta voxels/sec
    let engineColors = params.engineColors||RED_BLUE_SPRITE_COLORS;    
    if (params.excludeEnginePS != true) {
    this.enginePS = new TParticleSys({ name: 'vehicle_engine_p_sys', parent: this, emitRate: 200,
                                      positionOffset : new TOffset(-7,7,0),
                                    velocityOffset: new TOffset(-80,0,0),
                                  decaySec: 1, initScale: 8, posVariance: 2,
                                decayVariance: 10, scaleVariance: 10,  velocityVariance: 10,
                              colors : engineColors,
                            });
    }
    this.showCameraAttachmentMarker = (params.showCameraAttachmentMarker == true); 
    if (this.showCameraAttachmentMarker == true) {
      this.cameraAttachmentMarker = debugPositionMarker.clone();
      scene.add(this.cameraAttachmentMarker);
    }
    this.showCockpitLookat = (params.showCockpitLookat == true);
    if (this.showCockpitLookat == true) {
      this.cockpitLookatMarker = debugPositionMarker.clone();
      scene.add(this.cockpitLookatMarker);
    }
    this.showCockpitPosition = (params.showCockpitPosition == true);
    if (this.showCockpitPosition == true) {
      this.cockpitPositionMarker = debugPositionMarker.clone();
      scene.add(this.cockpitPositionMarker);
    }
    //setup vehicle engine sound
    if (params.engineSoundFName != '') {
      this.engineSoundStartOffset = 0;      
      this.engineSound = gameSounds.setupSound({
        filename: params.engineSoundFName,
        loop: true,
        volume: 1,
      });                
    }
    //setup  explode sound
    if (params.explodeSoundFName != '') {
      this.explodeSound = gameSounds.setupSound({
        filename: params.explodeSoundFName,
        loop: false,
        volume: 1,
      });    
    }    
    this.throttle = 0;
  }
  //=== properties ======
  set throttle(value) {
    if (value < 0) value = 0;
    if (value > 100) value = 100;
    this.private_throttle = value;
    if ((this.engineSound)&&(this.engineSound.tmgLoaded)) {
      if (value > 1) {
        if (!this.engineSound.isPlaying) {  
          this.engineSound.startTime = this.engineSoundStartOffset;  
          this.engineSound.play();  // play the audio
          this.engineSound.setLoop(true);
        }  
        let volume = (2 * value / 100) * this.engineSoundMaxVolume;
        this.engineSound.setVolume(volume);
      } else {
        if (this.engineSound.isPlaying) {
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
  allLoaded() {
    let result = super.allLoaded();
    result = result && this.engineSound.tmgLoaded;
    result = result && this.explodeSound.tmgLoaded;    
    if (this.enginePS) result = result && this.enginePS.allLoaded();
    //more here if needed
    return result;
  }  
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
    if (this.explodeSound) this.explodeSound.play();
  }     
  orbit(aBody) {
  //Input: aBody - TCelestialBody
  //NOTE: formula found here: http://www.physicsclassroom.com/class/circles/Lesson-4/Mathematics-of-Satellite-Motion
  //      V^2 = G * aBody.mass / R
    let aBodyDirV = aBody.position.clone();
    aBodyDirV.sub(this.position);
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
    this.velocity.clampLength(-this.maxVelocity,this.maxVelocity);  //keep velocity length within -500 to 500 voxels/sec
  }
  animateParticles(deltaSec) {  //animate particle system
    if (this.enginePS) this.enginePS.animate(deltaSec);        
  }    
  animate(deltaSec) {
    super.animate(deltaSec);  //First, change postion based on current velocity
    this.animateParticles(deltaSec);  //animate particle system
    //--NOTE: Below calculates velocity etc that will be used to set position during NEXT animation cycle
    this.thrust(this.maxThrust  * this.private_throttle/100, deltaSec);
    if (!disableGravity) {
      //Later I can make a loop that cycles through all other objects
      //  and gets force from each -- i.e. could have 2 suns...
      let deltaV = this.getGravityAccelV(sun, deltaSec);
      this.accelerate(deltaV)
    }
    this.cameraAttachement = this.cameraAttachmentOffset.combineWithObjectPosition(this); //position for following camera attachement
    if (this.cameraAttachmentMarker) this.cameraAttachmentMarker.position.copy(this.cameraAttachement);

    this.cockpitPos = this.cockpitOffset.combineWithObjectPosition(this); //position for cockpit camera    
    if (this.cockpitPositionMarker) this.cockpitPositionMarker.position.copy(this.cockpitPos);
    
    //this.cockpitLookAt = this.lookingAtPos(100).add(this.cockpitPos); //postion for cockpit camera to look at
    this.cockpitLookAt = this.lookingAtPos(100);  //postion for cockpit camera to look at
    if (this.cockpitLookatMarker) this.cockpitLookatMarker.position.copy(this.cockpitLookAt);
    
  }  
  resetPositionToInit() {
    super.resetPositionToInit()
    this.orbit(sun);  //<-- to do, make more generic...
  }
  hide() {
    super.hide();        
    if (this.cameraAttachmentMarker) scene.remove(this.cameraAttachmentMarker);        
    if (this.cockpitLookatMarker)    scene.remove(this.cockpitLookatMarker);        
    if (this.cockpitPositionMarker)  scene.remove(this.cockpitPositionMarker);            
  }
  unhide() {
    super.unhide();          
    if (this.cameraAttachmentMarker) scene.add(this.cameraAttachmentMarker);        
    if (this.cockpitLookatMarker)    scene.add(this.cockpitLookatMarker);        
    if (this.cockpitPositionMarker)  scene.add(this.cockpitPositionMarker);            
  }
  handleAction(actionArray, deltaSec)  {
    //Input: Action should be an array of entries from VEHICLE_ACTION
    while (actionArray.length > 0) {
      let action = actionArray.pop();      
      switch (action) {
        case VEHICLE_ACTION.yawRight:
          this.yaw(-SHIP_ROTATION_RATE, deltaSec);
          autoPointTowardsMotionDelay = AUTO_POINT_DELAY;
          break;                               
        case VEHICLE_ACTION.yawLeft:
          this.yaw(SHIP_ROTATION_RATE, deltaSec);
          autoPointTowardsMotionDelay = AUTO_POINT_DELAY;
          break;
        case VEHICLE_ACTION.pitchUp:
          this.pitch(-SHIP_ROTATION_RATE, deltaSec);
          autoPointTowardsMotionDelay = AUTO_POINT_DELAY;
          break;
        case VEHICLE_ACTION.pitchDn:
          this.pitch(SHIP_ROTATION_RATE, deltaSec);
          autoPointTowardsMotionDelay = AUTO_POINT_DELAY;
          break;        
        case VEHICLE_ACTION.rollRight:
          this.roll(SHIP_ROTATION_RATE, deltaSec);
          autoPointTowardsMotionDelay = AUTO_POINT_DELAY;
          break;        
        case VEHICLE_ACTION.rollLeft:
          this.roll(-SHIP_ROTATION_RATE, deltaSec);
          autoPointTowardsMotionDelay = AUTO_POINT_DELAY;
          break;
        case VEHICLE_ACTION.orientToVelocity:
          this.lookAtVelocity();  //orient in direction of object's velocity
          break;
        case VEHICLE_ACTION.thrustMore:
          this.throttle += SHIP_THROTTLE_DELTA_RATE * deltaSec
          break
        case VEHICLE_ACTION.thrustLess:
          if (this.throttle > 0) this.throttle -= SHIP_THROTTLE_DELTA_RATE * deltaSec
          break
        case VEHICLE_ACTION.launchRocket:
          this.launchRocket();
          break
        case VEHICLE_ACTION.dropBomb:
          if (this.dropBomb) this.dropBomb();
          break
        case VEHICLE_ACTION.stop:
          this.stop();
          break
        case VEHICLE_ACTION.resetPosToInit:
          this.resetPositionToInit();
          break
      } //switch
    } //while  
  }    
    
}
