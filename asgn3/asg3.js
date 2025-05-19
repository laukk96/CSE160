var VSHADER_SOURCE = `
    precision mediump float;
    attribute vec4 a_Position;
    attribute vec2 a_UV;
    varying vec2 v_UV;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ProjMatrix;
    void main() {
        gl_Position = u_ProjMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
        v_UV = a_UV;
    }`;

// projection matrix sets the perspective camera lens
// view matrix sets the camera's position and angle
// global rotate matrix for scene-wide rotating (like orbiting)
// model matrix for transforming the individual object

var FSHADER_SOURCE = `
    precision mediump float;
    varying vec2 v_UV;
    uniform vec4 u_FragColor;
    uniform sampler2D u_Sampler0; // sky.jpg
    uniform sampler2D u_Sampler1; // grass.jpg
    uniform int u_whichTexture;
    void main() {
        if (u_whichTexture == -2){
            gl_FragColor = u_FragColor; 
        } else if (u_whichTexture == -1){
            gl_FragColor = vec4(v_UV,1.0,1.0);
        } else if (u_whichTexture == 0){
            gl_FragColor = texture2D(u_Sampler0, v_UV);
        } else if (u_whichTexture == 1){
            gl_FragColor = texture2D(u_Sampler1, v_UV);
        }else{
            gl_FragColor = vec4(.1,.2,.2,.1); // error, reddish
            // gl_FragColor = vec4(v_UV,1.0,1.0);
        }
    }`;

// Globals
/** @type {HTMLCanvasElement} */
var canvas;
/** @type {WebGLRenderingContext} */
var gl;
var a_Position;
let a_UV;
var u_FragColor;
let u_GlobalRotateMatrix;
var u_ModelMatrix;
let u_ProjMatrix;
let u_ViewMatrix;
var u_Sampler0;
var u_Sampler1;
var u_whichTexture;
/** @type {Camera} */
let g_camera;

// --------- TextureQuad.js Book Example ---------
function initTextures(gl, n) {
  var image0 = new Image(); // Create the image object
  if (!image0) {
    console.log("Failed to create the image object");
    return false;
  }
  // Register the event handler to be called on loading an image
  image0.onload = function () {
    sendImageToTEXTUREi(gl, n, u_Sampler0, image0, gl.TEXTURE0, 0);
  };
  // Tell the browser to load an image
  image0.src = "../resources/sky.jpg";

  // Texture 1: Grass block
  var image1 = new Image();
  if (!image1) {
    console.log("Failed to create the image object");
    return false;
  }
  // Register the event handler to be called on loading an image
  image1.onload = function () {
    sendImageToTEXTUREi(gl, n, u_Sampler1, image1, gl.TEXTURE1, 1);
  };
  // Tell the browser to load an image
  image1.src = "../resources/iceperf.jpg";
  return true;
}

// Sends the texture to GLSL
function sendImageToTEXTUREi(gl, n, u_Sampler, image, glTexture, i) {
  var texture = gl.createTexture(); // Create a texture object on the GPU
  if (!texture) {
    console.log("Failed to create the texture object");
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // note: originally the image has y=0 on the top
  // Enable texture unit0
  gl.activeTexture(glTexture);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // Set the texture unit 0 to the sampler
  // note: Tells GLSL to set u_Sampler equal to texture unit 0
  gl.uniform1i(u_Sampler, i);

  gl.clear(gl.COLOR_BUFFER_BIT); // Clear <canvas>

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle
}

// Functions from 1.3a
function setupWebGL() {
  // Retrieve the <canvas> element
  canvas = document.getElementById("webgl");
  if (!canvas) {
    console.log("Failed to retrieve the <canvas> element");
    return;
  }

  // Get the rendering context for WebGL
  // gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log("Failed to return the rendering context for WebGL");
    return;
  }

  gl.enable(gl.DEPTH_TEST); // TODO: Fix black renders, recommended set to enable (Asgn2 requirement)
  gl.disable(gl.CULL_FACE);

  // Specify color for clearing <canvas>
  // const clear_num = 0.7;
  gl.clearColor(0.3, 0.6, 1.0, 1.0);
  // Clear the color and depth buffers
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // gl.clear(gl.COLOR_BUFFER_BIT);

  // Camera system
  g_camera = new Camera();
}

