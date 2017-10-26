//T3DPoint is defined in T3DPoint.js

/*
class TParticle  extends T3DPoint {
  constructor (aMaterial, initScale, decaySec, initPosition, velocityV) {
  set scale(value) {
  set position(positionV) {
  get isActive() {
  animate(deltaSec) {
  activate(initScale, decaySec, initPosition, velocityV) {
  inactivate() {
}

class TParticleSys {
  constructor(aParent,
              offsetIn, offsetUp, offsetLeft,
              posVariance, decayVariance, scaleVariance) {
  emit(initPosV, directionV, decaySec, initScale ) {  
  get throttle() {
  set throttle(value) {
  init()  {
  getUnusedParticle()  {
  emit() {
  hasActiveParticles() {
  animate(deltaSec) {  
}

*/


// ======= Types ================
class TParticle  extends T3DPoint {
  constructor (aMaterial, initScale, decaySec, initPosition, velocityV) {
    //input: aMateraial -- a THREE.SpriteMaterial
    //       initScale -- 1 for normal size, 2 for double etc (can be fractional)
    //       decaySec -- gives planned time for particle to decrease from initScale to 0
    //       initPosition -- a THREE.Vector3;
    //       velocityV -- vector for motion of particle.
    super(1);  //sprite will have a default mass of 1 kg
    this.object = new THREE.Sprite(aMaterial);
    this.private_scale = initScale;
    this.activate(initScale, decaySec, initPosition, velocityV);
  }
  // == properties =====
  set scale(value) {
    if (value < 0) value = 0;
    if (value > 100) value = 100;  //this is a 100x increase in size
    this.private_scale = value;
    this.object.scale.x = value;
    this.object.scale.y = value;
    this.object.scale.z = value;
  }
  //setPosition(positionV) {
  //  this.position.copy(positionV);
  //  this.object.position.copy(positionV);
  //}
  get isActive() {
    return (this.private_scale > 0.1);
  }
  // == methods =====
  animate(deltaSec) {
    if (!this.isActive) return;  //no animation if not active
    super.animate(deltaSec);
    this.object.position.copy(this.position);
    let newScale = this.private_scale - this.decayRate * deltaSec;
    this.scale = newScale;
  }
  activate(initScale, decaySec, initPosition, velocityV) {
    this.scale = initScale;       //triggers setter of property
    this.decayRate = initScale / decaySec;  //gives scale decrease/sec
    this.position = initPosition; //triggers setter of property
    this.velocity.copy(velocityV);
  }
  inactivate() {
    this.scale = 0;
  }
}


class TParticleSys {
  /*
  constructor(aScene,
              aParent,
              emitRate,
              positionOffset,
              velocityOffset,
              decaySec,
              initScale,
              posVariance, decayVariance, scaleVariance, velocityVariance) {
    */
    constructor(params) {
    //Input:  params.aScene -- a THREE.scene
    //        params.aParent -- should be a T3DObject
    //        params.emitRate -- the number of particles to emit per second
    //        params.positionOffset -- a TOffset, offsets position relative to aParent.position
    //        params.velocityOffset -- a TOffset, offsets particle velocity relative to aParent.velocity;
    //        params.decaySec -- amount of time (seconds) that it takes particle to decay
    //        params.initScale -- initial scale of sprite -- 1 is normal, 2 is double etc, can be fractional
    //        params.posVariance -- % +/- random variance to add to initPosV, so not all from exact same spot.  E.g. 5 --> +/- 5%
    //        params.velocityVariance -- % +/- random to add to x, y, z of direction.  E.g. 5 --> +/- 5%
    //        params.decayVariance -- % +/- random amount of time to add to decaySec.  E.g. 5 --> +/- 5%
    //        params.scaleVariance -- % +/- of size of initial scale.  E.g. 5 --> +/- 5%
    //        params.colors -- JSON object with colors {{pct:0.4, color:'rgba(128,2,15,1)'},...}
    this.scene = params.aScene;
    this.parent = params.aParent;
    this.fullEmitRate = params.emitRate;  //this is emit rate when at full throttle (default)
    this.emitRate = params.emitRate;
    this.private_throttle = 100;  //should be 0-100 for 0-100%
    this.positionOffset = params.positionOffset.clone();
    this.velocityOffset = params.velocityOffset.clone();
    this.decaySec = params.decaySec;
    this.initScale = params.initScale;
    this.posVariance = params.posVariance;
    this.decayVariance = params.decayVariance;
    this.scaleVariance = params.scaleVariance;
    this.velocityVariance = params.velocityVariance;
    this.colors = params.colors;
    this.particlesArray = [];  //will hold TParticles
    this.numToEmit = 0;
    this.init();
  }
  // --- Properties -------
  get throttle() {
    return private_throttle;
  }
  set throttle(value) {
    if (value < 0) value = 0;
    if (value > 100) value = 100;
    this.private_throttle = value;
    this.emitRate = this.fullEmitRate * value / 100;
  }
  // --- Methods -------
  init()  {
    var spriteCanvas = generateSprite(this.colors);
    var textureMap = new THREE.CanvasTexture(spriteCanvas);
    var spriteParams = {
      map: textureMap,
      blending: THREE.AdditiveBlending
    };
    this.aMaterial = new THREE.SpriteMaterial(spriteParams);

  }
  getUnusedParticle()  {
    //look for inactive particle in array.  If none found, than add one to array
    let particle = null;
    let tempParticle = null;
    let arrayLength = this.particlesArray.length;
    for (var i = 0; i < arrayLength; i++) {
      tempParticle = this.particlesArray[i];
      if (tempParticle.isActive == false) {
        particle = tempParticle;
        break;
      }
    }
    if (particle == null) {
      particle = new TParticle(this.aMaterial, 0, 0, nullV, nullV);
      this.particlesArray.push(particle);
      this.scene.add(particle.object);
    }
    return particle;
  }
  emit() {
    let initPosition = this.parent.offsetPos(this.positionOffset);
    initPosition = randomizeVector(initPosition, this.posVariance);
    let initVelocity = this.parent.offsetVelocity(this.velocityOffset);
    initVelocity = randomizeVector(initVelocity, this.velocityVariance);
    let decaySec = randomizeNum(this.decaySec, this.decayVariance);
    let initScale = randomizeNum(this.initScale, this.scaleVariance);
    let particle = this.getUnusedParticle();
    particle.activate(initScale, decaySec, initPosition, initVelocity);
  }
  hasActiveParticles() {
    let result = false;
    let tempParticle = null;
    let arrayLength = this.particlesArray.length;
    for (var i = 0; i < arrayLength; i++) {
      tempParticle = this.particlesArray[i];
      result = result || tempParticle.isActive;
      if (result) break;  //quit as soon as 1 active particle found
    }
    return result;
  }        
  animate(deltaSec) {
    //call emit() based on this.emitRate;
    this.numToEmit += this.emitRate * deltaSec;  //may only increase by 0.0234 particles/cycle
    while (this.numToEmit > 1) {
      this.emit();
      this.numToEmit -= 1;
    }
    //cycle through existing particles, animating each one.
    this.particlesArray.forEach(
      function(particle) {
        particle.animate(deltaSec);
      }
    );
  }
}
