//TVehicle defined in TVehicle.js

/*
class TShip extends TVehicle {
  constructor (mass, aName) {
  launchRocket() {
  loadSounds(audioListener, audioLoader) {
  stop() {
  animateParticles(deltaSe) {  //animate particle system
*/


class TShip extends TVehicle {
  constructor(params) {
    //Input:           
    //  params.mass
    //  params.name
    //  params.initPosition
    //  params.modelFName
    //-----------------------
    params.maxThrust = SHIP_THRUST_MAX;  
    params.showPosMarker = SHIP_SHOW_POS_MARKER; 
    params.showCameraAttachmentMarker = SHIP_SHOW_CAMERA_ATTACHEMENT_MARKER;
    super(params);
    this.objectOffset.set(5, 0, 0);    //this is Offset displacing 3D model from game position.
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
  
  set throttle(value) {
    super.throttle = value
    if (this.wingSmokeLeftPS) this.wingSmokeLeftPS.throttle = value;
    if (this.wingSmokeLeftPS) this.wingSmokeRightPS.throttle = value;
  }   
  get throttle() {
    return super.throttle;          
  }     
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
  stop() {  //a debug function
    this.position.set(250,0,0);
    this.velocity.copy(nullV);
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
