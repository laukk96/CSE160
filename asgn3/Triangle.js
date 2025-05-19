class Triangle {
  constructor() {
    this.type = "triangle";
    this.position = [0.0, 0.0, 0.0];
    this.color = g_selectedColor.slice();
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.size = 5.0;
  }

  render() {
    let xy = this.position;
    let rgba = this.color;
    let size = this.size;

    // Pass position to a_Position variable
    // gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
    // Pass color to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    // Pass size
    gl.uniform1f(u_Size, size);

    // Draw Triangle
    let size_constant = size / 400;
    drawTriangle([
      xy[0],
      xy[1] + size_constant,
      xy[0] - size_constant,
      xy[1] - size_constant,
      xy[0] + size_constant,
      xy[1] - size_constant,
    ]);
  }
}

var g_vertexBuffer; // global vertex buffer for optimization
var g_uvbuffer;
function initVertexBuffer() {
  g_vertexBuffer = gl.createBuffer();
  if (!g_vertexBuffer) {
    console.log("Failed to create vertex buffer");
    return -1;
  }

  //   // Bind the buffer object to target
  //   gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);

  //   // Assign the buffer object to a_Position variable
  //   // NOTE: We only changed the parameter 2 -> 3.
  //   // This changes the number of things we pass through the function
  //   gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

  //   // Enable the assignment to a_Position variable
  //   gl.enableVertexAttribArray(a_Position);
}

function initUVBuffer() {
  // ---------
  // create a buffer object for UV
  g_uvbuffer = gl.createBuffer();
  if (!g_uvbuffer) {
    console.log("Failed to create the buffer object for UV");
    return -1;
  }

  //   // bind the buffer object to target
  //   gl.bindBuffer(gl.ARRAY_BUFFER, g_uvbuffer);

  //   // assign to a_Position attribute variable
  //   gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);

  //   // enable the assignment to a_UV variable
  //   gl.enableVertexAttribArray(a_UV);
}

function drawTriangle(vertices) {
  var n = 3;

  // Create vertex buffer
  var vertexBuffer = gl.createBuffer();

  // Bind the buffer object to target
  // Note: Always using gl.ARRAY_BUFFER
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  gl.drawArrays(gl.TRIANGLES, 0, n);
}

function drawTriangle3D(vertices) {
  // IMPORTANT: Vertex Buffers for 3D and 3DUV are DIFFERENT! Refresh each whenever you switch from 3D to 3DUV
  var n = vertices.length / 3;
  console.log("size of vertices / n:", vertices.length, " ", n);

  // Initialize Buffer Check
  if (!g_vertexBuffer) {
    initVertexBuffer();
  }

  // Validation check: Vertices
  if (vertices.length % 3 !== 0) {
    console.error(
      "drawTriangle3D: Vertex array length must be a multiple of 3. Got:",
      vertices.length
    );
    return;
  }

  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

  gl.drawArrays(gl.TRIANGLES, 0, n);
}

function drawTriangle3DUV(vertices, uv) {
  // IMPORTANT: Vertex Buffers for 3D and 3DUV are DIFFERENT! Refresh each whenever you switch from 3D to 3DUV
  var n = vertices.length / 3;

  if (!g_vertexBuffer) {
    initVertexBuffer();
  }
  if (!g_uvbuffer) {
    initUVBuffer();
  }

  // ---------- vertex buffer for position ------------
  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  // Assign the buffer object to a_Position variable
  // NOTE: We only changed the parameter 2 -> 3.
  // This changes the number of things we pass through the function
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  // ---------- UV BUFFER ------------
  // bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, g_uvbuffer);

  // write the data into the buffer
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.DYNAMIC_DRAW);
  // assign to a_Position attribute variable
  gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
  // enable the assignment to a_UV variable
  gl.enableVertexAttribArray(a_UV);

  gl.drawArrays(gl.TRIANGLES, 0, n);
}
