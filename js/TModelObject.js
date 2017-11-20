//T3DObject is defined in T3DObject.js


/*
class TModelObject extends T3DObject {
  constructor(mass, aName, aModelFName, aInitPosition) {
  //this.modelBaseRotationY
  onOBJTransvserseCallback(child) {
  onModelLoadedCallback(loadedObject) {
  onModelLoadErrorCallback(xhr) {
  onModelLoadProgressCallback(xhr) {
  loadModel(modelFileName) {
}  

*/


class TModelObject extends T3DObject {
  //This class differs from T3DObject in that the .object here is a loaded model (e.g. .obj file),
  //     wherease in T3DObject, they could be generic constructed sphere etc.  
  constructor(params) {
    //Input:           
    //  params.mass
    //  params.name
    //  params.initPosition
    //  params.maxVelocity         -- Default = 500 deltaV/sec
    //  params.modelFName          -- required for model loading
    //  params.modelBaseRotationY  -- optional.  Default = 0  <-- removed
    //  params.autoAddToScene      -- optional.  Default = true;
    //  params.modelScale          -- optional,  Default = 1
    //  params.plane               -- optional.  Default ORBIT_PLANE.xz
    //  params.showPosMarker       -- optional.  Default is false
    //  params.collisionBoxSize    -- default is 5 (this.position +/- 5 voxels/side)
    //-----------------------
    super(params);
    this.normalScale = this.modelScaleV.clone();
    this.autoAddToScene = (params.autoAddToScene !== false);
    let modelFName = params.modelFName||''; 
    if (modelFName !== '') this.loadModel(modelFName);
  }  
  setPosition(P) {  //unify moving of this.position into one function
    super.setPosition(P)
    //set position of model relative to current object position
    this.object.position.copy(this.objectOffset.combineWithObjectPosition(this));
  }          
  onOBJTransvserseCallback(child) {
    if (child instanceof THREE.Mesh) {
      child.material.map = this.texture;
    }
  }
  onModelLoadedCallback(loadedObject) {
    loadedObject.traverse((child)=> this.onOBJTransvserseCallback(child)); 
    this.object = loadedObject;
    this.object.name = this.name
    this.object.scale.copy(this.modelScaleV);
    //NOTE: I can't change the object baseline orientation here because I am later 
    //     telling the object to lookAt() a given point, which would override changes. 
    //     I will have to use modeling software (e.g. Blender) to correct model orientation if needed.
    this.calculateInUpLeft ();
    this.resetPositionToInit();  
    if (this.autoAddToScene) this.addToScene();    
    this.loaded = true;
  }  
  onModelLoadErrorCallback(xhr) {
    //any load error handler can go here
  }
  onModelLoadProgressCallback(xhr) {
    if (xhr.lengthComputable) {
      let percentComplete = xhr.loaded / xhr.total * 100;
      console.log(Math.round(percentComplete, 2) + '% downloaded');
    }
  }
  loadModel(modelFileName) {
    this.texture = new THREE.CanvasTexture( generateTexture( 0, 0.5, 1 ), THREE.UVMapping );
    let loadManager = new THREE.LoadingManager();
    loadManager.onProgress = function (item, loaded, total) {
      console.log(item, loaded, total);
    };
    let localOnLoadedCallbackFn = null;
    let OBJloader = new THREE.OBJLoader(loadManager);
    OBJloader.load(
      modelFileName, 
      (loadedObject)=> this.onModelLoadedCallback(loadedObject),
      (xhr) => this.onModelLoadProgressCallback(xhr),
      (xhr) => this.onModelLoadErrorCallback(xhr)
    ); 
  }
  allLoaded() {
    let result = super.allLoaded();
    //more here if needed
    return result;
  }  
  
}  