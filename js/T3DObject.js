//T3DPoint is defined in T3DPoint.js


/*
class T3DObject {
  //---- member properties/attributes -------
  this.rotationVelocity  //units are delta radians/sec
  this.loaded  
  this.showPosMarker  
  this.showCameraAttachmentMarker   
  this.modelScaleV  
  this.object   //this will be the THREE.Object3D for the vehicle
  this.objectOffset  //this is an Offset displacing 3D model from game position.
  this.modelBaseRotationY
  this.plane 
  //--------- member functions --------------
  constructor(mass, aName) {
  get inV() {
  get upV() {
  get leftV() {
  get futurePos() {
  function lookingAtPos(distance)  {
  getInUpLeft(inV, upV, leftV) {
  calculateInUpLeft () {
  yaw(deltaAngle, deltaSec) {
  pitch(deltaAngle, deltaSec)  {
  roll(deltaAngle, deltaSec)  {
  lookAtVelocity () {
  rotateTowardsV (targetV, rotationRate, deltaSec)  {
  rotateTowardsVelocity (rotationRate, deltaSec)  {
  onOBJTransvserseCallback(child) {
  //function onModelLoadedCallback ( object) {
  onModelLoadErrorCallback(xhr) {
  onModelLoadProgressCallback(xhr) {
  loadModel(modelFileName) {  
}

*/

