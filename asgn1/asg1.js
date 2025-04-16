
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
    void main() {
    gl_Position = a_Position;
       gl_PointSize = 10.0; 
    }`;

var FSHADER_SOURCE = `
    precision mediump float;
    uniform vec4 u_FragColor;
    void main() {
       gl_FragColor = u_FragColor;
    }`;

// Globals
let canvas;
/** @type {WebGLRenderingContext} */
let gl;
let a_Position;
let u_FragColor;

// Function 1.3
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

// MAIN
function main() {
    const red = 'rgba(255, 0, 0, 1.0)';
    const green = 'rgba(0, 255, 0, 1.0)';
    const blue = 'rgba(0, 0, 255, 1.0)';
    const black = 'rgba(0, 0, 0, 1.0)';
    
    setupWebGL();

    // Initialize Shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)){
        console.log('Failed to initialize shaders.');
        return;
    }

    // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0){
        console.log('Failed to get the stoarge location of a_Position');
        return;
    }

    // Get the stoarge location of u_FragColor variable
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (u_FragColor < 0){
        console.log('Failed to get the stoarge location of u_FragColor');
        return;
    }

    // Specify color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    canvas.onmousedown = function(event){
        click(event, gl, canvas, a_Position, u_FragColor);
    }
}

var g_points = [];
var g_colors = [];

function click(event, gl, canvas, a_Position, u_FragColor){
    var x = event.clientX;
    var y = event.clientY;
    var rect = event.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width/2) / (canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

    // Store points to g_points array
    g_points.push([x, y]);

    // Store colors to g_colors array
    if (x >= 0.0 && y >= 0.0){
        g_colors.push([1.0, 0.0, 0.0, 1.0]); // Red
    } else if (x < 0.0 && y < 0.0){
        g_colors.push([0.0, 1.0, 0.0, 1.0]); // Green
    } else {
        g_colors.push([1.0, 1.0, 1.0, 1.0]); // White
    }

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Draw all points
    var len = g_points.length;
    for (let i = 0; i < len; i++){
        var xy = g_points[i];
        var rgba = g_colors[i];

        // Pass position to a_Position variable
        gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
        // Pass color to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        // Draw Point
        gl.drawArrays(gl.POINTS, 0, 1);
    }
};