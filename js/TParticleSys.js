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


class TAnimatedParticle extends T3DPoint {
  constructor(params) {
  activate(initPosition, velocityV) {
  inactivate() {
  offsetForTile(tileNum) {
  animateTexture(deltaSec) {
  animate(deltaSec) {
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
class TParticle extends T3DPoint {
  constructor(params) {
    //Input:
    //  params.material       -- a THREE.js material
    //  params.initScale      -- 1 for normal size, 2 for double etc (can be fractional). Default is 1
    //  params.decaySec       -- gives planned time for particle to decrease from initScale to 0.  Default is 1
    //  params.initPosition   -- a THREE.Vector3.  Default is (0,0)
    //  params.velocityV      -- vector for motion of particle.
    //  params.mass           -- default is 1
    //  params.name           -- default is 'particle'
    params.name = params.name||'particle';
    super(params);  
    this.object = new THREE.Sprite(params.material);
    this.private_scale = params.initScale||1;
    this.decaySec = params.decaySec||1;
    if (!params.initPosition) params.initPosition = new THREE.Vector3();
    if (!params.velocityV) params.velocityV = new THREE.Vector3();
    this.activate(this.private_scale, this.decaySec, params.initPosition, params.velocityV);
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
    if (!this.isActive) this.inactivate();
  }
  activate(initScale, decaySec, initPosition, velocityV) {
    this.scale = initScale;       //triggers setter of property
    this.decayRate = initScale / decaySec;  //gives scale decrease/sec
    this.position.copy(initPosition); 
    this.velocity.copy(velocityV);
    scene.add(this.object);    
  }
  inactivate() {
    this.scale = 0;
    scene.remove(this.object);    
  }
}

class TAnimatedParticle extends T3DPoint {
        
//to-do -- change to make descendent of TParticle -- put back in scaling and decay stuff.          
        
//NOTE 1: This is a cousin class, not a descendent class, of TParticle
//NOTE 3: the texture passed in params.materials has some requirements:
//        -- image width must be power of 2: 2,4,8,16,32,64,128,256,512,1024,2048 etc.
//        -- image height must also be power of 2.  Doesn't have to be same as width
//        -- First frame image of sequence should be in upper left.  Then next frame would be
//           to the right, and so on, along first row.  Then wrap like reading a book
//           to begin again at left-hand side of image to 2nd row.
//        -- It is OK for there to be blank spaces at end of sequence.  These will not
//           be shown, as long as correct number of images specified in params.numTiles
//        -- the passed texture will be modified during the animation sequence.  So
//           the image should be unique, or the animation here will affect the appearance
//           of other objects.  
  constructor(params) {
    //Input:
    //  params.texture        -- Required.  A THREE.js texture -- Should be a tiled image containing all frames of animation
    //  params.numTilesHoriz  -- Required.  Should be image height / tile height.  This is the number of rows on the image (including any blank rows needed to make image power of 2 size)
    //  params.numTilesVert   -- Required.  Should be image width / tile width
    //  params.numTiles       -- Required.  Number of frame images in the sequence (don't include trailing empty space needed for power of 2)
    //  params.cycleTime      -- Required.  Number of seconds to show entire animation sequence
    //  params.scale          -- 1 for normal size, 2 for double etc (can be fractional). Default is 1
    //  params.initPosition   -- a THREE.Vector3.  Default is (0,0)
    //  params.velocityV      -- vector for motion of particle.
    //  params.mass           -- default is 1
    //  params.name           -- default is 'particle'
    //  params.loop           -- default is true;
    params.name = params.name||'animated-particle';
    super(params);
    this.isActive = false;
    if (!params.initPosition) params.initPosition = new THREE.Vector3();
    if (!params.velocityV) params.velocityV = new THREE.Vector3();
    this.activate(params.initPosition, params.velocityV);
    this.numTilesHorizontal = params.numTilesHoriz;
    this.numTilesVertical = params.numTilesVert;
    this.scale = params.scale||1;
    this.texture = params.texture;
    this.loop = (params.loop == true);        
    this.numberOfTiles = params.numTiles; //may not be same as tilesHoriz * tilesVert if there are blank tiles at the bottom
    this.texture.wrapS = THREE.RepeatWrapping; 
    this.texture.wrapT = THREE.RepeatWrapping; 
    this.texture.repeat.set(1/this.numTilesHorizontal, 1/this.numTilesVertical);
    this.tileDisplayDuration = params.cycleTime;  // how long should each image be displayed?
    this.material = new THREE.SpriteMaterial({
      map: this.texture, 
      blending: THREE.AdditiveBlending
    });
    this.object = new THREE.Sprite(this.material);
    this.object.position.copy(this.position);
    this.object.scale.set(this.scale, this.scale, this.scale);
  }  
  activate(initPosition, velocityV) {
    this.position.copy(initPosition); 
    this.velocity.copy(velocityV);
    this.isActive = true;
    this.currentDisplayTime = 0;  // how long has the current image been displayed?
    this.currentTileNum = 0; //set index of tile to beginning.  
    this.currentColumn = 0;
    this.currentRow = 0;
    scene.add(this.object);    
  }
  inactivate() {
    this.isActive = false;
    scene.remove(this.object);    
  }
  offsetForTile(tileNum) {
    var result = new THREE.Vector2();
    result.x = this.currentColumn / this.tilesHorizontal;
    result.y = (this.tilesVertical - currentRow - 1) / this.tilesVertical;
    return result;          
  }          
  animateTexture(deltaSec) {
    //NOTE: Code modified from here http://stemkoski.github.io/Three.js/Texture-Animation.html          
    this.currentDisplayTime += deltaSec;
    while (this.currentDisplayTime > this.tileDisplayDuration) {
      this.currentDisplayTime -= this.tileDisplayDuration;
      this.currentTileNum += 1;
      if (this.currentTile >= this.numberOfTiles) {
        if (this.loop) {              
          this.currentTile = 0;
        } else {
          this.inactivate();
          break;
        }        
      }  
      this.currentColumn = this.currentTileNum % this.numTilesHorizontal;       //first column is 0
      this.currentRow = Math.floor( this.currentTile / this.tilesHorizontal );  //first row is 0
      while (this.currentRow >= this.numtilesVertical) this.currentRow -= 1;
    }
    texture.offset.copy(offsetForTile(this.currrentTileNum));
  }   
  animate(deltaSec) {
    if (!this.isActive) return;  //no animation if not active
    super.animate(deltaSec);
    this.object.position.copy(this.position);
    this.animateTexture(deltaSec);
  }  
}        


class TParticleSys {
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
    var spriteCanvas = generateSpriteCanvas(this.colors);
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
      particle = new TParticle({
        material: this.aMaterial, 
        initScale: 0, 
        decaySec: 0, 
        initPosition: nullV, 
        velocityV: nullV
      });
      this.particlesArray.push(particle);
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
