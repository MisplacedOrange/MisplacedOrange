import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { createWaterMaterial } from "./shaders.js";
import { createRippleSim } from "./waterSim.js";
import { createHeroTexture } from "./heroTexture.js";

// World units covered by the ripple simulation. Larger than the visible region
// so cursor ripples have room to propagate out past the frame edges.
const INTERACTION_WORLD = 240;
// The flat water plane. Comfortably larger than the camera's footprint.
const PLANE_SIZE = 520;
// How high the bird's-eye camera floats above the surface.
const CAMERA_HEIGHT = 120;

export function Ocean() {
  const { camera, gl, scene, size } = useThree();

  const sim = useMemo(() => createRippleSim(gl, 512, INTERACTION_WORLD), [gl]);
  useEffect(() => () => sim.dispose(), [sim]);

  const hero = useMemo(() => createHeroTexture(), []);
  useEffect(() => () => hero.dispose(), [hero]);

  const pendingDrops = useRef([]);
  const lastPos = useRef(null);

  const waterMaterial = useMemo(
    () =>
      createWaterMaterial({
        rippleTexture: sim.texture,
        texelSize: sim.texelSize,
        worldSize: sim.worldSize,
      }),
    [sim],
  );

  // Draw the underwater hero text to its texture and keep it in sync with the
  // viewport size / pixel ratio so it stays crisp.
  useEffect(() => {
    const dpr = Math.min(gl.getPixelRatio(), 2);
    hero.draw(size.width, size.height, dpr);
    waterMaterial.uniforms.uBackground.value = hero.texture;
  }, [hero, waterMaterial, gl, size.width, size.height]);

  // Straight-down bird's-eye view. up = -Z keeps "forward" pointing into the
  // screen so the surface fills the frame the way you'd expect from above.
  useEffect(() => {
    camera.up.set(0, 0, -1);
    camera.position.set(0, CAMERA_HEIGHT, 0);
    camera.lookAt(0, 0, 0);
    // No scene background — the canvas clears transparent so the underwater
    // image layer shows through the semi-transparent water.
    scene.background = null;
  }, [camera, scene]);

  // Pointer -> world plane intersection -> ripple drops. Moving the cursor lays
  // down a gentle continuous trail; pressing makes a stronger splash.
  useEffect(() => {
    const raycaster = new THREE.Raycaster();
    const waterPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const ndc = new THREE.Vector2();
    const hit = new THREE.Vector3();

    function toWorld(clientX, clientY) {
      const w = Math.max(window.innerWidth, 1);
      const h = Math.max(window.innerHeight, 1);
      ndc.set((clientX / w) * 2 - 1, -(clientY / h) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      return raycaster.ray.intersectPlane(waterPlane, hit) ? hit : null;
    }

    function addDrop(x, z, strength, radiusUv) {
      const u = x / sim.worldSize + 0.5;
      const v = z / sim.worldSize + 0.5;
      if (u < 0 || u > 1 || v < 0 || v > 1) return;
      pendingDrops.current.push(new THREE.Vector4(u, v, radiusUv, -strength));
    }

    function trail(clientX, clientY, pressed) {
      const p = toWorld(clientX, clientY);
      if (!p) return;
      const last = lastPos.current;
      const dx = last ? p.x - last.x : 0;
      const dz = last ? p.z - last.z : 0;
      const speed = Math.sqrt(dx * dx + dz * dz);
      const minDist = pressed ? 0.4 : 0.7;
      if (!last || speed > minDist) {
        const base = pressed ? 0.32 : 0.14;
        addDrop(p.x, p.z, Math.min(base + speed * 0.06, 0.9), 0.008);
        lastPos.current = { x: p.x, z: p.z };
      }
    }

    let pressed = false;
    const onMove = (e) => trail(e.clientX, e.clientY, pressed);
    const onDown = (e) => {
      pressed = true;
      lastPos.current = null;
      const p = toWorld(e.clientX, e.clientY);
      if (p) addDrop(p.x, p.z, 1.1, 0.014);
    };
    const onUp = () => {
      pressed = false;
      lastPos.current = null;
    };
    const onTouch = (e) => {
      const touch = e.touches[0];
      if (touch) trail(touch.clientX, touch.clientY, true);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("touchmove", onTouch, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("touchmove", onTouch);
    };
  }, [camera, sim.worldSize]);

  useEffect(() => {
    if (!import.meta.env.DEV) return undefined;
    window.__aquariumRenderForVerification = () => gl.render(scene, camera);
    window.__aquariumDiagnostics = () => ({
      sceneChildren: scene.children.length,
      frame: gl.info.render.frame,
      calls: gl.info.render.calls,
      triangles: gl.info.render.triangles,
    });
    return () => {
      delete window.__aquariumRenderForVerification;
      delete window.__aquariumDiagnostics;
    };
  }, [gl, scene, camera]);

  useFrame((state) => {
    const elapsed = state.clock.elapsedTime;

    sim.step(pendingDrops.current);
    pendingDrops.current.length = 0;

    waterMaterial.uniforms.uRippleTex.value = sim.texture;
    waterMaterial.uniforms.uResolution.value.set(size.width, size.height);
    waterMaterial.uniforms.uTime.value = elapsed;

    // Barely-there drift so the still surface never feels frozen.
    camera.position.x = Math.sin(elapsed * 0.05) * 1.2;
    camera.position.z = Math.cos(elapsed * 0.043) * 1.2;
    camera.position.y = CAMERA_HEIGHT;
    camera.lookAt(0, 0, 0);
  });

  return (
    <mesh
      rotation-x={-Math.PI / 2}
      material={waterMaterial}
      frustumCulled={false}
    >
      <planeGeometry args={[PLANE_SIZE, PLANE_SIZE, 1, 1]} />
    </mesh>
  );
}
