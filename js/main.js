  "use strict"

  //--- Other javascript files referenced --------
  //<script src="js/three.js"></script>
  //<script src="js/OBJLoader.js"></script>
  //<script src="js/const.js"></script>
  //<script src="js/util.js"></script>
  //<script src="js/T3DObject.js"></script>
  //<script src="js/TCelestialBody.js"></script>
  //<script src="js/TVehicle.js"></script>
  //<script src="js/TCamera.js"></script>
  //<script src="js/setup.js"></script>
  //<script src="js/userinput.js"></script>
  //<script src="js/debug.js"></script>
  //<script src="js/globals.js"></script>

  //================================================

  function animate() {
    let deltaSec = clock.getDelta();
    //deltaSec = 0.01;  //<-- remove later!
    handleKeyAction(ship,deltaSec);
    animateObjects(deltaSec);
    debugAnimate(deltaSec)
    renderer.render( scene, gameCamera.camera );
    //stats.update();
    if (!gamePaused) requestAnimationFrame( animate );
  }

  function animateObjects(deltaSec) {
    sun.animate(deltaSec);
    ship.animate(deltaSec);
    gameCamera.animate(deltaSec);
    animateLight(deltaSec);
  }

  function animateLight(deltaSec) {
    //let timer = 0.0001 * Date.now();
    //pointLight.position.x = Math.sin( timer * 7 ) * 300;
    //pointLight.position.y = Math.cos( timer * 5 ) * 400;
    //pointLight.position.z = Math.cos( timer * 3 ) * 300;
  }

  init();
  //animate();  //<---- this is launched from callback started in init()
