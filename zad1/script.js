const vertexShaderTxt = `
    precision mediump float;

    attribute vec2 vertPosition;
    attribute vec3 vertColor;

    varying vec3 fragColor;

    void main() {
        fragColor = vertColor;
        gl_Position = vec4(vertPosition, 0.0, 1.0);
    }

`

const fragmentShaderTxt = `
    precision mediump float;
    varying vec3 fragColor;
    void main() {
        gl_FragColor = vec4(fragColor, 1.0); // R,G,B, opacity
    }
`


let Triangle = function() {
    let canvas = document.getElementById('main-canvas');
    let gl = canvas.getContext('webgl');
    if (!gl) {
        alert('webgl not supported');
    }

    gl.clearColor(1.0, 0.5, 0.5, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    let vertexShader = gl.createShader(gl.VERTEX_SHADER);
    let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vertexShader, vertexShaderTxt);
    gl.shaderSource(fragmentShader, fragmentShaderTxt);

    gl.compileShader(vertexShader);
    gl.compileShader(fragmentShader);

    let program = gl.createProgram();

    let vertices = [
        // X, Y
        -0.25, 0.25,  0.25, 0.25, 0.0,
        -0.25, -0.25, 0.25, 0.25, 0.0,
        0.25, -0.25,  0.25, 0.25, 0.0,

        -0.25, 0.25,  0.25, 0.25, 0.0,
        0.25, -0.25,  0.25, 0.25, 0.0,
        0.25, 0.25,   0.25, 0.25, 0.0,
    ]

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    gl.detachShader(program, vertexShader);
    gl.detachShader(program, fragmentShader);

    gl.validateProgram(program);

    const verticesexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);


    const posAttrLocation = gl.getAttribLocation(program, 'vertPosition');
    const colorAttrLocation = gl.getAttribLocation(program, 'vertColor');

    gl.vertexAttribPointer(
        posAttrLocation,
        2,
        gl.FLOAT,
        gl.FALSE,
        5 * Float32Array.BYTES_PER_ELEMENT,
        0
    );

    gl.vertexAttribPointer(
        colorAttrLocation,
        3,
        gl.FLOAT,
        gl.FALSE,
        5 * Float32Array.BYTES_PER_ELEMENT,
        2 * Float32Array.BYTES_PER_ELEMENT,
    );

    gl.enableVertexAttribArray(colorAttrLocation);
    gl.enableVertexAttribArray(posAttrLocation);
    gl.useProgram(program);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}
