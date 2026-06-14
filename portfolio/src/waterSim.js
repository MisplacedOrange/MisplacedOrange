import * as THREE from "three";

// GPU height-field water simulation. Solves the 2D wave equation on a
// ping-pong float texture so disturbances genuinely propagate, reflect off the
// pond edges, and interfere with one another — two ripples meeting will add,
// cancel and cross exactly like real water, rather than each playing a
// one-shot canned animation.
//
// Each texel packs two scalars: R = current height, G = previous height.
// The discrete update is the classic stable scheme
//   next = (hL + hR + hD + hU) * 0.5 - hPrev
// followed by a small damping factor so energy bleeds away over a few seconds.

export const SIM_SIZE = 512; // simulation resolution (texels per side)
export const SIM_WORLD = 180; // default world units covered by the interaction texture
const MAX_DROPS = 8; // disturbances injected per frame

export function createRippleSim(renderer, size = SIM_SIZE, worldSize = SIM_WORLD) {
  const makeRT = () =>
    new THREE.WebGLRenderTarget(size, size, {
      type: THREE.HalfFloatType,
      format: THREE.RGBAFormat,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      depthBuffer: false,
      stencilBuffer: false,
    });

  let rtRead = makeRT();
  let rtWrite = makeRT();

  // Disturbances to inject this step: xy = uv centre, z = radius (uv), w = strength.
  const drops = Array.from({ length: MAX_DROPS }, () => new THREE.Vector4(0, 0, 0, 0));

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uSrc: { value: null },
      uTexel: { value: new THREE.Vector2(1 / size, 1 / size) },
      uDamping: { value: 0.994 }, // closer to 1.0 = ripples persist longer
      uDrops: { value: drops },
      uDropCount: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uSrc;
      uniform vec2 uTexel;
      uniform float uDamping;
      uniform vec4 uDrops[${MAX_DROPS}];
      uniform int uDropCount;

      void main() {
        vec4 s = texture2D(uSrc, vUv);
        float cur = s.r;
        float prev = s.g;

        float l = texture2D(uSrc, vUv + vec2(-uTexel.x, 0.0)).r;
        float r = texture2D(uSrc, vUv + vec2( uTexel.x, 0.0)).r;
        float d = texture2D(uSrc, vUv + vec2(0.0, -uTexel.y)).r;
        float u = texture2D(uSrc, vUv + vec2(0.0,  uTexel.y)).r;

        // Wave equation (c^2 = 0.5, the stability limit for this scheme).
        float next = (l + r + d + u) * 0.5 - prev;
        next *= uDamping;

        // Inject this frame's disturbances as soft gaussian bumps. Once added
        // they live in the field and propagate on their own.
        for (int i = 0; i < ${MAX_DROPS}; i++) {
          if (i >= uDropCount) break;
          vec4 dr = uDrops[i];
          float dist = distance(vUv, dr.xy);
          next += dr.w * exp(-(dist * dist) / max(dr.z * dr.z, 1e-6));
        }

        gl_FragColor = vec4(next, cur, 0.0, 1.0);
      }
    `,
  });

  // Fullscreen quad in clip space — the vertex shader writes gl_Position
  // directly, so the camera is irrelevant.
  const scene = new THREE.Scene();
  const camera = new THREE.Camera();
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  scene.add(quad);

  // Start from a flat, still surface.
  const restore = renderer.getRenderTarget();
  renderer.setClearColor(0x000000, 1);
  for (const rt of [rtRead, rtWrite]) {
    renderer.setRenderTarget(rt);
    renderer.clear();
  }
  renderer.setRenderTarget(restore);

  function step(activeDrops) {
    const count = Math.min(activeDrops.length, MAX_DROPS);
    for (let i = 0; i < count; i++) drops[i].copy(activeDrops[i]);
    material.uniforms.uDropCount.value = count;
    material.uniforms.uSrc.value = rtRead.texture;

    const prevTarget = renderer.getRenderTarget();
    renderer.setRenderTarget(rtWrite);
    renderer.render(scene, camera);
    renderer.setRenderTarget(prevTarget);

    const tmp = rtRead;
    rtRead = rtWrite;
    rtWrite = tmp;
  }

  return {
    step,
    worldSize,
    texelSize: 1 / size,
    get texture() {
      return rtRead.texture;
    },
    dispose() {
      rtRead.dispose();
      rtWrite.dispose();
      quad.geometry.dispose();
      material.dispose();
    },
  };
}
