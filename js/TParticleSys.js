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
}

function initParticle( particle, delay ) {

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
    return (this.private_scale > 0.01);
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
  constructor(aScene,
              aParent,
              emitRate,
              positionOffset,
              velocityOffset,
              decaySec,
              initScale,
              posVariance, decayVariance, scaleVariance, velocityVariance) {
    //Input:  scene -- a THREE.scene
    //        aParent -- should be a T3DObject
    //        emitRate -- the number of particles to emit per second
    //        positionOffset -- a TOffset, offsets position relative to aParent.position
    //        velocityOffset -- a TOffset, offsets particle velocity relative to aParent.velocity;
    //        decaySec -- amount of time (seconds) that it takes particle to decay
    //        initScale -- initial scale of sprite -- 1 is normal, 2 is double etc, can be fractional
    //        posVariance -- % +/- random variance to add to initPosV, so not all from exact same spot.  E.g. 5 --> +/- 5%
    //        velocityVariance -- % +/- random to add to x, y, z of direction.  E.g. 5 --> +/- 5%
    //        decayVariance -- % +/- random amount of time to add to decaySec.  E.g. 5 --> +/- 5%
    //        scaleVariance -- % +/- of size of initial scale.  E.g. 5 --> +/- 5%
    this.scene = aScene;
    this.parent = aParent;
    this.fullEmitRate = emitRate;  //this is emit rate when at full throttle (default)
    this.emitRate = emitRate;
    this.private_throttle = 100;  //should be 0-100 for 0-100%
    this.positionOffset = positionOffset.clone();
    this.velocityOffset = velocityOffset.clone();
    this.decaySec = decaySec;
    this.initScale = initScale;
    this.posVariance = posVariance;
    this.decayVariance = decayVariance;
    this.scaleVariance = scaleVariance;
    this.velocityVariance = velocityVariance;
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
    var spriteCanvas = generateSprite();
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
  animate(deltaSec) {
    //call emit() based on this.emitRate;
    this.numToEmit += this.emitRate * deltaSec;  //may only increase by 0.0234 particles/cycle
    while (this.numToEmit > 1) {
      this.emit();
      this.numToEmit -= 1;
    }
    //cycle through existing particles, animating each one.
    /*
    let particle = {};
    let arrayLength = this.particlesArray.length;
    for (var i = 0; i < arrayLength; i++) {
      particle = this.particlesArray[i];
      particle.animate(deltaSec);
    }
    */

    //cycle through existing particles, animating each one.
    this.particlesArray.forEach(
      function(particle) {
        particle.animate(deltaSec);
      }
    );
  }
}
