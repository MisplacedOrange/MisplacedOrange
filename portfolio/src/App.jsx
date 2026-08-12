import { useEffect, useState } from "react";

const GITHUB_URL = "https://github.com/MisplacedOrange";

const projects = [
  {
    number: "01",
    name: "Vantage",
    label: "Full-stack product",
    description:
      "Trust-first local discovery where visibility is earned through verified activity—not ad spend.",
    stack: ["React", "TypeScript", "Rust", "Supabase"],
    repo: "https://github.com/crackle2k/vantage",
    live: "https://vantage-ruddy.vercel.app",
    featured: true,
  },
  {
    number: "02",
    name: "OrangeDL",
    label: "Desktop tooling",
    description:
      "A Windows-first download manager with concurrent transfers, local history, and yt-dlp support.",
    stack: ["Tauri", "Rust", "React", "SQLite"],
    repo: "https://github.com/MisplacedOrange/OrangeDL",
  },
  {
    number: "03",
    name: "gRNAlytics",
    label: "Bioinformatics",
    description:
      "A Python tool that ranks CRISPR guide RNAs after automated NCBI BLAST off-target analysis.",
    stack: ["Python", "Biopython", "BLAST"],
    repo: "https://github.com/MisplacedOrange/gRNAlytics",
  },
  {
    number: "04",
    name: "Solutions",
    label: "Problem solving",
    description:
      "Accepted DMOJ, Codeforces, LeetCode, CCC, DMOPC, and contest practice solutions.",
    stack: ["Python", "Java", "C++"],
    repo: "https://github.com/MisplacedOrange/Solutions",
  },
];

const funFacts = [
  "My GitHub avatar is a literal orange. Branding: solved.",
  "I logged 3,032 GitHub contributions over the last year.",
  "I practice on DMOJ, Codeforces, LeetCode, and Project Euler.",
  "My recent projects span TypeScript, Rust, Python, Java, and C++.",
  "I built software that helps rank CRISPR guide RNAs.",
  "I’m based in Ontario, Canada.",
];

function Icon({ name }) {
  if (name === "github") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M12 .8A11.3 11.3 0 0 0 8.4 22.9c.6.1.8-.3.8-.6v-2.2c-3.5.8-4.2-1.5-4.2-1.5-.6-1.5-1.4-1.9-1.4-1.9-1.1-.8.1-.8.1-.8 1.3.1 2 1.3 2 1.3 1.1 2 3 1.4 3.7 1.1.1-.8.4-1.4.8-1.7-2.8-.3-5.7-1.4-5.7-6.3 0-1.4.5-2.5 1.3-3.4-.1-.3-.6-1.6.1-3.3 0 0 1.1-.3 3.5 1.3a12 12 0 0 1 6.4 0c2.4-1.6 3.5-1.3 3.5-1.3.7 1.7.2 3 .1 3.3.8.9 1.3 2 1.3 3.4 0 4.9-3 6-5.8 6.3.5.4.9 1.2.9 2.4v3.6c0 .4.2.7.8.6A11.3 11.3 0 0 0 12 .8Z"
        />
      </svg>
    );
  }

  if (name === "linkedin") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M5.3 7.4H1.7V22h3.6V7.4ZM3.5 1.8A2.1 2.1 0 1 0 3.5 6a2.1 2.1 0 0 0 0-4.2ZM22.3 13.6c0-4.4-2.4-6.5-5.5-6.5a4.8 4.8 0 0 0-4.3 2.4v-2H9V22h3.6v-7.2c0-1.9.4-3.7 2.8-3.7 2.4 0 2.4 2.2 2.4 3.8V22h3.6l.9-8.4Z"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M18.9 2h3.7l-8.1 9.2L24 22h-7.4l-5.8-7.6L4.1 22H.4l8.7-10L0 2h7.6l5.2 6.9L18.9 2Zm-1.3 18.1h2L6.5 3.8H4.4l13.2 16.3Z"
      />
    </svg>
  );
}

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

