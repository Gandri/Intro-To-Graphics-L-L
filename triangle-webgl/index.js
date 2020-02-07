const vertices = [
    // Vertex 1 (Top Middle)
     0.0,  0.5, 0.0,
     1.0,  0.0, 0.0, 1.0,

    // Vertex 2 (Bottom Left)
    -0.5, -0.5, 0.0,
     0.0,  1.0, 0.0, 1.0,

    // Vertex 3 (Bottom Right)
     0.5, -0.5, 0.0,
     0.0,  0.0, 1.0, 1.0
];

const canvas = document.getElementById("viewport");
const gl = canvas.getContext("webgl2");

const vertexShaderSource = `#version 300 es
    in vec3 position;
    in vec4 color;

    out vec4 vertexColor;

    void main() {
        gl_Position = vec4(position, 1.0);
        vertexColor = color;
    }
`;

const fragmentShaderSource = `#version 300 es
    precision mediump float;

    in vec4 vertexColor;
    out vec4 fragColor;

    void main() {
        fragColor = vertexColor;
    }
`;

function resizeCanvas() {
    if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
    }
}

function loadShaderProgram() {
    const vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertShader, vertexShaderSource);
    gl.compileShader(vertShader);

    let success = gl.getShaderParameter(vertShader, gl.COMPILE_STATUS);
    if (!success) {
        console.log(gl.getShaderInfoLog(vertShader));
    }

    const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragShader, fragmentShaderSource);
    gl.compileShader(fragShader);

    success = gl.getShaderParameter(fragShader, gl.COMPILE_STATUS);
    if (!success) {
        console.log(gl.getShaderInfoLog(fragShader));
    }

    const program = gl.createProgram();
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!success) {
        console.log(gl.getProgramInfoLog(program));
    }

    gl.deleteShader(vertShader);
    gl.deleteShader(fragShader);
    return program;
}

function renderTriangle() {
    if (!gl) {
        return;
    }

    resizeCanvas();

    const shaderProgram = loadShaderProgram();
    gl.useProgram(shaderProgram);

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    const positionLoc = gl.getAttribLocation(shaderProgram, "position");
    const colorLoc = gl.getAttribLocation(shaderProgram, "color");
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 4 * 7, 0);
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 4 * 7, 4 * 3);
    gl.enableVertexAttribArray(colorLoc);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}

renderTriangle();

