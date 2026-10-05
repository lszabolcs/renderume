# 0004 — Copyable starter templates

**Status:** Accepted  
**Date:** 2026-09-29

## Decision

First-party layout alternatives live under `templates/` as complete,
self-contained CV projects. `renderume init` copies one selected template; it defaults
to `default` and accepts `--template sidebar` for the CSS Grid sidebar layout.

## Why

The target user already works directly with TSX and CSS. A separate theme
distribution layer would add an unnecessary concept between the CLI and the
user-owned project. Complete templates are easy to inspect, copy, and modify.

## Consequences

- Every template includes its own content samples, configuration, and theme.
- Templates share the same normalized `ResumeData` and YAML/Markdown contract.
- `renderume init` remains a direct directory copy rather than assembling files from
  shared sample data and layout sources.