function connectVariablesToGLSL() {
  // Initialize Shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log("Failed to initialize shaders.");
    return;
  }

  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, "a_Position"); // Javascript Pointer to the GLSL variable
  if (a_Position < 0) {
    console.log("Failed to get the storage location of a_Position");
    return;
  }

  a_UV = gl.getAttribLocation(gl.program, "a_UV"); // Javascript Pointer to the GLSL variable
  if (a_UV < 0) {
    console.log("Failed to get the storage location of a_UV");
    return;
  }
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, "u_GlobalRotateMatrix");
  if (!u_GlobalRotateMatrix) {
    console.log("Failed to get the storage location of u_GlobalRotateMatrix");
    return;
  }

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
  if (!u_ModelMatrix) {
    console.log("Failed to get the storage location of u_ModelMatrix");
    return;
  }

  // Get the storage location of u_ProjMatrix
  u_ProjMatrix = gl.getUniformLocation(gl.program, "u_ProjMatrix");
  if (!u_ProjMatrix) {
    console.log("Failed to get the storage location of u_ProjMatrix");
    return;
  }

  // Get the storage location of u_ViewMatrix
  u_ViewMatrix = gl.getUniformLocation(gl.program, "u_ViewMatrix");
  if (!u_ViewMatrix) {
    console.log("Failed to get the storage location of u_ViewMatrix");
    return;
  }

  // Get the storage location of u_FragColor variable
  u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
  if (!u_FragColor) {
    console.log("Failed to get the storage location of u_FragColor");
    return;
  }

  // -------------- Textures: u_Sampler --------------
  // Get the storage location of u_Sampler0
  u_Sampler0 = gl.getUniformLocation(gl.program, "u_Sampler0");
  if (!u_Sampler0) {
    console.log("Failed to get the storage location of u_Sampler0");
    return false;
  }
  u_Sampler1 = gl.getUniformLocation(gl.program, "u_Sampler1");
  if (!u_Sampler1) {
    console.log("Failed to get the storage location of u_Sampler1");
    return false;
  }

  // -------------- Textures: u_whichTexture --------------
  u_whichTexture = gl.getUniformLocation(gl.program, "u_whichTexture");
  if (!u_whichTexture) {
    console.log("Failed to get the storage location of u_whichTexture");
    return false;
  }
}

// Globals related to UI Elements
var g_animationBoolean = true;
var g_selectedColor = [1.0, 1.0, 1.0, 1.0];
var g_segments = 6;
var g_globalAngle = 0;
var g_finAngle = 0;
var g_footAngle = 0;
var g_neckAngle = 0;
var g_torsoAngle = 0;
var g_beakAngle = 0;

var g_mouseCoords = { x: 0, y: 0 };

function addActionsForHtmlUI() {
  // Button Events
  animationButton = document.getElementById("animationButton");
  animationButton.onclick = function () {
    g_animationBoolean = !g_animationBoolean;
    // if (g_animationBoolean) {g_startTime = performance.now()/1000.0; }
    g_animationBoolean
      ? (animationButton.style.backgroundColor = "rgba(0.0, 220.0, 50.0, 1.0)")
      : (animationButton.style.backgroundColor = "rgba(240.0, 0.0, 20.0, 1.0)");
  };

  // Angle Slider
  var angleSlide = document.getElementById("angleSlide");
  angleSlide.addEventListener("input", function () {
    g_globalAngle = this.value - 180;
    // renderAllShapes();
  });

  // Fin Slider
  var finSlide = document.getElementById("finSlide");
  finSlide.addEventListener("input", function () {
    g_finAngle = this.value;
    // renderAllShapes();
  });

  // Foot Slider
  var footSlide = document.getElementById("footSlide"); // Get the new slider element by its ID
  footSlide.addEventListener("input", function () {
    g_footAngle = this.value;
    // renderAllShapes();
  });

  // Neck Slider
  var neckSlide = document.getElementById("neckSlide");
  neckSlide.addEventListener("input", function () {
    g_neckAngle = this.value;
    // renderAllShapes();
  });

  // Torso Slider
  var torsoSlide = document.getElementById("torsoSlide");
  torsoSlide.addEventListener("input", function () {
    g_torsoAngle = this.value;
    // renderAllShapes();
  });

  // Beak Slider
  var beakSlide = document.getElementById("beakSlide");
  beakSlide.addEventListener("input", function () {
    g_beakAngle = this.value;
    // renderAllShapes();
  });

  // Canvas Mouse Move
  canvas.addEventListener("mousemove", handleMouseMove);
}

