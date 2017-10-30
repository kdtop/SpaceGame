

// ======= Types ================
class TSounds {
  constructor() {
    this.audioListener = new THREE.AudioListener(); 
    this.audioLoader = new THREE.AudioLoader();      
    gameCamera.camera.add(this.audioListener);  // add the listener to the camera

   this.ambientAudio = new THREE.Audio(this.audioListener);  
  }
  onSoundLoadedCallback(aAudioObject, aAudioBuffer,params) {
    aAudioObject.setBuffer(aAudioBuffer);
    aAudioObject.tmgLoaded = true;
    aAudioObject.setLoop(params.loop);
    aAudioObject.setVolume(params.volume);      
  }  
  loadSound(params, aAudioObj) {
    this.audioLoader.load(  
      params.filename,  // resource URL
      (audioBuffer) => this.onSoundLoadedCallback(aAudioObj, audioBuffer, params),
      (xhr) => {console.log(params.filename + '  ' + (xhr.loaded / xhr.total * 100) + '% loaded')},  //download progresses callback
      (xhr) =>  {console.log('An error happened during audio loading of: ' + params.fileName)}    //download errors callback
    );  
  }
  setupSound(params) {  //returns a THREE.Audio object
    let result = new THREE.Audio(this.audioListener); 
    result.tmgLoaded = false;    
    this.loadSound(params, result);
    return result;
  }  
}
