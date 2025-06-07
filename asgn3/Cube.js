class Cube {
  constructor() {
    this.type = "Cube";
    this.color = g_selectedColor.slice();
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
    this.textureNum = -2;

    this.allverts = [];
    this.allverts = this.allverts.concat([0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0]);
    this.allverts = this.allverts.concat([0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0]);

    this.allverts = this.allverts.concat([0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0]);
    this.allverts = this.allverts.concat([0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0]);

    this.allverts = this.allverts.concat([0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0]);
    this.allverts = this.allverts.concat([0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0]);

    this.allverts = this.allverts.concat([0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0]);
    this.allverts = this.allverts.concat([0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0]);

    this.allverts = this.allverts.concat([1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0]);
    this.allverts = this.allverts.concat([1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0]);

    this.allverts = this.allverts.concat([0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0]);
    this.allverts = this.allverts.concat([0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0]);

    this.uvs = [];
    this.uvs = this.uvs.concat([0.0, 0.0, 0.0, 1.0, 1.0, 1.0]); // front faze z = 0
    this.uvs = this.uvs.concat([0.0, 0.0, 1.0, 0.0, 1.0, 1.0]);

    this.uvs = this.uvs.concat([0.0, 0.0, 0.0, 1.0, 1.0, 1.0]);
    this.uvs = this.uvs.concat([0.0, 0.0, 1.0, 0.0, 1.0, 1.0]);

    this.uvs = this.uvs.concat([0.0, 0.0, 0.0, 1.0, 1.0, 1.0]);
    this.uvs = this.uvs.concat([0.0, 0.0, 1.0, 0.0, 1.0, 1.0]);

    this.uvs = this.uvs.concat([0.0, 0.0, 0.0, 1.0, 1.0, 1.0]);
    this.uvs = this.uvs.concat([0.0, 0.0, 1.0, 0.0, 1.0, 1.0]);

    this.uvs = this.uvs.concat([0.0, 0.0, 0.0, 1.0, 1.0, 1.0]);
    this.uvs = this.uvs.concat([0.0, 0.0, 1.0, 0.0, 1.0, 1.0]);

    this.uvs = this.uvs.concat([0.0, 0.0, 0.0, 1.0, 1.0, 1.0]);
    this.uvs = this.uvs.concat([0.0, 0.0, 1.0, 0.0, 1.0, 1.0]);
  }
  render() {
    var rgba = this.color;

    if (!g_vertexBuffer) {
      initVertexBuffer();
    }

    // Pass in the texture number
    gl.uniform1i(u_whichTexture, this.textureNum); // 1i — this means 1 integer
    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    // Pass the matrix to u_ModelMatrix attribute
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    // Front Face z = 0.0
    drawTriangle3DUV([0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0], [0.0, 0.0, 0.0, 1.0, 1.0, 1.0]);
    drawTriangle3DUV([0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0], [0.0, 0.0, 1.0, 0.0, 1.0, 1.0]);

    // Top Face y = 1.0
    drawTriangle3DUV([0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0], [0.0, 0.0, 0.0, 1.0, 1.0, 1.0]);
    drawTriangle3DUV([0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0], [0.0, 0.0, 1.0, 0.0, 1.0, 1.0]);

    // Left Face x = 0.0
    drawTriangle3DUV([0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0], [0.0, 0.0, 0.0, 1.0, 1.0, 1.0]);
    drawTriangle3DUV([0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0], [0.0, 0.0, 1.0, 0.0, 1.0, 1.0]);

    // Bottom Face y = 0.0
    drawTriangle3DUV([0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0], [0.0, 0.0, 0.0, 1.0, 1.0, 1.0]);
    drawTriangle3DUV([0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0], [0.0, 0.0, 1.0, 0.0, 1.0, 1.0]);

    // Right Face x = 1.0
    drawTriangle3DUV([1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0], [0.0, 0.0, 0.0, 1.0, 1.0, 1.0]);
    drawTriangle3DUV([1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0], [0.0, 0.0, 1.0, 0.0, 1.0, 1.0]);

    // Back Face z = 1.0
    drawTriangle3DUV([0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0], [0.0, 0.0, 0.0, 1.0, 1.0, 1.0]);
    drawTriangle3DUV([0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0], [0.0, 0.0, 1.0, 0.0, 1.0, 1.0]);
  }

  renderFast() {
    var rgba = this.color;

    gl.uniform1i(u_whichTexture, this.textureNum); // 1i — this means 1 integer
    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    // Pass the matrix to u_ModelMatrix attribute
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    // front face

    if (!g_vertexBuffer) {
      initVertexBuffer();
    }

    drawTriangle3DUV(this.allverts, this.uvs);
  }
}