function sendPerformanceStatsToHTML(text, id) {
  elem = document.getElementById(id);
  if (!elem) {
    console.log("Cannot find element with id=" + id);
    return;
  }
  elem.innerHTML = text;
}

// Main
function main() {
  initMap();
  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();
  addPointerLockAndMouseControls();

  // From 3.7 Handling input
  document.onkeydown = keydown;

  // From 3.2/3.3 of tutorial
  initTextures(gl, 0);

  // renderAllShapes();
  requestAnimationFrame(tick);
}

function convertCoordinatesToGLSL(event) {
  let x = event.clientX;
  let y = event.clientY;
  let rect = event.target.getBoundingClientRect();

  x = (x - rect.left - canvas.width / 2) / (canvas.width / 2);
  y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

  return [x, y];
}

// helper: createChildMatrixOfParent()
// -> will make child of cloned matrix as parent
function createChildMatrixOfParent(matrixToClone, scaleX, scaleY, scaleZ) {
  newMatrix = new Matrix4();
  newMatrix.set(matrixToClone);
  // scale down so the matrix is a "unit matrix"
  newMatrix.scale(1 / scaleX, 1 / scaleY, 1 / scaleZ);
  return newMatrix;
}

// helper: rotateLocalCenter()
// -> will make rotations easy
function rotateLocalCenter(matrix, angle, cx, cy, cz) {
  matrix.translate(cx, cy, cz);
  matrix.rotate(angle, 1, 0, 0);
  matrix.translate(-cx, -cy, -cz);
}

// --------------- Input Handler ---------------

keycodeBind = {
  87: () => g_camera.moveForward(), // W
  65: () => g_camera.moveLeft(), // A
  83: () => g_camera.moveBackward(), // S
  68: () => g_camera.moveRight(), // D

  81: () => g_camera.panLeft(), // Q
  69: () => g_camera.panRight(), // E
};

function keydown(ev) {
  const handler = keycodeBind[ev.keyCode];
  if (handler) handler();
}

// --------------- Map Creator ---------------

var map = Array(32)
  .fill()
  .map(() => Array(32).fill(0));

function initMap() {
  for (let i = 0; i < 32; i++) {
    for (let j = 0; j < 32; j++) {
      map[i][j] = Math.random() < 0.3 ? Math.floor(Math.random() * 5) + 1 : 0;
    }
  }
  // console.log("map: ", map.flat().join(" "));
}

let mapDiff = 16;
let smallScale = 0.5;

function drawMap() {
  var wallcolor = [0.0, 0.5, 0.2, 1.0];
  for (let i = 0; i < 32; i++) {
    for (let j = 0; j < 32; j++) {
      let height = map[i][j];
      for (let h = 0; h < height; h++) {
        let wall = new Matrix4();
        wall.translate(0, -0.75, 0);
        wall.translate((i - mapDiff) * smallScale, h * smallScale, (j - mapDiff) * smallScale);
        wall.scale(smallScale, smallScale, smallScale);
        drawCubeFast(wall, wallcolor, 1);
      }
    }
  }
}
// --------------- Render function ---------------

green = [0.0, 1.0, 0.0, 1.0];
lightwhite = [0.9, 0.9, 0.9, 1.0];
black = [0.08, 0.08, 0.08, 1.0];
white = [1.0, 1.0, 1.0, 1.0];

function renderAllShapes() {
  let startTime = performance.now();

  // global rotate matrix
  var globalRotMax = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMax.elements);

  // model matrix
  var modelMatrix = new Matrix4();
  modelMatrix.rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  // ---------- Camera.js Projection Setup ----------
  // view matrix perspective
  gl.uniformMatrix4fv(u_ViewMatrix, false, g_camera.viewMatrix.elements);
  // console.log("viewMatrix:", g_camera.viewMatrix.elements);
  // // projection matrix perspective
  gl.uniformMatrix4fv(u_ProjMatrix, false, g_camera.projectionMatrix.elements);
  // console.log("proj matrix:", g_camera.projectionMatrix.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  //   gl.clear(gl.COLOR_BUFFER_BIT);

  // --------------- Terrain ------------------
  drawGroundCube();
  drawSkyBox();
  drawMap();
  // --------------- Penguin Builder ---------------
  drawPenguin();

  // console.log("rightPupil coords:" + rightPupil.elements[12], rightPupil.elements[13], rightPupil.elements[14] + "\nmouseCoords: " + g_mouseCoords.x + ", " + g_mouseCoords.y);

  let duration = performance.now() - startTime;
  sendPerformanceStatsToHTML(
    "ping (ms): " + Math.floor(duration) + " | fps: " + Math.floor(10000 / duration) / 10,
    "numdot"
  );
}

