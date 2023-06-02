// https://www.khronos.org/opengl/wiki/OpenGL_Shading_Language
const vertexShaderTxt = `
    precision mediump float;

    attribute vec3 vertPosition;
    attribute vec3 vertColor;

    varying vec3 fragColor;

    uniform mat4 mWorld;
    uniform mat4 mView;
    uniform mat4 mProj;

    void main()
    {
        fragColor = vertColor;
        gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
    }

`

const fragmentShaderTxt = `
    precision mediump float;

    varying vec3 fragColor;

    void main()
    {
        gl_FragColor = vec4(fragColor, 1.0); // R,G,B, opacity
    }
`
const mat4 = glMatrix.mat4;

var boxVertices =
    [ // X, Y, Z           R, G, B
        // Top
        -1.0, 1.0, -1.0,
        -1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, -1.0,

        // Left
        -1.0, 1.0, 1.0,
        -1.0, -1.0, 1.0,
        -1.0, -1.0, -1.0,
        -1.0, 1.0, -1.0,

        // Right
        1.0, 1.0, 1.0,
        1.0, -1.0, 1.0,
        1.0, -1.0, -1.0,
        1.0, 1.0, -1.0,

        // Front
        1.0, 1.0, 1.0,
        1.0, -1.0, 1.0,
        -1.0, -1.0, 1.0,
        -1.0, 1.0, 1.0,

        // Back
        1.0, 1.0, -1.0,
        1.0, -1.0, -1.0,
        -1.0, -1.0, -1.0,
        -1.0, 1.0, -1.0,

        // Bottom
        -1.0, -1.0, -1.0,
        -1.0, -1.0, 1.0,
        1.0, -1.0, 1.0,
        1.0, -1.0, -1.0,
    ];


let colors = [
    // R, G, B
    0.5, 0.5, 0.5,
    0.5, 0.5, 0.5,
    0.5, 0.5, 0.5,
    0.5, 0.5, 0.5,

    0.75, 0.25, 0.5,
    0.75, 0.25, 0.5,
    0.75, 0.25, 0.5,
    0.75, 0.25, 0.5,

    0.25, 0.25, 0.75,
    0.25, 0.25, 0.75,
    0.25, 0.25, 0.75,
    0.25, 0.25, 0.75,

    1.0, 0.0, 0.15,
    1.0, 0.0, 0.15,
    1.0, 0.0, 0.15,
    1.0, 0.0, 0.15,

    0.0, 1.0, 0.15,
    0.0, 1.0, 0.15,
    0.0, 1.0, 0.15,
    0.0, 1.0, 0.15,

    0.5, 0.5, 1.0,
    0.5, 0.5, 1.0,
    0.5, 0.5, 1.0,
    0.5, 0.5, 1.0,
]

var boxIndices =
    [
        // Top
        0, 1, 2,
        0, 2, 3,

        // Left
        5, 4, 6,
        6, 4, 7,

        // Right
        8, 9, 10,
        8, 10, 11,

        // Front
        13, 12, 14,
        15, 14, 12,

        // Back
        16, 17, 18,
        16, 18, 19,

        // Bottom
        21, 20, 22,
        22, 20, 23
    ];

class World {
    #gl;
    #program;
    #fragmentShader;
    #vertexShader;
    #colors;
    #boxVertices;
    #boxIndices;

    // stworzenie canvasu, kontekstu, stworzenie programu i inicjalizacja koloru
    constructor(id, backgroundColor) {
        this.canvas = document.getElementById(id);
        this.#gl = this.canvas.getContext('webgl');
        this.#program = this.#gl.createProgram();


        this.backgroundColor = backgroundColor;

        if (!this.#gl) {
            alert('WebGL not supported');
            return;
        }

        this.prepareBackground(this.backgroundColor)
    }

    // Inicjalizacja tla i jego koloru
    prepareBackground(backgroundColor) {
        this.#gl.clearColor(...backgroundColor, 1.0);  // R,G,B, opacity
        this.#gl.clear(this.#gl.COLOR_BUFFER_BIT | this.#gl.DEPTH_BUFFER_BIT);
        this.#gl.enable(this.#gl.DEPTH_TEST);
        this.#gl.enable(this.#gl.CULL_FACE);

    }

    //setter do #backgroundColor
    set background(backgroundColor) {
        this.backgroundColor = backgroundColor;
        this.#gl.clearColor(...backgroundColor, 1.0);  // R,G,B, opacity

        this.#gl.clear(this.#gl.COLOR_BUFFER_BIT | this.#gl.DEPTH_BUFFER_BIT);
    }

    set fragmentShader(shaderString) {
        this.#fragmentShader = shaderString;
    }

    set vertexShader(shaderString) {
        this.#vertexShader = shaderString;
    }

    // ładowanie vertex/fragment shader
    loadShader(type) {
        let shader_type = null;
        let shaderString = null;
        if (type == 'VERTEX') {
            shader_type = this.#gl.VERTEX_SHADER;
            shaderString = this.#vertexShader;
        }
        else if (type = 'FRAGMENT') {
            shader_type = this.#gl.FRAGMENT_SHADER;
            shaderString = this.#fragmentShader;
        }

        let shader = this.#gl.createShader(shader_type);
        this.#gl.shaderSource(shader, shaderString);

        this.#gl.compileShader(shader)
        this.#gl.attachShader(this.#program, shader)

    }

