# 0006 — Flexible contact links

**Status:** Accepted  
**Date:** 2026-10-05

## Decision

Profile contact data contains optional `phone` and `links` fields. `links` is a
list of `{ label, url }` objects. The older fixed `website`, `github`, and
`linkedin` fields are not part of the content contract.

## Why

Developers use different public profiles and portfolio services. A labeled list
keeps the content format small while allowing a theme to render only the links
that make sense for its layout.

## Migration

Replace each fixed link with a labeled item in `contact.links`. For example,
`github: https://github.com/example` becomes:

```yaml
links:
  - label: GitHub
    url: https://github.com/example
```
