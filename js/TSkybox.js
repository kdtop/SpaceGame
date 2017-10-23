
// ======= Types ================
class TSkybox {
  //NOTE: Later I would like to implement a quick and dirty load
  //   of low resolution skybox, then have background callback of higher
  //   resolution load and then swap after higher resolution one is ready
  constructor() {
    this.load('256');
    this.loaded = true;
  }
  load(sizeDirName) {
    let cubeTextureLoader = new THREE.CubeTextureLoader();
    let pathName = 'textures/skybox/' + sizeDirName + '/';
    cubeTextureLoader.setPath(pathName);
    let cubeURLs = [
      'right.png', 'left.png',
      'top.png', 'bot.png',   //note: top image might need to be rotated
      'front.png', 'back.png'
    ];
    let textureSkyCube = cubeTextureLoader.load(cubeURLs);
    scene.background = textureSkyCube;            
  }    
}