function ProjectCard({ project }) {
  return (
    <article className={`project-card${project.featured ? " project-card--featured" : ""}`}>
      <div className="project-card__topline">
        <span>{project.number}</span>
        <span>{project.label}</span>
      </div>
      <div className="project-card__title-row">
        <h3>{project.name}</h3>
        <a href={project.repo} target="_blank" rel="noreferrer" aria-label={`${project.name} repository`}>
          <Arrow />
        </a>
      </div>
      <p>{project.description}</p>
      <div className="project-card__bottom">
        <ul className="tag-list" aria-label={`${project.name} technologies`}>
          {project.stack.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        {project.live && (
          <a className="live-link" href={project.live} target="_blank" rel="noreferrer">
            live <Arrow />
          </a>
        )}
      </div>
    </article>
  );
}

function Mascot() {
  const [factIndex, setFactIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const chooseFact = () => {
    setFactIndex((current) => {
      const offset = 1 + Math.floor(Math.random() * (funFacts.length - 1));
      return (current + offset) % funFacts.length;
    });
    setIsOpen(true);
  };

  return (
    <aside className={`mascot${isOpen ? " mascot--speaking" : ""}`}>
      <div className="fact-bubble" id="orange-fact" role="status" aria-live="polite">
        <span className="fact-bubble__label">orange says</span>
        {funFacts[factIndex]}
      </div>
      <button
        className="mascot__button"
        type="button"
        aria-label="Roy's orange mascot. Hover, focus, or tap for a random fact."
        aria-describedby="orange-fact"
        onPointerEnter={chooseFact}
        onPointerLeave={(event) => event.pointerType !== "touch" && setIsOpen(false)}
        onFocus={chooseFact}
        onBlur={() => setIsOpen(false)}
        onClick={chooseFact}
      >
        <img src="/roy-cutout.png" alt="" />
        <span className="mascot__hint">hover for a fact</span>
      </button>
    </aside>
  );
}

export function App() {
  const [publicRepos, setPublicRepos] = useState(15);

  useEffect(() => {
    const controller = new AbortController();

    fetch("https://api.github.com/users/MisplacedOrange", {
      signal: controller.signal,
      headers: { Accept: "application/vnd.github+json" },
    })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((profile) => setPublicRepos(profile.public_repos ?? 15))
      .catch(() => {});

    return () => controller.abort();
  }, []);

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <div className="site-frame">
        <header className="site-header">
          <a className="wordmark" href="#top" aria-label="Roy Lu, home">
            roy lu<span>.</span>
          </a>
          <nav aria-label="Primary navigation">
            <a href="#work">work</a>
            <a href="#about">about</a>
            <a href={GITHUB_URL} target="_blank" rel="noreferrer">
              github <Arrow />
            </a>
          </nav>
        </header>

        <main id="main-content" className="single-screen">
          <section className="intro-panel" id="top" aria-labelledby="hero-title">
            <div className="eyebrow hero__eyebrow">
              <span className="status-dot" aria-hidden="true" />
              Student developer · Ontario, Canada
            </div>

            <h1 id="hero-title">
              Roy Lu builds useful software for <em>curious problems.</em>
            </h1>

            <p className="hero__intro">
              Web, desktop, bioinformatics, and algorithms—practical ideas turned into clear,
              shippable tools.
            </p>

            <div className="hero__actions">
              <a className="button button--primary" href="#work">
                See selected work <span aria-hidden="true">↓</span>
              </a>
              <a className="button button--quiet" href={GITHUB_URL} target="_blank" rel="noreferrer">
                <Icon name="github" /> Open GitHub <Arrow />
              </a>
            </div>

            <a className="github-snapshot" href={GITHUB_URL} target="_blank" rel="noreferrer">
              <div className="github-snapshot__identity">
                <span className="github-mark">
                  <Icon name="github" />
                </span>
                <span>
                  <strong>@MisplacedOrange</strong>
                  <small>Profile snapshot · Aug 12, 2026</small>
                </span>
              </div>
              <dl className="github-snapshot__stats">
                <div>
                  <dt>Contributions</dt>
                  <dd>3,032</dd>
                </div>
                <div>
                  <dt>Repos</dt>
                  <dd>{publicRepos}</dd>
                </div>
                <div>
                  <dt>Pinned</dt>
                  <dd>4</dd>
                </div>
              </dl>
              <span className="github-snapshot__arrow" aria-hidden="true">
                ↗
              </span>
            </a>

            <div className="about-strip" id="about">
              <span className="eyebrow">02 · What I bring</span>
              <p>
                Range with a reason: product thinking, technical breadth, and plenty of problem-solving reps.
              </p>
              <div className="about-strip__points">
                <span>product range</span>
                <span>React · Rust · Python</span>
                <span>competitive programming</span>
              </div>
            </div>
          </section>

          <section className="work-panel" id="work" aria-labelledby="work-title">
            <div className="work-panel__header">
              <div>
                <span className="eyebrow">01 · Selected work</span>
                <h2 id="work-title">Proof, not promises.</h2>
              </div>
              <a className="text-link" href={`${GITHUB_URL}?tab=repositories`} target="_blank" rel="noreferrer">
                all repos <Arrow />
              </a>
            </div>

            <div className="project-grid">
              {projects.map((project) => (
                <ProjectCard key={project.name} project={project} />
              ))}
            </div>

            <div className="work-panel__footer">
              <span>Start with the code.</span>
              <div>
                <a href={GITHUB_URL} target="_blank" rel="noreferrer" aria-label="GitHub">
                  <Icon name="github" />
                </a>
                <a href="https://linkedin.com/in/royluu" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                  <Icon name="linkedin" />
                </a>
                <a href="https://x.com/misplacedorange" target="_blank" rel="noreferrer" aria-label="X">
                  <Icon name="x" />
                </a>
              </div>
            </div>
          </section>
        </main>

        <footer className="site-footer">
          <p>Roy Lu · Ontario, Canada</p>
          <p>Built to get out of the way.</p>
        </footer>
      </div>

      <Mascot />
    </>
  );
}