// ----------- drawCube --------------
function drawCube(M, targetColor = [0.8, 0.8, 0.8, 1.0], textureNum = -2) {
  var cube = new Cube();
  cube.color = targetColor;
  cube.textureNum = textureNum;
  cube.matrix = M;
  cube.render();
}

function drawCubeFast(M, targetColor = [0.8, 0.8, 0.8, 1.0], textureNum = -2) {
  var cube = new Cube();
  cube.color = targetColor;
  cube.textureNum = textureNum;
  cube.matrix = M;
  cube.renderFast();
}

var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;

function tick() {
  // global tick variable update
  g_seconds = performance.now() / 1000.0 - g_startTime;
  // console.log(g_seconds);

  renderAllShapes();
  requestAnimationFrame(tick);
}

function handleMouseMove(event) {
  g_mouseCoords = convertToWebGLCoords(event);
}

function convertToWebGLCoords(event) {
  const rect = canvas.getBoundingClientRect(); // Get canvas position and size

  // Calculate mouse position relative to the canvas's top-left corner
  const pixelX = event.clientX - rect.left;
  const pixelY = event.clientY - rect.top;

  // Convert pixel coordinates to WebGL clip space coordinates
  const clipX = (pixelX / canvas.width) * 2 - 1;
  // Flip Y axis: (pixelY / canvas.height) gives 0 at top, 1 at bottom
  // We want 1 at top, -1 at bottom
  const clipY = 1 - (pixelY / canvas.height) * 2;

  return { x: clipX, y: clipY };
}

function calculateMouseToPupilDifferential(worldposX, worldposY) {
  var xdiff = g_mouseCoords.x - worldposX;
  var ydiff = g_mouseCoords.y - worldposY;

  return { xd: Math.max(-1, Math.min(xdiff * 3, 1)), yd: Math.max(-1, Math.min(ydiff * 3, 1)) };
}

function drawSkyBox() {
  const skyboxScale = 1000;
  var skybox = new Matrix4();
  skybox.setTranslate(-50, -1, -50);
  skybox.scale(skyboxScale, skyboxScale, skyboxScale);
  drawCube(skybox, [0.1, 0.1, 0.1, 1.0], 0);
}

function drawGroundCube() {
  var cubematrix = new Matrix4();
  groundColor = [0.8, 0.8, 0.8, 1.0];
  cubematrix.setTranslate(0, 0, 0);
  cubematrix.translate(-18 / 2, -0.8, -18 / 2);
  cubematrix.scale(18, 0.1, 18);
  drawCube(cubematrix, groundColor);
}