    prepareShaders() {
        this.loadShader("VERTEX");
        this.loadShader("FRAGMENT");
        this.#gl.linkProgram(this.#program)
    }

    set boxVertices(boxVertices) {
        this.#boxVertices = boxVertices;
    }

    set colors(colors) {
        this.#colors = colors;
    }

    set boxIndices(boxIndices) {
        this.#boxIndices = boxIndices;
    }

    prepareBuffer() {
        const boxVerticesertexBufferObject = this.#gl.createBuffer();
        this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, boxVerticesertexBufferObject);
        this.#gl.bufferData(this.#gl.ARRAY_BUFFER, new Float32Array(this.#boxVertices), this.#gl.STATIC_DRAW); // since everything in JS is 64 bit floating point we need to convert to 32 bits

        const cubeIndexBufferObject = this.#gl.createBuffer();
        this.#gl.bindBuffer(this.#gl.ELEMENT_ARRAY_BUFFER, cubeIndexBufferObject);
        this.#gl.bufferData(this.#gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.#boxIndices), this.#gl.STATIC_DRAW); // since everything in JS is 64 bit floating point we need to convert to 32 bits

        const posAttrLocation = this.#gl.getAttribLocation(this.#program, 'vertPosition');

        this.#gl.vertexAttribPointer(
            posAttrLocation,
            3,
            this.#gl.FLOAT,
            this.#gl.FALSE,
            3 * Float32Array.BYTES_PER_ELEMENT,
            0,
        );

        const colorAttrLocation = this.#gl.getAttribLocation(this.#program, 'vertColor');
        const color_buffer = this.#gl.createBuffer();
        this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, color_buffer);
        this.#gl.bufferData(this.#gl.ARRAY_BUFFER, new Float32Array(this.#colors), this.#gl.STATIC_DRAW);

        this.#gl.vertexAttribPointer(
            colorAttrLocation,
            3,
            this.#gl.FLOAT,
            this.#gl.FALSE,
            0,
            0
        );

        this.enableAttrib(posAttrLocation);
        this.enableAttrib(colorAttrLocation);

    }

    enableAttrib(attr) {
        this.#gl.enableVertexAttribArray(attr);
    }

    preparePerspective(){
        const matWorldUniformLocation = this.#gl.getUniformLocation(this.#program, "mWorld");
        const matViewUniformLocation = this.#gl.getUniformLocation(this.#program, 'mView');
        const matProjUniformLocation = this.#gl.getUniformLocation(this.#program, 'mProj');
    
        let worldMatrix = mat4.create();
        let worldMatrix2 = mat4.create();
    
    
        let viewMatrix = mat4.create();
        mat4.lookAt(viewMatrix, [0, 0, -10], [0, 0, 0], [0, 1, 0]); // vectors are: position of the camera, which way they are looking, which way is up
        let projMatrix = mat4.create();
        mat4.perspective(projMatrix, glMatrix.glMatrix.toRadian(45), this.canvas.width / this.canvas.height, 0.1, 1000.0);
    
        this.#gl.uniformMatrix4fv(matWorldUniformLocation, this.#gl.FALSE, worldMatrix);
        this.#gl.uniformMatrix4fv(matViewUniformLocation, this.#gl.FALSE, viewMatrix);
        this.#gl.uniformMatrix4fv(matProjUniformLocation, this.#gl.FALSE, projMatrix);
    }

    rotateAnimation(){
        let rotationMatrix = new Float32Array(16)
        let translationMatrix = new Float32Array(16)
    
        let angle = 0;
        const loop = function () {
            angle = performance.now() / 100 / 8 * 2 * Math.PI;
    
            this.#gl.clear(this.#gl.COLOR_BUFFER_BIT | this.#gl.DEPTH_BUFFER_BIT);
    
            mat4.fromRotation(rotationMatrix, angle, [1, 2, 0]);
            mat4.fromTranslation(translationMatrix, [-2, 0, 0])
            mat4.mul(worldMatrix, translationMatrix, rotationMatrix)
    
            this.#gl.uniformMatrix4fv(matWorldUniformLocation, this.#gl.FALSE, worldMatrix);
            this.#gl.drawElements(this.#gl.TRIANGLES, boxIndices.length, this.#gl.UNSIGNED_SHORT, 0);
            rotationMatrix = new Float32Array(16)
            translationMatrix = new Float32Array(16)
    
            mat4.fromRotation(rotationMatrix, angle * 0.5, [1, 2, 0]);
            mat4.fromTranslation(translationMatrix, [2, 0, 0])
            mat4.mul(worldMatrix2, translationMatrix, rotationMatrix)
            this.#gl.uniformMatrix4fv(matWorldUniformLocation, this.#gl.FALSE, worldMatrix2);
            this.#gl.drawElements(this.#gl.TRIANGLES, boxIndices.length, this.#gl.UNSIGNED_SHORT, 0);
    
            requestAnimationFrame(loop);
        }
        requestAnimationFrame(loop);
    }
}

const canvas_name = 'main-canvas';
let world = new World(canvas_name, [0.5, 0.0, 0.3]);
world.background = [0.0, 0.0, 0.0];

world.fragmentShader = fragmentShaderTxt
world.vertexShader = vertexShaderTxt

world.prepareShaders();

world.boxVertices = boxVertices;
world.colors = colors;
world.boxIndices = boxIndices;

world.prepareBuffer();

world.preparePerspective();

world.rotateAnimation();
