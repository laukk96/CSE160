class Triangle{
    constructor(){
        this.type='triangle';
        this.position=[0.0, 0.0, 0.0];
        this.color=g_selectedColor.slice();
        this.color=[1.0, 1.0, 1.0, 1.0];
        this.size=5.0;
    }
    
    render(){
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
        let size_constant = size/400;
        drawTriangle( [xy[0], xy[1]+size_constant, xy[0]-size_constant, xy[1]-size_constant, xy[0]+size_constant, xy[1]-size_constant] );
    }
}

function drawTriangle(vertices){
    var n = 3;

    // Create vertex buffer
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer){
        console.log('Failed to create vertex buffer');
        return -1;
    }

    // Bind the buffer object to target
    // Note: Always using gl.ARRAY_BUFFER
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW); 
    // Changed from gl.STATIC_DRAW --> gl.DYNAMIC_DRAW 

    // Note: This is already done in our program --> connectVariablesToGLSL()
    // var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    // if (a_Position < 0) {
    //     console.log('Failed to get the storage location of a_Position');
    //     return -1;
    // }
    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);

    gl.drawArrays(gl.TRIANGLES, 0, n);
}