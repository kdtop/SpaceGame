  "use strict"

  /*--- Other javascript files referenced --------
    <script src="js/three.js"></script>
    <script src="js/OBJLoader.js"></script>
    <script src="js/const.js"></script>
    <script src="js/util.js"></script>
    <script src="js/TSkybox.js"></script>
    <script src="js/TOffset.js"></script>    
    <script src="js/T3DPoint.js"></script>
    <script src="js/T3DObject.js"></script>
    <script src="js/TParticleSys.js"></script>
    <script src="js/TCelestialbody.js"></script>
    <script src="js/TVehicle.js"></script>
    <script src="js/TShip.js"></script>
    <script src="js/TCamera.js"></script>
    <script src="js/setup.js"></script>
    <script src="js/userinput.js"></script>
    <script src="js/globals.js"></script>
    <script src="js/debug.js"></script>
    <script src="js/main.js"></script>
  -------------------------------------------------*/
  
  function checkIfLoaded() {
    loadedStatus.ship = ship.loaded;
    if (USING_SHIP2) {
      loadedStatus.ship2 = ship2.loaded;  //temp
    } else loadedStatus.ship2 = true; 
    loadedStatus.sun = sun.loaded;
    loadedStatus.skyBox = skyBox.loaded;
    loadedStatus.rockets = ship.rocketsLoaded()
    loadedStatus.allLoaded = (
      loadedStatus.ship &&
      loadedStatus.ship2 &&  //temp
      loadedStatus.sun &&
      loadedStatus.skyBox && 
      loadedStatus.rockets && 
      loadedStatus.rocketSound
    );
  }    

  function animate() {
    if (!loadedStatus.allLoaded) checkIfLoaded();
    if (loadedStatus.allLoaded) {
      let deltaSec = clock.getDelta();
      if (debugging) deltaSec = 0.01;  //<-- Debug option for prolonged frames when stepping through
      if (USING_SHIP2) {
        handleKeyAction(ship2,deltaSec);
      } else {
        handleKeyAction(ship,deltaSec);
      }      
      animateObjects(deltaSec);
      debugAnimate(deltaSec)
      renderer.render( scene, gameCamera.camera );
      //stats.update();
    }  
    if (!gamePaused) requestAnimationFrame( animate );
  }

  function animateObjects(deltaSec) {
    
    for (var i=0; i < gameObjects.length; i++) {
      gameObjects[i].animate(deltaSec);
    }  
  }
  init();
  animate();  
