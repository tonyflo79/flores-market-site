precision highp float;

varying vec2 vUv;

uniform sampler2D uTexture;
uniform float uTime;
uniform vec2  uMouse;        // in UV space
uniform float uIntensity;    // ramps on pointermove, decays to idle
uniform vec2  uAspect;       // canvas aspect
uniform vec2  uImgAspect;    // source image aspect

// Cover-UV: keeps the image filling the plane like CSS object-fit: cover.
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

  // Sharp, undistorted texture sample — food stays food.
  vec3 col = texture2D(uTexture, uv).rgb;

  // ---- Dimmed + desaturated + warm-toned base ----
  float luma = dot(col, vec3(0.299, 0.587, 0.114));
  vec3 desat = mix(vec3(luma), col, 0.55);          // saturation 55%
  vec3 warmCast = vec3(1.04, 0.96, 0.82);           // slight amber cast
  vec3 base = desat * 0.48 * warmCast;              // darkened warmth

  // ---- Cursor spotlight: soft radial reveal ----
  // Aspect-correct distance so the spotlight is circular on any viewport.
  vec2 d2 = vUv - uMouse;
  d2.x *= uAspect.x / uAspect.y;
  float d  = length(d2);

  float spotRadius = 0.32;
  float edge       = 0.22;
  float spot = 1.0 - smoothstep(spotRadius - edge, spotRadius, d);

  // Gentle inner plateau so the reveal is confident, not a pin-prick.
  spot = smoothstep(0.0, 1.0, spot);

  // Cursor-motion brightening: when you're actively moving, the light brightens.
  spot *= 0.85 + uIntensity * 0.35;

  // ---- Ambient idle spotlight (keeps the image alive without a cursor) ----
  vec2 idleCenter = vec2(0.5, 0.48);
  float di = distance(vUv, idleCenter);
  float idle = 1.0 - smoothstep(0.0, 0.55, di);
  idle *= 0.32 + 0.05 * sin(uTime * 0.35);           // slow breath
  spot = max(spot, idle * 0.55);

  // ---- Revealed layer: full color + warm glow ----
  vec3 warmGlow = vec3(1.00, 0.90, 0.68);
  vec3 revealed = mix(col, col * warmGlow * 1.06, 0.35);

  // Blend dim base → reveal by spot intensity
  vec3 finalCol = mix(base, revealed, clamp(spot, 0.0, 1.0));

  // ---- Bottom-up ink gradient for text legibility ----
  float gradient = smoothstep(0.00, 0.85, 1.0 - vUv.y);
  finalCol = mix(finalCol, vec3(0.078, 0.067, 0.059), gradient * 0.62);

  // ---- Subtle vignette ----
  float v = smoothstep(0.95, 0.32, distance(vUv, vec2(0.5)));
  finalCol *= mix(0.70, 1.0, v);

  gl_FragColor = vec4(finalCol, 1.0);
}
