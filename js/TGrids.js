

/*
class TGrid extends T3DPoint {
  constructor(params, aPlane) {
  get gridInScene() {
  set gridInScene(value) {
  get gridVisibility() {
  set gridVisibility(value) {
  distToGridVisibility(aDist) {
  animate(deltaSec, trackedObjects) {
}  

class TGrids {
  constructor(params) {
  animate(deltaSec) {
}  
*/



class TGrid extends T3DPoint {
  constructor(params, aPlane) {
    //Input:
    //  params.size                 -- default is GRID_SIZE
    //  params.divs                 -- default is GRID_DIVS
    //  params.centerLineColor      -- default is GRID_COLOR_CENTRAL_LINE
    //  params.mainColor            -- default is GRID_COLOR  
    //  params.position             -- default is (0,0,0)
    //  params.gridVisibilityDist   -- default is 100;
    //  params.glowVisibilityDist   -- default is 200;
    if (params.position) {
      params.initPosition = params.position;
    } else {
      params.position = new THREE.Vector3(0,0,0);
    }  
    super(params);
    this.name = 'Grid-' + ORBIT_PLANE_NAME[aPlane];
    this.size = params.size || GRID_SIZE;
    this.divs = params.divs || GRID_DIVS;
    this.mainColor = params.mainColor || GRID_COLOR;    
    this.centerLineColor = params.centerLineColor ||GRID_COLOR_CENTRAL_LINE;
    this.object = new THREE.GridHelper(this.size, this.divs, this.centerLineColor, this.mainColor);
    this.object.name = this.name;
    this.plane = aPlane;
    this.gridVisibilityDist = params.gridVisibilityDist || 100;
    this.glowVisibilityDist = params.glowVisibilityDist || 200;
    this.private_gridVisibility = 0;  //range is 0.0 - 1.0
    this.private_solidVisibility = 0; //range is 0.0 - 1.0
    this.plGeometry = new THREE.PlaneGeometry(this.size, this.size, this.divs, this.divs);
    this.plMaterial = new THREE.MeshBasicMaterial({
      color:       this.mainColor, 
      //ambient:     GRID_COLOR, 
      side:        THREE.DoubleSide, 
      opacity:     0.1,   //initially very transparent
      transparent: true, 
      depthWrite:  false 
    });
    this.solid = new THREE.Mesh(this.plGeometry, this.plMaterial);
    this.solid.receiveShadow = false;
    this.solid.name = 'Grid-solid-' + ORBIT_PLANE_NAME[aPlane];
    
    switch (this.plane) {
      case ORBIT_PLANE.xz:
        this.object.rotation.y = 0;     
        this.solid.rotation.x = Pi/2;     
        break;
      case ORBIT_PLANE.xy:
        this.object.rotation.x = Pi/2;  
        this.solid.rotation.x = 0;     
        break;
      case ORBIT_PLANE.yz:
        this.object.rotation.z = Pi/2;  
        this.solid.rotation.y = Pi/2;     
        break;
    }  
    this.private_gridInScene = false;
    this.private_solidInScene = false;
    
    if (this.plane == ORBIT_PLANE.xz) return;  //debug, remove later
    scene.add(this.solid);
  }
  get gridInScene() {
    return this.private_gridInScene;    
  }
  set gridInScene(value) {
    if (this.private_gridInScene == value) return;
    if (value == true) scene.add(this.object); else scene.remove(this.object);
    this.private_gridInScene = value;
  }
  get solidInScene() {
    return this.private_solidInScene;    
  }
  set solidInScene(value) {
    //if (this.private_solidInScene == value) return;
    if (value == true) {
      scene.add(this.solid); 
    } else { 
      scene.remove(this.solid);
    }  
    this.private_solidInScene = value;
  }      
  get gridVisibility() {
    return this.private_gridVisibility;
  }  
  set gridVisibility(value) {
    if (value < 0) value = 0;
    if (value > 1) value = 1;
    this.private_gridVisibility = value;
    this.gridInScene = (value > 0.70)
  }
  get solidVisibility() {
    return this.private_solidVisibility;
  }  
  set solidVisibility(value) {
    if (value < 0) value = 0;
    if (value > 1) value = 1;
    this.private_solidVisibility = value;
    this.solidInScene = (value > 0.10)
    this.plMaterial.opacity = value;
  }    
  distToGridVisibility(aDist) {
    //result is number 0-1.0  for 0 to 100% visibility
    //         |            
    //   100%  |..............
    //         |             .
    //         |             .
    //         |             .
    //         |             .
    //         |             .
    //         |             .  
    // --------+-------------*----------------------------
    //         0             ^params.gridVisibilityDist
    /*
    if (aDist < 0) aDist = 0;
    if (aDist > this.gridVisibilityDist) aDist = this.gridVisibilityDist;
    let maxVisibility = 1;
    let result = (-maxVisibility/this.gridVisibilityDist) * aDist + maxVisibility;  
    */
    let result=0;
    if (aDist > this.gridVisibilityDist) result = 0; else result = 1;    
    return result;    
  }  
  distToSolidVisibility(aDist) {
    //result is number 0-1.0  for 0 to 100% visibility
    //         |
    //         |.  100%
    //         |  .
    //         |    .
    //         |      .
    //         |        .
    //         |          .
    //         |            .
    // --------+-------------*----------------------------
    //         0             ^params.glowVisibilityDist
    let result = 0;
    if (this.distToGridVisibility(aDist) == 1) {
      result = 0;
    } else {
      if (aDist < 0) aDist = 0;       
      if (aDist > this.glowVisibilityDist) aDist = this.glowVisibilityDist;
      let maxVisibility = 0.5;
      result = (-maxVisibility/this.glowVisibilityDist) * aDist + maxVisibility;
    }
    return result;    
  }  
  isVisible() {
    let result = (this.gridVisibility > 0);
    return result;
  }  
  animate(deltaSec, trackedObjects) {
    //Input: deltaSec == number of seconds of this frame
    //       trackedObjects == array of T3DObjects
    let closestDist = 9999;
    for (var i=0; i < trackedObjects.length; i++) {
      let a3DObject = trackedObjects[i];
      let aDist = 9999;
      switch (this.plane) {
        case ORBIT_PLANE.xz:
          aDist = Math.abs(a3DObject.position.y);
          break;
        case ORBIT_PLANE.xy:
          aDist = Math.abs(a3DObject.position.z);
          break;
        case ORBIT_PLANE.yz:
          aDist = Math.abs(a3DObject.position.x);
          break;
      }  
      if (aDist < closestDist) closestDist = aDist;  
    }
    this.gridVisibility = this.distToGridVisibility(closestDist);
    this.solidVisibility = this.distToSolidVisibility(closestDist);
  }  
}  

