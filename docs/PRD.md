# Product Requirements — Renderume

**Status:** Accepted baseline  
**Version:** 1.0  
**Date:** 2026-09-27

## Summary

Renderume is a local-first command-line résumé renderer for developers. Users store content in portable YAML and Markdown files, customize presentation through React components and CSS/Tailwind, and generate a print-ready PDF locally.

> Your résumé is a repository: write it in Markdown, shape it in React, build it with one command.

Renderume is not a web CV builder. It has no account, hosted editor, cloud persistence, AI workflow, cover-letter generator, or ATS scoring feature.

## Problem

Most CV builders make users maintain sensitive professional information inside an opinionated web application and offer limited control over output. Developers need a durable source-controlled workflow that does not trade data ownership for a PDF export and does not constrain styling to a template editor.

## Target user

The primary user is a frontend developer who is comfortable editing Markdown, YAML, TSX, CSS, and Git. A secondary user can use the generated starter theme and edit only content files.

## Goals

1. Make a complete, professional A4 PDF from local files with one command.
2. Give frontend developers real component- and CSS-level layout control.
3. Keep the content portable, inspectable, versionable, and local.
4. Produce reliable multi-page documents rather than a fragile screenshot of a webpage.

## Non-goals for MVP

- Browser editor, drag-and-drop UI, sign-in, or cloud sync.
- AI writing, job-description analysis, ATS score, or API-key management.
- Cover letters.
- Import from LinkedIn, PDF, or DOCX.
- Template marketplace or remote theme loading.
- Job-specific `targets/` / variant overlays.
- Equal-width, automatically balanced multi-column pagination.

## User workflow

```bash
renderume init my-cv
cd my-cv
renderume build
```

The initial generated project includes a functioning example CV, a default theme, and comments or documentation sufficient to identify content and theme entry points.

## CLI requirements

| Command | Requirement |
| --- | --- |
| `renderume init [directory]` | Create a starter CV project. |
| `renderume build` | Validate source, render HTML, and write HTML/PDF output. |
| `renderume validate` | Validate without generating output; use non-zero exit code on errors. |
| `renderume watch` | Serve local HTML/PDF previews and rebuild them on content or theme changes. |

`renderume build` must report output paths. A failed validation must not overwrite the most recent valid PDF.

## Source structure

```text
my-cv/
├── cv.config.yaml
├── content/
│   ├── profile.yaml
│   ├── summary.md
│   ├── experience/
│   ├── projects/
│   ├── skills.yaml
│   ├── languages.yaml
│   └── education.md
├── theme/
│   ├── Resume.tsx
│   ├── components/
│   ├── styles.css
│   └── print.css
├── public/
└── dist/
```

`content/`, `theme/`, and `cv.config.yaml` are source. `dist/` is generated and Git-ignored.

## Content format

YAML stores structured fields. Markdown stores long-form sections and item bodies. Experience and project items are separate Markdown files with YAML frontmatter.

```md
---
company: Acme Inc.
role: Senior Frontend Engineer
location: Remote
start: 2023-03
end: present
stack: [TypeScript, React, Next.js]
order: 10
pageBreakBefore: false
---

- Built a reusable component system.
- Improved a critical flow's LCP by 38%.
```

Required experience fields are `company`, `role`, and `start`. Dates use `YYYY-MM`; the only open-ended `end` value is `present`.

## Theme requirements

A theme is a local React module. The entry component receives normalized `ResumeData`; it does not open or parse content files.

```tsx
export function Resume({ cv }: { cv: ResumeData }) {
  return <main>{/* user-owned layout */}</main>;
}
```

The theme may use plain CSS or Tailwind. The user must be able to alter DOM structure, typography, colors, spacing, and section presentation without forking the compiler.

## Rendering requirements

```text
YAML + Markdown → normalize and validate → ResumeData
→ React + CSS render → static HTML → Chromium PDF → HTML and PDF files
```

PDF output must:

- use A4 size and configurable margins;
- wait for fonts and local assets;
- contain searchable/selectable text;
- work offline after dependencies are installed;
- not send CV content over the network.

## Pagination requirements

The default theme must treat experience entries, projects, and skill groups as meaningful blocks.

- Keep normal project and skill blocks together when they fit on the next page.
- Let a long experience item use meaningful remaining page space, but keep its heading and metadata with subsequent content.
- Keep section headings with subsequent content.
- Avoid splitting individual bullet items where possible.
- If a block exceeds a full page, split it safely rather than clipping or dropping content.
- Honor `pageBreakBefore: true` for an explicit page break before an item.
- Render page boundaries in preview.

The default theme uses print CSS such as `break-inside: avoid-page`, `break-after: avoid-page`, widows/orphans, and explicit break-before semantics. These are intentional rendering rules, not optional visual polish.

## Layout support

The MVP supports:

1. A one-column, ATS-friendly default theme.
2. An optional CSS Grid layout with a short sidebar and a long primary content column.

The sidebar holds concise fields such as contact details, links, skills, and languages. Long experience/project content remains in the primary flow. CSS multi-column (`columns`) is not used in first-party themes.

Automatic balancing and page-by-page placement across two equal columns is deferred. It requires a dedicated pagination engine and must not be approximated with fragile CSS behavior.

## Validation experience

Validation errors must name the file and field and offer an actionable message.

```text
✖ content/experience/acme-senior-frontend.md
  end: expected "YYYY-MM" or "present"; received "current"

✖ content/profile.yaml
  contact.email: invalid email address

Build aborted. Run `renderume validate` after fixing the files.
```

In watch mode, retain the latest valid document and surface the current validation error in both terminal and preview.

## Acceptance criteria

The MVP is complete only when:

1. `renderume init` creates a usable starter project.
2. The starter project builds to `dist/cv.html` and `dist/cv.pdf`.
3. An example with at least two pages has no clipped, overlapping, or missing content.
4. A regular experience item moves intact to the next page when it fits there.
5. A longer-than-page item continues without losing content.
6. `pageBreakBefore: true` starts the item on a new page.
7. Invalid required fields, dates, and e-mail values fail with field-level errors and a non-zero status.
8. Watch mode reacts to content and theme edits.
9. Watch exposes a preview that identifies A4 page boundaries.
10. The build does not transmit CV data over the network.

## Explicit future phases

1. `targets/` for job-specific content variants, only after the single-CV flow is stable.
2. Dedicated two-column pagination, only after visual regression coverage protects current output.
3. Additional copyable local themes, not a remote marketplace.

## Implementation choices left open

The CLI argument library, schema-validation library, bundler details, and preview server are implementation decisions. They must preserve this PRD's file contract, local-first behavior, and commands.
