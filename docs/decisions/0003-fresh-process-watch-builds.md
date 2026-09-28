# 0003 — Fresh process for watch rebuilds

**Status:** Accepted  
**Date:** 2026-09-28

## Decision

`cv watch` will use Chokidar to observe CV source files and run each build in a
new Node process.

## Why

Themes can import arbitrary local TSX components. Node caches those module
dependencies, so rebuilding in the watcher process would not reliably reflect a
component edit. A fresh process preserves the ordinary build behavior without a
custom module invalidation system.

## Consequences

- Watch rebuilds have small process-start overhead, but theme changes are
  reliable.
- Failed child builds do not replace the last valid PDF because the existing
  build command writes its PDF atomically.
- Chokidar is an explicit runtime dependency for cross-platform file watching.
