# Repository organization and branch audit

Checked November 15, 2026, America/Los_Angeles. Repository: [bendricks07/Roadrunners-HACKATHON](https://github.com/bendricks07/Roadrunners-HACKATHON). Default branch: `main`.

## Integration result

A fresh fetch found `origin/main` at `0f0bd0ecba8cd88e27ed676f619de23108a6a35c`, five commits beyond the previous local checkout. The local checkout was advanced with a fast-forward. Every pre-existing local branch and all seven remote heads were already ancestors of that `main`; no additional feature merge was necessary. The GitHub API returned no open pull requests.

| GitHub branch | Checked tip | Commits absent from `main` |
| --- | --- | ---: |
| `main` | `0f0bd0e` | 0 |
| `Matthew` | `088991f` | 0 |
| `Verity` | `9beee28` | 0 |
| `app-asthetics-` | `3042e26` | 0 |
| `codex/cal-poly-parking-inventory` | `70539de` | 0 |
| `codex/campuscurb-demo` | `d08086d` | 0 |
| `codex/free-parking-research` | `1b8fe13` | 0 |

The pre-existing local `Matthew` and `codex/free-parking-research` heads also match their remote branches. The original Matthew worktree was clean. Branch names and history were preserved.

The organization update was prepared from this integrated base on `codex/repository-organization` for inclusion in `main`. It adds documentation and indexes; it does not alter app behavior or archived evidence.

## Where work belongs

| Path | Maintained purpose |
| --- | --- |
| `demo/` | Working browser app and app tests |
| `docs/` | Current technical docs, status, research, plans, and archived handoffs |
| `data/research/` | Source-backed research records |
| `tools/parking-research/` | Maintained research and detector code/tests |
| `artifacts/` | Dated design images, screenshots, samples, provenance, and delivered evidence packs |
| `README.md` | Short project overview, setup, and navigation |
| `CONTRIBUTING.md` | Development and integration workflow |
| `AGENTS.md` | Coding-agent repository instructions |

The complete original product plan and team collaboration proposal were moved out of the long root README into `docs/plans/`. The earlier implementation notes are retained separately from consolidated current status. Evidence files and ZIPs keep their original paths and bytes.

## Checks

- Integrated app: 37 Node tests and configured syntax checks passed.
- Research: 28 Python tests passed with no skips in the detector environment.
- Organization: relative links, preserved planning text, and artifact identities checked before publication.

This is a point-in-time audit, not an automatic merge service. New work should start from freshly fetched `main`; future branch commits need their own integration check. GitHub pushes do not deploy the hosted Site.
