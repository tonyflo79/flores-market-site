precision highp float;

varying vec2 vUv;

uniform sampler2D uTexture;
uniform float uTime;
uniform vec2  uMouse;         // in UV space
uniform float uIntensity;     // ramps on pointermove, decays to idle
uniform vec2  uAspect;        // viewport aspect / image aspect, for cover-UV
uniform vec2  uImgAspect;

// ---- simplex 2D noise (Ian McEwan / Ashima Arts) ----
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                      -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
      + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m; m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// cover-UV: keeps the image filling the plane without stretch, like CSS object-fit: cover.
vec2 coverUV(vec2 uv, vec2 screenAspect, vec2 imgAspect) {
  vec2 ratio = vec2(
    min((screenAspect.x / screenAspect.y) / (imgAspect.x / imgAspect.y), 1.0),
    min((screenAspect.y / screenAspect.x) / (imgAspect.y / imgAspect.x), 1.0)
  );
  return vec2(
    uv.x * ratio.x + (1.0 - ratio.x) * 0.5,
    uv.y * ratio.y + (1.0 - ratio.y) * 0.5
  );
}

void main() {
  vec2 uv = coverUV(vUv, uAspect, uImgAspect);

  // Cursor ripple
  float d = distance(vUv, uMouse);
  float falloff = smoothstep(0.32, 0.0, d);
  vec2 dir = normalize(vUv - uMouse + 0.0001);
  vec2 push = dir * falloff * uIntensity * 0.03;

  // Idle breathing noise
  float n1 = snoise(vUv * 3.0 + uTime * 0.2);
  float n2 = snoise(vUv * 6.0 - uTime * 0.15);
  vec2 n = vec2(n1, n2) * (0.006 + uIntensity * 0.01);

  vec2 displaced = uv + push + n;

  // Tiny chromatic aberration tied to cursor intensity
  float ca = 0.0015 + uIntensity * 0.002;
  vec3 col;
  col.r = texture2D(uTexture, displaced + vec2(ca, 0.0)).r;
  col.g = texture2D(uTexture, displaced).g;
  col.b = texture2D(uTexture, displaced - vec2(ca, 0.0)).b;

  // Bottom-up warm-ink gradient for text legibility
  float gradient = smoothstep(0.05, 0.9, 1.0 - vUv.y);
  col = mix(col, vec3(0.078, 0.067, 0.059), gradient * 0.62);

  // Subtle vignette
  float v = smoothstep(0.9, 0.4, distance(vUv, vec2(0.5)));
  col *= mix(0.78, 1.0, v);

  gl_FragColor = vec4(col, 1.0);
}