class T3DObject extends T3DPoint {
  constructor(mass, aName) {
    super(mass, aName);
    this.rotationVelocity = new THREE.Vector3(); //units are delta radians/sec
    this.loaded = false;
    this.showPosMarker = false; 
    this.showCameraAttachmentMarker = false; 
    this.modelScaleV = new THREE.Vector3(1,1,1);
    this.object = null;                          //this will be the THREE.Object3D for the vehicle
    this.objectOffset = new TOffset(0,0,0);      //this is an Offset displacing 3D model from game position.
    this.modelBaseRotationY = 0;
    this.plane = PLANE_UNK;
    this.visible = true;
    gameObjects.push(this);
  }
  //=== Class Properties =====
  get inV() {
    this.calculateInUpLeft ();
    return this.inVector;
  }
  get upV() {
    this.calculateInUpLeft ();
    return this.upVector;
  }
  get leftV() {
    this.calculateInUpLeft ();
    return this.leftVector;
  }
  get futurePos() {
  //Results:  return where vehicle position will be 1 second in future at current velocity
    let p2 = this.object.position.clone();
    p2.add(this.velocity);  //will use velocity * 1 second
    return p2;
  }
  lookingAtPos(distance) {
  //Results: return point in front of object, based on current orientation
    this.calculateInUpLeft ();
    let forwardV = this.inV;
    forwardV.multiplyScalar(distance);
    return forwardV;
  }
  //=== Class Methods =====
  getInUpLeft(inV, upV, leftV) {
    //Input: object -- Object3D
    //       inV -- an OUT parameter.   Returns X axis vector (relative to Matrix)
    //       upV -- an OUT parameter.   Returns Y axis vector (relative to Matrix)
    //       leftV -- an OUT parameter. Returns Z axis vector (relative to Matrix)
    //NOTE: The in and left are relative to loaded ship.  I am unsure if the
    //      ship model is pre-rotated confusing the orientation.
    //results: none
      this.object.matrix.extractBasis (leftV, upV, inV);
  }
  calculateInUpLeft () {
    this.inVector = new THREE.Vector3();  //in is Z axis for loaded ship.
    this.upVector = new THREE.Vector3();  //up is Y axis.
    this.leftVector = new THREE.Vector3();//left is X axis for loaded ship.
    this.object.matrix.extractBasis (this.leftVector, this.upVector, this.inVector)
  }
  yaw(deltaAngle, deltaSec) {  //yaw is like a car turning left or right
    this.calculateInUpLeft ();
    this.object.rotateOnAxis(this.upV, deltaAngle * deltaSec);
  }
  pitch(deltaAngle, deltaSec)  {  //pitch is like a ship nosing up or nosing down.
  //Input: deltaAngle -- radians/sec.  Amount to change/sec
  //       deltaSec -- amount that has elapsed for this animation frame
  //results: none
    this.calculateInUpLeft ();
    this.object.rotateOnAxis(this.leftV, deltaAngle * deltaSec);
  }
  roll(deltaAngle, deltaSec)  {  //roll is like a barrel roll in an airplane.
  //Input: deltaAngle -- radians/sec.  Amount to change/sec
  //       deltaSec -- amount that has elapsed for this animation frame
  //results: none
    this.calculateInUpLeft ();
    this.object.rotateOnAxis(this.inV, deltaAngle * deltaSec);
  }
  lookAtVelocity () {  //orient in direction of velocity
    this.object.lookAt(this.futurePos);
  }
  rotateTowardsV (targetV, rotationRate, deltaSec)  {  //orient towards direction of targetV
    //Input: targetV -- vector to rotate orientation towards
    //       rotationRate -- radians/sec
    //       deltaSec: milliseconds for this frame
    //results: none
    let laV = this.lookingAtPos(10);
    let crossV = laV.cross(targetV);  //cross product is perpendicular to both other vectors
    crossV.normalize();
    let dotProd = laV.dot(targetV);   // = |laV| * |targetV| * cos(angle)  And angle is angle between vectors
    let rotRad = rotationRate * deltaSec;
    if (Math.abs(rotRad) > (1/360) * 2*Pi) {  //ignore rotation when within 1 degrees
      if (dotProd > 0) radRad *= -1;
      this.object.rotateOnAxis(crossV, rotRad);
    }
  }
  rotateTowardsVelocity (rotationRate, deltaSec)  {  //gradually orient towards direction of object's velocity
    //Input: rotationRate -- radians/sec
    //       deltaSec: milliseconds for this frame
    //results: none
    let fpV = this.futurePos;
    this.rotateTowardsV(fpV, rotationRate, deltaSec);
  }
  animate(deltaSec)  {
    super.animate(deltaSec);
    this.object.position.clone(this.position);
  }
  offsetPos(offset) {
    //input: offset -- a TOffset
    //Example use:  A value of (2, 1, -3) for offset means T3DObject's
    //            T3DObject.position + T3DObject.inV * 2
    //                               + T3DObject.upV * 1
    //                               + T3DObject.leftV * 1
    //Result: returns this.positon + offset
    let result = offset.combineWithObjectAddVector(this, this.position);
    return result;
  }
  offsetVelocity(offset) {
    //input: offset -- a TOffset
    //Example use:  A value of (2, 1, -3) for offset means T3DObject's
    //            T3DObject.velocity + T3DObject.inV * 2
    //                               + T3DObject.upV * 1
    //                               + T3DObject.leftV * 1
    //Result: returns this.positon + offset
    let result = offset.combineWithObjectAddVector(this, this.velocity);
    return result;
  }  
  handleRocketStrike(rocket) {
    //this can be overridden in descendents to handle missle strikes. 
    this.explode();
  }    
  otherObjetsInDistSq(objArray, distSq) {
    //Cycle through other objects and check distance to them, addding to 
    //  array all objects (T3DObjects) close enough
    //Input: objArray -- an OUT parameter
    //       distSq -- the square of the proximity distance
    let p = new THREE.Vector3();
    for (var i=0; i < gameObjects.length; i++) {
      p.copy(gameObjects[i].position);
      p.sub(this.position);
      if (p.lengthSq() < distSq) objArray.push(gameObjects[i]);
    }  
  }  
  hide() {
    //this.setScale(VERY_TINY_SCALE_V);  //perhaps not needed
    this.position.copy(nullV);
    this.velocity.copy(nullV);
    this.visible = false;
    if (this.object) scene.remove(this.object);
  }  
  unhide() {
    if (this.object) scene.add(this.object);
  }  
  explode() {  //override in descendants for points etc...
    //FINISH -- launch explosion
    this.hide();    
  }     
  setScale(scaleV) {
    this.object.scale.copy(scaleV);
    this.modelScaleV.copy(scaleV);
  }    
  /*
  onOBJTransvserseCallback(child) {
    if (child instanceof THREE.Mesh) {
      child.material.map = this.texture;
    }
  }
  */
  onModelLoadErrorCallback(xhr) {
    //any load error handler can go here
  }
  onModelLoadProgressCallback(xhr) {
    if (xhr.lengthComputable) {
      let percentComplete = xhr.loaded / xhr.total * 100;
      console.log(Math.round(percentComplete, 2) + '% downloaded');
    }
  }
  shipModelLoadedCallBack(loadedObject) {
    //having to use ship in global scope because 'this' is lost by callback! 
    onModelLoadedCallback(loadedObject, ship);      
  }    
  rocketModelLoadedCallBack(loadedObject) {
    //having to use rocket in global scope because 'this' is lost by callback!  
    onModelLoadedCallback(loadedObject, rocket);     
  }    
  loadModel(modelFileName) {
    this.texture = new THREE.CanvasTexture( generateTexture( 0, 0.5, 1 ), THREE.UVMapping );
    let loadManager = new THREE.LoadingManager();
    loadManager.onProgress = function ( item, loaded, total ) {
      console.log(item, loaded, total);
    };
    let localOnLoadedCallbackFn = null;
    //This below is a horrendous hack that I hate to have to use.  Loosing 'this' during callback
    if (this.name == 'ship') localOnLoadedCallbackFn = this.shipModelLoadedCallBack;
    if (this.name == 'rocket') localOnLoadedCallbackFn = this.rocketModelLoadedCallBack;
    if (!localOnLoadedCallbackFn) return;
    let OBJloader = new THREE.OBJLoader(loadManager);
    OBJloader.load(
      modelFileName, 
      localOnLoadedCallbackFn,
      this.onModelLoadProgressCallback,
      this.onModelLoadErrorCallback
    ); //OBJloader.load()
    /*
    OBJloader.load(
      modelFileName, 
      function (loadedObject) { //<-- this is callback function after model loaded
        loadedObject.traverse(this.onOBJTransvserseCallback);
        this.object = loadedObject;
        this.object.name = this.name
        this.object.scale.copy(this.modelScaleV);
        this.object.rotation.y = modelBaseRotationY;
        this.resetPositionToInit(sun);  //TO DO <-- make more generic
        scene.add(this.object);
        
        if (this.showPosMarker == true) {
          let originMaterial = new THREE.MeshBasicMaterial( { color: 0xffaa00, wireframe: true } );
          let originGeometry = new THREE.SphereGeometry( 30, 32, 16 );
          this.originIndicator = new THREE.Mesh(originGeometry, originMaterial);
          scene.add(this.originIndicator);
        }
        
        if (this.showCameraAttachmentMarker == true) {
          let cameraTargetMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );
          let cameraTargetGeometry = new THREE.SphereGeometry( 8, 10, 10 );
          this.cameraAttachementMarker = new THREE.Mesh(cameraTargetGeometry, cameraTargetMaterial );
          scene.add(this.cameraAttachementMarker);
        }
        
        this.loaded = true;
      },          
      //this.onModelLoadedCallback, //<-- handles putting into scene after load
      this.onModelLoadProgressCallback,
      this.onModelLoadErrorCallback
    ); //OBJloader.load()    
    */
  }      
                                      
}

