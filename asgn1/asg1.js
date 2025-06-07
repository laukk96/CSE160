
// DrawRectangle.js

function angleBetween(v1, v2){
    var mag1 = v1.magnitude();
    var mag2 = v2.magnitude();
    var thedot = Vector3.dot(v1, v2);
    var theAngle = parseFloat(Math.acos(thedot/(mag1 * mag2)));
    return theAngle*(180/Math.PI);
}

function areaTriangle(v1, v2){
    var v3 = Vector3.cross(v1, v2);
    var area = v3.magnitude()/2;
    return area;
}


var g_points = [];


// Vertex Shader Program
var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    uniform float u_Size;
    void main() {
    gl_Position = a_Position;
       gl_PointSize = u_Size; 
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
var u_Size;

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
    // Get the storage location of u_Size
    u_Size = gl.getUniformLocation(gl.program, 'u_Size');
    if (!u_Size){
        console.log('Failed to get the storage location of u_Size');
        return;
    }

    // Get the storage location of u_FragColor variable
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor){
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }
}

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Globals related to UI Elements
var g_selectedColor = [1.0, 1.0, 1.0, 1.0];
var g_selectedSize = 10;
var g_selectedType = POINT;
var g_segments = 6;

function addActionsForHtmlUI(){
    // Button Events
    document.getElementById('green').onclick = function(){g_selectedColor = [0.0, 1.0, 0.0, 1.0]};
    document.getElementById('red').onclick = function(){g_selectedColor = [1.0, 0.0, 0.0, 1.0]};
    document.getElementById('clearButton').onclick = function(){
        g_shapesList = [];
        gl.clear(gl.COLOR_BUFFER_BIT);
    };

    // Button Shape Events
    document.getElementById('pointButton').onclick = function(){g_selectedType=POINT};
    document.getElementById('triangleButton').onclick = function(){g_selectedType=TRIANGLE};
    document.getElementById('circleButton').onclick = function(){g_selectedType=CIRCLE};

    // Slider Events
    var redSlide = document.getElementById('redSlide');
    redSlide.addEventListener('mouseup', function(){ g_selectedColor[0] = redSlide.value/255.0});

    var greenSlide = document.getElementById('greenSlide');
    greenSlide.addEventListener('mouseup', function(){ g_selectedColor[1] = greenSlide.value/255.0});

    var blueSlide = document.getElementById('blueSlide');
    blueSlide.addEventListener('mouseup', function(){ g_selectedColor[2] = blueSlide.value/255.0});

    var sizeSlide = document.getElementById('sizeSlide');
    sizeSlide.addEventListener('mouseup', function(){g_selectedSize = this.value});

    // Circle Segment Slider
    var segmentSlide = document.getElementById('segmentSlide');
    segmentSlide.addEventListener('mouseup', function(){g_segments = this.value});
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

    // Specify color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    canvas.onmousedown = click;
    canvas.onmousemove = function(ev){ if (ev.buttons == 1){ click(ev); } };
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

function createAndStorePoint([x, y]){
    let point;
    if (g_selectedType == POINT){ point = new Point() }
    else if (g_selectedType == TRIANGLE){ point = new Triangle() }
    else if (g_selectedType == CIRCLE){ 
        point = new Circle();
        point.segments=g_segments;
    }

    point.position=[x, y];
    point.color=g_selectedColor.slice();
    point.size=g_selectedSize;
    g_shapesList.push(point);
}

function renderAllShapes(){
    let startTime = performance.now();
    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Draw all points
    let len = g_shapesList.length;
    for (let i = 0; i < len; i++){
        g_shapesList[i].render();
    }

    let duration = performance.now() - startTime;
    sendPerformanceStatsToHTML("numdot: " + len + " | ms: " + Math.floor(duration) + " | fps: " + Math.floor(10000/duration)/10, "numdot");
}



function click(event){
    [x, y] = convertCoordinatesToGLSL(event);

    createAndStorePoint([x, y]);

    renderAllShapes(); 
};