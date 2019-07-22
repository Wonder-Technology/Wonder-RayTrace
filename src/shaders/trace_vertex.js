var trace_vertex = `#version 300 es
      precision highp float;
      precision highp int;

layout(location=0) in vec2 position;
out vec2 uv;

void main() {
    uv = position;
    gl_Position = vec4(2.0 * position - 1.0, 0, 1);
}`