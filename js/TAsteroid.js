


class TAsteroid extends TModelObject {
  //This class differs from T3DObject in that the .object here is a loaded model (e.g. .obj file),
  //     wherease in T3DObject, they could be generic constructed sphere etc.  
  constructor(params) {
    //Input:           
    //  ... all params from TModelObject and higher ancestors
    //  (add more here)
    //-----------------------
    params.modelFName = ASTEROID_MODEL_FNAMES[randomInt(1,3)];
    params.name = 'asteroid';
    let greyN = random(0.1,1);
    params.modelColor = new TColor(greyN, greyN, greyN);
    super(params);
    this.rotationVelocity.set(random(0,Pi/2),random(0,Pi/2),random(0,Pi/2));
    this.euler = new THREE.Euler(0,0,0,'XYZ');
  } 
  resetPositionToInit() {
    super.resetPositionToInit();
    this.switchToPlane(ORBIT_PLANE.xz, true);
    this.orbit(sun);  //<-- to do, make more generic...
  }
  animate(deltaSec)  {
    super.animate(deltaSec);
    let rv=this.rotationVelocity.clone();
    rv.multiplyScalar(deltaSec);
    let curEuler = this.object.rotation;
    this.euler.set(curEuler.x + rv.x, curEuler.y + rv.y, curEuler.z + rv.z, 'XYZ');
    this.object.setRotationFromEuler(this.euler);  //make asteroid tumble.  
  }  
} 

