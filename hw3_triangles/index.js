var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix;
    void main() {
        gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    }`;

var FSHADER_SOURCE = `
    precision mediump float;
    uniform vec4 u_FragColor;
    void main() {
       gl_FragColor = u_FragColor;
    }`;

// Globals
/** @type {HTMLCanvasElement} */
var canvas;
/** @type {WebGLRenderingContext} */
var gl;
var a_Position;
var u_FragColor;
var u_ModelMatrix;

// Functions from 1.3a
function setupWebGL(){
    // Retrieve the <canvas> element
    canvas = document.getElementById('webgl');
    if (!canvas) {
        console.log('Failed to retrieve the <canvas> element');
        return;
    }

    // Get the rendering context for WebGL
    // gl = getWebGLContext(canvas);
    gl = canvas.getContext('webgl', {preserveDrawingBuffer: true});
    if (!gl){
        console.log('Failed to return the rendering context for WebGL');
        return;
    }

    gl.enable(gl.DEPTH_TEST); // TODO: Fix black renders, recommended set to enable (Asgn2 requirement)
    // gl.disable(gl.CULL_FACE);

    // Specify color for clearing <canvas>
    const clear_num = 0.7;
    gl.clearColor(0.3, 0.6, 1.0, 1.0);
    // Clear the color and depth buffers
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // gl.clear(gl.COLOR_BUFFER_BIT);
}

function connectVariablesToGLSL(){
    // Initialize Shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)){
        console.log('Failed to initialize shaders.');
        return;
    }

    // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position'); // Javascript Pointer to the GLSL variable 
    if (a_Position < 0){
        console.log('Failed to get the storage location of a_Position');
        return;
    }
    // Get the storage location of u_ModelMatrix
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix){
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }
    // Hook up GlobalRotateMatrix
    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix){
        console.log('Failed to get the storage location of u_GlobalRotateMatrix');
        return;
    }

    // Get the storage location of u_FragColor variable
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor){
        console.log('Failed to get the storage location of u_FragColor');
        return;
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

var g_mouseCoords = {x:0, y:0};



function addActionsForHtmlUI(){
    // Button Events
    animationButton = document.getElementById('animationButton');
    animationButton.onclick = function(){
        g_animationBoolean = !g_animationBoolean;
        // if (g_animationBoolean) {g_startTime = performance.now()/1000.0; }
        g_animationBoolean ? animationButton.style.backgroundColor = 'rgba(0.0, 220.0, 50.0, 1.0)' : animationButton.style.backgroundColor = 'rgba(240.0, 0.0, 20.0, 1.0)';
    };

    // Angle Slider
    var angleSlide = document.getElementById('angleSlide');
    angleSlide.addEventListener('input', function(){g_globalAngle = this.value-180; renderAllShapes(); });

    // Fin Slider
    var finSlide = document.getElementById('finSlide');
    finSlide.addEventListener('input', function(){g_finAngle = this.value; renderAllShapes(); });

    // Foot Slider
    var footSlide = document.getElementById('footSlide'); // Get the new slider element by its ID
    footSlide.addEventListener('input', function(){ g_footAngle = this.value; renderAllShapes(); });

    // Neck Slider
    var neckSlide = document.getElementById('neckSlide');
    neckSlide.addEventListener('input', function() { g_neckAngle = this.value; renderAllShapes(); });

    // Torso Slider
    var torsoSlide = document.getElementById('torsoSlide');
    torsoSlide.addEventListener('input', function() { g_torsoAngle = this.value; renderAllShapes(); });

    // Beak Slider
    var beakSlide = document.getElementById('beakSlide');
    beakSlide.addEventListener('input', function() { g_beakAngle = this.value; renderAllShapes(); });

    // Canvas Mouse Move
    canvas.addEventListener('mousemove', handleMouseMove);
}

function sendPerformanceStatsToHTML(text, id){
    elem = document.getElementById(id);
    if (!elem){
        console.log("Cannot find element with id="+id);
        return;
    }
    elem.innerHTML = text;
}

// Main
function main() {
    setupWebGL();
    connectVariablesToGLSL();
    addActionsForHtmlUI();

    // canvas.onmousedown = click;
    // canvas.onmousemove = function(ev){ if (ev.buttons == 1){ click(ev); } };

    // renderAllShapes();
    requestAnimationFrame(tick);
}


function convertCoordinatesToGLSL(event){
    let x = event.clientX;
    let y = event.clientY;
    let rect = event.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width/2) / (canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

    return([x, y]);
}

// helper: createChildMatrixOfParent()
// -> will make child of cloned matrix as parent
function createChildMatrixOfParent(matrixToClone, scaleX, scaleY, scaleZ){
    newMatrix = new Matrix4();
    newMatrix.set(matrixToClone);
    newMatrix.scale(1/scaleX, 1/scaleY, 1/scaleZ);
    return newMatrix;
}

// helper: rotateLocalCenter()
// -> will make rotations easy
function rotateLocalCenter(matrix, angle, cx, cy, cz){
    matrix.translate(cx, cy, cz);
    matrix.rotate(angle, 1, 0, 0);
    matrix.translate(-cx, -cy, -cz);
}

green = [0.0, 1.0, 0.0, 1.0];
lightwhite = [0.9, 0.9, 0.9, 1.0];
black = [0.08, 0.08, 0.08, 1.0];
white = [1.0, 1.0, 1.0, 1.0];

function renderAllShapes(){
    let startTime = performance.now();

    // Pass the matrix to the u_ModelMatrix
    var globalRotMax=new Matrix4().rotate(-g_globalAngle, 0, 1, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMax.elements);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT);
}

function drawCube(M, targetColor){
    var cube = new Cube();
    cube.color = targetColor;
    cube.matrix = M;
    cube.render();
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;

function tick(){
    // global tick variable update
    g_seconds=performance.now()/1000.0 - g_startTime;
    // console.log(g_seconds);

    renderAllShapes();

    requestAnimationFrame(tick);
}

function handleMouseMove(event){
    g_mouseCoords = convertToWebGLCoords(event);
}

function convertToWebGLCoords(event){
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

function calculateMouseToPupilDifferential(worldposX, worldposY){
    var xdiff = g_mouseCoords.x - worldposX;
    var ydiff = g_mouseCoords.y - worldposY;

    return {xd: Math.max(-1, Math.min(xdiff*3, 1)), yd: Math.max(-1, Math.min(ydiff*3, 1))};
}