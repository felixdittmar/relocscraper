# Mode Shared Context: System Rules & Relocation Schema

This document contains shared constants, data schemas, normalization invariants, and operational guidelines common across all modes.

## Supported Providers

| Provider | Website | Primary Region | Inventory Focus | Typical Base Rate |
|---|---|---|---|---|
| **Indie Campers** | `indiecampers.com` | Pan-European (18+ countries) | Campervans & Pop-up vans (Active Plus, Nomad, Atlas) | €1/day (specials) or up to 80% off |
| **Movacar** | `movacar.de` / `movacar.com` | Germany & Central Europe | Cars, Transporters, Campervans (incl. Carl und Carla fleet) | €1.00 total |
| **Driiveme** | `driiveme.com` | France, Germany, Spain, Italy, UK, Portugal | One-way passenger cars, utility vans (6m³-20m³) | €1.00 total |
| **Imoova** | `imoova.com` | Western & Southern Europe (IT, PT, ES, DE, NL) | Motorhomes & Campervans | €1.00 / day |

> **Note on Carl und Carla (`carlundcarla.de`)**: Carl und Carla does not operate an independent automated 1€ relocation booking platform; their entire 1€ Überführungsfahrten inventory is officially syndicated through Movacar. All Carl und Carla trips are ingested via Movacar and tagged with `fleetPartner: "Carl und Carla"` to avoid duplicate entries while maintaining full searchability via `reloc filter --provider carlundcarla`.

## Canonical Data Schema (`RelocationDeal`)

Every scraper normalizes external payloads into this contract:

```typescript
interface RelocationDeal {
  id: string;                     // Unique identifier: e.g. "movacar_260109"
  provider: string;               // "indiecampers" | "movacar" | "driiveme" | "imoova" | "carlundcarla"
  providerName: string;           // Formatted display name
  fleetPartner?: string | null;   // Underlying fleet brand if syndicated
  origin: {
    city: string;                 // Cleaned city name
    countryCode: string;          // ISO 3166-1 alpha-2 (e.g. "DE", "FR", "ES")
    countryName: string;          // Full country name
    postalCode?: string | null;
    street?: string | null;
    stationCode?: string | null;
  };
  destination: {
    city: string;
    countryCode: string;
    countryName: string;
    postalCode?: string | null;
    street?: string | null;
    stationCode?: string | null;
  };
  dates: {
    earliestDeparture?: string;   // ISO string or clean date text
    latestPickup?: string;
    deliverBy?: string;
    durationDays: number;         // Total allowed trip duration in days
    durationHours?: number;       // Allowed hours
    offerEnds?: string;           // Countdown expiration if applicable
  };
  vehicle: {
    model: string;                // Specific vehicle make/model
    categoryName: string;         // Provider's category label
    category: "campervan" | "van" | "car" | "motorhome" | "other";
    seats: number;                // Passenger capacity
    sleeping?: number | null;     // Berths for campers
    fuelType?: string | null;
    gearType?: string | null;
  };
  price: {
    amount: number;               // Numerical value (e.g. 1.00 or 0.00)
    currency: string;             // ISO currency: "EUR" | "GBP"
    rateType: "total" | "per_day";
  };
  inclusions: {
    freeKm?: number | string | null;
    extraKmCostEuro?: number | null;
    fuelIncluded: boolean;
    fuelNotes?: string | null;
    ferryIncluded: boolean;
    ferryNotes?: string | null;
    essentialKitIncluded?: boolean;
  };
  bookingUrl: string;             // Direct URL to view or book the trip
  scrapedAt: string;              // ISO timestamp of scrape
}
```

## Vehicle Categorization Invariants

- **`campervan`**: Any vehicle designed for camping and sleeping (Pop-up roofs, VW California, Ford Nugget, Westfalia, Mercedes Marco Polo, Indie Campers Nomad/Atlas/Active).
- **`motorhome`**: Large RVs, integrated or alcove motorhomes with built-in shower/toilet compartments.
- **`van`**: Cargo vans, box trucks, transporters, or passenger utility vans without built-in sleeping accommodation (e.g., Carl Transporter, Carlos XL, Renault Master, Mercedes Sprinter, 6m³-20m³ vans).
- **`car`**: Standard passenger automobiles (Sedans, hatchbacks, estates, SUVs).

## Geographic Resolution Invariant

- Every origin and destination is resolved to both a standard city name and an ISO country code (`DE`, `FR`, `ES`, `PT`, `IT`, `AT`, `CH`, `NL`, `BE`, `GB`).
- Cross-border relocations are defined as trips where `origin.countryCode !== destination.countryCode`.
