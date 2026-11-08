# Mode: scan — Multi-Provider Relocation Scraper

Executes network requests against all 5 target rental platforms, normalizes inventory, persists the current snapshot, and caches raw payloads.

## CLI Invocation

```bash
# Scan all 5 providers
reloc scan

# Scan only a specific provider
reloc scan --provider movacar
reloc scan --provider imoova
reloc scan --provider driiveme
reloc scan --provider indiecampers
reloc scan --provider carlundcarla
```

## Provider Implementation Details

### 1. Indie Campers (`indiecampers.com`)
- **Endpoint**: `https://indiecampers.com/discover/en-us/deals/europe`
- **Data Extracted**: One-way campervan specials (Barcelona, Lisbon, Bilbao, Bologna, Lyon, Milan, Paris, etc.), vehicle models (Nomad, Active Plus, Atlas), dates, maximum nights, and ferry reimbursement benefits.
- **Syndicated**: Also cross-referenced in Imoova and Movacar feeds where Indie Campers inventory is syndicated.

### 2. Movacar (`movacar.de`)
- **Endpoint**: `https://crowd-api-production-615013621295.europe-west1.run.app/v1/offers`
- **Parameters**: `pickupDateFrom=YYYY-MM-DD`, `pickupDateTo=YYYY-MM-DD`, `locale=de`
- **Data Extracted**: Real-time European 1€ inventory, origin/destination stations with exact addresses and postal codes, included free km, excess km rate, vehicle specs, and booking IDs.

### 3. Driiveme (`driiveme.com`)
- **Endpoints**: `https://www.driiveme.com/{locale}/component/transport-list` (`en-GB`, `de-DE`, `fr-FR`, `es-ES`)
- **Data Extracted**: City-to-city car and van transfers, rental duration (e.g. 24h, 48h), vehicle category, seats, validity dates, countdown expiration, and rental partner (e.g. City Drop, Avis, Hertz).

### 4. Imoova (`imoova.com`)
- **Endpoint**: `https://www.imoova.com/relocations/table/europe`
- **Data Extracted**: Structured table rows containing reference IDs (`RLC...`), departure/arrival depots, date windows, vehicle classification, daily rate (€1), duration, seats, fuel allowance, and ferry reimbursement.

### 5. Carl und Carla (`carlundcarla.de`)
- **Endpoints**:
  - Direct campaign: `https://carlundcarla.de/angebote` & `/blog/aktion-kostenfreie-einwegmieten`
  - Movacar Fleet feed: Automated extraction of CarlundCarla vehicle transfers (`code: carlundcarla*`).
- **Data Extracted**: Transporter ("Carl"), XL-Transporter ("Carlos"), and 9-seater ("Carla") relocations across 50+ German cities, 0€ base rate campaigns, and 1€ transfers.

## Persistence & Caching Contract

- Raw per-provider response stored in `data/cache/<provider>.json`.
- Unified deduplicated dataset written to `data/relocations.json`.
- Previous run preserved in `data/relocations.previous.json` for diff and watcher analysis.
- If a provider request fails due to network outage, the scraper seamlessly falls back to the local cache and flags the warning without crashing the session.
