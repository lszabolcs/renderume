# My CV

This directory is your CV source. It intentionally has no `package.json`: the
`renderume` command is provided by Renderume, not this project.

## Start here

1. Replace the placeholder details in `content/profile.yaml`.
2. Write a short introduction in `content/summary.md`.
3. Add or remove Markdown files in `content/experience/` and `content/projects/`.
4. Update grouped skills in `content/skills.yaml` and optional education in
   `content/education.md`.

Check the source before creating files:

```bash
renderume validate
```

Build the static HTML and print-ready PDF:

```bash
renderume build
```

For local development, run the live HTML and PDF preview:

```bash
renderume watch
```

`renderume watch` prints an HTML URL with live reload for browser developer tools and a
PDF URL for final A4 pagination. It never opens a browser window itself.

## Layout

Edit `theme/Resume.tsx` to change document structure and `theme/styles.css` for
layout and print styles. This template uses CSS Grid: keep concise contact
details and skills in the sidebar, and keep long-form content in the main column.

The CSS custom properties at the top of `theme/styles.css` control typography,
colors, spacing, and sidebar width.

Generated HTML and PDF files are written to `dist/`; do not edit or commit them.
