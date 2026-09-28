# 0002 — Local HTML and PDF preview routes

**Status:** Accepted  
**Date:** 2026-09-28

## Decision

`cv watch` will build both output artifacts and serve them from one
loopback-only server: `/html` for the generated static document and `/pdf` for
the print-ready document. It watches the source files, prints both URLs, and
never opens a browser.

## Why

The HTML document gives theme authors direct access to browser developer tools.
The PDF is still required to verify A4 page boundaries and print CSS, which do
not necessarily match screen rendering.

## Consequences

- Watch does not introduce a second render path or a web editor.
- A single local port keeps the two views associated with the same build.
- Users choose which URL to open; Renderume does not control their browser.
