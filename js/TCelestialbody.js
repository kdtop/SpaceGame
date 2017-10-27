
class TCelestialBody extends T3DObject {
//  constructor (mass, realSize, gameSize, fileName, aName, aInitPosition) {
  constructor(params) {
    //Input:           
    //  params.mass
    //  params.name
    //  params.initPosition
    //  params.realSize
    //  params.gameSize
    //  params.textureFName
    //-----------------------
    super(params);
    this.realWorldSize = params.realSize||1;  // KM radius
    this.radius = params.gameSize||1;         //desired size in graphic world
    this.rotationVelocity.y = Pi/4;    //radians/sec
    let aTexture = new THREE.TextureLoader().load(params.textureFName);
    let aMaterial = new THREE.MeshBasicMaterial( { map: aTexture } );
    let aGeometry = new THREE.SphereGeometry(this.radius, 32, 16 );
    this.object = new THREE.Mesh( aGeometry, aMaterial );
    this.object.name = params.name;
    this.loaded = true;
    scene.add(this.object);
  }
  animate(deltaSec) {
    super.animate(deltaSec);
    this.object.rotation.y -= this.rotationVelocity.y * deltaSec;
  }
}