/*
//This will by system like AsteroidSystem in that is will recycle asteroids
//  as they are destroyed, and dynamically add new asteroids to pool of available
//  ones as needed. 


class TAsteroidSys {
    constructor(params) {
    //Input:  params.name                   -- an identifier name
    //        params.asteroidNamePrefix     -- default = ''
    //        params.parent                 -- should be a T3DObject
    //        params.emitRate               -- the number of asteroids to emit per second
    //        params.positionOffset         -- a TOffset, offsets position relative to parent.position
    //        params.velocityOffset         -- a TOffset, offsets asteroid velocity relative to parent.velocity;
    //        params.decaySec               -- amount of time (seconds) that it takes asteroid to decay. Default is 1
    //        params.initScale              -- initial scale of sprite -- 1 is normal, 2 is double etc, can be fractional. Default is 1
    //        params.posVariance            -- % +/- random variance to add to initPosV, so not all from exact same spot.  E.g. 5 --> +/- 5%. Default is 5
    //        params.velocityVariance       -- % +/- random to add to x, y, z of direction.  E.g. 5 --> +/- 5% .  Default is 5
    //        params.decayVariance          -- % +/- random amount of time to add to decaySec.  E.g. 5 --> +/- 5%.  Default is 5
    //        params.scaleVariance          -- % +/- of size of initial scale.  E.g. 5 --> +/- 5%.  Default is 5
    //        params.colors                 -- JSON object with colors {{pct:0.4, color:'rgba(128,2,15,1)'},...}    
    //        params.isCollidedTestFn       -- default is undefined.  If passed, should be test func that returns T3DObject if collided
    //        params.onCollidedFn           -- default is undefined.  If isCollided() returns object, then this.onCollidedFn(this, otherObj) is called.              
    //        params.collisionTestFreq      -- default is 0.  Range is 0-1.0.  e.g. if 0.35 that 35% of asteroids will be tested for collision
    this.name = params.name||'undefined';
    this.asteroidNamePrefix = params.asteroidNamePrefix || '';
    this.parent = params.parent;
    this.fullEmitRate = params.emitRate;  //this is emit rate when at full throttle (default)
    this.emitRate = params.emitRate;
    this.private_throttle = 100;  //should be 0-100 for 0-100%
    this.positionOffset = params.positionOffset.clone();
    this.velocityOffset = params.velocityOffset.clone();
    this.decaySec = params.decaySec||1;
    this.initScale = params.initScale||1;
    this.posVariance = (typeof params.posVariance !== 'undefined') ? params.posVariance : 5;
    this.decayVariance = (typeof params.decayVariance !== 'undefined') ? params.decayVariance : 5;
    this.scaleVariance = (typeof params.scaleVariance !== 'undefined') ? params.scaleVariance : 5;
    this.velocityVariance = (typeof params.velocityVariance !== 'undefined') ? params.velocityVariance : 5;
    this.colors = params.colors;
    this.asteroidsArray = [];  //will hold asteroids (TAsteroids or TAnimatedAsteroids)
    this.numToEmit = 0;
    this.animationTextureFName = params.animationTextureFName||'';
    this.numTilesHoriz = params.numTilesHoriz||1;
    this.numTilesVert = params.numTilesVert||1;
    this.numTiles = params.numTiles||1;
    this.cycleTime = params.cycleTime||1;
    this.loop = (params.loop == true);
    this.preloadedTextures = [];
    this.numPreloadedTextures = params.numPreloadedTextures||5;    
    this.isCollidedTestFn = params.isCollidedTestFn;
    this.onCollidedFn = params.onCollidedFn;
    this.collisionTestFreq = clampNum((params.collisionTestFreq||0), 0, 1);
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
  onTextureLoadedCallback(aTexture, aCallBackFn) {  //aCallBackFn if optional
    this.preloadedTextures.push(aTexture);
    if (aCallBackFn) aCallBackFn(aTexture);
  }
  onTextureLoadProgressCallback(xhr) {
    if (xhr.lengthComputable) {
      let percentComplete = xhr.loaded / xhr.total * 100;
      console.log(this.animationTextureFName + ' ' + Math.round(percentComplete, 2) + '% downloaded');
    }
  }
  onTextureLoadErrorCallback(xhr) {
    //any load error handler can go here
  }
  addPreloadedTexture(aCallBackFn) {  //aCallBackFn if optional
    this.textureLoader.load(
      this.animationTextureFName,
      (loadedTexture) => this.onTextureLoadedCallback(loadedTexture, aCallBackFn),
      (xhr) => this.onTextureLoadProgressCallback(xhr),
      (xhr) => this.onTextureLoadErrorCallback(xhr)
    );
  }
  getUnusedTexture(aCallbackFn) {
    if (this.preloadedTextures.length > 0) {
      aCallbackFn(this.preloadedTextures.pop());
    } else {
      this.addPreloadedTexture(
        (aTexture) => aCallbackFn(this.preloadedTextures.pop())
      );
    }
    if (this.preloadedTextures.length < 1) this.addPreloadedTexture(); //get another ready for next time.
  }
  getUnusedAsteroid(aCallbackFn)  {
    //look for inactive asteroid in array.  If none found, than add one to array
    let asteroid = null;
    let tempAsteroid = null;
    let arrayLength = this.asteroidsArray.length;
    for (var i = 0; i < arrayLength; i++) {
      tempAsteroid = this.asteroidsArray[i];
      if (tempAsteroid.isActive == false) {
        asteroid = tempAsteroid;
        break;
      }
    }
    if (asteroid == null) {
      let collidedTestFn = null;
      let onCollidedFn = null;
      if (Math.random() < this.collisionTestFreq) {
        collidedTestFn = this.isCollidedTestFn;
        onCollidedFn = this.onCollidedFn;          
      }    
      let asteroidParams = {  //params common to both types here...
        owner:               this,
        name:                this.asteroidNamePrefix + '_asteroid',
        initScale:           0,
        decaySec:            0,
        initPosition:        nullV,
        velocityV:           nullV,
        isCollidedTestFn:    collidedTestFn,  //will be null, or Fn, depending on desired test frequency
        onCollidedFn:        onCollidedFn,    //will be null, or Fn, depending on desired test frequency    
      }        
      //-- asteroid parameters specific to type here ---
      asteroidParams.material = this.aMaterial;
      //-------------------------------------------------
      asteroid = new TAsteroid(asteroidParams);
      this.asteroidsArray.push(asteroid);
      aCallbackFn(asteroid);      
    } else {
      aCallbackFn(asteroid);
    }
    //return asteroid;
  }
  emitByParams(params) {
    //input:  params.initPosition
    //        params.initVelocity
    let initPosition = params.initPosition;
    let initVelocity = params.initVelocity;
    initPosition = randomizeVector(initPosition, this.posVariance);
    initVelocity = randomizeVector(initVelocity, this.velocityVariance);
    let decaySec = randomizeNum(this.decaySec, this.decayVariance);
    let initScale = randomizeNum(this.initScale, this.scaleVariance);
    this.getUnusedAsteroid(
      (aAsteroid) => aAsteroid.activate(initScale, decaySec, initPosition, initVelocity)
    );
  }
  emit() {
    this.emitByParams({
      initPosition: this.parent.offsetPos(this.positionOffset),
      initVelocity: this.parent.offsetVelocity(this.velocityOffset),
    });
  }
  hasActiveAsteroids() {
    let result = false;
    let tempAsteroid = null;
    let arrayLength = this.asteroidsArray.length;
    for (var i = 0; i < arrayLength; i++) {
      tempAsteroid = this.asteroidsArray[i];
      result = result || tempAsteroid.isActive;
      if (result) break;  //quit as soon as 1 active asteroid found
    }
    return result;
  }
  allLoaded() {
    let result = true;  //<-- To do: implement this...
    //more here if needed
    return result;
  }
  animate(deltaSec) {
    //call emit() based on this.emitRate;
    this.numToEmit += this.emitRate * deltaSec;  //may only increase by 0.0234 asteroids/cycle
    while (this.numToEmit > 1) {
      this.emit();
      this.numToEmit -= 1;
    }
    //cycle through existing asteroids, animating each one.
    this.asteroidsArray.forEach(
      function(asteroid) {
        asteroid.animate(deltaSec);
      }
    );
  }
}


*/