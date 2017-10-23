

// ======= Types ================
class TSounds {
  constructor() {
    this.audioListener = new THREE.AudioListener(); 
    this.audioLoader = new THREE.AudioLoader();      
    gameCamera.camera.add(this.audioListener);  // add the listener to the camera

    //ship.engineSound = new THREE.Audio(audioListener);  // instantiate audio object
    //scene.add( ship.engineSound );  // add the audio object to the scene
    //var audioLoader = new THREE.AudioLoader();  // instantiate a loader      
      
   this.ambientAudio = new THREE.Audio(this.audioListener);  
      
  }
}
