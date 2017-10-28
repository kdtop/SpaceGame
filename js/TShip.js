//TVehicle defined in TVehicle.js

/*
class TShip extends TVehicle {
  constructor (mass, aName) {
  set throttle(value) {
  get throttle() {
  rocketsLoaded() {  
  launchRocket() {
  loadSounds(audioListener, audioLoader) {
  stop() {
  animateParticles(deltaSe) {  //animate particle system
  animate(deltaSec) {  
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
    params.showCockpitLookat = SHIP_SHOW_COCKPIT_LOOKAT;
    params.showCockpitPosition = SHIP_SHOW_COCKPIT_POS;
    params.maxVelocity = SHIP_VELOCITY_MAX;
    params.engineSoundFName = 'audio/effects/Rocket-SoundBible.com-941967813.mp3';
    params.explodeSoundFName = ROCKET_SOUND_EXPLODE;

    super(params);
    this.cockpitOffset.set(25,10,0);           //location of cockpit relative to object
    this.cameraAttachmentOffset = new TOffset(-40,20,0); //location of camera attachemnt relative to object
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
    this.rockets = [];
    let leftWingTip = -(SHIP_WING_SPREAD/2);
    let spanPerRocket = SHIP_WING_SPREAD/SHIP_NUM_ROCKETS;
    for (var i=0; i < SHIP_NUM_ROCKETS; i++) {
      let aRocket = new TRocket({ mass: ROCKET_MASS,
                                name: 'rocket-' + i.toString(), 
                              ownerVehicle: this, 
                            modelFName: ROCKET_MODEL_FNAME, 
                          initPosition: nullV
                        });
      let leftOffset =  leftWingTip + i*spanPerRocket + spanPerRocket/2;
      aRocket.offsetFromOwner.left = leftOffset;
      this.rockets.push(aRocket);                  
    }            
  }  //constructor     
  set throttle(value) {
    super.throttle = value
    if (this.wingSmokeLeftPS) this.wingSmokeLeftPS.throttle = value;
    if (this.wingSmokeLeftPS) this.wingSmokeRightPS.throttle = value;
  }   
  get throttle() {
    return super.throttle;          
  }   
  
  rocketsLoaded() {
    //later I will expande this to multiple rockets.
    let result = false;
    for (var i=0; i < SHIP_NUM_ROCKETS; i++) {
      result = result||this.rockets[i].loaded;
      if (result) break;
    }        
    return result;          
    //return this.rocket.loaded;          
  }
  nextReadyRocket()  {  //returns a TRocket, or null
    let result = null;          
    for (var i=0; i < SHIP_NUM_ROCKETS; i++) {
      if (this.rockets[i].visible) continue;
      result = this.rockets[i];
      break;
    }        
    return result;          
  }        
  launchRocket() {
    //if (this.rocket.visible) return; //if visible, then already launched....
    //this.rocket.launch();
    let aRocket = this.nextReadyRocket();
    if (aRocket) aRocket.launch();
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
    //TO DO -- try commenting out lines below. I think not needed.  
    this.wingSmokeLeftPS.throttle = throttle;
    this.wingSmokeRightPS.throttle = throttle;
    
    this.wingSmokeLeftPS.animate(deltaSec);  
    this.wingSmokeRightPS.animate(deltaSec);        
  } 
  animate(deltaSec) {
    super.animate(deltaSec);
    //this.rocket.animate(deltaSec);    
    for (var i=0; i < SHIP_NUM_ROCKETS; i++) {
      this.rockets[i].animate(deltaSec);
    }                
  }  
}
