# Renderume agent guide

Before making changes, read:

1. `docs/PRD.md`
2. `docs/architecture.md`
3. `docs/development.md`

## Non-negotiable rules

- Keep all CV content local. Do not add telemetry, accounts, cloud storage, or network-dependent features.
- Do not add AI, ATS scoring, cover-letter, or editor features unless the PRD is explicitly changed first.
- Preserve the boundary between the content/core layer and user-owned theme layer.
- Do not change the documented content format without a migration plan and documentation update.
- Keep changes focused. Record durable architectural choices in `docs/decisions/`.
- For PDF or print-layout changes, run the relevant build and perform a visual PDF check.
- Do not commit generated files, secrets, or dependency directories.
