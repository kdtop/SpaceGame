
/*
class T3DPoint {
  constructor(params) {
  animate(deltaSec)  {
  resetPositionToInit() {
}
*/

var globalIDCounter = 0;

// ======= Types ================
class T3DPoint {
  constructor(params) {
    //Input:           
    //  params.mass                   -- default is 1
    //  params.name                   -- default is 'default name' 
    //  params.initPosition           -- default is (0,0,0)
    //  params.maxVelocity            -- Default = 500 deltaV/sec
    //  params.plane                  -- optional.  default ORBIT_PLANE.xz
    //  params.showArrows             -- default is false.  If true, this overrides the .showArrow# parameters
    //  params.showArrow1             -- default is false, unless params.showArrows==true
    //  params.showArrow2             -- default is false, unless params.showArrows==true
    //  params.showArrow3             -- default is false, unless params.showArrows==true
    //  params.arrowLength            -- default is 25
    //  params.collisionBoxSize       -- default is 50 (this.position +/- 5 voxels/side)
    //  params.showCollisionBox       -- default is false
    //-----------------------
    this.name = params.name||'default name';
    this.mass = params.mass||1;                  //the mass of the point
    this.visible = true;                         //can be changed in descendent classes
    this.initPosition = new THREE.Vector3();     //Initial position
    this.position = new THREE.Vector3();         //the is the location to be used for game physics
    this.plane = params.plane||ORBIT_PLANE.xz;
    if (params.initPosition) {
      this.initPosition.copy(params.initPosition);
      this.position.copy(params.initPosition); //set position to initial position, if provided.
    }  
    this.velocity = new THREE.Vector3();         //vector of point's velocity
    this.maxVelocity = params.maxVelocity||500;          //max delta voxels/sec
    this.tmgID = globalIDCounter++;
    this.arrows = [];
    if (params.showArrows == true) {
      params.showArrow1 = true;
      params.showArrow2 = true;
      params.showArrow3 = true;
    }  
    this.showArrow1 = params.showArrow1;
    this.showArrow2 = params.showArrow2;
    this.showArrow3 = params.showArrow3;
    this.arrowLength = params.arrowLength || 25;
    if (this.showArrow1 == true) this.addArrow(plusXV, this.position, this.arrowLength, 0xff0000);
    if (this.showArrow2 == true) this.addArrow(plusYV, this.position, this.arrowLength, 0x00ff00);
    if (this.showArrow3 == true) this.addArrow(plusZV, this.position, this.arrowLength, 0x0000ff);
    this.showCollisionBox = (params.showCollisionBox == true);
    this.setCollisionBoxSize(params.collisionBoxSize || 50);
  }
  setCollisionBoxSize(size, visible) {
    this.collisionBoxSize = size;
    if (this.collisionBoxIndicator) scene.remove(this.collisionBoxIndicator);  //remove old, if exists
    if (this.showCollisionBox) {
      let boxGeometry = this.getCollisionBoxGeometry(size);
      let material = new THREE.MeshBasicMaterial({ 
        color: 0xffaa00, 
        wireframe: true,
      });
      this.collisionBoxIndicator = new THREE.Mesh(boxGeometry, material);
      this.collisionBoxIndicator.name = this.name + '_collisionBoxIndicator';
      this.collisionBoxIndicator.position.copy(this.position);
      scene.add(this.collisionBoxIndicator);
    }  
  }  
  getCollisionBoxGeometry(size) {
    //allow override for descendents (e.g. CelestialBody will need to be sphere, not box)
    let boxGeometry = new THREE.BoxGeometry(size*2, size*2, size*2);
    return boxGeometry;    
  }  
  pointCollides(pt) {  //pt is Vector3
    return inVolume(this.position, pt, this.collisionBoxSize); 
  }  
  otherObjectCollided() {
    //Cycle through gameObject and return FIRST collision
    //Result: returns null if none, or collided object
    let result = null;
    for (var i=0; i < gameObjects.length; i++) {
      let otherObj = gameObjects[i];
      if (!otherObj.visible) continue;
      if (otherObj == this) continue;
      if (!otherObj.pointCollides(this.position)) continue;
      result = otherObj;
      break;
    }        
    return result;
  }  
  otherObjectsCollided(objArray) {
    //Cycle through gameObject and return all collisions
    //Input: objArray -- an OUT parameter
    for (var i=0; i < gameObjects.length; i++) {
      let otherObj = gameObjects[i];
      if (!otherObj.visible) continue;
      if (otherObj == this) continue;
      if (otherObj.pointCollides(this.position)) {
        objArray.push(otherObj);
      }  
    }        
  }  
  otherObjectsInDistSq(objArray, distSq) {
    //Cycle through other objects and check distance to them, addding to
    //  array all objects (T3DObjects) close enough
    //Input: objArray -- an OUT parameter
    //       distSq -- the square of the proximity distance
    let p = new THREE.Vector3();
    for (var i=0; i < gameObjects.length; i++) {
      if (gameObjects[i] == this) continue;
      p.copy(gameObjects[i].position);
      p.sub(this.position);
      if (p.lengthSq() < distSq) {
        objArray.push(gameObjects[i]);
      }  
    }
  }
  addArrow(dir, position, length, color) {    
    let arrow = new THREE.ArrowHelper(dir, position, length, color);
    this.arrows.push(arrow)    
    arrow.name = 'arrow-' + this.arrows.length;
    scene.add(arrow);
  }  
  addToScene() {  //add this to scene, ** if ** not already present
    if (!this.object) return;
    let found = false;
    for (var i=0; i < scene.children.length; i++) {
      if (!scene.children[i].tmgID) continue;
      if (scene.children[i].tmgID == this.tmgID) {
        found = true;
        break;
      }  
    };
    if (!found) scene.add(this.object);
  }    
  animateArrows(deltaSec) {
    //override in descendents for alternate behavior
    for (var i = 0; i < this.arrows.length; i++) {
      let arrow = this.arrows[i];
      arrow.position.copy(this.position);      
    }  
  }  
  orbit(aBody) {
  //Call this function once to get velocity needed to orbit aBody  
  //Input: aBody - TCelestialBody
  //NOTE: formula found here: http://www.physicsclassroom.com/class/circles/Lesson-4/Mathematics-of-Satellite-Motion
  //      V^2 = G * aBody.mass / R
    let aBodyDirV = aBody.position.clone();
    aBodyDirV.sub(this.position);
    let distToaBody = aBodyDirV.length();  //radius of orbit
    let orbitVelocity = Math.sqrt(GRAV_CONST * aBody.mass / distToaBody);  //scalar speed
    aBodyDirV.normalize();
    let orbitV = aBodyDirV.clone();  //This is a unit length vector
    //The cross product of two vectors gives a third vector at right angles to both.
    let orbitAxis = upVForPlane[this.plane];
    //orbitV.cross(plusYV);  //result should be unit length
    orbitV.cross(orbitAxis);  //result should be unit length
    orbitV.multiplyScalar(orbitVelocity * 0.0000000000125) ; //Manual adjustment factor found via trial and error
    this.velocity.copy(orbitV);
  }
  setPosition(P) {  //unify moving of this.position into one function
    this.position.copy(P)
    if (this.collisionBoxIndicator) {
      this.collisionBoxIndicator.position.copy(this.position);
    }  
  }
  accelerate(deltaV) {
    this.velocity.add (deltaV);            //units are delta voxels -- NOT deltaV/sec
    this.velocity.clampLength(-this.maxVelocity,this.maxVelocity);  //keep velocity length within -500 to 500 voxels/sec
  }
  animate(deltaSec)  {
    let deltaPos = this.velocity.clone();
    deltaPos.multiplyScalar(deltaSec);  //units are now delta voxels.
    let oldPos = this.position.clone();
    let newPosition = this.position.clone();
    newPosition.add(deltaPos);
    let wrapped = wrapPosition(this, newPosition);
    this.position.copy(newPosition);
    if (this.handleWrapped && wrapped) {
      this.handleWrapped(deltaSec, oldPos);  //can implement in descendent classes
    }  
    this.animateArrows(deltaSec);
  }
  resetPositionToInit() {
    this.position.copy(this.initPosition);
    this.velocity.copy(nullV);
  }
  
}
