//T3DObject is defined in T3DObject.js


/*
class TModelObject extends T3DObject {
  constructor(mass, aName, aModelFName, aInitPosition) {
  this.modelBaseRotationY
  onOBJTransvserseCallback(child) {
  onModelLoadedCallback(loadedObject) {
  onModelLoadErrorCallback(xhr) {
  onModelLoadProgressCallback(xhr) {
  loadModel(modelFileName) {
}  

*/


class TModelObject extends T3DObject {
  constructor(params) {
    //Input:           
    //  params.mass
    //  params.name
    //  params.initPosition
    //  params.modelFName                  -- required for model loading
    //  params.modelBaseRotationY          -- optional.  default = 0
    //  params.autoAddToScene              -- optional.  Default = true;
    //  params.modelScale                  -- optional, default = 1
    //  params.plane                       -- optional.  default PLANE_XZ
    //  params.showCameraAttachmentMarker  -- default is false 
    //  params.showPosMarker               -- default is false
    //-----------------------
    super(params);
    this.modelBaseRotationY = params.modelBaseRotationY||0;
    this.normalScale = this.modelScaleV.clone();
    this.autoAddToScene = (params.autoAddToScene !== false);
    this.showCameraAttachmentMarker = (params.showCameraAttachmentMarker == true); 
    this.showPosMarker = (params.showPosMarker == true);
    let modelFName = params.modelFName||''; 
    if (modelFName !== '') this.loadModel(modelFName);
  }  
  onOBJTransvserseCallback(child) {
    if (child instanceof THREE.Mesh) {
      child.material.map = this.texture;
    }
  }
  onModelLoadedCallback(loadedObject) {
    console.log('In model callback.  Name='+this.Name);
    loadedObject.traverse((child)=> this.onOBJTransvserseCallback(child)); 
    this.object = loadedObject;
    this.object.name = this.name
    this.object.scale.copy(this.modelScaleV);
    this.object.rotation.y = this.modelBaseRotationY;    
    this.calculateInUpLeft ();
    this.object.rotateOnAxis(this.upV, this.modelBaseRotationY);
    this.resetPositionToInit();  
    if (this.autoAddToScene) scene.add(this.object);
    
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
    loadManager.onProgress = function ( item, loaded, total ) {
      console.log(item, loaded, total);
    };
    let localOnLoadedCallbackFn = null;
    let OBJloader = new THREE.OBJLoader(loadManager);
    OBJloader.load(
      modelFileName, 
      (loadedObject)=> this.onModelLoadedCallback(loadedObject),
      this.onModelLoadProgressCallback,
      this.onModelLoadErrorCallback
    ); 
  }
}  