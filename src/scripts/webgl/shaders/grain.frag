precision mediump float;
uniform float uSeed;
uniform vec2  uRes;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float n = hash(uv * uRes + uSeed);
  // Center around 0.5 for overlay blending
  gl_FragColor = vec4(vec3(n), n * 0.5);
}
