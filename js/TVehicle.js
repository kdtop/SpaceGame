//TModelObject defined in TModelObject.js

class TVehicle extends TModelObject {
  //NOTe: This class introduces an engine and responds to gravity
  constructor(params) {
    //Input:           
    //  -- T3DPoint --
    //  params.mass                        -- default is 1
    //  params.name                        -- default is 'default name' 
    //  params.initPosition                -- default is (0,0,0)
    //  params.maxVelocity                 -- Default = 500 deltaV/sec
    //  params.plane                       -- optional.  default ORBIT_PLANE.xz
    //  params.showArrows                  -- default is false.  If true, this overrides the .showArrow# parameters
    //  params.showArrow1                  -- default is false
    //  params.showArrow2                  -- default is false
    //  params.showArrow3                  -- default is false
    //  params.collisionBoxSize            -- default is 5 (this.position +/- 5 voxels/side)
    //  params.showCollisionBox            -- default is false
    //  -- T3DObject --                    
    //  params.modelScale                  -- optional, default = 1
    //  params.showPosMarker               -- default is false
    //  params.excludeFromGameObjects      -- default is false
    //  params.arrowsOffset                -- default is null (only applies if showArrow# is true)
    //  params.damageToExplode             -- default is 100
    //  params.rotationVelocity       -- default is (0,0,0)    
    //  -- TModelObject --                 
    //  params.modelFName                  -- required for model loading
    //  params.modelColor                  -- TColor. Default is (0, 0.5, 1);
    //  params.autoAddToScene              -- optional.  Default = true;
    //  params.showPosMarker               -- optional.  Default is false
    //  params.modelObject                 -- default is null.  If provided, then used as model instead of loading from FName
    //  -- TVehicle --      
    //  params.maxThrust                   -- Default = 100 deltaV/sec
    //  params.showCameraAttachmentMarker  -- default is false 
    //  params.showCockpitLookat           -- default is false
    //  params.showCockpitPosition         -- default is false   
    //  params.engineColors                -- default is RED_BLUE_SPRITE_COLORS
    //  params.engineSoundFName            -- required if sound wanted
    //  params.engineSoundMaxVolume        -- default = 1 (0.8 means max volume 80% normal)
    //  params.explodeSoundFName           -- required if sound wanted 
    //  params.explodeSoundVolume          -- default = 1 (0.8 means max volume 80% normal)
    //  params.excludeEnginePS             -- default is false
    //  params.teleportSoundFName          -- default is none
    //  params.teleportSoundVolume         -- default is 1
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
    this.explodeSoundVolume = params.explodeSoundVolume||1;
    this.engineSoundFName = params.engineSoundFName || '';
    this.explodeSoundFName = params.explodeSoundFName || '';
    this.teleportSoundFName = params.teleportSoundFName || '';
    this.teleportSoundVolume = params.teleportSoundVolume || 1
    this.maxThrust = params.maxThrust||100;              //deltaV/sec
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
    if (this.engineSoundFName != '') {
      this.engineSoundStartOffset = 0;      
      this.engineSound = gameSounds.setupSound({
        filename: this.engineSoundFName,
        loop: true,
        volume: this.engineSoundMaxVolume,
      });                
    }
    //setup explosion sound
    if (this.explodeSoundFName != '') {
      this.explodeSound = gameSounds.setupSound({
        filename: this.explodeSoundFName,
        loop: false,
        volume: this.explodeSoundVolume,
      });    
    }    
    this.throttle = 0;
    //setup teleport sound
    if (this.teleportSoundFName != '') {
      this.teleportSound = gameSounds.setupSound({
        filename: this.teleportSoundFName,
        loop: false,
        volume: this.teleportSoundVolume || 1,
      });    
    }    
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
    //globalDebugMessage = 'Throttle='+this.private_throttle.toString();
  }
  get throttle() {
    return this.private_throttle;
  }
  //=== methods ========
  allLoaded() {
    let result = super.allLoaded();
    result = result && this.engineSound.tmgLoaded;
    result = result && this.explodeSound.tmgLoaded;    
    if (this.teleportSound) result = result && this.teleportSound.tmgLoaded;    
    if (this.enginePS) result = result && this.enginePS.allLoaded();
    //more here if needed
    return result;
  }  
  thrust(accel, deltaSec)  {   //add velocity in direction of IN vector
  //Input: accel  -- SCALAR deltaV/sec
  //       deltaSec -- elapsed time for this frame
    if (accel == 0) return;
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
  switchPlanes() {
    let visibleGrids = gameGrids.getVisibleGrids();
    for (var i=0; i < visibleGrids.length; i++) {
      let aPlane = visibleGrids[i];
      if (aPlane == this.plane) continue;
      this.switchToPlane(aPlane);
      break;
    }  
  }  
  handleWrapped(deltaSec, oldPosition) {
    if (this.teleportSound) this.teleportSound.play();
  }  
  animateArrows(deltaSec) {
    //this is called from T3DPoint.animate()
    //below is debug stuff
    if (this.arrows.length == 0) return;
    super.animateArrows(deltaSec);
    let arrow = this.arrows[0];
    let velDir = this.velocity.clone();
    velDir.normalize()
    arrow.setDirection(velDir);  //red arrow
    
    if (this.arrows.length < 2) return;
    if (!this.laV) return;
    arrow = this.arrows[1];
    arrow.setDirection(this.laV);   //green arrow
    
    if (this.arrows.length < 3) return;
    if (!this.targetV) return;
    arrow = this.arrows[2];
    arrow.setDirection(this.targetV);  //blue arrow
  }    
  animateParticles(deltaSec) {  //animate particle system
    if (this.enginePS) this.enginePS.animate(deltaSec);        
  }    
  animate(deltaSec) {
    super.animate(deltaSec);  //First, change postion based on current velocity
    this.animateParticles(deltaSec);  //animate particle system
    //--NOTE: Below calculates velocity etc that will be used to set position during NEXT animation cycle
    this.thrust(this.maxThrust  * this.private_throttle/100, deltaSec);
    /*
    if (!disableGravity) {
      //Later I can make a loop that cycles through all other objects
      //  and gets force from each -- i.e. could have 2 suns...
      let deltaV = this.getGravityAccelV(sun, deltaSec);
      this.accelerate(deltaV)
    }
    */
    this.cameraAttachement = this.cameraAttachmentOffset.combineWithObjectPosition(this); //position for following camera attachement
    if (this.cameraAttachmentMarker) this.cameraAttachmentMarker.position.copy(this.cameraAttachement);

    this.cockpitPos = this.cockpitOffset.combineWithObjectPosition(this); //position for cockpit camera    
    if (this.cockpitPositionMarker) this.cockpitPositionMarker.position.copy(this.cockpitPos);
    
    //this.cockpitLookAt = this.lookingAtPos(100).add(this.cockpitPos); //postion for cockpit camera to look at
    this.cockpitLookAt = this.lookingAtPos(100);  //postion for cockpit camera to look at
    if (this.cockpitLookatMarker) this.cockpitLookatMarker.position.copy(this.cockpitLookAt);
    
  }  
  resetPositionToInit() {
    super.resetPositionToInit();
    gameCamera.resetPositionToInit();
    this.switchToPlane(ORBIT_PLANE.xz, true);
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
    let unhandled = [];
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
          autoPointTowardsMotionDelay = AUTO_POINT_DELAY;
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
        case VEHICLE_ACTION.switchPlane:
          this.switchPlanes();
          break
        case VEHICLE_ACTION.rotateX:   //for debugging
          this.rotateOnObjectAxis(plusXV, SHIP_ROTATION_RATE, deltaSec);
          break
        case VEHICLE_ACTION.rotateY:   //for debugging
          this.rotateOnObjectAxis(plusYV, SHIP_ROTATION_RATE, deltaSec);
          break
        case VEHICLE_ACTION.rotateZ:   //for debugging
          this.rotateOnObjectAxis(plusZV, SHIP_ROTATION_RATE, deltaSec);
          break  
        default:  
          unhandled.push(action);      
      } //switch
    } //while  
    for (var i=0; i < unhandled.length; i++) {
      actionArray.push(unhandled[i]); //these can be handled by descendant class          
    }  
  }    
    
}
