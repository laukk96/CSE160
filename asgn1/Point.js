class Point{
    constructor(){
        this.type='point';
        this.position=[0.0, 0.0, 0.0];
        this.color=g_selectedColor.slice();
        this.color=[1.0, 1.0, 1.0, 1.0];
        this.size=5.0;
    }
    
    render(){
        let xy = this.position;
        let rgba = this.color;
        let size = this.size;

        // Edit: Because of Triangle.js, we need to quit using buffer to send attribute
        gl.disableVertexAttribArray(a_Position);

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