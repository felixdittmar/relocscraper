# CLAUDE.md — Agent & Development Guide

## Project Overview

`relocscraper` is an open-source European vehicle rental relocation scraper and explorer CLI.
Supported providers: `indiecampers.com`, `movacar.de`, `driiveme.com`, `imoova.com`, `carlundcarla.de`.
Modes are defined as Markdown prompt files in `modes/` following the `career-ops` architectural standard.

## Core Commands

```bash
# Run tests
npm test

# Run scrapers (all 5 sites)
node bin/reloc.mjs scan
# or
./reloc scan

# Display formatted table
./reloc display [--limit N]

# Granular filtering
./reloc filter --origin Berlin --destination Spain --vehicle campervan --seats 4

# Sorting
./reloc sort price asc
./reloc sort duration desc

# Inspect specific deal
./reloc detail <deal_id>

# Statistics & European corridors
./reloc stats

# Recurring watcher
./reloc watch --once

# Data export
./reloc export --format csv --output data/relocations.csv
./reloc export --format md --output data/relocations.md
```

## Modes Directory Structure (`modes/`)

- `modes/README.md`: Catalog and routing.
- `modes/_shared.md`: Shared invariants, normalization, and `RelocationDeal` data contract.
- `modes/_custom.md`: User preferences and standing rules.
- `modes/scan.md`: Scraper implementation & caching protocol.
- `modes/display.md`: Terminal table formatting.
- `modes/filter.md`: Multi-field filtering specifications.
- `modes/sort.md`: Sorting keys & ordering logic.
- `modes/detail.md`: Detailed inspection view.
- `modes/stats.md`: Aggregate analytics report.
- `modes/watch.md`: Diff detection & watcher daemon.
- `modes/export.md`: CSV/MD/JSON export.
- `modes/book.md`: Booking pre-flight verification checklist.
