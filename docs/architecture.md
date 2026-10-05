# Architecture

## Purpose

Renderume compiles local CV source files into static HTML and a print-ready PDF. It is a document compiler, not a browser-based CV builder.

```text
YAML + Markdown
      ↓
load, normalize, validate
      ↓
ResumeData
      ↓
React theme + CSS/Tailwind
      ↓
static print HTML
      ↓
Chromium PDF rendering
      ↓
HTML + PDF
```

## Repository structure

This repository will contain the CLI and its starter template assets:

```text
renderume/
├── AGENTS.md                 # Instructions for automated contributors
├── README.md
├── CONTRIBUTING.md
├── docs/
│   ├── PRD.md
│   ├── architecture.md
│   ├── development.md
│   └── decisions/
├── bin/                      # Executable `renderume` entry point
├── src/                      # CLI and compiler implementation
├── templates/                # Complete starter projects copied by `renderume init`
├── tests/
└── package.json
```

A generated CV project must have this structure:

```text
my-cv/
├── cv.config.yaml            # Output settings
├── content/
│   ├── profile.yaml
│   ├── summary.md
│   ├── experience/
│   │   └── company-role.md
│   ├── projects/
│   ├── skills.yaml
│   ├── languages.yaml
│   └── education.md
├── theme/
│   ├── Resume.tsx            # Theme entry point
│   ├── components/
│   ├── styles.css
│   └── print.css
├── public/                   # Optional local assets
└── dist/                     # Generated; ignored by Git
```

`content/`, `theme/`, and `cv.config.yaml` are the user-owned source of truth. `dist/` is never an input and is ignored by Git.

## Layer boundaries

### Content and core

The core loads YAML and Markdown, validates it, and normalizes it into `ResumeData`. It owns parsing, ordering, formatting of dates, validation messages, and build orchestration.

The core must not contain decisions about a particular visual layout.

### Theme

A theme is local React/TSX plus CSS. The compiler loads `theme/Resume.tsx`; it must export a React component named `Resume` or a default component. That component receives `ResumeData` and renders static markup. An optional `theme/styles.css` is embedded with the rendered document. Themes may control hierarchy, layout, typography, and which optional fields they show. Themes must not read content files themselves or mutate source data.

Themes are executable local code. Installing an untrusted theme has the same risk profile as installing untrusted npm code.

Each starter template contains one active `theme/` directory. The first-party
`default` and `sidebar` templates are complete, self-contained CV projects and
use the same normalized `ResumeData` and content format. `renderume init` selects a
template; this only changes the initial files, not the content contract.

### Renderer

The renderer receives static HTML and resolved CSS and produces the PDF with Chromium. It must wait for fonts and local assets before printing. Output must remain selectable, searchable text rather than rasterized page images.

## Distribution

The repository is an installable Node CLI package. Its `bin/renderume.mjs` entry point
starts the TypeScript CLI through the packaged `tsx` runtime. Package files are
whitelisted to the executable, source, templates, README, and license.

The package depends on Playwright and its matching Chromium browser package.
The browser package downloads Chromium during `npm install`, so a user does not
need a separate Playwright command before running `renderume build`.

### Watch

`renderume watch` builds the same HTML and PDF artifacts as `renderume build`, serves them only
on `127.0.0.1`, and observes `content/`, `theme/`, and `cv.config.yaml`. It
prints separate `/html` and `/pdf` routes without opening a browser. The HTML
route supports theme debugging in browser developer tools and reloads after a
successful rebuild through a local server-sent event. A failed rebuild adds a
local error banner to the previous HTML document. The PDF route remains the
authoritative A4 pagination view and is served without injected code. Each
subsequent build runs in a fresh Node process so changes to TSX theme dependencies
bypass the module cache. A failed rebuild leaves the previous generated artifacts
intact.

## Stable content contract

The initial data format uses YAML for structured fields and Markdown for long-form content. Each experience item is one Markdown file with YAML frontmatter.

`cv.config.yaml` supplies the output filename and A4 margin. `profile.yaml` holds
the name, title, optional location, and a nested `contact` object with required
e-mail, optional phone number, and an optional labeled-link list. `skills.yaml`
contains named groups of string items. `languages.yaml` is optional and contains
a list of free-text language and level pairs;
`education.md` is optional. Projects follow the same frontmatter-plus-Markdown
shape as experience items, with `name` in place of `company`, `role`, and dates.

```md
---
company: Acme Inc.
role: Senior Frontend Engineer
start: 2023-03
end: present
order: 10
pageBreakBefore: false
---

- Built a reusable component system.
```

The theme only receives the normalized type, never raw frontmatter. A change to the documented source format requires a migration plan, fixtures, and documentation update.

The theme decides which sections to render and their order. These are layout
choices, so they do not belong in the compiler configuration.

## Print and pagination contract

The default theme must render with semantic components such as `Section`, `ExperienceItem`, `ProjectItem`, `SkillGroup`, and `KeepTogether`.

These are theme-owned components. The compiler does not impose their DOM or CSS;
the starter theme demonstrates the contract with standard print CSS.

- A section title avoids being orphaned at the bottom of a page.
- Project and skill blocks avoid splitting across pages when they fit on a new page.
- Experience metadata avoids being orphaned, but long experience content may break between bullet items.
- A block taller than a whole page may split; content must never be clipped or lost.
- `pageBreakBefore: true` requests a page break before an item.
- A preview shows A4 page boundaries.

`examples/pagination-cv` is a regression fixture for content that is larger than
one page. It is intentionally separate from the copyable starter template.

The first release supports one-column and main-column-with-short-sidebar themes. The sidebar layout must use CSS Grid, not CSS multi-column. Equal, automatically balanced columns require a dedicated pagination engine and are explicitly out of scope for the MVP.
