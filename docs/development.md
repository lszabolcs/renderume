# Development guide

## Working agreement

Read `AGENTS.md`, the [PRD](PRD.md), and [architecture](architecture.md) before making a change. The PRD takes precedence over convenience features and implementation preferences.

## Scope discipline

Renderume stays local-first. Do not add network calls, telemetry, sign-in, cloud persistence, AI rewriting, ATS scores, cover letters, or a web editor unless the PRD is deliberately amended first.

Prefer the smallest implementation that preserves the documented CLI and content contract. Avoid adding dependencies unless they eliminate meaningful complexity or reliability risk.

## Code and file rules

- Use TypeScript for production code.
- Keep parsing/normalization separate from rendering and PDF concerns.
- Treat user content as data; do not silently mutate source files during build.
- Keep generated output in `dist/` and out of commits.
- Do not add personal CV data, API keys, or private contact details to fixtures.
- Keep theme code user-owned and independent from file-system reads.

## Verification

Every change must run the smallest relevant automated check. Before merging a user-visible feature, run the full documented test/build sequence once it exists.

For source-format changes, cover valid input, invalid input, and a helpful error message containing file and field context.

For PDF or print-style changes:

1. Build the example CV.
2. Inspect the generated PDF visually, including multi-page cases.
3. Check for clipping, overlap, orphaned headings, unintended blank pages, and lost content.
4. Add or update a regression fixture when the change fixes a pagination bug.

## Documentation

Update documentation in the same change when a command, content field, generated project layout, or theme API changes. Record lasting architectural choices in `docs/decisions/` using a short decision record.

## Commits

Use small, imperative Conventional Commit-style messages where useful, for example:

```text
feat: add markdown experience loader
fix: keep experience headings with their content
docs: document theme entry point
```

Do not bundle drive-by formatting or unrelated refactors with feature work.
