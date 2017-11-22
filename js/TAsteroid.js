


class TAsteroid extends TModelObject {
  constructor(params) {
    //Input:           
    //  -- T3DPoint --
    //  params.mass                        -- default is 1
    //  params.name                        -- default is 'default name' 
    //  params.initPosition                -- default is (0,0,0)
    //  params.maxVelocity                 -- Default = 500 deltaV/sec
    //  params.plane                       -- optional.  default ORBIT_PLANE.xz
    //  params.showArrows                  -- default is false.  If true, this overrides the .showArrow# parameters
    //  params.showArrow1                  -- default is false
    //  params.showArrow2                  -- default is false
    //  params.showArrow3                  -- default is false
    //  params.collisionBoxSize            -- default is 5 (this.position +/- 5 voxels/side)
    //  params.showCollisionBox            -- default is false
    //  -- T3DObject --                    
    //  params.modelScale                  -- optional, default = 1
    //  params.showPosMarker               -- default is false
    //  params.excludeFromGameObjects      -- default is false
    //  params.arrowsOffset                -- default is null (only applies if showArrow# is true)
    //  params.damageToExplode             -- default is 100
    //  params.rotationVelocity            -- default is (0,0,0)    
    //  -- TModelObject --                 
    //  params.modelFName                  -- required for model loading
    //  params.modelColor                  -- TColor. Default is (0, 0.5, 1);
    //  params.autoAddToScene              -- optional.  Default = true;
    //  params.showPosMarker               -- optional.  Default is false
    //  params.modelObject                 -- default is null.  If provided, then used as model instead of loading from FName
    //  -- TAsteroid --     
    //  params.asteroidSize                -- default is 1 (e.g. 2 = 2x size)
    //  params.rotationVelocity            -- default is random Vector 0-2Pi/sec in each direction
    //-----------------------
    params.modelFName = params.modelFName || ASTEROID_MODEL_FNAMES[randomInt(1,3)];
    params.name = params.name || 'asteroid';
    let greyN = random(0.1,0.5);
    params.modelColor = new TColor(greyN, greyN, greyN);
    params.asteroidSize = params.asteroidSize || 1;
    params.modelScale = ASTEROID_SCALE_NORMALIZER * params.asteroidSize;  
    params.mass = params.mass || ASTEROID_MASS;
    params.collisionBoxSize = params.collisionBoxSize || ASTEROID_COLLISION_BOX_SIZE;
    params.rotationVelocity = params.rotationVelocity || new THREE.Vector3(random(0,Pi/2),random(0,Pi/2),random(0,Pi/2));
    super(params);
    this.unscaledMass = this.mass;
    this.unscaledCollisionBoxSize = params.collisionBoxSize;
    this.setScale(params.modelScale); //<-- sets scalled mass, scalled collisionBox, in addition to just scale
    this.euler = new THREE.Euler(0,0,0,'XYZ');
    this.hide();  //default will be to be invisible on creation.  Should activated with this.activate();
  } 
  resetPositionToInit() {
    super.resetPositionToInit();
    //more here if needed.  
  }
  get isActive() {
    return this.visible;
  }
  setAsteroidSize(asteroidSize) {
    //NOTE: Asteroid size will be e.g. 0.5-3 for 1/2 to 3x normal size
    //   But because the original models are so tiny, I have to make the 
    //   actual scaling factor much larger.  
    let scale = ASTEROID_SCALE_NORMALIZER * asteroidSize;
    this.mass = this.unscaledMass * Math.pow(asteroidSize, 2);  // (asteroidSize^2)     
    this.setCollisionBoxSize(this.unscaledCollisionBoxSize * asteroidSize);
    this.setScale(scale);
  }  
  inactivate() {
    this.hide();
  }  
  activate(asteroidSize, position, velocity, rotationVelocity) {
    this.setAsteroidSize(asteroidSize);
    this.setPosition(position);
    this.velocity.copy(velocity);
    this.rotationVelocity.copy(rotationVelocity);
    this.unhide();
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

class TAsteroidSys {
//This will by system like AsteroidSystem in that is will recycle asteroids
//  as they are destroyed, and dynamically add new asteroids to pool of available
//  ones as needed. 
  constructor(params) {
    //Input:  params.name                   -- an identifier name
    if (!params) params = {};
    this.name = params.name || 'AsteroidSys';
    this.asteroidsArray = [];  //will hold pool asteroids (TAsteroid's ) -- some visibile, perhaps some not
    this.preloadMasters();
    this.beltEmitted = false; //<-- will make this more sophisticated later
  }
  preloadMasters() {
    let tempParams = {
      modelFName: ASTEROID_MODEL_FNAMES[1],
      name: 'asteroid1',
      excludeFromGameObjects: true,  //<-- will need to add copies into gameObjects
      initPosition: new THREE.Vector3(0,0,0),      
    }  
    this.asteroidMasterCopies = []; //will hold TAsteroids for master copies of 3 types of asteroids
    this.asteroidMasterCopies.push(new TAsteroid(tempParams));
    //---
    tempParams.modelFName= ASTEROID_MODEL_FNAMES[2];
    tempParams.name= 'asteroid2';
    this.asteroidMasterCopies.push(new TAsteroid(tempParams));
    //---
    tempParams.modelFName= ASTEROID_MODEL_FNAMES[3];
    tempParams.name= 'asteroid3';
    this.asteroidMasterCopies.push(new TAsteroid(tempParams));
  }  
  allLoaded() {
    let result = true;
    for (var i=0; i < this.asteroidMasterCopies.length; i++) {
      result = result && this.asteroidMasterCopies[i].loaded;
      if (!result) break;
    }
    return result;
  }  
  getUnusedAsteroid()  {
    //look for inactive asteroid in array.  If none found, than add one to array
    let asteroid = null;
    for (var i = 0; i < this.asteroidsArray.length; i++) {
      if (this.asteroidsArray[i].isActive) continue;
      asteroid = this.asteroidsArray[i];
      break;
    }
    if (asteroid == null) {
      let asteroidMaster = this.asteroidMasterCopies[randomInt(0,2)];
      asteroid = new TAsteroid({  
        initPosition:        nullV,
        velocityV:           nullV,
        isCollidedTestFn:    this.isCollidedTestFn,
        onCollidedFn:        this.onCollidedFn,   
        modelObject:         asteroidMaster.object,
        //showCollisionBox:    true,  //<--- debugging         
      });
      this.asteroidsArray.push(asteroid);
    }
    asteroid.setScale(random(0.2,2));
    return asteroid;
  }
  emitByParams(params) {
    //input:  params.initPosition
    //        params.initVelocity
    //        params.rotationVelocity
    //        params.callbackFn
    let asteroid = this.getUnusedAsteroid();
    asteroid.activate(random(0.2,2),            //asteroidSize
                      params.initPosition,      //position 
                      params.initVelocity,      //velocity
                      params.rotationVelocity   //rotationVelocity
                      );
    return asteroid;
  }
  createBelt(numAsteroids, orbitPlane, radius) {
    for (var i=0; i < numAsteroids; i++) {
      let radians = random(0, 2*Pi);
      radius = randomizeNum(radius,5);
      let aX = Math.cos(radians) * radius;
      let aY = Math.sin(radians) * radius;
      let p = new THREE.Vector3(0,0,0);
      switch (orbitPlane) {
        case ORBIT_PLANE.xy: p.set(aX, aY,  0); break;
        case ORBIT_PLANE.xz: p.set(aX,  0, aY); break;
        case ORBIT_PLANE.yz: p.set( 0, aY, aX); break;
      }  
      let asteroid = this.emitByParams({
        initPosition: p,
        asteroidSize: random(0.25, 0.75),
        initVelocity: nullV,  //will change by call to orbit() later
        rotationVelocity:  new THREE.Vector3(random(0,Pi/2),random(0,Pi/2),random(0,Pi/2)),
      });
      asteroid.plane = orbitPlane;
      asteroid.orbit(sun);  //<-- to do, make more generic...
    }  
  }  
  animate(deltaSec) {
    //NOTE: each asteroid is animated from the main loop (via gameObjects),
    //   so no need to animate them here.  
    if (!this.beltEmitted) {
      this.createBelt(50, ORBIT_PLANE.xz, 600);
      this.beltEmitted = true;
      //Later I will make more clever technique, with ongoing asteroid additions, etc.  
    }  
  }  
  
}

