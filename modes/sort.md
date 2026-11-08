# Mode: sort — Relocation Ordering & Ranking

Sorts relocation offers by various quantitative and alphabetical dimensions to find the cheapest, longest, or most convenient trips.

## CLI Invocation

```bash
# Sort by price (ascending - cheapest first)
reloc sort price asc

# Sort by price (descending)
reloc sort price desc

# Sort by allowed trip duration (longest road trips first)
reloc sort duration desc

# Sort by earliest departure date
reloc sort date asc

# Sort by passenger seat capacity
reloc sort seats desc

# Sort alphabetically by origin city
reloc sort origin asc

# Sort alphabetically by destination city
reloc sort destination asc

# Sort by provider
reloc sort provider asc
```

## Supported Sort Keys

| Key | Description | Typical Use Case |
|---|---|---|
| `price` | Numerical base rate in EUR | Finding 0.00 € and 1.00 € trips |
| `duration` | Trip duration in days | Finding extended vacations vs quick transfers |
| `date` | Earliest departure date | Finding imminent weekend departures |
| `seats` | Passenger seating capacity | Group travel & family road trips |
| `origin` | Departure city name | Grouping offers near your home city |
| `destination` | Arrival city name | Grouping offers towards your vacation target |
| `provider` | Scraped provider | Comparing service offerings |
