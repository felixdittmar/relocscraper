# Mode: route — Deutschlandticket + 1€ Relocation Hybrid Route Planner

Calculates optimized travel itineraries combining free local/regional public transit (via the Deutschlandticket: RE, RB, S-Bahn) with high-speed 1€ vehicle rental relocations (from Ugoki, Movacar, Driiveme, Imoova, etc.) to produce journeys that are significantly faster than pure regional train travel while maintaining ultra-low costs (typically ~1.00 € total with free fuel on supported offers).

## Why This Works

- **Pure Deutschlandticket baseline**: While the Deutschlandticket is valid on all German regional trains (RE/RB), long-distance trips (e.g., Berlin → Köln, Berlin → Hamburg, Frankfurt → Berlin) require multiple transfers (2–4 connections) and average only ~55–65 km/h, taking 5 to 10+ hours. High-speed ICE/IC trains are not covered by the ticket.
- **1€ Relocations**: Vehicle transfers run on high-speed Autobahn corridors (averaging 110–120 km/h) and cost only 1.00 € (with Ugoki/MILES and certain Movacar offers even including free fuel).
- **Hybrid synergy**: By taking free local RE/RB/S-Bahn feeder trains to and from the rental pickup/drop-off stations and driving the main intercity Autobahn leg, travelers can save 1 to 4+ hours of travel time at virtually zero added cost.

## CLI Invocation

```bash
# Calculate fastest hybrid routes between two cities
reloc route Berlin Hamburg
reloc route Berlin Köln
reloc route Frankfurt Berlin

# Using explicit flags
reloc route --from Berlin --to Hamburg
reloc route --from Frankfurt --to Berlin --fuel-only

# Filter only routes with free fuel included (e.g. Ugoki / MILES)
reloc route Berlin Hamburg --fuel-only

# Adjust maximum D-Ticket feeder train radius (default: 180 km)
reloc route Potsdam Bremen --max-feeder 200

# Filter for relocations available on a specific pickup date
reloc route Berlin Hamburg --date 2026-11-10

# Inspect all hybrid combinations including slower routes
reloc route Berlin Dresden --all
```

## Output Breakdown

Every hybrid option provides:
1. **Time Saved Badge**: Highlights net minutes and hours saved over pure regional trains (e.g. `⚡ SAVE 2h 32m`).
2. **Total Travel Time**: Sum of feeder transit + buffer (35m pickup/dropoff check) + driving + final feeder transit.
3. **Out-of-pocket Cost**: Breakdown of rental rate (1.00 €) and estimated fuel costs (0.00 € if fuel is included).
4. **Leg-by-Leg Itinerary**:
   - `Leg 1 (Train)`: D-Ticket Regional Transit from user origin to vehicle pickup station (0.00 €).
   - `Leg 2 (Drive)`: 1€ Relocation drive on Autobahn with vehicle model and duration.
   - `Leg 3 (Train)`: D-Ticket Regional Transit from drop-off station to final destination (0.00 €).
5. **Vehicle Specifications & Dates**: Vehicle category, seats, and available pickup date window.
6. **Direct Booking Link**: Link to reserve the vehicle.
