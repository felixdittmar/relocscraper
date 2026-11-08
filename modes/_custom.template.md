---
# User Custom Preferences for Rental Relocations
user:
  home_country: "DE"
  home_city: "Berlin"
  favorite_destinations:
    - "Spain"
    - "Portugal"
    - "Italy"
    - "France"

filters:
  max_price_eur: 5.0
  min_seats: 2
  vehicle_types:
    - "campervan"
    - "van"
    - "car"
  include_providers:
    - "indiecampers"
    - "movacar"
    - "driiveme"
    - "imoova"
    - "carlundcarla"

notifications:
  on_new_deal: true
  min_alert_seats: 2
  notify_destinations:
    - "Lisbon"
    - "Barcelona"
    - "Madrid"
    - "Rome"
---

# User Standing Instructions & House Rules

This file stores persistent user preferences and procedural rules.
The scraper and AI agent honor these preferences when scanning, filtering, and displaying relocation trips.

## Standing Preferences:
1. Always highlight campervan relocations ending in Southern Europe (Portugal, Spain, Italy).
2. For short weekend trips, prioritize routes under 3 days departing from Germany.
3. Alert whenever a 0.00 € free relocation deal is discovered.
