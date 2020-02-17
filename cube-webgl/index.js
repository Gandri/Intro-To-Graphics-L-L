var spector = new SPECTOR.Spector();

const vertices = [
    // Front Face
    // (Top Left)
    -0.5, 0.5, 0.5,
    1.0, 0.0, 0.0, 1.0,

    // (Bottom Left)
    -0.5, -0.5, 0.5,
    0.0, 1.0, 0.0, 1.0,

    // (Bottom Right)
    0.5, -0.5, 0.5,
    0.0, 0.0, 1.0, 1.0,

    // (Top Right)
    0.5, 0.5, 0.5,
    1.0, 0.0, 1.0, 1.0,

    // Left Face
    // (Top Left)
    -0.5, 0.5, -0.5,
    1.0, 0.0, 0.0, 1.0,

    // (Bottom Left)
    -0.5, -0.5, -0.5,
    0.0, 1.0, 0.0, 1.0,

    // (Bottom Right)
    -0.5, -0.5, 0.5,
    0.0, 0.0, 1.0, 1.0,

    // (Top Right)
    -0.5, 0.5, 0.5,
    1.0, 0.0, 1.0, 1.0,

    // Right Face
    // (Top Left)
    0.5, 0.5, 0.5,
    1.0, 0.0, 0.0, 1.0,

    // (Bottom Left)
    0.5, -0.5, 0.5,
    0.0, 1.0, 0.0, 1.0,

    // (Bottom Right)
    0.5, -0.5, -0.5,
    0.0, 0.0, 1.0, 1.0,

    // (Top Right)
    0.5, 0.5, -0.5,
    1.0, 0.0, 1.0, 1.0,

    // Top Face
    // (Top Left)
    -0.5, 0.5, -0.5,
    1.0, 0.0, 0.0, 1.0,

    // (Bottom Left)
    -0.5, 0.5, 0.5,
    0.0, 1.0, 0.0, 1.0,

    // (Bottom Right)
    0.5, 0.5, 0.5,
    0.0, 0.0, 1.0, 1.0,

    // (Top Right)
    0.5, 0.5, -0.5,
    1.0, 0.0, 1.0, 1.0,

    // Bottom Face
    // (Top Left)
    -0.5, -0.5, -0.5,
    1.0, 0.0, 0.0, 1.0,

    // (Bottom Left)
    -0.5, -0.5, 0.5,
    0.0, 1.0, 0.0, 1.0,

    // (Bottom Right)
    0.5, -0.5, 0.5,
    0.0, 0.0, 1.0, 1.0,

    // (Top Right)
    0.5, -0.5, -0.5,
    1.0, 0.0, 1.0, 1.0,

    // Back Face
    // (Top Left)
    -0.5, 0.5, -0.5,
    1.0, 0.0, 0.0, 1.0,

    // (Bottom Left)
    -0.5, -0.5, -0.5,
    0.0, 1.0, 0.0, 1.0,

    // (Bottom Right)
    0.5, -0.5, -0.5,
    0.0, 0.0, 1.0, 1.0,

    // (Top Right)
    0.5, 0.5, -0.5,
    1.0, 0.0, 1.0, 1.0,
];

const indices = [
    // Front Face
    0, 1, 2, 2, 3, 0,
    // Left Face
    4, 5, 6, 6, 7, 4,
    // Right Face
    8, 9, 10, 10, 11, 8,
    // Top Face
    12, 13, 14, 14, 15, 12,
    // Bottom Face
    16, 17, 18, 18, 19, 16,
    // Back Face
    20, 21, 22, 22, 23, 20
];

const canvasState = {
    isPointerCaptured: false
};

const canvas = document.getElementById("viewport");
const gl = canvas.getContext("webgl2");

const mesh = {
    vao: 0,
    vbo: 0,
    ibo: 0
};

let modelMatrix = glMatrix.mat4.create();
glMatrix.mat4.identity(modelMatrix);

