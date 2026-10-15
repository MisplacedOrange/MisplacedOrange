import { useEffect, useState } from "react";

let visitCountRequest;

function loadVisitCount() {
  if (!visitCountRequest) {
    const url = new URL("https://counterapi.com/api/misplacedorange.me/view/portfolio");
    url.searchParams.set("timeline", "total");
    const isLiveSite = ["misplacedorange.me", "www.misplacedorange.me"].includes(window.location.hostname);
    if (!isLiveSite) url.searchParams.set("readOnly", "true");

    visitCountRequest = fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    }).then(async (response) => {
      if (!response.ok) throw new Error("Visit counter unavailable");
      const { value } = await response.json();
      if (!Number.isSafeInteger(value) || value < 0) throw new Error("Invalid visit count");
      return value;
    });
  }
  return visitCountRequest;
}

function VisitCounter() {
  const [count, setCount] = useState(null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    let active = true;
    loadVisitCount().then(
      (value) => { if (active) setCount(value); },
      () => { if (active) setUnavailable(true); },
    );
    return () => { active = false; };
  }, []);

  return (
    <div className="visit-counter" title={unavailable ? "visit counter unavailable" : "total site visits"}>
      <span>oranges </span>
      <span className="visit-count" aria-live="polite" aria-label={unavailable ? "visit count unavailable" : undefined}>
        {unavailable ? "—" : count === null ? "…" : count.toLocaleString("en-CA")}
      </span>
    </div>
  );
}

const socials = [
  {
    label: "GitHub",
    href: "https://github.com/MisplacedOrange",
    path: "M12 .8A11.3 11.3 0 0 0 8.4 22.9c.6.1.8-.3.8-.6v-2.2c-3.5.8-4.2-1.5-4.2-1.5-.6-1.5-1.4-1.9-1.4-1.9-1.1-.8.1-.8.1-.8 1.3.1 2 1.3 2 1.3 1.1 2 3 1.4 3.7 1.1.1-.8.4-1.4.8-1.7-2.8-.3-5.7-1.4-5.7-6.3 0-1.4.5-2.5 1.3-3.4-.1-.3-.6-1.6.1-3.3 0 0 1.1-.3 3.5 1.3a12 12 0 0 1 6.4 0c2.4-1.6 3.5-1.3 3.5-1.3.7 1.7.2 3 .1 3.3.8.9 1.3 2 1.3 3.4 0 4.9-3 6-5.8 6.3.5.4.9 1.2.9 2.4v3.6c0 .4.2.7.8.6A11.3 11.3 0 0 0 12 .8Z",
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/royluu",
    path: "M5.3 7.4H1.7V22h3.6V7.4ZM3.5 1.8A2.1 2.1 0 1 0 3.5 6a2.1 2.1 0 0 0 0-4.2ZM22.3 13.6c0-4.4-2.4-6.5-5.5-6.5a4.8 4.8 0 0 0-4.3 2.4v-2H9V22h3.6v-7.2c0-1.9.4-3.7 2.8-3.7 2.4 0 2.4 2.2 2.4 3.8V22h3.6l.9-8.4Z",
  },
  {
    label: "X",
    href: "https://x.com/misplacedorange",
    path: "M18.9 2h3.7l-8.1 9.2L24 22h-7.4l-5.8-7.6L4.1 22H.4l8.7-10L0 2h7.6l5.2 6.9L18.9 2Zm-1.3 18.1h2L6.5 3.8H4.4l13.2 16.3Z",
  },
];

const projects = [
  {
    name: "Octavius",
    category: "Hardware | 1st - Huawei OMNI Live Challenge @ Hack the North ‘26",
    description: "Wearable robotic arm with voice and vision controls, built from cardboard, popsicle sticks, and servos.",
    technology: "Python, C++, Raspberry Pi, Arduino",
    href: "https://github.com/savcode066/octavius",
  },
  {
    name: "Vantage",
    category: "Software | National Finalist @ FBLC ’26",
    description: "A community-focused discovery tool to help users find, rate, and support local small businesses.",
    technology: "Typescript, React, Python",
    href: "https://github.com/crackle2k/vantage",
  },
];

function ExternalLink({ children, ...props }) {
  return (
    <a target="_blank" rel="noreferrer" {...props}>
      {children}
    </a>
  );
}

export function App() {
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className="site-header" id="index">
        <nav className="main-nav" aria-label="Main navigation">
          <a href="#about">about</a>
          <a href="#projects">projects</a>
        </nav>
      </header>

      <main className="profile" id="main-content">
        <div className="profile-heading">
          <h1 id="profile-title">Roy Lu</h1>
          <VisitCounter />
        </div>

        <section className="about content-section" id="about" aria-labelledby="about-title">
          <h2 id="about-title">a little about me</h2>
          <p>based in the greater toronto area. i want to major in computer science and i'm interested in machine learning, robotics, and aerospace.</p>
        </section>

        <section className="content-section projects" id="projects" aria-labelledby="projects-title">
          <h2 id="projects-title">my favourite projects</h2>
          <ul className="project-list">
            {projects.map(({ name, category, description, technology, href }) => (
              <li className="project-row" key={name}>
                <div className="project-info">
                  <span className="project-category">{category}</span>
                  <h3>
                    <ExternalLink className="entity-link" href={href}>{name}</ExternalLink>
                  </h3>
                  <p>{description}</p>
                  <span className="project-technology">{technology}</span>
                </div>
                <ExternalLink
                  className="project-link"
                  href={href}
                  aria-label={`View ${name} on GitHub`}
                >
                  GitHub ↗
                </ExternalLink>
              </li>
            ))}
          </ul>
          <p className="more-projects">
            <ExternalLink href="https://github.com/MisplacedOrange?tab=repositories">
              rest of my cool projects ↗
            </ExternalLink>
          </p>
        </section>

        <section className="content-section" id="other" aria-labelledby="other-title">
          <h2 id="other-title">other</h2>
          <ul className="other-list">
            <li>air cadet of 3 years, currently a FSgt</li>
            <li>co-author of a paper at NewInML @ Neurips '26</li>
            <li>always looking for highschool internships 👀</li>
            <li>feel free contact me through linkedin or X</li>
          </ul>
        </section>
      </main>
      <footer className="site-footer">© {new Date().getFullYear()} Roy Lu</footer>
      <nav className="social-dock" aria-label="Social links">
        {socials.map(({ label, href, path }) => (
          <ExternalLink key={label} href={href} aria-label={label} title={label}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d={path} />
            </svg>
          </ExternalLink>
        ))}
      </nav>
    </>
  );
}
