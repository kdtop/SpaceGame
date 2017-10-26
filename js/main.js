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
    loadedStatus.rocket = rocket.loaded;
    //rocketSound : false
    loadedStatus.allLoaded = (
      loadedStatus.ship &&
      loadedStatus.ship2 &&  //temp
      loadedStatus.sun &&
      loadedStatus.skyBox && 
      loadedStatus.rocket && 
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
    
    //for (var i=0; i < gameObjects.length; i++) {
    //  gameObjects[i].animate();
    //}  
    sun.animate(deltaSec);
    ship.animate(deltaSec);    
    if (USING_SHIP2) ship2.animate(deltaSec);  //temp
    rocket.animate(deltaSec);
    gameCamera.animate(deltaSec);
    //animateLight(deltaSec);
  }

  function animateLight(deltaSec) {
    //let timer = 0.0001 * Date.now();
    //pointLight.position.x = Math.sin( timer * 7 ) * 300;
    //pointLight.position.y = Math.cos( timer * 5 ) * 400;
    //pointLight.position.z = Math.cos( timer * 3 ) * 300;
  }

  init();
  //animate();  //<---- this is launched from callback started in init()
  animate();  
