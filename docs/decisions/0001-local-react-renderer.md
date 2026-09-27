# 0001 — Local React renderer with Chromium PDF output

**Status:** Accepted  
**Date:** 2026-09-27

## Decision

Renderume will compile local YAML and Markdown content into a normalized data model, render it through a local React/TSX theme with CSS or Tailwind, and generate the PDF using Chromium.

## Why

The intended users are frontend developers. React and CSS make layouts genuinely editable using familiar tools while Chromium provides browser-quality print CSS and selectable PDF text.

## Consequences

- Theme customization has broad power and themes are executable local code.
- The product must explicitly test print layout; browser rendering alone is not a PDF quality guarantee.
- A custom layout DSL, web editor, and cloud persistence are not introduced.
