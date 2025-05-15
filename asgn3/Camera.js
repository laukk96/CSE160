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
    this.speed = 1;
    this.updateViewMatrix();
  }
  updateViewMatrix() {
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
    let f = new Vector3().set(this.at); // normalized vector for lookVector
    f.sub(this.eye);
    f.normalize();
    f.mul(this.speed);
    this.eye += f;
    this.at += f;
    this.updateViewMatrix();
  }
  moveBackward() {
    let f = new Vector3().set(this.at); // normalized vector for lookVector
    f.sub(this.eye);
    f.normalize();
    f.mul(-this.speed);
    this.eye += f;
    this.at += f;
    this.updateViewMatrix();
  }
  moveLeft() {
    let f = new Vector3().set(this.at);
    f.sub(this.eye);
    f.normalize();
    let s = new Vector3().set(f);
    s.cross(this.up);
    s.normalize();
    s.mul(-this.speed);

    this.eye += s;
    this.at += s;
    this.updateViewMatrix();
  }
  moveRight() {
    let f = new Vector3().set(this.at);
    f.sub(this.eye);
    f.normalize();
    let s = new Vector3().set(f);
    s.cross(this.up);
    s.normalize();
    s.mul(this.speed);

    this.eye += s;
    this.at += s;
    this.updateViewMatrix();
  }
}
