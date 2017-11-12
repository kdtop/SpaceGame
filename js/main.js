  "use strict"

  function shipsLoaded() {
    //returns true if ALL ships (and their rockets) are loaded. 
    let result = true;
    for (var i=0; i < shipsArray.length; i++) {
      result = result && shipsArray[i].allLoaded();      
      if (result == false) break;
    }    
    return result;    
  }  
  
  function checkIfLoaded() {
    loadedStatus.ships = shipsLoaded();
    loadedStatus.sun = sun.loaded;
    loadedStatus.skyBox = skyBox.loaded;
    loadedStatus.allLoaded = (
      loadedStatus.ships &&
      loadedStatus.sun &&
      loadedStatus.skyBox && 
      loadedStatus.rocketSound  //<-- implement later
    );
  }    

  function animate() {
    handleEnvironmentActions(getKeyEnvironmentAction());      
    if (!loadedStatus.allLoaded) checkIfLoaded();
    if (loadedStatus.allLoaded) {
      let deltaSec = clock.getDelta();
      if (debugging) deltaSec = 0.01;  //<-- Debug option for prolonged frames when stepping through
      for (var i=0; i < shipsArray.length; i++) {
        shipsArray[i].handleAction(getKeyVehicleAction(i), deltaSec);
      }
      gameCamera.handleAction(getKeyCameraAction(), deltaSec);
      animateObjects(deltaSec);
      gameGrids.animate(deltaSec, shipsArray);
      debugAnimate(deltaSec);
      explosionManager.animate(deltaSec);
      renderer.render( scene, gameCamera.camera );
      //stats.update();
    }  
    if (!gamePaused) requestAnimationFrame(animate);
  }
  
  function handleEnvironmentActions(actionArray) {
    while (actionArray.length > 0) {
      let action = actionArray.pop();
      switch (action) {
        case ENV_ACTION.toggleGravity:
          disableGravity = !disableGravity;
          break;
        case ENV_ACTION.togglePause:          
          gamePaused = !gamePaused;
          if (!gamePaused) requestAnimationFrame(animate);
          gamePaused ? clock.stop() : clock.start();          
          break;
      } //switch
    } //while  
  }  

  function animateObjects(deltaSec) {    
    for (var i=0; i < gameObjects.length; i++) {
      gameObjects[i].animate(deltaSec);
    }      
  }
  
  
  init();
  animate();  
