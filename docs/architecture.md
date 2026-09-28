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

This repository will contain the CLI and its starter/theme assets:

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
├── src/                      # CLI and compiler implementation
├── templates/                # Files copied by `cv init`
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
│   └── education.md
├── theme/
│   ├── Resume.tsx            # Theme entry point
│   ├── components/
│   ├── styles.css
│   └── print.css
├── public/                   # Optional local assets
├── dist/                     # Generated; ignored by Git
└── package.json
```

`content/`, `theme/`, and `cv.config.yaml` are the user-owned source of truth. `dist/` is never an input and is ignored by Git.

## Layer boundaries

### Content and core

The core loads YAML and Markdown, validates it, and normalizes it into `ResumeData`. It owns parsing, ordering, formatting of dates, validation messages, and build orchestration.

The core must not contain decisions about a particular visual layout.

### Theme

A theme is local React/TSX plus CSS. The compiler loads `theme/Resume.tsx`; it must export a React component named `Resume` or a default component. That component receives `ResumeData` and renders static markup. An optional `theme/styles.css` is embedded with the rendered document. Themes may control hierarchy, layout, typography, and which optional fields they show. Themes must not read content files themselves or mutate source data.

Themes are executable local code. Installing an untrusted theme has the same risk profile as installing untrusted npm code.

### Renderer

The renderer receives static HTML and resolved CSS and produces the PDF with Chromium. It must wait for fonts and local assets before printing. Output must remain selectable, searchable text rather than rasterized page images.

## Stable content contract

The initial data format uses YAML for structured fields and Markdown for long-form content. Each experience item is one Markdown file with YAML frontmatter.

`cv.config.yaml` supplies the output filename and A4 margin. `profile.yaml` holds
the name, title, optional location, and a nested `contact` object. `skills.yaml`
contains named groups of string items;
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

- A section title avoids being orphaned at the bottom of a page.
- An ordinary experience/project/skill block avoids splitting across pages when it fits on a new page.
- A block taller than a whole page may split; content must never be clipped or lost.
- `pageBreakBefore: true` requests a page break before an item.
- A preview shows A4 page boundaries.

The first release supports one-column and main-column-with-short-sidebar themes. The sidebar layout must use CSS Grid, not CSS multi-column. Equal, automatically balanced columns require a dedicated pagination engine and are explicitly out of scope for the MVP.
