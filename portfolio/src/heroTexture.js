import * as THREE from "three";

// 24×24 viewBox SVG paths for each icon
const GITHUB   = new Path2D("M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.744 0 .267.18.579.688.481C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z");
const LINKEDIN = new Path2D("M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z");
const X_ICON   = new Path2D("M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z");

export const SOCIALS = [
  { icon: GITHUB, href: "https://github.com/misplacedorange", ariaLabel: "GitHub: @misplacedorange" },
  { icon: LINKEDIN, href: "https://linkedin.com/in/royluu", ariaLabel: "LinkedIn profile" },
  { icon: X_ICON, href: "https://x.com/misplacedorange", ariaLabel: "X profile" },
];

function drawIcon(ctx, path, x, y, size, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.translate(x, y);
  ctx.scale(size / 24, size / 24);
  ctx.fill(path);
  ctx.restore();
}


export function createHeroTexture() {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.colorSpace = THREE.SRGBColorSpace;

  function draw(width, height, dpr) {
    const w = Math.max(1, Math.floor(width * dpr));
    const h = Math.max(1, Math.floor(height * dpr));
    canvas.width = w;
    canvas.height = h;
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.scale(dpr, dpr);

    const fonts   = `"Cabinet Grotesk","Neue Montreal","Inter",system-ui,sans-serif`;
    const pad     = width * 0.10;
    const midY    = height * 0.44;
    const inkHi   = "rgba(243,253,255,0.96)";
    const inkSoft = "rgba(231,250,255,0.78)";

    // Name
    const nameSize = Math.min(width * 0.13, 168);
    ctx.font = `700 ${nameSize}px ${fonts}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = inkHi;
    ctx.fillText("Hi! I'm Roy Lu", pad - 15, midY);

    // Subtitle
    const subSize = Math.min(width * 0.022, 22);
    ctx.font = `500 ${subSize}px ${fonts}`;
    ctx.fillStyle = inkSoft;
    if ("letterSpacing" in ctx) ctx.letterSpacing = `${subSize * 0.2}px`;
    ctx.fillText("An aspiring CS Major based in Ontario, Canada", pad, midY + nameSize * 0.5);
    if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";

    // Social
    const iconSize   = Math.min(width * 0.022, 22);
    const headerSize = Math.min(width * 0.012, 12);
    const iconGap    = iconSize * 1.8;
    const sy         = midY + nameSize * 1.38;

    ctx.font = `500 ${headerSize}px ${fonts}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    if ("letterSpacing" in ctx) ctx.letterSpacing = `${headerSize * 0.25}px`;
    ctx.fillStyle = "rgba(180,220,230,0.55)";
    ctx.fillText("Socials:", pad, sy - iconSize * 1.4);
    if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
    const regions = [];
    SOCIALS.forEach(({ icon, href, ariaLabel }, i) => {
      const sx = pad + i * iconGap;
      drawIcon(ctx, icon, sx, sy - iconSize / 2, iconSize, inkSoft);
      regions.push({ href, ariaLabel, x: sx, y: sy - iconSize / 2, w: iconSize, h: iconSize });
    });

    ctx.restore();
    texture.needsUpdate = true;

    // Defer until after App.jsx's useEffect listener is registered.
    requestAnimationFrame(() => {
      window.dispatchEvent(new CustomEvent("hero-regions", { detail: regions }));
    });
  }

  return { texture, draw, dispose: () => texture.dispose() };
}
