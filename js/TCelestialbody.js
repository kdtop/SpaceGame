
class TCelestialBody extends T3DObject {
  constructor(params) {
    //Input:           
    //  params.mass
    //  params.name
    //  params.initPosition
    //  params.realSize
    //  params.gameSize
    //  params.textureFName
    //  params.atmosphereTextureFName

    //-----------------------
    super(params);
    this.realWorldSize = params.realSize||1;  // KM radius
    this.radius = params.gameSize||1;         //desired size in graphic world
    this.radiusSquared = this.radius * this.radius;
    this.rotationVelocity.y = Pi/32;    //radians/sec
    let aTexture = new THREE.TextureLoader().load(params.textureFName);
    let aMaterial = new THREE.MeshBasicMaterial( { map: aTexture } );
    let aGeometry = new THREE.SphereGeometry(this.radius, 32, 16 );
    this.object = new THREE.Mesh( aGeometry, aMaterial );
    this.object.name = params.name;
    this.loaded = true;
    this.addToScene();
    //scene.add(this.object);
    
    var atmosphereMaterial;
    params.atmosphereTextureFName = params.atmosphereTextureFName || '';
    if (params.atmosphereTextureFName == '') {
      atmosphereMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xb3ecff,  //light blue 
        transparent: false, 
        //opacity: 0.9,
        blending: THREE.AdditiveBlending 
      });
    } else {
      let atmosphereTexture = new THREE.TextureLoader().load(params.atmosphereTextureFName);
      atmosphereMaterial = new THREE.MeshBasicMaterial({
        map: atmosphereTexture, 
        transparent: true, 
        opacity: 0.8,
        blending: THREE.AdditiveBlending, 
      });
    }  
    let atmosphereGeometry = new THREE.SphereGeometry(this.radius+2, 32, 16 );
    this.atmosphereObject = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    this.atmosphereRotationVelocity = new THREE.Vector3(); //units are delta radians/sec
    this.atmosphereRotationVelocity.y = this.rotationVelocity.y / 2    //radians/sec
    scene.add(this.atmosphereObject);
    
  }
  explode() {  
    //override ancestor to keep planet from blowing up.          
    //this.hide();    
  } 
  acceptDamage(damageValue, otherObj) {
    //override ancestor to keep planet from blowing up.          
    //ignore damage
  }  
  pointCollides(pt) {  //pt is Vector3
    let p = this.position.clone(); p.sub(pt);
    let result = (p.lengthSq() <= this.radiusSquared);
    return result;
  }  
  allLoaded() {
    let result = super.allLoaded();
    //more here if needed
    return result;
  }    
  animate(deltaSec) {
    super.animate(deltaSec);
    this.object.rotation.y -= this.rotationVelocity.y * deltaSec;
    this.atmosphereObject.rotation.y += this.atmosphereRotationVelocity.y * deltaSec;
  }
}
