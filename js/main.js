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
    loadedStatus.sun = sun.loaded;
    loadedStatus.skyBox = skyBox.loaded;
    //loaded.rocket = rocket.loaded;
    //rocketSound : false
    loadedStatus.allLoaded = (
      loadedStatus.ship &&
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
      //deltaSec = 0.01;  //<-- Debug option for prolonged frames when stepping through
      handleKeyAction(ship,deltaSec);
      animateObjects(deltaSec);
      debugAnimate(deltaSec)
      renderer.render( scene, gameCamera.camera );
      //stats.update();
    }  
    if (!gamePaused) requestAnimationFrame( animate );
  }

  function animateObjects(deltaSec) {
    sun.animate(deltaSec);
    ship.animate(deltaSec);
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
