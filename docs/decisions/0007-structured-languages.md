# 0007 — Structured language entries

**Status:** Accepted  
**Date:** 2026-10-05

## Decision

Languages live in an optional `content/languages.yaml` file. Each list entry has
required free-text `language` and `level` fields.

## Why

Languages are concise structured CV data, while proficiency labels vary by
person, language, and locale. A pair of unrestricted strings keeps the source
easy to edit and lets themes choose their own presentation.

## Migration

This is additive. Existing CV projects continue to load with an empty
`languages` list. To add the section, create `content/languages.yaml`:

```yaml
languages:
  - language: English
    level: C1
```
