class Cube{
    constructor(){
        this.type='Cube';
        this.color=[1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
    }

    render(){
        var rgba = this.color;
        
        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Bottom Face z = 0.0
        drawTriangle3D( [0.0,0.0,0.0, 0.0,1.0,0.0, 1.0,1.0,0.0 ]);
        drawTriangle3D( [0.0,0.0,0.0, 1.0,0.0,0.0, 1.0,1.0,0.0 ]);

        // Top Face z = 1.0
        drawTriangle3D( [0.0,0.0,0.0, 0.0,1.0,0.0, 1.0,1.0,0.0 ]);
        drawTriangle3D( [0.0,0.0,0.0, 1.0,0.0,0.0, 1.0,1.0,0.0 ]);

        // Front Face y = 0.0
        drawTriangle3D( [0.0,0.0,0.0, 0.0,0.0,1.0, 1.0,0.0,1.0 ]);
        drawTriangle3D( [0.0,0.0,0.0, 1.0,0.0,0.0, 1.0,0.0,1.0 ]);

        // Back Face y = 1.0
        drawTriangle3D( [0.0,1.0,0.0, 0.0,1.0,1.0, 1.0,1.0,1.0 ]);
        drawTriangle3D( [0.0,1.0,0.0, 1.0,1.0,0.0, 1.0,1.0,1.0 ]);

        // Left Face x = 0.0
        drawTriangle3D( [0.0,0.0,0.0, 0.0,1.0,0.0, 0.0,1.0,1.0 ]);
        drawTriangle3D( [0.0,0.0,0.0, 0.0,0.0,1.0, 0.0,1.0,1.0 ]);

        // Right Face
        drawTriangle3D( [1.0,0.0,0.0, 1.0,1.0,0.0, 1.0,1.0,1.0 ]);
        drawTriangle3D( [1.0,0.0,0.0, 1.0,0.0,1.0, 1.0,1.0,1.0 ]);

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    }
}