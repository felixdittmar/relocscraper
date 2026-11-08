import assert from "node:assert";
import { RelocEngine } from "../lib/engine.mjs";

console.log("Running Filter and Sort Unit Tests...");

const engine = new RelocEngine();

const sampleDeals = [
  {
    id: "deal_1",
    provider: "movacar",
    providerName: "Movacar",
    origin: { city: "Berlin", countryCode: "DE", countryName: "Germany" },
    destination: { city: "Munich", countryCode: "DE", countryName: "Germany" },
    dates: { earliestDeparture: "2026-11-10", durationDays: 2 },
    vehicle: { model: "VW Golf", category: "car", seats: 5 },
    price: { amount: 1.0, currency: "EUR" },
    inclusions: { fuelIncluded: false, ferryIncluded: false }
  },
  {
    id: "deal_2",
    provider: "imoova",
    providerName: "Imoova",
    origin: { city: "Bologna", countryCode: "IT", countryName: "Italy" },
    destination: { city: "Lisbon", countryCode: "PT", countryName: "Portugal" },
    dates: { earliestDeparture: "2026-11-15", durationDays: 5 },
    vehicle: { model: "Nomad Pop-up", category: "campervan", seats: 4 },
    price: { amount: 1.0, currency: "EUR" },
    inclusions: { fuelIncluded: true, ferryIncluded: false }
  },
  {
    id: "deal_3",
    provider: "carlundcarla",
    providerName: "Carl und Carla",
    origin: { city: "Dresden", countryCode: "DE", countryName: "Germany" },
    destination: { city: "Hamburg", countryCode: "DE", countryName: "Germany" },
    dates: { earliestDeparture: "2026-11-09", durationDays: 1 },
    vehicle: { model: "Carl Transporter", category: "van", seats: 3 },
    price: { amount: 0.0, currency: "EUR" },
    inclusions: { fuelIncluded: false, ferryIncluded: false }
  },
  {
    id: "deal_4",
    provider: "indiecampers",
    providerName: "Indie Campers",
    origin: { city: "Barcelona", countryCode: "ES", countryName: "Spain" },
    destination: { city: "Tenerife", countryCode: "ES", countryName: "Spain" },
    dates: { earliestDeparture: "2026-11-20", durationDays: 7 },
    vehicle: { model: "Atlas 4", category: "campervan", seats: 4 },
    price: { amount: 5.0, currency: "EUR" },
    inclusions: { fuelIncluded: false, ferryIncluded: true }
  }
];

// 1. Filter by Origin
const origDe = engine.filterDeals(sampleDeals, { origin: "Germany" });
assert.strictEqual(origDe.length, 2, "Should find 2 deals originating in Germany");

// 2. Filter by Vehicle Category
const campers = engine.filterDeals(sampleDeals, { vehicleType: "campervan" });
assert.strictEqual(campers.length, 2, "Should find 2 campervans");

// 3. Filter by Free Only
const freeDeals = engine.filterDeals(sampleDeals, { freeOnly: true });
assert.strictEqual(freeDeals.length, 1, "Should find 1 free deal");
assert.strictEqual(freeDeals[0].id, "deal_3");

// 4. Filter by Cross Border
const crossBorder = engine.filterDeals(sampleDeals, { crossBorder: true });
assert.strictEqual(crossBorder.length, 1, "Should find 1 cross-border deal (Italy to Portugal)");
assert.strictEqual(crossBorder[0].id, "deal_2");

// 5. Filter by Seats
const seats4 = engine.filterDeals(sampleDeals, { minSeats: 4 });
assert.strictEqual(seats4.length, 3, "Should find 3 deals with >= 4 seats");

// 6. Filter by Perks
const ferryDeals = engine.filterDeals(sampleDeals, { ferryIncluded: true });
assert.strictEqual(ferryDeals.length, 1, "Should find 1 ferry deal");

// 7. Sort by Price
const sortedPrice = engine.sortDeals(sampleDeals, "price", "asc");
assert.strictEqual(sortedPrice[0].price.amount, 0.0, "Lowest price should be 0.0");
assert.strictEqual(sortedPrice[sortedPrice.length - 1].price.amount, 5.0, "Highest price should be 5.0");

// 8. Sort by Duration Descending
const sortedDur = engine.sortDeals(sampleDeals, "duration", "desc");
assert.strictEqual(sortedDur[0].dates.durationDays, 7, "Longest duration should be 7 days");

console.log("✔ All Filter and Sort tests passed successfully!");
