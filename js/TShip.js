//TVehicle defined in TVehicle.js

/*
class TShip extends TVehicle {
  constructor (mass, aName) {
  set throttle(value) {
  get throttle() {
  rocketsLoaded() {
  allLoaded() {
  launchRocket() {
  //loadSounds(audioListener, audioLoader) {
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
    //  params.excludeWingSmokePS  --default = false
    //  params.excludeEnginePS     -- default is false
    //-----------------------
    params.maxThrust = SHIP_THRUST_MAX;
    params.showPosMarker = SHIP_SHOW_POS_MARKER;
    params.showCameraAttachmentMarker = SHIP_SHOW_CAMERA_ATTACHEMENT_MARKER;
    params.showCockpitLookat = SHIP_SHOW_COCKPIT_LOOKAT;
    params.showCockpitPosition = SHIP_SHOW_COCKPIT_POS;
    params.maxVelocity = SHIP_VELOCITY_MAX;
    params.engineSoundFName = SHIP_SOUND_ENGINE;
    params.explodeSoundFName = SHIP_SOUND_EXPLODE;
    params.engineSoundMaxVolume = SHIP_SOUND_ENGINE_MAX_VOLUME,
    params.explodeSoundVolume = SHIP_SOUND_EXPLODE_MAX_VOLUME
    params.teleportSoundFName = TELEPORT_SOUND;
    params.teleportSoundVolume = TELEPORT_SOUND_VOLUME;
    //------------------------
    super(params);
    this.cockpitOffset.set(25,10,0);           //location of cockpit relative to object
    this.cameraAttachmentOffset = new TOffset(-40,20,0); //location of camera attachemnt relative to object
    this.objectOffset.set(5, 0, 0);    //this is Offset displacing 3D model from game position.
    if (params.excludeWingSmokePS !== true) {
      this.wingSmokeLeftPS = new TParticleSys({ name: 'ship_L_smoke_p_sys',
                                               parent: this,
                                              emitRate: 10,
                                             positionOffset: new TOffset(10,5,20),
                                           velocityOffset: new TOffset(-40,0,0),
                                          decaySec: 1,
                                         initScale: 4,
                                        posVariance: 0,
                                       decayVariance: 10,
                                      scaleVariance: 10,
                                     velocityVariance: 10,
                                   colors: GRAY_SPRITE_COLORS,
                                  });
      this.wingSmokeRightPS = new TParticleSys({ name: 'ship_R_smoke_p_sys',
                                                parent: this,
                                               emitRate: 10,
                                              positionOffset: new TOffset(10,5,-20),
                                             velocityOffset: new TOffset(-40,0,0),
                                            decaySec: 1,
                                           initScale: 4,
                                          posVariance: 0,
                                         decayVariance: 10,
                                        scaleVariance: 10,
                                       velocityVariance: 10,
                                      colors: GRAY_SPRITE_COLORS,
                                     });
    }
    this.gatlingGunPS = new TParticleSys({ name: 'ship_gatling_gun_p_sys',
                                          parent: this,
                                         emitRate: 100,
                                        positionOffset: new TOffset(50,0,0),
                                       velocityOffset: new TOffset(1000,0,0),
                                      decaySec: 1,
                                     initScale: 4,
                                    posVariance: 1,
                                   decayVariance: 0,
                                  scaleVariance: 0,
                                 velocityVariance: 0,
                                colors: WHITE_RED_SPRITE_COLORS,
                               });
    this.gatlingGunThrottle = 0;
    this.gatlingLoopSound = gameSounds.setupSound({  //setup gatling-loop sound
      filename: SHIP_SOUND_GATLING_LOOP,
      loop: true,
      volume: SHIP_SOUND_GATLING_MAX_VOLUME,
    });
    this.gatlingEndSound = gameSounds.setupSound({ //setup gatling-end sound
      filename: SHIP_SOUND_GATLING_END,
      loop: false,
      volume: SHIP_SOUND_GATLING_MAX_VOLUME,
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
  gatlingGunOn() {
    this.gatlingGunThrottle = 100;
    this.gatlingLoopSound.play();
  }
  gatlingGunOff() {
    this.gatlingGunThrottle = 0;
    this.gatlingLoopSound.stop();
    this.gatlingEndSound.play();
  }
  rocketsLoaded() {
    let result = true;
    for (var i=0; i < SHIP_NUM_ROCKETS; i++) {
      result = result && this.rockets[i].loaded;
      if (result == false) break;
    }
    return result;
  }
  allLoaded() {
    let result = super.allLoaded();
    result = result && this.rocketsLoaded();
    if (this.wingSmokeRightPS) result = result && this.wingSmokeRightPS.allLoaded();
    if (this.wingSmokeLeftPS) result = result && this.wingSmokeLeftPS.allLoaded();
    result = result && this.gatlingGunPS.allLoaded();
    result = result && this.gatlingLoopSound.tmgLoaded;
    result = result && this.gatlingEndSound.tmgLoaded;
    //more here if needed
    return result;
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
    let aRocket = this.nextReadyRocket();
    if (aRocket) aRocket.launch();
  }
  handleWrapped(deltaSec, oldPosition) {
    super.handleWrapped(deltaSec, oldPosition);
    animatedPortalManager.emitByParams({
      initPosition: oldPosition,
      initVelocity: nullV.clone(),
    });
    let aPosition = this.position.clone();
    animatedPortalManager.emitByParams({
      initPosition: aPosition,
      initVelocity: nullV.clone(),
    });
  }
  dropBomb() {  //initially, this is just a debug function
    let aPosition = this.position.clone();
    animatedPortalManager.emitByParams({
      initPosition: aPosition,
      initVelocity: nullV.clone(),
    });
  }
  stop() {  //a debug function
    this.velocity.copy(nullV);
    this.rotationVelocity.copy(nullV);
  }
  animate(deltaSec) {
    super.animate(deltaSec);
    autoPointTowardsMotionDelay -= deltaSec;
    if (autoPointTowardsMotionDelay <= 0) {
      autoPointTowardsMotionDelay = 0;
      this.rotateTowardsVelocity (Pi, deltaSec);   //gradually orient towards direction of object's velocity
    }
  }
  animateParticles(deltaSec) {  //animate particle system
    var speed = this.velocity.length();
    var fullEffect = 150; //voxels/second
    var throttle = (speed / fullEffect) * 100;
    if (throttle > 100) throttle = 100;
    if (this.wingSmokeLeftPS) {
      this.wingSmokeLeftPS.throttle = throttle;
      this.wingSmokeLeftPS.animate(deltaSec);
    }
    if (this.wingSmokeRightPS) {
      this.wingSmokeRightPS.throttle = throttle;
      this.wingSmokeRightPS.animate(deltaSec);
    }
    this.gatlingGunPS.throttle = this.gatlingGunThrottle;
    this.gatlingGunPS.animate(deltaSec);
    super.animateParticles(deltaSec);
  }
  handleAction(actionArray, deltaSec)  {
    //Input: Action should be an array of entries from VEHICLE_ACTION
    super.handleAction(actionArray, deltaSec);
    while (actionArray.length > 0) {
      let action = actionArray.pop();
      switch (action) {
        case VEHICLE_ACTION.fireGatlingGun:
          this.gatlingGunOn();
          break;
        case VEHICLE_ACTION.stopGatlingGun:
          this.gatlingGunOff();
          break;
      } //switch
    } //while
  }



}
