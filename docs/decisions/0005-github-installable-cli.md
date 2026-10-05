# 0005 — GitHub-installable CLI with managed Chromium

**Status:** Accepted  
**Date:** 2026-10-02

## Decision

Renderume is distributed as an installable Node CLI package from its GitHub
repository. It exposes a `renderume` binary and packages the source and starter
templates needed at runtime. The package installs its matching Chromium browser
dependency automatically.

## Why

The user should be able to install one tool and immediately run `renderume init` and
`renderume build`. Asking them to understand or manually configure the PDF renderer
would expose an implementation detail and make the initial workflow fragile.

## Consequences

- The first installation downloads Chromium and can take longer than a typical
  small CLI installation.
- The generated CV remains a plain directory without npm dependencies.
- The public GitHub repository is the primary installation source, using npm's
  `github:` shorthand.
