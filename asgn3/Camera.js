class Camera {
  constructor() {
    this.fov = 90; // float
    this.eye = new Vector3([0, 0, -3]); // vector3
    this.at = new Vector3([0, 0, 0]);
    this.up = new Vector3([0, 1, 0]);

    this.viewMatrix = new Matrix4();
    this.projectionMatrix = new Matrix4().setPerspective(
      60,
      canvas.width / canvas.height,
      0.1,
      1000
    );
    this.speed = 0.1;
    this.updateViewMatrix();
  }
  updateViewMatrix() {
    console.log("update:", this.eye, this.at, this.up);
    this.viewMatrix.setLookAt(
      this.eye.elements[0],
      this.eye.elements[1],
      this.eye.elements[2], // position

      this.at.elements[0],
      this.at.elements[1],
      this.at.elements[2], // look at

      this.up.elements[0],
      this.up.elements[1],
      this.up.elements[2] // up
    );
  }
  moveForward() {
    console.log("moveForward:", this.eye, this.at, this.up);
    let elementsat = this.at.elements;
    let f = new Vector3([elementsat[0], elementsat[1], elementsat[2]]); // normalized vector for lookVector
    f = f.sub(this.eye);

    f.normalize();

    f = f.mul(this.speed);

    this.eye = this.eye.add(f);
    this.at = this.at.add(f);
    console.log("moveForward 2:", this.eye, this.at, this.up);

    this.updateViewMatrix();
    console.log("updated: ", this.viewMatrix.elements);
  }
  moveBackward() {
    let elementsat = this.at.elements;
    let f = new Vector3([elementsat[0], elementsat[1], elementsat[2]]); // normalized vector for lookVector
    f = f.sub(this.eye);
    f.normalize();
    f = f.mul(-this.speed);
    this.eye = this.eye.add(f);
    this.at = this.at.add(f);
    this.updateViewMatrix();
  }
  moveLeft() {
    let elementsat = this.at.elements;
    let f = new Vector3([elementsat[0], elementsat[1], elementsat[2]]); // normalized vector for lookVector
    f = f.sub(this.eye);
    f.normalize();
    let s = new Vector3([f.elements[0], f.elements[1], f.elements[2]]);
    s = s.cross(this.up);
    s.normalize();
    s = s.mul(-this.speed);

    this.eye = this.eye.add(s);
    this.at = this.at.add(s);
    this.updateViewMatrix();
  }
  moveRight() {
    let elementsat = this.at.elements;
    let f = new Vector3([elementsat[0], elementsat[1], elementsat[2]]); // normalized vector for lookVector
    f = f.sub(this.eye);
    f.normalize();
    let s = new Vector3([f.elements[0], f.elements[1], f.elements[2]]);
    s = s.cross(this.up);
    s.normalize();
    s = s.mul(this.speed);

    this.eye = this.eye.add(s);
    this.at = this.at.add(s);
    this.updateViewMatrix();
  }
}
