# Mode: display — Terminal Table Visualizer

Presents active vehicle relocations in an ANSI-formatted, colorized terminal table with responsive columns and status badges.

## CLI Invocation

```bash
# Display default table (up to 50 rows)
reloc display

# Limit displayed results
reloc display --limit 15

# Display with quick filters
reloc display --origin Germany
reloc display --destination Portugal
reloc display --vehicle campervan
reloc display --free
```

## Visual Badges & Styling

- **Price Badges**:
  - `0.00 € (FREE)`: Bold Green
  - `1.00 EUR`: Bold Green
  - Higher rates: Yellow
- **Provider Badges**:
  - `[Movacar]`: Blue
  - `[Imoova]`: Magenta
  - `[Driiveme]`: Cyan
  - `[Indie Campers]`: Yellow
  - `[Carl&Carla]`: Green
- **Vehicle Icons**:
  - `🚐 Camper`: Campervans & pop-up vans
  - `🏠 Motorhome`: Large RVs
  - `📦 Van`: Transporters, cargo & utility vans
  - `🚗 Car`: Passenger cars

## Display Columns

| Column | Description |
|---|---|
| **ID** | Unique handle for the deal (used in `reloc detail <id>` or `reloc book <id>`) |
| **Provider** | Scraped source platform |
| **Route** | Origin City (Country) → Destination City (Country) |
| **Vehicle** | Model and category badge |
| **Dates / Days** | Earliest departure date and maximum allowed trip duration |
| **Seats** | Passenger capacity |
| **Price** | Total or daily base rate |
| **Perks** | Free km allowance, fuel allowance, ferry reimbursement |
