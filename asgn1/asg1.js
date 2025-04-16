
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

function main() {
    const red = 'rgba(255, 0, 0, 1.0)';
    const green = 'rgba(0, 255, 0, 1.0)';
    const blue = 'rgba(0, 0, 255, 1.0)';
    const black = 'rgba(0, 0, 0, 1.0)';
    // Retrieve the <canvas> element
    var canvas = document.getElementById('example');
    if (!canvas) {
        console.log('Failed to retrieve the <canvas> element');
        return false;
    }
    const cwidth = document.getElementById('example').clientWidth;
    const cheight = document.getElementById('example').clientHeight;

    // Get the rendering context for 2DCG
    var ctx = canvas.getContext('2d');
    allPoints = [];
    // var v0 = new Vector3();
    // var v1 = new Vector3([2.25, 2.25, 0]);
    
    function drawVector(v, color){
        const scale = 20;
        const originx = cwidth/2;
        const originy = cheight/2;

        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(originx, originy);
        ctx.lineTo(originx + v.elements[0]*scale, originy + v.elements[1]*scale);
        ctx.stroke();
    }

    function drawPoint(ox, oy){
        const psize = 10;
        ctx.fillStyle = red;
        ctx.fillRect(ox-psize/2, oy-psize/2, psize, psize);
    }

    function initCanvas(){
        // Draw a black rectangle canvas
        ctx.fillStyle = black;  // Set a black color
        ctx.fillRect(0, 0, cwidth, cheight);         // Fill a rectangle with the color
    }

    // var v1t = new Vector3();
    // var v2t = new Vector3();

    initCanvas();
    // drawPoint(cwidth/2, cheight/2);

    canvas.onmousedown = function(event){
        addPoint(event, ctx, canvas);
        initCanvas();
        for (let i = 0; i < g_points.length; i++){
            drawPoint(g_points[i][0], g_points[i][1]);
        }
    }
}

function addPoint(event, ctx, canvas){
    var x = event.clientX;
    var y = event.clientY;
    console.log("init point: ", x, " ", y);
    var rect = event.target.getBoundingClientRect();

    // x = ((x - rect.left) - canvas.width/2) / (canvas.width/2);
    // y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

    if (x >= 0.0 && y > 0.0){
        g_points.push([x, y]);
    }
    console.log("point added! ", x, " ", y);
};

    // function drawRegularVectors(){
    //     var x1 = document.getElementById("x1").value;
    //     var y1 = document.getElementById("y1").value;

    //     var x2 = document.getElementById("x2").value;
    //     var y2 = document.getElementById("y2").value;

    //     v1t = new Vector3([parseFloat(x1), parseFloat(y1), 0]);
    //     v2t = new Vector3([parseFloat(x2), parseFloat(y2), 0]);

    //     drawVector(v1t, 'rgba(255, 0, 0, 1.0');
    //     drawVector(v2t, 'rgba(0, 0, 255, 1.0');
    // }

    // initCanvas();
    // drawRegularVectors();

    // Submit button event listener
    // document.getElementById("vectorDrawForm").addEventListener("submit", function(event){
    //     event.preventDefault();
    //     initCanvas();
    //     drawRegularVectors();

    //     // Draw the select operation
    //     var selectValue = document.getElementById("select_operations").value;
        
    //     // Operations
    //     var v3 = new Vector3();

    //     if (selectValue === "Add"){
    //         v3 = v1t.add(v2t);
    //         drawVector(v1t, green);
    //         console.log(v3.elements);
    //     }
    //     else if (selectValue === "Subtract"){
    //         v3 = v1t.sub(v2t);
    //         drawVector(v1t, green);
    //         console.log(v3.elements);
    //     }
    //     else if (selectValue === "Multiply"){
    //         var scalar = parseFloat(document.getElementById("scalar text").value);
    //         v1t.mul(scalar);
    //         drawVector(v1t, green);
    //         v2t.mul(scalar);
    //         drawVector(v2t, green);
    //         console.log(scalar, v1t.elements);
    //     }
    //     else if (selectValue === "Divide"){
    //         var scalar = parseFloat(document.getElementById("scalar text").value);
    //         v1t.div(scalar);
    //         drawVector(v1t, green);
    //         v2t.div(scalar);
    //         drawVector(v2t, green);
    //         console.log(scalar, v1t.elements);
    //     }
    //     else if (selectValue === "Magnitude"){
    //         console.log("v1 magnitude: ", v1t.magnitude());
    //         console.log("v2 magnitude: ", v2t.magnitude());
    //     }
    //     else if (selectValue === "Normalize"){
    //         v1t.normalize();
    //         drawVector(v1t, green);
    //         v2t.normalize();
    //         drawVector(v2t, green);
    //     }
    //     else if (selectValue === "Angle Between"){
    //         console.log("Angle Between:", angleBetween(v1t, v2t));
    //     }
    //     else if (selectValue === "Area"){
    //         console.log("Area of Triangle:", areaTriangle(v1t, v2t));
    //     }
    // });

  