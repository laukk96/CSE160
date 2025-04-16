
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
    gl = getWebGLContext(canvas);
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

var g_selectedColor = [1.0, 1.0, 1.0, 1.0];
var g_selectedSize = 10;

function addActionsForHtmlUI(){
    // Button Events
    document.getElementById('green').onclick = function(){g_selectedColor = [0.0, 1.0, 0.0, 1.0]};
    document.getElementById('red').onclick = function(){g_selectedColor = [1.0, 0.0, 0.0, 1.0]};
    
    // Slider Events
    var redSlide = document.getElementById('redSlide');
    redSlide.addEventListener('mouseup', function(){ g_selectedColor[0] = redSlide.value/255.0});

    var greenSlide = document.getElementById('greenSlide');
    greenSlide.addEventListener('mouseup', function(){ g_selectedColor[1] = greenSlide.value/255.0});

    var blueSlide = document.getElementById('blueSlide');
    blueSlide.addEventListener('mouseup', function(){ g_selectedColor[2] = blueSlide.value/255.0});

    var sizeSlide = document.getElementById('sizeSlide');
    sizeSlide.addEventListener('mouseup', function(){g_selectedSize = this.value});
}

// Main
function main() {
    setupWebGL();
    connectVariablesToGLSL();
    addActionsForHtmlUI();

    // Specify color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    canvas.onmousedown = function(event){
        click(event);
    }
}

var g_points = [];
var g_colors = [];
var g_sizes = [];


function convertCoordinatesToGLSL(event){
    let x = event.clientX;
    let y = event.clientY;
    let rect = event.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width/2) / (canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

    return([x, y]);
}

function renderAllShapes(){
    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Draw all points
    let len = g_points.length;
    for (let i = 0; i < len; i++){
        let xy = g_points[i];
        let rgba = g_colors[i];
        let size = g_sizes[i];

        // Pass position to a_Position variable
        gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
        // Pass color to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        // Pass size
        gl.uniform1f(u_Size, size);
        // Draw Point
        gl.drawArrays(gl.POINTS, 0, 1);
    }
}

function click(event){
    let xy = [x, y] = convertCoordinatesToGLSL(event);

    // Store points to g_points array
    g_points.push(xy);

    // Store colors to g_colors array
    // if (x >= 0.0 && y >= 0.0){
    //     g_colors.push([1.0, 0.0, 0.0, 1.0]); // Red
    // } else if (x < 0.0 && y < 0.0){
    //     g_colors.push([0.0, 1.0, 0.0, 1.0]); // Green
    // } else {
    //     g_colors.push([1.0, 1.0, 1.0, 1.0]); // White
    // }
    g_colors.push(g_selectedColor.slice());
    g_sizes.push(g_selectedSize);

    renderAllShapes(); 
};