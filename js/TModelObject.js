
class TModelObject extends T3DObject {
  //This class differs from T3DObject in that the .object here is a loaded model (e.g. .obj file),
  //     wherease in T3DObject, they could be generic constructed sphere etc.  
  constructor(params) {
    //Input:       
    //  -- T3DPoint --
    //  params.mass                   -- default is 1
    //  params.name                   -- default is 'default name' 
    //  params.initPosition           -- default is (0,0,0)
    //  params.maxVelocity            -- Default = 500 deltaV/sec
    //  params.plane                  -- optional.  default ORBIT_PLANE.xz
    //  params.showArrows             -- default is false.  If true, this overrides the .showArrow# parameters
    //  params.showArrow1             -- default is false
    //  params.showArrow2             -- default is false
    //  params.showArrow3             -- default is false
    //  params.collisionBoxSize       -- default is 5 (this.position +/- 5 voxels/side)
    //  params.showCollisionBox       -- default is false
    //  -- T3DObject --
    //  params.modelScale             -- optional, default = 1
    //  params.showPosMarker          -- default is false
    //  params.excludeFromGameObjects -- default is false
    //  params.arrowsOffset           -- default is null (only applies if showArrow# is true)
    //  params.damageToExplode        -- default is 100
    //  params.rotationVelocity       -- default is (0,0,0)    
    //  -- TModelObject --   
    //  params.modelFName          -- required for model loading
    //  params.modelColor          -- TColor. Default is (0, 0.5, 1);
    //  params.autoAddToScene      -- optional.  Default = true;
    //  params.showPosMarker       -- optional.  Default is false
    //  params.modelObject         -- default is null.  If provided, then used as model instead of loading from FName
    //-----------------------
    super(params);
    this.normalScaleV = this.modelScaleV.clone(); //setup in T3DObject
    this.autoAddToScene = (params.autoAddToScene !== false);
    //NOTE: the r,g,b values are passed to generateTexture.  This expects input
    //   values of each 0-1, otherwise the texture is blown-out white. 
    this.modelColor = params.modelColor || new TColor(0, 0.5, 1);
    if (params.modelObject) {
      this.object = params.modelObject.clone();
      this.object.name = this.name;
      this.setScaleV(this.normalScaleV);
      this.loaded = true;
    } else {  
      let modelFName = params.modelFName||''; 
      if (modelFName !== '') {
        this.loadModel(modelFName);
        //this.onModelLoadedCallback() <-- NOTE: This will be triggered by callback after load   
      }  
    }  
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
    this.setScaleV(this.modelScaleV);
    //NOTE: I can't change the object baseline orientation here because I am later 
    //     telling the object to lookAt() a given point, which would override changes. 
    //     I will have to use modeling software (e.g. Blender) to correct model orientation if needed.
    this.calculateInUpLeft ();
    this.resetPositionToInit();  //may be overridden in descendent classes. 
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
    let texture = generateTexture(this.modelColor.r, this.modelColor.g, this.modelColor.b);
    this.texture = new THREE.CanvasTexture(texture, THREE.UVMapping);
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