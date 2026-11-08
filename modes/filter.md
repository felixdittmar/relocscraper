# Mode: filter — Granular Relocation Filtering

Filters the active relocation dataset across multiple geographic, vehicular, pricing, and itinerary parameters.

## CLI Invocation

```bash
# Filter by origin city or country
reloc filter --origin Berlin
reloc filter --origin Germany
reloc filter --origin FR

# Filter by destination
reloc filter --destination Spain
reloc filter --destination Lisbon

# Filter by specific provider
reloc filter --provider indiecampers
reloc filter --provider imoova
reloc filter --provider movacar
reloc filter --provider driiveme
reloc filter --provider carlundcarla

# Filter by vehicle category
reloc filter --vehicle campervan
reloc filter --vehicle van
reloc filter --vehicle car

# Filter by passenger seats
reloc filter --seats 4
reloc filter --seats 9

# Filter by price & budget
reloc filter --max-price 1.0
reloc filter --free

# Filter by cross-border international corridors
reloc filter --cross-border

# Filter by perks
reloc filter --fuel     # routes with fuel allowance
reloc filter --ferry    # routes with ferry ticket reimbursement
```

## Combined Complex Filters

```bash
# Cross-border campervan trip to Portugal with at least 4 seats
reloc filter --vehicle campervan --destination Portugal --seats 4

# Free or 1€ German transporter rental
reloc filter --origin Germany --vehicle van --max-price 1.0

# European long-haul trips with ferry allowance
reloc filter --ferry --cross-border
```

## Filter Precedence & Matching Logic

1. **Origin & Destination**: Matches against both city name (case-insensitive substring) and ISO country code/name.
2. **Provider**: Matches against provider ID or underlying fleet partner.
3. **Vehicle**: Matches category (`campervan`, `van`, `car`, `motorhome`) or model name substring.
4. **Capacity**: Matches `seats >= minSeats`.
5. **Price**: Matches `price.amount <= maxPrice`.