function drawPenguin() {
  // Body Cube
  var targetAngle;

  var bodyx = 0.5;
  var bodyy = 1.0;
  var bodyz = bodyx;
  var bodyMatrix = new Matrix4();
  bodyColor = [0.2, 0.2, 0.2, 1.0];

  var mapYDiff = Math.max(map[15][15], map[15][16], map[16][15], map[16][16]) * 0.5;

  // bodyMatrix.setTranslate(0, 0, 0);
  bodyMatrix.setTranslate(-0.25, -0.5 + mapYDiff, -0.25);
  bodyMatrix.translate(bodyx / 2, bodyy / 2, bodyz / 2);
  targetAngle = g_animationBoolean ? 30 * Math.sin(g_seconds) : g_torsoAngle;
  var bodyRotAxisX = g_animationBoolean ? 1 * Math.sin(g_seconds / 4) : 1;
  var bodyRotAxisY = g_animationBoolean ? 3 * Math.cos(g_seconds / 7) : -1;
  bodyMatrix.rotate(targetAngle, bodyRotAxisX, bodyRotAxisY, 0);
  bodyMatrix.translate(-bodyx / 2, -bodyy / 2, -bodyz / 2);
  bodyMatrix.scale(bodyx, bodyy, bodyz); // Scale happens first (?) according to 2.2
  drawCube(bodyMatrix, bodyColor);

  // Head Cube
  var hlc = 0.3 / 2; // head local center
  var hlc_y = 0.15;
  var headMatrix = createChildMatrixOfParent(bodyMatrix, bodyx, bodyy, bodyz);

  headColor = bodyColor;
  // headColor = green;
  targetAngle = g_animationBoolean ? 20 * Math.sin((g_seconds * 2) / 3) : -g_neckAngle;
  headMatrix.translate(-0.3 / 2 + 0.5 / 2, 1, -0.3 / 2);
  headMatrix.translate(hlc, hlc_y, hlc);
  headMatrix.rotate(targetAngle, 1, 0, 0);
  headMatrix.translate(-hlc, -hlc_y, -hlc);
  headMatrix.scale(0.3, 0.3, 0.3);
  drawCube(headMatrix, headColor);

  // Right fin
  var rfin_mx = createChildMatrixOfParent(bodyMatrix, bodyx, bodyy, bodyz);
  fin_color = bodyColor;
  // fin_color = [0.2, .5, 1.0, 1.0];
  rfin_mx.translate(0.5, 0.9, 0.25 + 0.15);
  targetAngle = g_animationBoolean ? -20 * Math.sin(g_seconds * 2) + 20 : g_finAngle;
  rfin_mx.rotate(targetAngle, 0, 0, 1);
  rfin_mx.rotate(180, 1, 0, 0);
  rfin_mx.scale(0.1, 0.8, 0.25);
  drawCube(rfin_mx, fin_color);

  // Left fin
  var lfin_mx = createChildMatrixOfParent(bodyMatrix, bodyx, bodyy, bodyz);
  lfin_mx.translate(0, 0.9, 0.25 / 2);
  targetAngle = g_animationBoolean ? 20 * Math.sin(g_seconds * 2) - 20 : -g_finAngle;
  lfin_mx.rotate(targetAngle, 0, 0, 1);
  lfin_mx.rotate(180, 0, 0, 1);
  lfin_mx.scale(0.1, 0.8, 0.25);
  drawCube(lfin_mx, fin_color);

  // Foot Config
  var flc_x = 0.2; // Foot local center x
  var flc_y = 0.1;
  var flc_z = 0.3;
  orange = [1, 0.6, 0, 1.0];

  // Right foot
  var rfoot = createChildMatrixOfParent(bodyMatrix, bodyx, bodyy, bodyz);
  targetAngle = g_animationBoolean ? 45 * Math.sin((g_seconds * 10) / 3) : g_footAngle;
  rfoot.translate(0.3 + 0.1 / 2, -0.2 / 2, -0.3 / 2);
  rotateLocalCenter(rfoot, targetAngle, flc_x / 2, flc_y / 2, flc_z * 0.8);
  rfoot.scale(0.2, 0.1, 0.3); // first

  // Left Foot
  var lfoot = createChildMatrixOfParent(bodyMatrix, bodyx, bodyy, bodyz);
  // targetAngle = g_animationBoolean ? -45*Math.sin(g_seconds*4) : -g_footAngle;
  targetAngle = -targetAngle;
  lfoot.translate(-0.1 / 2, -0.2 / 2, -0.3 / 2);
  rotateLocalCenter(lfoot, targetAngle, flc_x / 2, flc_y / 2, flc_z * 0.8);
  lfoot.scale(0.2, 0.1, 0.3);

  drawCube(rfoot, orange);
  drawCube(lfoot, orange);

  // Belly (static part)
  var belly = createChildMatrixOfParent(bodyMatrix, bodyx, bodyy, bodyz);
  var bellyColor = [0.9, 0.9, 0.9, 1.0];
  belly.translate(0.2 / 2, 0, -0.01 / 2);
  belly.scale(0.3, 0.9, 0.01);
  drawCube(belly, bellyColor);

  // Upper beak
  var beakx = 0.1;
  var beaky = 0.1 / 4;
  var beakz = 0.1;

  var upperBeak = createChildMatrixOfParent(headMatrix, 0.3, 0.3, 0.3);
  targetAngle = g_animationBoolean
    ? 5 * Math.sin((g_seconds * 3) / 2) + 5 * Math.cos(g_seconds / 3) + 10
    : g_beakAngle;
  upperBeak.translate(0.1, 0.05, -0.1);
  rotateLocalCenter(upperBeak, targetAngle, beakx / 2, beaky / 2, beakz);
  upperBeak.scale(beakx, beaky, beakz);
  drawCube(upperBeak, orange);

  // Lower Beak
  var lowerBeak = createChildMatrixOfParent(headMatrix, 0.3, 0.3, 0.3);
  targetAngle = -targetAngle;
  lowerBeak.translate(0.1, 0.05 - beaky / 2, -0.1);
  rotateLocalCenter(lowerBeak, targetAngle, beakx / 2, beaky / 2, beakz);
  lowerBeak.scale(beakx, beaky, beakz);
  drawCube(lowerBeak, orange);

  // Eyes
  var eyex = 0.08;
  var eyey = eyex;
  var eyez = 0.01;

  var leftEye = createChildMatrixOfParent(headMatrix, 0.3, 0.3, 0.3);
  leftEye.translate(0.1 / 4, 0.06 + eyey, -eyez / 2);
  leftEye.scale(eyex, eyey, eyez);

  var rightEye = createChildMatrixOfParent(headMatrix, 0.3, 0.3, 0.3);
  rightEye.translate(0.1 / 4 + eyex * 2, 0.06 + eyey, -eyez / 2);
  rightEye.scale(eyex, eyey, eyez);

  drawCube(leftEye, lightwhite);
  drawCube(rightEye, lightwhite);

  // Pupils
  var pupil_sx = eyex * 0.5;
  var pupil_sy = eyey * 0.8;
  var pupil_sz = eyez * 0.5;

  var leftPupil = createChildMatrixOfParent(leftEye, eyex, eyey, eyez);
  var pmd = g_animationBoolean
    ? calculateMouseToPupilDifferential(leftPupil.elements[12], leftPupil.elements[13])
    : { xd: 0.1, yd: -0.9 }; // pmd = pupilMouseDiff
  leftPupil.translate(eyex * 0.25 + pmd.xd * 0.02, eyey * 0.15 + pmd.yd * 0.015, -eyez * 0.5);
  leftPupil.scale(pupil_sx, pupil_sy, pupil_sz);
  drawCube(leftPupil, black);

  var rightPupil = createChildMatrixOfParent(rightEye, eyex, eyey, eyez);
  pmd = g_animationBoolean
    ? calculateMouseToPupilDifferential(rightPupil.elements[12], rightPupil.elements[13])
    : { xd: 0.1, yd: -0.9 }; // pmd = pupilMouseDiff
  rightPupil.translate(eyex * 0.25 + pmd.xd * 0.02, eyey * 0.15 + pmd.yd * 0.015, -eyez * 0.5);
  rightPupil.scale(eyex * 0.5, eyey * 0.8, eyez * 0.5);
  drawCube(rightPupil, black);

  // Eye Shine
  var leftEyeShine = createChildMatrixOfParent(leftPupil, pupil_sx, pupil_sy, pupil_sz);
  leftEyeShine.translate(0.025, eyey * 0.55, -eyez * 0.5);
  leftEyeShine.scale(pupil_sx * 0.25, pupil_sy * 0.25, pupil_sz * 0.25);
  drawCube(leftEyeShine, lightwhite);

  var rightEyeShine = createChildMatrixOfParent(rightPupil, pupil_sx, pupil_sy, pupil_sz);
  rightEyeShine.translate(0.025, eyey * 0.55, -eyez * 0.5);
  rightEyeShine.scale(pupil_sx * 0.25, pupil_sy * 0.25, pupil_sz * 0.25);
  drawCube(rightEyeShine, lightwhite);
}

