

class TRocket extends TVehicle {
  constructor(params) {
    //Input:           
    //  params.mass
    //  params.name
    //  params.initPosition
    //  params.modelFName
    //  params.ownerVehicle
    //  params.plane -- optional.  default PLANE_XZ
    //-----------------------
    params.modelBaseRotationY = Pi/2;
    params.maxThrust = ROCKET_THRUST_MAX;  //deltaV/sec  
    params.autoAddToScene = false;
    params.modelScale = 0.75;
    params.showPosMarker  = ROCKET_SHOW_POS_MARKER; 
    params.showCameraAttachmentMarker = ROCKET_SHOW_CAMERA_ATTACHEMENT_MARKER;
    super(params);
    this.lifeSpanTime = ROCKET_LIFESPAN;  //seconds until explosion
    this.remainingLifeSpan = 0;
    this.ownerVehicle = params.ownerVehicle||null;
    this.visible = false; //true means rocket is moving independently
    this.offsetFromOwner = new TOffset(60,0,0);   //location of this relative to owner vehicle
    this.hide();
  }  
  explode() {  
    super.explode(); 
    //more here if needed....
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
  launch() {
    //calculate launch postion based on owner
    let newPosition = this.offsetFromOwner.combineWithObjectPosition(this.ownerVehicle);
    this.velocity.copy(this.ownerVehicle.velocity);
    this.position.copy(newPosition);
    this.object.lookAt(this.ownerVehicle.lookingAtPos(100));
    this.unhide();
    this.throttle = 100;
    this.visible = true;
    //this.setScaleV(this.normalScale);
    this.remainingLifeSpan = this.lifeSpanTime;
  }    
}