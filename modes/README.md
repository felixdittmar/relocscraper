# modes/

The "brain" of relocscraper: Markdown workflow and specification files executed by CLI tools and AI coding agents.

## Purpose

Similar to `career-ops`, each mode file defines one clear workflow (`scan`, `display`, `filter`, `sort`, `detail`, `stats`, `watch`, `export`, `book`). The AI agent or human operator reads the mode file, understands the rules, flags, and data invariants, and executes or guides the workflow.

## Mode Catalog

| File | Mode | Purpose | Command |
|---|---|---|---|
| `scan.md` | `scan` | Automatically scrapes all 5 European relocation providers with caching | `reloc scan` |
| `display.md` | `display` | Displays active relocations in formatted ANSI terminal tables | `reloc display` |
| `filter.md` | `filter` | Multi-criteria filtering (origin, destination, vehicle, seats, price, perks) | `reloc filter` |
| `sort.md` | `sort` | Multi-field sorting (price, date, duration, seats, route) | `reloc sort` |
| `detail.md` | `detail` | Deep-dive inspection of a specific relocation deal and depot addresses | `reloc detail <id>` |
| `stats.md` | `stats` | European market intelligence, top corridors, provider share, vehicle breakdown | `reloc stats` |
| `watch.md` | `watch` | Automated background monitoring with snapshot diffing and alerts | `reloc watch` |
| `export.md` | `export` | Exports listings to JSON, CSV, or formatted Markdown digest | `reloc export` |
| `book.md` | `book` | Pre-flight booking checklist, requirements, and reservation link | `reloc book <id>` |

## Shared Context & Customization

| File | Role |
|---|---|
| `_shared.md` | System context shared across modes: schema definitions, country codes, vehicle categorization, error codes |
| `_custom.template.md` | Seed template for user customizations and standing preferences |
| `_custom.md` | User-layer preferences: home airport/city, target countries, excluded vehicles, alert thresholds |

## Architecture & Conventions

- **One file = one mode**: The `# Mode: <name> — <title>` format defines the workflow.
- **System Layer vs User Layer**:
  - **System Layer**: Mode files (`modes/*.md` except `_custom.md`), engine scripts in `lib/`, CLI in `bin/`.
  - **User Layer**: `config/preferences.yml`, `modes/_custom.md`, scraped dataset `data/relocations.json`, `data/cache/`.
- **Zero-fabrication & Data Integrity**: Deal information is strictly extracted from real provider network responses.
