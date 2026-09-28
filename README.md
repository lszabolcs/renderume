# Renderume

Renderume is a local-first résumé renderer for developers.

Write your CV in Markdown and YAML, customize its layout with React and CSS, then generate a print-ready PDF from the command line. Your CV remains a repository you own; no account, web editor, cloud storage, or AI workflow is required.

> Status: pre-development. The product contract and development constraints are documented before implementation begins.

## Intended workflow

```bash
cv init my-cv
cd my-cv
cv validate
cv build
cv watch
```

The generated project will keep content in YAML and Markdown, themes in TSX and CSS, and generated output outside version control.

Create a starter project with `cv init my-cv`. `init` refuses an existing target
directory, so it cannot overwrite a CV project by accident.

`cv watch` builds both artifacts, prints two localhost URLs, and rebuilds after
source changes; it never opens a browser tab by itself. `/html` reloads after a
successful rebuild and supports browser developer tools. `/pdf` remains a raw
PDF route for inspecting final A4 pagination.

It observes `content/`, `theme/`, and `cv.config.yaml`. Failed rebuilds report
the validation error and leave the last valid PDF in place. Stop it with
`Ctrl+C`.

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

## Documentation

- [Product requirements](docs/PRD.md)
- [Architecture and file structure](docs/architecture.md)
- [Development guide](docs/development.md)
- [Contributor guide](CONTRIBUTING.md)
- [Architecture decisions](docs/decisions/)

## License

Renderume is available under the [PolyForm Noncommercial 1.0.0](LICENSE) license. It may be used, changed, and shared for noncommercial purposes. Commercial use requires separate permission.
