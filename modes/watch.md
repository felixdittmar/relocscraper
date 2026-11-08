# Mode: watch — Automated Monitor & Alert Daemon

Monitors the 5 European rental relocation platforms on a recurring cadence, performs differential comparison against prior snapshots, and surfaces newly listed routes.

## CLI Invocation

```bash
# Run a single monitoring pass and exit
reloc watch --once

# Run daemon with periodic interval (e.g. every 5 minutes / 300 seconds)
reloc watch --interval 300
```

## Operational Flow

```mermaid
flowchart TD
    A[Start Watch Pass] --> B[Load Previous Snapshot from data/relocations.json]
    B --> C[Execute Live Multi-Provider Scrape]
    C --> D[Compute Diff: New vs Expired Deals]
    D --> E{Any New Deals?}
    E -- Yes --> F[Display New Deals Table & Notification]
    E -- No --> G[Log 'No Changes']
    F --> H[Update Canonical Snapshot]
    G --> H
    H --> I{Is Daemon Mode?}
    I -- Yes --> J[Sleep for interval seconds]
    J --> A
    I -- No --> K[Exit 0]
```

## Diff Logic

- Deals present in the current scrape but absent in `data/relocations.previous.json` are classified as **NEW DEALS**.
- Expired or reserved deals that disappeared are logged as **DROPPED DEALS**.
- Notifications can be filtered according to `config/preferences.yml` criteria (e.g., alert only on routes heading to Portugal or Italy).