class TGrids {
  constructor(params) {
    //Input:
    //  params.size             -- default is GRID_SIZE
    //  params.divs             -- default is GRID_DIVS    
    //  params.centerLineColorXZ -- default is GRID1_COLOR_CENTRAL_LINE
    //  params.mainColorXZ       -- default is GRID1_COLOR  
    //  params.centerLineColorYZ -- default is GRID2_COLOR_CENTRAL_LINE
    //  params.mainColorXZ       -- default is GRID2_COLOR 
    //  params.centerLineColorXY -- default is GRID3_COLOR_CENTRAL_LINE 
    //  params.mainColorXY       -- default is GRID3_COLOR                               
    //  params.position         -- default is (0,0,0)
    //  params.excludeXZ        -- default is false
    //  params.excludeXY        -- default is false
    //  params.excludeYZ        -- default is false
    //  params.trackedObjects   -- array of tracked objects.  
    //  params.gridVisibilityDist   -- default is 100;
    this.mainColorXZ = params.mainColorXZ || GRID1_COLOR;    
    this.centerLineColorXZ = params.centerLineColorXZ ||GRID1_COLOR_CENTRAL_LINE;
    this.mainColorXY = params.mainColorXY || GRID2_COLOR;    
    this.centerLineColorXY = params.centerLineColorXY ||GRID2_COLOR_CENTRAL_LINE;
    this.mainColorYZ = params.mainColorYZ || GRID3_COLOR;    
    this.centerLineColorYZ = params.centerLineColorYZ ||GRID3_COLOR_CENTRAL_LINE;    
    if (params.excludeXZ != true) {
      params.mainColor = this.mainColorXZ;
      params.centerLineColor = this.centerLineColorXZ;      
      this.xz = new TGrid(params, ORBIT_PLANE.xz);
    }  
    if (params.excludeXY != true) {
      params.mainColor = this.mainColorXY;
      params.centerLineColor = this.centerLineColorXY;      
      this.xy = new TGrid(params, ORBIT_PLANE.xy);
    }
    if (params.excludeYZ != true) {
      params.mainColor = this.mainColorYZ;
      params.centerLineColor = this.centerLineColorYZ;      
      this.yz = new TGrid(params, ORBIT_PLANE.yz);
    }
    if (!params.trackedObject) params.trackedObject = null;
    this.trackedObjects = [];
    if (params.trackedObjects) this.trackedObjects = params.trackedObjects.slice();
  }
  getVisibleGrids() {
    //Results: returns an array filled with ORBIT_PLANE values
    let result = [];
    if ((this.xz) && (this.xz.isVisible())) result.push(ORBIT_PLANE.xz);
    if ((this.xy) && (this.xy.isVisible())) result.push(ORBIT_PLANE.xy);
    if ((this.yz) && (this.yz.isVisible())) result.push(ORBIT_PLANE.yz);
    return result;    
  }  
  animate(deltaSec) {
    if (this.xz) this.xz.animate(deltaSec, this.trackedObjects);
    if (this.xy) this.xy.animate(deltaSec, this.trackedObjects);
    if (this.yz) this.yz.animate(deltaSec, this.trackedObjects);
  }  
  
}  