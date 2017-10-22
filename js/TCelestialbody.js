
class TCelestialBody extends T3DObject {
  constructor (mass, realSize, gameSize, fileName, aName) {
    super(mass, aName);
    this.realWorldSize = realSize;  // KM radius
    this.radius = gameSize;         //desired size in graphic world
    this.rotationVelocityY = Pi;    //radians/sec

    let aTexture = new THREE.TextureLoader().load( fileName );
    let aMaterial = new THREE.MeshBasicMaterial( { map: aTexture } );
    let aGeometry = new THREE.SphereGeometry(this.radius, 32, 16 );
    this.object = new THREE.Mesh( aGeometry, aMaterial );
    this.object.position.set(0,0,0);
    this.object.name = aName;
    this.loaded = true;
    scene.add(this.object);

  }
  animate(deltaSec) {
    super.animate(deltaSec);
    this.object.rotation.y -= this.rotationVelocityY * deltaSec;
  }
}