function onOBJTransvserseCallback(child) {
  if (child instanceof THREE.Mesh) {
    child.material.map = this.texture;
  }
}  
     
                                            
function onModelLoadedCallback(loadedObject, contextThis) {
  loadedObject.traverse( 
    function (child) {
      if (child instanceof THREE.Mesh) {
        child.material.map = contextThis.texture;
      }
    }                  
  );
  contextThis.object = loadedObject;
  contextThis.object.name = contextThis.name
  contextThis.object.scale.copy(contextThis.modelScaleV);
  contextThis.object.rotation.y = contextThis.modelBaseRotationY;
  contextThis.resetPositionToInit(sun);  //TO DO <-- make more generic
  scene.add(contextThis.object);
  
  if (contextThis.showPosMarker == true) {
    let originMaterial = new THREE.MeshBasicMaterial( { color: 0xffaa00, wireframe: true } );
    let originGeometry = new THREE.SphereGeometry( 30, 32, 16 );
    contextThis.originIndicator = new THREE.Mesh(originGeometry, originMaterial);
    scene.add(contextThis.originIndicator);
  }
  
  if (contextThis.showCameraAttachmentMarker == true) {
    let cameraTargetMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );
    let cameraTargetGeometry = new THREE.SphereGeometry( 8, 10, 10 );
    contextThis.cameraAttachementMarker = new THREE.Mesh(cameraTargetGeometry, cameraTargetMaterial );
    scene.add(contextThis.cameraAttachementMarker);
  }
  contextThis.loaded = true;
}

