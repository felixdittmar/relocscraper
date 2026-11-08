# Mode: detail — Deep Deal Inspection

Displays a detailed specification sheet for a single relocation offer, including depot addresses, free kilometer allowances, excess mileage fees, fuel policies, and booking links.

## CLI Invocation

```bash
reloc detail <deal_id>
```

### Examples

```bash
# Inspect an Imoova campervan deal
reloc detail imoova_RLC129937

# Inspect a Movacar transfer
reloc detail movacar_260109

# Inspect an Indie Campers special
reloc detail indiecampers_barcelona_to_lisbon_activeplus
```

## Detail Sheet Content

- **Deal Identifier**: Internal unique handle
- **Provider & Fleet Partner**: Scraped provider and underlying fleet owner (e.g., Carl und Carla via Movacar, Indie Campers via Imoova)
- **Depot Locations**:
  - Origin depot city, country, postal code, street address, and internal station code
  - Destination depot city, country, postal code, street address
- **Vehicle Specifications**: Exact make/model, category, seats, sleeping berths, transmission (automatic/manual), fuel type
- **Trip Parameters**: Maximum duration in days and hours, departure window, final deliver-by cutoff
- **Financial Details**: Base price, currency, billing model (per-trip total or per-day)
- **Mileage Terms**: Free kilometers included, cost in EUR per extra kilometer beyond allowance
- **Special Incentives**: Fuel allowances, ferry ticket reimbursement
- **Direct Reservation URL**: Clickable link to complete the booking on the provider's official portal
