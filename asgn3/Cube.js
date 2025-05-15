class Cube {
  constructor() {
    this.type = "Cube";
    this.color = g_selectedColor.slice();
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
    this.textureNum = -2;
  }
  render() {
    var rgba = this.color;

    // Pass in the texture number
    gl.uniform1i(u_whichTexture, this.textureNum); // 1i — this means 1 integer
    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    // Pass the matrix to u_ModelMatrix attribute
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    // // Front Face z = 0.0
    // drawTriangle3D( [0.0,0.0,0.0, 0.0,1.0,0.0, 1.0,1.0,0.0 ]);
    // drawTriangle3D( [0.0,0.0,0.0, 1.0,0.0,0.0, 1.0,1.0,0.0 ]);
    // // Front: new 3d UV triangle test
    // // drawTriangle3DUV([0,0,0, 1,1,0, 1,0,0], [1,0, 0,1, 1,1]);

    // // Top Face y = 1.0
    // drawTriangle3D( [0.0,1.0,0.0, 0.0,1.0,1.0, 1.0,1.0,1.0 ]);
    // drawTriangle3D( [0.0,1.0,0.0, 1.0,1.0,0.0, 1.0,1.0,1.0 ]);

    // // Left Face x = 0.0
    // drawTriangle3D( [0.0,0.0,0.0, 0.0,1.0,0.0, 0.0,1.0,1.0 ]);
    // drawTriangle3D( [0.0,0.0,0.0, 0.0,0.0,1.0, 0.0,1.0,1.0 ]);

    // // Pass the color of a point to u_FragColor variable
    // // Make it lighter to "emulate" lighting
    // gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]*1);

    // // Bottom Face y = 0.0
    // drawTriangle3D( [0.0,0.0,0.0, 0.0,0.0,1.0, 1.0,0.0,1.0 ]);
    // drawTriangle3D( [0.0,0.0,0.0, 1.0,0.0,0.0, 1.0,0.0,1.0 ]);

    // // Right Face x = 1.0
    // drawTriangle3D( [1.0,0.0,0.0, 1.0,1.0,0.0, 1.0,1.0,1.0 ]);
    // drawTriangle3D( [1.0,0.0,0.0, 1.0,0.0,1.0, 1.0,1.0,1.0 ]);

    // // Back Face z = 1.0
    // drawTriangle3D( [0.0,0.0,1.0, 0.0,1.0,1.0, 1.0,1.0,1.0 ]);
    // drawTriangle3D( [0.0,0.0,1.0, 1.0,0.0,1.0, 1.0,1.0,1.0 ]);

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
}