const last_target = [ 0.0, 0.0, 0.0 ];
const mouse = {
    lastX: 0.0,
    lastY: 0.0,
    x: 0.0,
    y: 0.0
};

// Because OpenGL/WebGL are right handed coordinate
// by default up is positive Y and into the screen is negative Z
const camera = {
    position: glMatrix.vec3.fromValues(0.0, 1.0, 2.0),
    forward: glMatrix.vec3.fromValues(0.0, 0.0, -1.0),
    center: glMatrix.vec3.fromValues(0.0, 0.0, 0.0),
    up: glMatrix.vec3.fromValues(0.0, 1.0, 0.0),
    fov: 90.0,
    pitch: 0.0,
    yaw: 0.0,
    zNear: 0.1,
    zFar: 100.0,
    sensitivity: 0.05
};

const speed = 2.5;
const dt = 0.0;

const W = 87;
const S = 83;
const A = 65;
const D = 68;
const ESCAPE = 27;

const keysPressed = {
    W: false,
    S: false,
    A: false,
    D: false,
    ESCAPE: false
};

const vertexShaderSource = `#version 300 es
    in vec3 position;
    in vec4 color;

    uniform mat4 model;
    uniform mat4 view;
    uniform mat4 projection;

    out vec4 vertexColor;

    void main() {
        gl_Position = projection * view * model * vec4(position, 1.0);
        gl_PointSize = 10.0;
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
    } }

function calculateViewMatrix() {
    let viewMatrix = glMatrix.mat4.create();
    glMatrix.mat4.lookAt(viewMatrix, camera.position, camera.center, camera.up);
    return viewMatrix;
}

function toRadians(degree) {
    return degree * (Math.PI / 180);
}

// Using a perspective projection
function calculateProjectionMatrix() {
    let perspectiveMatrix = glMatrix.mat4.create();
    glMatrix.mat4.perspective(perspectiveMatrix, toRadians(camera.fov), (canvas.width / canvas.height), camera.zNear, camera.zFar);
    console.log("YOLO", perspectiveMatrix);
    return perspectiveMatrix;
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

function initCube(shaderProgram) {
    mesh.vao = gl.createVertexArray();
    gl.bindVertexArray(mesh.vao);

    mesh.vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    mesh.ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(indices), gl.STATIC_DRAW);

    const positionLoc = gl.getAttribLocation(shaderProgram, "position");
    const colorLoc = gl.getAttribLocation(shaderProgram, "color");
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 4 * 7, 0);
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 4 * 7, 4 * 3);
    gl.enableVertexAttribArray(colorLoc);
}

function renderMesh(shaderProgram, mesh) {
    gl.useProgram(shaderProgram);

    const viewMatrix = calculateViewMatrix();
    const projectionMatrix = calculateProjectionMatrix();

    glMatrix.mat4.rotateY(modelMatrix, modelMatrix, Math.PI / 180);

    const viewUniformLoc = gl.getUniformLocation(shaderProgram, "view");
    gl.uniformMatrix4fv(viewUniformLoc, false, viewMatrix);

    const projectionUniformLoc = gl.getUniformLocation(shaderProgram, "projection");
    gl.uniformMatrix4fv(projectionUniformLoc, false, projectionMatrix);

    const modelUniformLoc = gl.getUniformLocation(shaderProgram, "model");
    gl.uniformMatrix4fv(modelUniformLoc, false, modelMatrix);

    // In case they are unbound for some reason
    gl.bindVertexArray(mesh.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vbo);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.ibo);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_INT, 0);
}

const rotation = 0.0;

function renderLoop() {
    if (!gl) {
        return;
    }

    gl.enable(gl.DEPTH_TEST);
    // spector.displayUI();

    const shaderProgram = loadShaderProgram();
    initCube(shaderProgram);

    resizeCanvas();

    renderMesh(shaderProgram, mesh);

    window.requestAnimationFrame(renderLoop);
}

window.requestAnimationFrame(renderLoop);

