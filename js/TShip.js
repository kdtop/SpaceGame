//TVehicle defined in TVehicle.js

/*
class TShip extends TVehicle {
  constructor (mass, aName) {
  animateParticles(deltaSe) {  //animate particle system
*/


class TShip extends TVehicle {
  constructor (mass, aName) {
    super(mass, aName);
    this.loaded = false;
    this.showPosMarker  = SHOW_SHIP_POS_MARKER; 
    this.showCameraAttachmentMarker = SHOW_CAMERA_ATTACHEMENT_MARKER;
    this.objectOffset.set(5, 0, 0);   
    this.position.set(150,0,0);
    this.maxThrust = SHIP_THRUST_MAX;  //deltaV/sec  default value
    //this.modelBaseRotationY = Pi/2;
    this.loadModel('models/galosha/galosha2.obj');
    this.plane = PLANE_XZ;
    this.wingSmokeLeftPS = new TParticleSys({ aScene: scene, aParent: this, emitRate: 10,
                                            positionOffset : new TOffset(10,5,20),
                                          velocityOffset: new TOffset(-40,0,0),
                                        decaySec: 1, initScale: 4, posVariance: 0,
                                      decayVariance: 10, scaleVariance: 10,  velocityVariance: 10,
                                    colors : GRAY_SPRITE_COLORS,
                                   });
    this.wingSmokeRightPS = new TParticleSys({ aScene: scene, aParent: this, emitRate: 10,
                                            positionOffset : new TOffset(10,5,-20),
                                          velocityOffset: new TOffset(-40,0,0),
                                        decaySec: 1, initScale: 4, posVariance: 0,
                                      decayVariance: 10, scaleVariance: 10,  velocityVariance: 10,
                                    colors : GRAY_SPRITE_COLORS,
                                   });
    this.engineSoundStartOffset = 4;  //Starting at +4 is specific for slow-start engine mp3
  }  //constructor
  launchRocket() {
    if (rocket.visible) return; //if visible, then already launched....
    
    //Later I want to be able to have multiple rockets....
    rocket.launch();
  }  
  loadSounds(audioListener, audioLoader) {
    //NOTE: this will be called by gameSounds object
 
    this.engineSound = new THREE.Audio(audioListener);  
    scene.add(this.engineSound); 
    
    //finish after I figure out closures in classes
    //  i.e. how to reference 'this' in the callback
        
  }    
  animateParticles(deltaSec) {  //animate particle system  
    super.animateParticles(deltaSec);
    var speed = this.velocity.length();
    var fullEffect = 150; //voxels/second
    var throttle = (speed / fullEffect) * 100;
    if (throttle > 100) throttle = 100;
    //set amount of smoke from wings to correlate with ship speed
    this.wingSmokeLeftPS.throttle = throttle;
    this.wingSmokeRightPS.throttle = throttle;
    
    this.wingSmokeLeftPS.animate(deltaSec);  
    this.wingSmokeRightPS.animate(deltaSec);        
  }   //animateParticles 
}