function addPointerLockAndMouseControls() {
  // Request pointer lock when canvas is clicked
  canvas.addEventListener(
    "click",
    () => {
      // Keep the fallback for the method call itself
      canvas.requestPointerLock = canvas.requestPointerLock;
      if (canvas.requestPointerLock) {
        canvas.requestPointerLock();
      } else {
        console.warn("Pointer Lock API not supported by this browser.");
      }
    },
    false
  );

  // Handle pointer lock state changes
  document.addEventListener("pointerlockchange", lockChangeAlert, false);

  function lockChangeAlert() {
    // Check against the standard document.pointerLockElement
    if (document.pointerLockElement === canvas) {
      if (!g_camera.isPointerLocked) {
        console.log("Pointer Lock: Engaged");
        g_camera.isPointerLocked = true;
        document.addEventListener("mousemove", handleCameraMouseMove, false);
      }
    } else {
      console.log("Pointer Lock: Disengaged");
      g_camera.isPointerLocked = false;
      document.removeEventListener("mousemove", handleCameraMouseMove, false);
    }
  }

  // Handle mouse movement
  function handleCameraMouseMove(event) {
    if (g_camera.isPointerLocked) {
      const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
      const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
      g_camera.processMouseMovement(movementX, movementY);
    }
  }
}
