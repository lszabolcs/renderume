# Renderume

Renderume is a local-first résumé renderer for developers.

Write your CV in Markdown and YAML, customize its layout with React and CSS, then generate a print-ready PDF from the command line. Your CV remains a repository you own; no account, web editor, cloud storage, or AI workflow is required.

> Status: MVP. The CLI, starter templates, local preview, and PDF rendering are ready for local use.

## Install

Renderume requires Node.js 22 or newer. Its Chromium dependency downloads during
installation, so no separate browser setup is required.

Install the current default branch directly from GitHub:

```bash
npm install -g github:lszabolcs/renderume
```

## Intended workflow

```bash
renderume init my-cv
cd my-cv
renderume validate
renderume build
renderume watch
```

The first installation downloads Chromium because Renderume uses it to create
consistent, print-ready PDFs. After that, builds work locally without sending CV
content to a service.

The generated project will keep content in YAML and Markdown, themes in TSX and CSS, and generated output outside version control.

Create a starter project with `renderume init my-cv`. `init` refuses an existing target
directory, so it cannot overwrite a CV project by accident.

`renderume watch` builds both artifacts, prints two localhost URLs, and rebuilds after
source changes; it never opens a browser tab by itself. `/html` reloads after a
successful rebuild and supports browser developer tools. `/pdf` remains a raw
PDF route for inspecting final A4 pagination.

It observes `content/`, `theme/`, and `cv.config.yaml`. Failed rebuilds report
the validation error in the terminal and an HTML preview banner, while leaving
the last valid PDF in place. Stop it with `Ctrl+C`.

```text
my-cv/
├── cv.config.yaml
├── content/
├── theme/
├── public/
└── dist/
```

## Principles

- Local-first and offline after installation.
- Content is source-controlled, portable files.
- Themes are ordinary React, HTML, CSS, and optional Tailwind code.
- PDF output respects content-level page-break rules.
- Small scope: no editor UI, accounts, AI, ATS scoring, or cover letters.

## Templates

`renderume init` creates the one-column default starter. The optional sidebar starter
uses the same YAML and Markdown content contract, but starts with a CSS Grid
layout and a concise contact-and-skills sidebar:

```bash
renderume init my-cv --template sidebar
```

Each template is a complete, self-contained CV project. Templates do not change
the content format; they only supply different initial theme and sample files.

## Content reference

All paths below are relative to the generated CV directory. YAML holds
structured data; Markdown holds long-form content. The renderer passes
normalized data to `theme/Resume.tsx`, so themes do not read these files
directly.

### `cv.config.yaml`

| Field | Required | Value |
| --- | --- | --- |
| `locale` | Yes | Locale string, for example `en-GB`. |
| `output.filename` | Yes | PDF filename ending in `.pdf`, without a path. |
| `output.pageSize` | Yes | `A4`. |
| `output.margin` | Yes | CSS print length, for example `16mm`. |

### `content/profile.yaml`

| Field | Required | Value |
| --- | --- | --- |
| `name` | Yes | Full name. |
| `title` | Yes | Professional title. |
| `location` | No | Location string. |
| `contact.email` | Yes | E-mail address. |
| `contact.phone` | No | Phone number. |
| `contact.links` | No | List of `{ label, url }` link objects; defaults to `[]`. |

```yaml
contact:
  email: you@example.com
  phone: "+1 555 0100"
  links:
    - label: Portfolio
      url: https://your-site.example
    - label: GitHub
      url: https://github.com/your-handle
```

To migrate an older profile, replace `website`, `github`, and `linkedin` with
corresponding labeled entries in `contact.links`.

### `content/summary.md` and `content/education.md`

`summary.md` is required and must contain Markdown. `education.md` is optional;
omit it when the CV has no education section. Both are rendered as Markdown.

### `content/experience/*.md`

Each Markdown file creates one experience entry. Its filename becomes a stable
internal identifier; use a descriptive, unique filename such as
`acme-senior-frontend-engineer.md`.

| Frontmatter field | Required | Value |
| --- | --- | --- |
| `company` | Yes | Company or organization name. |
| `role` | Yes | Role title. |
| `start` | Yes | Start date, conventionally `YYYY-MM`. |
| `end` | No | End date in `YYYY-MM`, or `present`. |
| `location` | No | Location string. |
| `stack` | No | List of technology strings; defaults to `[]`. |
| `order` | No | Integer sort order; higher values appear first, default `0`. |
| `pageBreakBefore` | No | `true` starts the entry on a new page; default `false`. |

The Markdown body is required. Use ordinary Markdown paragraphs and bullet lists
for responsibilities and outcomes.

```md
---
company: Acme Inc.
role: Senior Frontend Engineer
start: 2023-03
end: present
stack: [TypeScript, React, Playwright]
order: 10
pageBreakBefore: false
---

- Built a reusable component system.
- Improved a critical flow's LCP by 38%.
```

### `content/projects/*.md`

Each Markdown file creates one project entry. Projects use the same `stack`,
`order`, and `pageBreakBefore` behavior as experience entries.

| Frontmatter field | Required | Value |
| --- | --- | --- |
| `name` | Yes | Project name. |
| `url` | No | Project URL. |
| `stack` | No | List of technology strings; defaults to `[]`. |
| `order` | No | Integer sort order; higher values appear first, default `0`. |
| `pageBreakBefore` | No | `true` starts the entry on a new page; default `false`. |

The Markdown body is required. Omit the entire `projects/` directory when the CV
has no projects.

### `content/skills.yaml`

`groups` is required and contains named skill groups. Each group requires a
`name` and an `items` list of strings.

```yaml
groups:
  - name: Frontend
    items: [TypeScript, React, CSS, Accessibility]
  - name: Tooling
    items: [Git, Playwright, Vite]
```

Run `renderume validate` after editing. It reports the source file and field for
missing or incorrectly typed values. Unrecognized YAML and frontmatter fields
are not passed to the theme, so do not use them as custom data without extending
the content loader first.

## Documentation

- [Product requirements](docs/PRD.md)
- [Architecture and file structure](docs/architecture.md)
- [Development guide](docs/development.md)
- [Contributor guide](CONTRIBUTING.md)
- [Architecture decisions](docs/decisions/)

## License

Renderume is available under the [PolyForm Noncommercial 1.0.0](LICENSE) license. It may be used, changed, and shared for noncommercial purposes. Commercial use requires separate permission.
