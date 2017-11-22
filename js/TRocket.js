

class TRocket extends TVehicle {
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
    //  params.rotationVelocity            -- default is (0,0,0)    
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
    //  -- TShip --
    //  params.excludeWingSmokePS          -- default = false
    //  params.excludeEnginePS             -- default is false
    //  -- TRocket -- 
    //  params.ownerVehicle
    //-----------------------
    params.maxThrust = ROCKET_THRUST_MAX;  //deltaV/sec  
    params.autoAddToScene = false;
    params.modelScale = 0.75;
    params.showPosMarker  = ROCKET_SHOW_POS_MARKER; 
    params.showCameraAttachmentMarker = ROCKET_SHOW_CAMERA_ATTACHEMENT_MARKER;
    params.showCockpitLookat = ROCKET_SHOW_COCKPIT_LOOKAT;
    params.showCockpitPosition = ROCKET_SHOW_COCKPIT_POS;
    params.engineColors = RED_ORANGE_BROWN_SPRITE_COLORS;  
    params.maxVelocity = ROCKET_VELOCITY_MAX;    
    params.engineSoundFName = ROCKET_SOUND_ENGINE;
    params.engineSoundMaxVolume = ROCKET_SOUND_MAX_VOLUME;
    params.explodeSoundFName = ROCKET_SOUND_EXPLODE;
    //------------------------
    super(params);
    this.lifeSpanTime = ROCKET_LIFESPAN;  //seconds until explosion
    this.remainingLifeSpan = 0;
    this.ownerVehicle = params.ownerVehicle||null;
    this.visible = false; //true means rocket is moving independently
    this.offsetFromOwner = new TOffset(40,0,0);   //location of this relative to owner vehicle
    this.enginePS.positionOffset.set(-16,-2,0);
    this.launchSound = gameSounds.setupSound({
      filename: ROCKET_SOUND_LAUNCH,
      loop: false,
      volume: ROCKET_SOUND_LAUNCH_MAX_VOLUME,
    });     
    this.hide();
  }  
  explode() {  
    let aPosition = this.position.clone();  
    let aVelocity = this.velocity.clone();
    super.explode(); 
    aVelocity.multiplyScalar(0.1);  //explosion animation will drift in prior direction at 10% velocity    
    explosionManager.emitByParams({
      initPosition: aPosition,
      initVelocity: aVelocity
    });            
    //more here if needed....
  }
  allLoaded() {
    let result = super.allLoaded();
    result = result && this.launchSound.tmgLoaded;
    //more here if needed
    return result;
  }    
  animate(deltaSec) {
    if (!this.visible) {
      if (this.enginePS.hasActiveParticles()) {
        this.animateParticles(deltaSec);
      }        
      return;  //note: rocket is invisible when not launched
    }
    super.animate(deltaSec);  //First, change postion based on current velocity
    this.remainingLifeSpan -= deltaSec;
    let hitArray = [];  this.hitOtherObjects(hitArray);
    var shouldExplode = ((hitArray.length > 0)||(this.remainingLifeSpan < 0));
    for (var i=0; i < hitArray.length; i++) {
      hitArray[i].acceptDamage(ROCKET_STRIKE_DAMAGE, this);
    }  
    if (shouldExplode) {
      this.explode();  
    }  
  } 
  hitOtherObjects(hitArray) {
    //This is designed so that rocket can explode when in proxmity
    //  to other object, rather than when it collides into the 
    //  other objects collisionBox
    this.otherObjectsInDistSq(hitArray, ROCKET_STRIKE_DIST_SQUARED);
  }
  resetPositionToInit() {
    super.resetPositionToInit(); //<-- this calls unnhide() 
    //This gets called in delayed callback after model loaded.      
    this.hide();  
  }
  launch() {
    //calculate launch postion based on owner
    let newPosition = this.offsetFromOwner.combineWithObjectPosition(this.ownerVehicle);
    this.velocity.copy(this.ownerVehicle.velocity);
    this.setPosition(newPosition);
    this.unhide();
    
    let inV = this.ownerVehicle.inV;
    inV.setLength(100);
    newPosition.add(inV);
    
    //newPosition.copy(this.ownerVehicle.lookingAtPos(100));
    this.lookAtTarget(newPosition);
    this.throttle = 100;
    this.remainingLifeSpan = this.lifeSpanTime;
    
    this.launchSound.play();
  }    
}