# Contributing

Renderume is intentionally small. Contributions should make the local CV workflow clearer, more reliable, or easier to customize without broadening the product into a web service.

By contributing, you agree that your contribution is available under the repository's [PolyForm Noncommercial 1.0.0](LICENSE) license.

## Before starting

Read the [PRD](docs/PRD.md), [architecture](docs/architecture.md), and [development guide](docs/development.md). They define the product boundary and the stable file-format contract.

## Contribution rules

- Keep each change focused and explain its user-facing reason.
- Do not add accounts, telemetry, cloud storage, AI features, ATS scoring, cover letters, or an editor UI without an approved PRD change.
- Preserve local/offline operation after dependencies are installed.
- Do not commit generated PDFs, build output, dependency directories, credentials, or personal CV data.
- Update documentation when a user-visible command, file format, theme API, or durable architectural decision changes.
- Add or update tests appropriate to the change. Print/PDF changes also require a visual check of the generated PDF.

## Review standard

A contribution is ready when it is scoped, documented, passes the relevant checks, and does not regress the example CV's rendered layout.

The same rules apply to AI-assisted changes.
