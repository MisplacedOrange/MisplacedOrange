import * as THREE from "three";

// Shared GLSL helpers. The noise uses a quintic fade (6t^5-15t^4+10t^3) instead
// of the usual cubic so it is C2-continuous — no faint lattice/"square" grid
// shows through at low frequencies. fbm is domain-warped to break up any
// directional banding into organic, cloud-like patches.
const commonGLSL = /* glsl */ `
  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 345.45));
    p += dot(p, p + 34.345);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0); // quintic fade
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amp = 0.55;
    mat2 rot = mat2(0.8, -0.6, 0.6, 0.8);
    for (int i = 0; i < 5; i++) {
      value += amp * noise(p);
      p = rot * p * 1.97 + 7.1;
      amp *= 0.5;
    }
    return value;
  }

  // Domain-warped fbm: feeds fbm back into itself so the result reads as soft,
  // wandering patches rather than a regular noise field. This is what paints the
  // murky dark batches drifting through the deep.
  float warped(vec2 p) {
    vec2 q = vec2(fbm(p), fbm(p + vec2(3.7, 1.2)));
    vec2 r = vec2(fbm(p + 2.5 * q + vec2(1.7, 9.2)), fbm(p + 2.5 * q + vec2(8.3, 2.8)));
    return fbm(p + 2.2 * r);
  }
`;

// Mouse-independent surface motion. Built from warped noise (NOT crossed sine
// waves, which interfere into a plaid grid) and kept very subtle, so the top
// layer reads as an eerily smooth, glassy sheet at rest. The cursor ripples are
// what bring it to life.
const ambientGLSL = /* glsl */ `
  float ambient(vec2 p, float t) {
    return (warped(p * 0.02 + vec2(t * 0.016, -t * 0.012)) - 0.5);
  }
`;

export function createWaterMaterial({ rippleTexture, texelSize, worldSize }) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uRippleTex: { value: rippleTexture },
      uRippleTexel: { value: new THREE.Vector2(texelSize, texelSize) },
      uWorldSize: { value: worldSize },
      uResolution: { value: new THREE.Vector2(1, 1) },
      // The content sitting below the water (hero text, later images), drawn to
      // a screen-sized canvas and refracted by the ripples.
      uBackground: { value: null },
      uRefract: { value: 0.04 }, // how strongly ripples bend the view below
      // Tropical water palette. Clear, light turquoise-blue water that drifts
      // into a slightly deeper blue toward the edges.
      uClear: { value: new THREE.Color(0x9fe3ec) }, // bright glassy highlight
      uDeep: { value: new THREE.Color(0x2bb0d4) }, // light tropical blue water
      uAbyss: { value: new THREE.Color(0x0a5f86) }, // deeper blue at the edges
    },
    vertexShader: /* glsl */ `
      precision highp float;
      varying vec3 vWorldPos;
      void main() {
        vec4 world = modelMatrix * vec4(position, 1.0);
        vWorldPos = world.xyz;
        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `,
    fragmentShader: /* glsl */ `
      precision highp float;
      uniform float uTime;
      uniform sampler2D uRippleTex;
      uniform vec2 uRippleTexel;
      uniform float uWorldSize;
      uniform vec2 uResolution;
      uniform sampler2D uBackground;
      uniform float uRefract;
      uniform vec3 uClear;
      uniform vec3 uDeep;
      uniform vec3 uAbyss;
      varying vec3 vWorldPos;

      ${commonGLSL}
      ${ambientGLSL}

      // Smooth fade so cursor ripples die out at the edge of the simulated field
      // instead of clipping.
      float fieldMask(vec2 uv) {
        vec2 m = smoothstep(0.0, 0.05, uv) * smoothstep(0.0, 0.05, 1.0 - uv);
        return m.x * m.y;
      }

      // Surface height from the cursor ripples baked into the sim texture only.
      // No ambient swell — against a flat abyss the always-on swell would show
      // up as faint streaks, so the colour reacts purely to where you touch.
      float surfaceHeight(vec2 p, float t) {
        vec2 uv = p / uWorldSize + 0.5;
        float ripple = texture2D(uRippleTex, uv).r * fieldMask(uv);
        return ripple * 6.5;
      }

      void main() {
        vec2 p = vWorldPos.xz;
        float t = uTime;
        float e = 0.5; // world-space step for derivatives

        float hC = surfaceHeight(p, t);
        float hL = surfaceHeight(p - vec2(e, 0.0), t);
        float hR = surfaceHeight(p + vec2(e, 0.0), t);
        float hD = surfaceHeight(p - vec2(0.0, e), t);
        float hU = surfaceHeight(p + vec2(0.0, e), t);

        // Surface gradient bends the view of what's below (refraction); the
        // laplacian (curvature) drives the light caught on ripple crests.
        vec2 grad = vec2(hR - hL, hU - hD) / (2.0 * e);
        float lap = (hL + hR + hD + hU - 4.0 * hC) / (e * e);

        // Clear tropical water with a gentle deepening toward the frame edges.
        vec2 uvScreen = gl_FragCoord.xy / uResolution;
        float voidFall = smoothstep(0.0, 1.6, length(uvScreen - 0.5));
        vec3 water = mix(uDeep, uAbyss, voidFall * 0.6);

        // Cursor ripples catch a touch more light where the surface curves.
        float lift = clamp(-lap * 2.4, 0.0, 1.0);
        water += lift * (uClear - uDeep) * 0.4;

        // Sample the submerged content, displaced by the ripple gradient so it
        // wobbles like the real thing seen through moving water. Clamp the
        // offset so strong ripples can't smear it across the screen.
        vec2 offset = clamp(grad * uRefract, vec2(-0.08), vec2(0.08));
        vec4 below = texture2D(uBackground, uvScreen + offset);

        // The content reads as submerged: it picks up the water's colour and
        // fades a little toward the deeper edges of the frame.
        vec3 submerged = mix(below.rgb, uClear, 0.12);
        float show = below.a * (1.0 - voidFall * 0.45);
        vec3 col = mix(water, submerged, show);

        // Ripple highlights glint across the text too, like light on a crest.
        col += lift * show * 0.18;

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
}
