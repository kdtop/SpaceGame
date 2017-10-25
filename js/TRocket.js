

class TRocket extends TVehicle {
  constructor (mass, aName, aVehicle) {
    super(mass, aName);
    this.loaded = false;
    this.showPosMarker  = SHOW_SHIP_POS_MARKER; 
    this.showCameraAttachmentMarker = SHOW_CAMERA_ATTACHEMENT_MARKER;
    this.modelBaseRotationY = Pi/2;
    this.loadModel('models/AVMT300/AVMT300.obj');
    this.normalScale = THREE.Vector3(1, 1, 1);
    this.plane = PLANE_XZ;
    this.maxThrust = ROCKET_THRUST_MAX;  //deltaV/sec    
    this.lifeSpanTime = ROCKET_LIFESPAN;  //seconds until explosion
    this.remainingLifeSpan = 0;
    this.ownerVehicle = aVehicle;
    this.visible = false; //true means rocket is moving independently
    this.offsetFromOwner = new TOffset(0,60,0);   //location of this relative to owner vehicle
    this.hide();
  }  
  animate(deltaSec) {
    if (!this.visible)  return;  //note: rocket is invisible when not launched
    super.animate(deltaSec);  //First, change postion based on current velocity
    this.remainingLifespan -= deltaSec;
    let hitArray = [];  this.hitOtherObjects(hitArray);
    var shouldExplode = ((hitArray.length > 0)||(this.remainingLifespan < 0));
    for (var i=0; i < hitArray.length; i++) hitArray[i].handleRocketStrike(this);
    if (shouldExplode) this.explode();  
  } 
  hitOtherObjects(hitArray) {
    this.otherObjetsInDistSq(hitArray, ROCKET_STRIKE_DIST_SQUARED);
  }
  launch() {
    //calculate launch postion based on owner
    let newPosition = this.offsetFromOwner.combineWithObject(this.ownerVehicle);
    this.position.copy(newPosition);
    this.object.lookAt(this.ownerVehicle.lookingAtPos(100));
    this.unhide();
    this.throttle = 100;
    this.visible = true;
    //this.setScale(this.normalScale);
    this.remainingLifeSpan = this.lifeSpanTime;
  }    
}