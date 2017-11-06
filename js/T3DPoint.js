
/*
class T3DPoint {
  constructor(params) {
  animate(deltaSec)  {
  resetPositionToInit() {
}
*/

var globalIDCounter = 0;

// ======= Types ================
class T3DPoint {
  constructor(params) {
    //Input:           
    //  params.mass
    //  params.name
    //  params.initPosition
    //  params.showArrow1             -- default is false
    //  params.showArrow2             -- default is false
    //  params.showArrow3             -- default is false
    //  params.arrowLength            -- default is 25
    //-----------------------
    this.name = params.name||'default name';
    this.mass = params.mass||1;                  //the mass of the point
    this.initPosition = new THREE.Vector3();     //Initial position
    this.position = new THREE.Vector3();         //the is the location to be used for game physics
    if (params.initPosition) {
      this.initPosition.copy(params.initPosition);
      this.position.copy(params.initPosition); //set position to initial position, if provided.
    }  
    this.velocity = new THREE.Vector3();         //vector of point's velocity
    this.tmgID = globalIDCounter++;
    this.arrows = [];
    this.showArrow1 = params.showArrow1;
    this.showArrow2 = params.showArrow2;
    this.showArrow3 = params.showArrow3;
    this.arrowLength = params.arrowLength || 25;
    if (this.showArrow1 == true) this.addArrow(plusXV, this.position, this.arrowLength, 0xff0000);
    if (this.showArrow2 == true) this.addArrow(plusYV, this.position, this.arrowLength, 0x00ff00);
    if (this.showArrow3 == true) this.addArrow(plusZV, this.position, this.arrowLength, 0x0000ff);
  }
  addArrow(dir, position, length, color) {    
    let arrow = new THREE.ArrowHelper(dir, position, length, color);
    this.arrows.push(arrow)    
    arrow.name = 'arrow-' + this.arrows.length;
    scene.add(arrow);
  }  
  addToScene() {  //add this to scene, ** if ** not already present
    if (!this.object) return;
    let found = false;
    for (var i=0; i < scene.children.length; i++) {
      if (!scene.children[i].tmgID) continue;
      if (scene.children[i].tmgID == this.tmgID) {
        found = true;
        break;
      }  
    };
    if (!found) scene.add(this.object);
  }    
  animateArrows(deltaSec) {
    //override in descendents for alternate behavior
    for (var i = 0; i < this.arrows.length; i++) {
      let arrow = this.arrows[i];
      arrow.position.copy(this.position);      
    }  
  }  
  animate(deltaSec)  {
    let deltaPos = this.velocity.clone();
    deltaPos.multiplyScalar(deltaSec);  //units are now delta voxels.
    let oldPos = this.position.clone();
    let newPosition = this.position.clone();
    newPosition.add(deltaPos);
    let wrapped = wrapPosition(this, newPosition);
    this.position.copy(newPosition);
    if (this.handleWrapped && wrapped) {
      this.handleWrapped(deltaSec, oldPos);  //can implement in descendent classes
    }  
    this.animateArrows(deltaSec);
  }
  resetPositionToInit() {
    this.position.copy(this.initPosition);
    this.velocity.copy(nullV);
  }
  
}
