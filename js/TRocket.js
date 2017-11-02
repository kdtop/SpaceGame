

class TRocket extends TVehicle {
  constructor(params) {
    //Input:           
    //  params.mass
    //  params.name
    //  params.initPosition
    //  params.modelFName
    //  params.ownerVehicle
    //  params.plane -- optional.  default ORBIT_PLANE.xz
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
    params.engineSoundMaxVolume = 0.30;
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
      volume: 1,
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
    for (var i=0; i < hitArray.length; i++) hitArray[i].handleRocketStrike(this);
    if (shouldExplode) {
      this.explode();  
    }  
  } 
  hitOtherObjects(hitArray) {
    this.otherObjetsInDistSq(hitArray, ROCKET_STRIKE_DIST_SQUARED);
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