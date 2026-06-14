import { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Ocean } from "./Ocean.jsx";

export function App() {
  const [regions, setRegions] = useState([]);

  useEffect(() => {
    const handler = (e) => setRegions(e.detail);
    window.addEventListener("hero-regions", handler);
    return () => window.removeEventListener("hero-regions", handler);
  }, []);

  return (
    <>
      <Canvas
        dpr={[1, 1.75]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 120, 0], fov: 45, near: 0.1, far: 900 }}
        onCreated={({ gl }) => {
          gl.toneMappingExposure = 1.05;
          gl.setClearColor(0x0a5f86, 1);
          gl.domElement.classList.add("aquarium-canvas");
          gl.domElement.setAttribute("aria-hidden", "true");
        }}
      >
        <Ocean />
      </Canvas>

      {/* Content stage — sits on top of the water surface. The hero name and
          location are rendered into the water itself (and refract with the
          ripples); the copy below is the accessible/SEO source of truth plus
          the interactive call-to-action. */}
      <main className="stage" aria-label="Portfolio">
        <h1 className="sr-only">Roy Lu — based in Ontario, Canada</h1>
        {/* Invisible click targets positioned over the refracted social pills
            drawn in the hero texture. Keyboard users see a focus ring. */}
        {regions.map(({ href, ariaLabel, x, y, w, h }) => (
          <a
            key={href}
            href={href}
            aria-label={ariaLabel}
            target="_blank"
            rel="noopener noreferrer"
            className="social-hit"
            style={{ left: x, top: y, width: w, height: h }}
          />
        ))}
      </main>
    </>
  );
}
