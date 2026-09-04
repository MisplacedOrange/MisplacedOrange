import { useState } from "react";

const SOCIAL_LINKS = [
  { label: "LinkedIn", href: "https://linkedin.com/in/royluu", icon: "linkedin" },
  { label: "X", href: "https://x.com/misplacedorange", icon: "x" },
  { label: "GitHub", href: "https://github.com/MisplacedOrange", icon: "github" },
];

const SOCIAL_ICON_PATHS = {
  linkedin:
    "M5.3 7.4H1.7V22h3.6V7.4ZM3.5 1.8A2.1 2.1 0 1 0 3.5 6a2.1 2.1 0 0 0 0-4.2ZM22.3 13.6c0-4.4-2.4-6.5-5.5-6.5a4.8 4.8 0 0 0-4.3 2.4v-2H9V22h3.6v-7.2c0-1.9.4-3.7 2.8-3.7 2.4 0 2.4 2.2 2.4 3.8V22h3.6l.9-8.4Z",
  x: "M18.9 2h3.7l-8.1 9.2L24 22h-7.4l-5.8-7.6L4.1 22H.4l8.7-10L0 2h7.6l5.2 6.9L18.9 2Zm-1.3 18.1h2L6.5 3.8H4.4l13.2 16.3Z",
  github:
    "M12 .8A11.3 11.3 0 0 0 8.4 22.9c.6.1.8-.3.8-.6v-2.2c-3.5.8-4.2-1.5-4.2-1.5-.6-1.5-1.4-1.9-1.4-1.9-1.1-.8.1-.8.1-.8 1.3.1 2 1.3 2 1.3 1.1 2 3 1.4 3.7 1.1.1-.8.4-1.4.8-1.7-2.8-.3-5.7-1.4-5.7-6.3 0-1.4.5-2.5 1.3-3.4-.1-.3-.6-1.6.1-3.3 0 0 1.1-.3 3.5 1.3a12 12 0 0 1 6.4 0c2.4-1.6 3.5-1.3 3.5-1.3.7 1.7.2 3 .1 3.3.8.9 1.3 2 1.3 3.4 0 4.9-3 6-5.8 6.3.5.4.9 1.2.9 2.4v3.6c0 .4.2.7.8.6A11.3 11.3 0 0 0 12 .8Z",
};

function SocialIcon({ name }) {
  const path = SOCIAL_ICON_PATHS[name];

  if (!path) return null;

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d={path} />
    </svg>
  );
}

export function App() {
  const [spinCount, setSpinCount] = useState(0);

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <div className="orange-page">
        <header className="orange-header">
          <a className="wordmark" href="#top" aria-label="Roy Lu, home">
            Roy Lu
          </a>

          <nav className="social-links" aria-label="Social links">
            {SOCIAL_LINKS.map(({ label, href, icon }) => (
              <a
                className="social-link"
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
              >
                <SocialIcon name={icon} />
              </a>
            ))}
          </nav>
        </header>

        <main id="main-content">
          <section className="orange-landing" id="top" aria-labelledby="orange-title">
            <div className="orange-landing__identity">
              <h1 id="orange-title">Roy Lu</h1>
              <p>BASED IN Ontario, Canada</p>
            </div>

            <div className="orange-landing__visual">
              <button
                className="orange-landing__fruit-button"
                type="button"
                aria-label="Spin the orange"
                onClick={() => setSpinCount((current) => current + 1)}
              >
                <img
                  key={spinCount}
                  className={`orange-landing__fruit${spinCount > 0 ? " is-spinning" : ""}`}
                  src="/orange.png"
                  alt="A smiling giant orange with a green leaf"
                />
              </button>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
