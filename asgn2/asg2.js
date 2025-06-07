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

    // Penguin Builder
    // Body Cube

    var targetAngle;

    var bodyx = 0.5;
    var bodyy = 1.0;
    var bodyz = bodyx;
    var bodyMatrix = new Matrix4();
    bodyColor = [0.2, 0.2, 0.2, 1.0];
    
    bodyMatrix.setTranslate(-.25, -.5, -.25);
    bodyMatrix.translate(bodyx/2, bodyy/2, bodyz/2);
    targetAngle = g_animationBoolean ? 30*Math.sin(g_seconds) : g_torsoAngle;
    var bodyRotAxisX = g_animationBoolean ? 1*Math.sin(g_seconds/4) : 1;
    var bodyRotAxisY = g_animationBoolean ? 3*Math.cos(g_seconds/7) : -1; 
    // bodyMatrix.rotate(, 1, -1, 0);
    bodyMatrix.rotate(targetAngle, bodyRotAxisX, bodyRotAxisY, 0);
    bodyMatrix.translate(-bodyx/2, -bodyy/2, -bodyz/2);
    bodyMatrix.scale(bodyx, bodyy, bodyz); // Scale happens first (?) according to 2.2
    drawCube(bodyMatrix, bodyColor);

    // Head Cube
    var hlc = 0.3/2; // head local center
    var hlc_y = 0.15;
    var headMatrix = createChildMatrixOfParent(bodyMatrix, bodyx, bodyy, bodyz);
    
    headColor = bodyColor;
    // headColor = green;
    targetAngle = g_animationBoolean ? 20*Math.sin(g_seconds*2/3) : -g_neckAngle;
    headMatrix.translate(-0.3/2+0.5/2, 1, -0.3/2);
    headMatrix.translate(hlc, hlc_y, hlc);
    headMatrix.rotate(targetAngle, 1, 0, 0);
    headMatrix.translate(-hlc, -hlc_y, -hlc);
    headMatrix.scale(0.3, 0.3, 0.3); 
    drawCube(headMatrix, headColor);

    // Right fin
    var rfin_mx = createChildMatrixOfParent(bodyMatrix, bodyx, bodyy, bodyz);
    fin_color = bodyColor;
    // fin_color = [0.2, .5, 1.0, 1.0];
    rfin_mx.translate(0.5, 0.9, 0.25+0.15);
    targetAngle = g_animationBoolean ? -20*Math.sin(g_seconds*2)+20 : g_finAngle;
    rfin_mx.rotate(targetAngle, 0, 0, 1);
    rfin_mx.rotate(180, 1, 0, 0);
    rfin_mx.scale(0.1, 0.8, 0.25);
    drawCube(rfin_mx, fin_color);

    // Left fin
    var lfin_mx = createChildMatrixOfParent(bodyMatrix, bodyx, bodyy, bodyz);
    lfin_mx.translate(0, 0.9, 0.25/2);
    targetAngle = g_animationBoolean ? 20*Math.sin(g_seconds*2)-20 : -g_finAngle;
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
    targetAngle = g_animationBoolean ? 45*Math.sin(g_seconds*10/3) : g_footAngle; 
    rfoot.translate(0.3+0.1/2, -0.2/2, -0.3/2);
    rotateLocalCenter(rfoot, targetAngle, flc_x/2, flc_y/2, flc_z*.8);
    rfoot.scale(0.2, 0.1, 0.3); // first
    
    // Left Foot
    var lfoot = createChildMatrixOfParent(bodyMatrix, bodyx, bodyy, bodyz);
    // targetAngle = g_animationBoolean ? -45*Math.sin(g_seconds*4) : -g_footAngle;
    targetAngle = -targetAngle;
    lfoot.translate(-.1/2, -0.2/2, -0.3/2);
    rotateLocalCenter(lfoot, targetAngle, flc_x/2, flc_y/2, flc_z*.8);
    lfoot.scale(0.2, 0.1, 0.3);
    
    drawCube(rfoot, orange);
    drawCube(lfoot, orange);

    // Belly (static part)
    var belly = createChildMatrixOfParent(bodyMatrix, bodyx, bodyy, bodyz);
    var bellyColor = [0.9, 0.9, 0.9, 1.0];
    belly.translate(0.2/2, 0, -.01/2);
    belly.scale(0.3, 0.9, 0.01);
    drawCube(belly, bellyColor);

    // Upper beak
    var beakx = 0.1;
    var beaky = 0.1/4;
    var beakz = 0.1;

    var upperBeak = createChildMatrixOfParent(headMatrix, 0.3, 0.3, 0.3);
    targetAngle = g_animationBoolean ? 5*Math.sin(g_seconds*3/2) + 5*Math.cos(g_seconds/3) + 10 : g_beakAngle;
    upperBeak.translate(0.1, 0.05, -0.1);
    rotateLocalCenter(upperBeak, targetAngle, beakx/2, beaky/2, beakz);
    upperBeak.scale(beakx, beaky, beakz);
    drawCube(upperBeak, orange);

    // Lower Beak
    var lowerBeak = createChildMatrixOfParent(headMatrix, 0.3, 0.3, 0.3);
    targetAngle = -targetAngle
    lowerBeak.translate(0.1, 0.05-beaky/2, -0.1);
    rotateLocalCenter(lowerBeak, targetAngle, beakx/2, beaky/2, beakz);
    lowerBeak.scale(beakx, beaky, beakz);
    drawCube(lowerBeak, orange);

    // Eyes
    var eyex = 0.08
    var eyey = eyex;
    var eyez = 0.01;

    var leftEye = createChildMatrixOfParent(headMatrix, 0.3, 0.3, 0.3);
    leftEye.translate(0.1/4, 0.06+eyey, -eyez/2);
    leftEye.scale(eyex, eyey, eyez);
    
    var rightEye = createChildMatrixOfParent(headMatrix, 0.3, 0.3, 0.3);
    rightEye.translate(0.1/4+eyex*2, 0.06+eyey, -eyez/2);
    rightEye.scale(eyex, eyey, eyez);

    drawCube(leftEye, lightwhite);
    drawCube(rightEye, lightwhite);

    // Pupils
    var pupil_sx = eyex*.5;
    var pupil_sy = eyey*.8
    var pupil_sz = eyez*.5

    var leftPupil = createChildMatrixOfParent(leftEye, eyex, eyey, eyez);
    var pmd = g_animationBoolean ? calculateMouseToPupilDifferential(leftPupil.elements[12], leftPupil.elements[13]) : {xd:0.1, yd:-.9}; // pmd = pupilMouseDiff
    leftPupil.translate(eyex*.25+pmd.xd*0.02, eyey*0.15+pmd.yd*0.015, -eyez*.5);
    leftPupil.scale(pupil_sx, pupil_sy, pupil_sz);
    drawCube(leftPupil, black);

    var rightPupil = createChildMatrixOfParent(rightEye, eyex, eyey, eyez);
    pmd = g_animationBoolean ? calculateMouseToPupilDifferential(rightPupil.elements[12], rightPupil.elements[13]) : {xd:0.1, yd:-.9}; // pmd = pupilMouseDiff
    rightPupil.translate(eyex*0.25+pmd.xd*0.02, eyey*0.15+pmd.yd*0.015, -eyez*.5);
    rightPupil.scale(eyex*.5, eyey*.8, eyez*.5);
    drawCube(rightPupil, black);

    // Eye Shine
    var leftEyeShine = createChildMatrixOfParent(leftPupil, pupil_sx, pupil_sy, pupil_sz);
    leftEyeShine.translate(0.025, eyey*0.55, -eyez*.5);
    leftEyeShine.scale(pupil_sx*.25, pupil_sy*.25, pupil_sz*0.25);
    drawCube(leftEyeShine, lightwhite);

    var rightEyeShine = createChildMatrixOfParent(rightPupil, pupil_sx, pupil_sy, pupil_sz);
    rightEyeShine.translate(0.025, eyey*0.55, -eyez*.5);
    rightEyeShine.scale(pupil_sx*.25, pupil_sy*.25, pupil_sz*0.25);
    drawCube(rightEyeShine, lightwhite);

    // console.log("rightPupil coords:" + rightPupil.elements[12], rightPupil.elements[13], rightPupil.elements[14] + "\nmouseCoords: " + g_mouseCoords.x + ", " + g_mouseCoords.y);

    let duration = performance.now() - startTime;
    sendPerformanceStatsToHTML("ping (ms): " + Math.floor(duration) + " | fps: " + Math.floor(10000/duration)/10, "numdot");
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