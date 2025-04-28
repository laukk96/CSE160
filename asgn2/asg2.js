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
    gl.clearColor(clear_num, clear_num, clear_num, 1.0);
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
var g_selectedColor = [1.0, 1.0, 1.0, 1.0];
var g_segments = 6;
var g_globalAngle = 0;
var g_finAngle = 0;

function addActionsForHtmlUI(){
    // Button Events
    document.getElementById('clearButton').onclick = function(){
        g_shapesList = [];
        gl.clear(gl.COLOR_BUFFER_BIT);
    };

    // Angle Slider
    var angleSlide = document.getElementById('angleSlide');
    angleSlide.addEventListener('input', function(){g_globalAngle = this.value; renderAllShapes(); });

    // Fin Slider
    var finSlide = document.getElementById('finSlide');
    finSlide.addEventListener('input', function(){g_finAngle = this.value; renderAllShapes(); });
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

    renderAllShapes();
}

// var g_points = [];
// var g_colors = [];
// var g_sizes = [];
var g_shapesList = [];

function convertCoordinatesToGLSL(event){
    let x = event.clientX;
    let y = event.clientY;
    let rect = event.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width/2) / (canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

    return([x, y]);
}


function renderAllShapes(){
    let startTime = performance.now();

    // Pass the matrix to the u_ModelMatrix
    var globalRotMax=new Matrix4().rotate(g_globalAngle, 0, 1, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMax.elements);


    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Penguin Builder
    // Body Cube
    var bodyMatrix = new Matrix4();
    bodyColor = [0.2, 0.2, 0.2, 1.0];
    
    bodyMatrix.setTranslate(-.25, -.5, -.25);
    bodyMatrix.scale(.5, 1, .5); // Scale happens first (?) according to 2.2
    // bodyMatrix.rotate(5, 1, 1, 1);
    drawCube(bodyMatrix, bodyColor);

    // Head Cube
    var headMatrix = new Matrix4();
    headColor = bodyColor;
    headMatrix.setTranslate(-0.3/2, bodyMatrix.elements[1*4 + 1]/2, -0.3); // get the head y axis position, elements is 4x4
    headMatrix.scale(0.3, 0.3, 0.3);
    drawCube(headMatrix, headColor);

    // Right fin
    var rfin_mx = new Matrix4();
    // fin_color = bodyColor;
    fin_color = [0.2, .5, 1.0, 1.0];
    rfin_mx.setTranslate(0.25, (-.8+.1)/2, -0.25/2);
    rfin_mx.scale(0.1, 0.8, 0.25);
    drawCube(rfin_mx, fin_color);

    let duration = performance.now() - startTime;
    sendPerformanceStatsToHTML("ping (ms): " + Math.floor(duration) + " | fps: " + Math.floor(10000/duration)/10, "numdot");
}

function drawCube(M, targetColor){
    var cube = new Cube();
    cube.color = targetColor;
    cube.matrix = M;
    cube.render();
}


// asgn1 
// function click(event){
//     [x, y] = convertCoordinatesToGLSL(event);

//     createAndStorePoint([x, y]);

//     renderAllShapes(); 
// };



// Button Shape Events
    // document.getElementById('pointButton').onclick = function(){g_selectedType=POINT};
    // document.getElementById('triangleButton').onclick = function(){g_selectedType=TRIANGLE};
    // document.getElementById('circleButton').onclick = function(){g_selectedType=CIRCLE};
    // document.getElementById('cubeButton').onClick = function(){g_selectedType=CUBE};

    // Slider Events
    // var redSlide = document.getElementById('redSlide');
    // redSlide.addEventListener('mouseup', function(){ g_selectedColor[0] = redSlide.value/255.0});

    // var greenSlide = document.getElementById('greenSlide');
    // greenSlide.addEventListener('mouseup', function(){ g_selectedColor[1] = greenSlide.value/255.0});

    // var blueSlide = document.getElementById('blueSlide');
    // blueSlide.addEventListener('mouseup', function(){ g_selectedColor[2] = blueSlide.value/255.0});

    // var sizeSlide = document.getElementById('sizeSlide');
    // sizeSlide.addEventListener('mouseup', function(){g_selectedSize = this.value});

    // // Circle Segment Slider
    // var segmentSlide = document.getElementById('segmentSlide');
    // segmentSlide.addEventListener('mouseup', function(){g_segments = this.value});


// function createAndStorePoint([x, y]){
//     let point;
//     if (g_selectedType == POINT){ point = new Point() }
//     else if (g_selectedType == TRIANGLE){ point = new Triangle() }
//     else if (g_selectedType == CIRCLE){ 
//         point = new Circle();
//         point.segments=g_segments;
//     }
//     else if (g_selectedType == CUBE){
//         cube = new Cube();
//         cube.color = [1.0, 0.0, 1.0, 1.0];
//         cube.render();
//         // g_shapesList.push(cube);
//     }

//     point.position=[x, y];
//     point.color=g_selectedColor.slice();
//     point.size=g_selectedSize;
//     g_shapesList.push(point);
// }