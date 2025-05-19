class Camera {
  constructor() {
    this.fov = 90; // float
    this.eye = new Vector3([0, 0, -3]); // vector3
    this.at = new Vector3([0, 0, 0]);
    this.up = new Vector3([0, 1, 0]);
    this.angle = 10;

    // Mouse Control variables
    this.yaw = -90.0; // yaw (left — right)
    this.pitch = 0.0; // pitch (up — down)
    this.mouseSensitivity = 0.25;
    this.isPointerLocked = false;

    this.viewMatrix = new Matrix4();
    this.projectionMatrix = new Matrix4().setPerspective(
      60,
      canvas.width / canvas.height,
      0.1,
      10000
    );
    this.speed = 0.1;
    this.updateViewMatrix();
  }
  updateYawPitchFromDirection() {
    let direction = new Vector3(this.at.elements[0], this.at.elements[1], this.at.elements[2])
      .sub(this.eye)
      .normalize();
    // Calculate yaw
    this.yaw = Math.atan2(direction.elements[0], direction.elements[2]) * (180 / Math.PI);
    // Calculate pitch
    this.pitch = Math.asin(direction.elements[1]) * (180 / Math.PI);
  }
  updateViewMatrix() {
    // Calculate the new direction vector from yaw and pitch
    let radYaw = this.yaw * (Math.PI / 180.0);
    let radPitch = this.pitch * (Math.PI / 180.0);

    let newFront = new Vector3();
    newFront.elements[0] = Math.cos(radYaw) * Math.cos(radPitch);
    newFront.elements[1] = Math.sin(radPitch);
    newFront.elements[2] = Math.sin(radYaw) * Math.cos(radPitch);
    newFront.normalize();

    this.at.set(this.eye).add(newFront);

    this.viewMatrix.setLookAt(
      this.eye.elements[0],
      this.eye.elements[1],
      this.eye.elements[2],
      this.at.elements[0],
      this.at.elements[1],
      this.at.elements[2],
      this.up.elements[0],
      this.up.elements[1],
      this.up.elements[2]
    );
  }
  moveForward() {
    let elementsat = this.at.elements;
    let f = new Vector3([elementsat[0], elementsat[1], elementsat[2]]); // normalized vector for lookVector
    f = f.sub(this.eye);

    f.normalize();

    f = f.mul(this.speed);

    this.eye = this.eye.add(f);
    this.at = this.at.add(f);

    this.updateViewMatrix();
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
  panLeft() {
    this.yaw -= this.angle;
    this.updateViewMatrix();
    return this;
  }

  panRight() {
    this.yaw += this.angle;
    this.updateViewMatrix();
    return this;
  }

  processMouseMovement(movementX, movementY, constrainPitch = true) {
    if (!this.isPointerLocked) return; // Only process if pointer is locked

    this.yaw += movementX * this.mouseSensitivity;
    this.pitch -= movementY * this.mouseSensitivity; // Invert Y movement

    // Constrain pitch to avoid flipping
    if (constrainPitch) {
      if (this.pitch > 89.0) this.pitch = 89.0;
      if (this.pitch < -89.0) this.pitch = -89.0;
    }

    this.updateViewMatrix();
  }
}
