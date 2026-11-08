import { MovacarProvider } from "./providers/movacar.mjs";
import { ImoovaProvider } from "./providers/imoova.mjs";
import { DriivemeProvider } from "./providers/driiveme.mjs";
import { IndieCampersProvider } from "./providers/indiecampers.mjs";
import { saveRelocations, saveProviderCache, loadRelocations, loadProviderCache } from "./storage.mjs";

export class RelocEngine {
  constructor() {
    this.providers = [
      new MovacarProvider(),
      new ImoovaProvider(),
      new DriivemeProvider(),
      new IndieCampersProvider()
    ];
  }

  /**
   * Scrapes all providers, updates cache, and returns combined results
   */
  async scanAll(options = {}) {
    const results = [];
    const providerStats = {};
    const errors = [];

    const activeProviders = options.providers
      ? this.providers.filter(p => options.providers.includes(p.id))
      : this.providers;

    const scrapePromises = activeProviders.map(async (provider) => {
      try {
        const deals = await provider.scrape(options);
        providerStats[provider.id] = {
          name: provider.name,
          count: deals.length,
          status: "ok"
        };
        await saveProviderCache(provider.id, deals);
        return { provider: provider.id, deals, error: null };
      } catch (err) {
        providerStats[provider.id] = {
          name: provider.name,
          count: 0,
          status: "error",
          error: err.message
        };
        errors.push({ provider: provider.id, error: err.message });

        // Fallback to cached version if available
        const cached = await loadProviderCache(provider.id);
        if (cached && Array.isArray(cached) && cached.length > 0) {
          providerStats[provider.id].count = cached.length;
          providerStats[provider.id].cachedFallback = true;
          return { provider: provider.id, deals: cached, error: err.message };
        }
        return { provider: provider.id, deals: [], error: err.message };
      }
    });

    const settled = await Promise.all(scrapePromises);
    const seenIds = new Set();
    const allDeals = [];

    for (const res of settled) {
      for (const deal of res.deals) {
        if (!seenIds.has(deal.id)) {
          seenIds.add(deal.id);
          allDeals.push(deal);
        }
      }
    }

    // Save to canonical storage
    await saveRelocations(allDeals, providerStats);

    return {
      deals: allDeals,
      stats: providerStats,
      errors
    };
  }

  /**
   * Filter deals according to given criteria
   */
  filterDeals(deals, criteria = {}) {
    return deals.filter(deal => {
      // 1. Origin filter (city or country)
      if (criteria.origin) {
        const query = criteria.origin.toLowerCase().trim();
        const cityMatch = (deal.origin.city || "").toLowerCase().includes(query);
        const countryMatch = (deal.origin.countryName || "").toLowerCase().includes(query) ||
                             (deal.origin.countryCode || "").toLowerCase() === query;
        if (!cityMatch && !countryMatch) return false;
      }

      // 2. Destination filter (city or country)
      if (criteria.destination) {
        const query = criteria.destination.toLowerCase().trim();
        const cityMatch = (deal.destination.city || "").toLowerCase().includes(query);
        const countryMatch = (deal.destination.countryName || "").toLowerCase().includes(query) ||
                             (deal.destination.countryCode || "").toLowerCase() === query;
        if (!cityMatch && !countryMatch) return false;
      }

      // 3. Provider filter (matches platform or underlying fleet partner like Carl und Carla)
      if (criteria.provider) {
        const norm = (s) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
        const pQuery = norm(criteria.provider);
        const matchesProvider = norm(deal.provider).includes(pQuery) ||
                                norm(deal.providerName).includes(pQuery) ||
                                norm(deal.fleetPartner).includes(pQuery);
        if (!matchesProvider) return false;
      }

      // 4. Vehicle category (campervan | van | car | motorhome)
      if (criteria.vehicleType) {
        const vQuery = criteria.vehicleType.toLowerCase().trim();
        if (deal.vehicle.category !== vQuery && !deal.vehicle.model.toLowerCase().includes(vQuery)) {
          return false;
        }
      }

      // 5. Minimum seats
      if (criteria.minSeats && typeof criteria.minSeats === "number") {
        if ((deal.vehicle.seats || 1) < criteria.minSeats) return false;
      }

      // 6. Max price
      if (criteria.maxPrice !== undefined && criteria.maxPrice !== null) {
        if (deal.price.amount > criteria.maxPrice) return false;
      }

      // 7. Free only (0€)
      if (criteria.freeOnly) {
        if (deal.price.amount > 0) return false;
      }

      // 8. Cross-border only
      if (criteria.crossBorder) {
        if (deal.origin.countryCode === deal.destination.countryCode) return false;
      }

      // 9. Fuel included
      if (criteria.fuelIncluded) {
        if (!deal.inclusions?.fuelIncluded) return false;
      }

      // 10. Ferry included
      if (criteria.ferryIncluded) {
        if (!deal.inclusions?.ferryIncluded) return false;
      }

      return true;
    });
  }

  /**
   * Sort deals by field and direction
   */
  sortDeals(deals, sortBy = "date", direction = "asc") {
    const mult = direction.toLowerCase() === "desc" ? -1 : 1;
    const sorted = [...deals];

    sorted.sort((a, b) => {
      switch (sortBy.toLowerCase()) {
        case "price":
          return (a.price.amount - b.price.amount) * mult;

        case "duration":
          return ((a.dates.durationDays || 0) - (b.dates.durationDays || 0)) * mult;

        case "seats":
          return ((a.vehicle.seats || 0) - (b.vehicle.seats || 0)) * mult;

        case "origin":
          return (a.origin.city || "").localeCompare(b.origin.city || "") * mult;

        case "destination":
          return (a.destination.city || "").localeCompare(b.destination.city || "") * mult;

        case "provider":
          return (a.providerName || "").localeCompare(b.providerName || "") * mult;

        case "date":
        default: {
          const dateA = a.dates.earliestDeparture || "9999-99-99";
          const dateB = b.dates.earliestDeparture || "9999-99-99";
          return dateA.localeCompare(dateB) * mult;
        }
      }
    });

    return sorted;
  }

  /**
   * Computes comprehensive statistics across deals
   */
  computeStats(deals) {
    const stats = {
      total: deals.length,
      byProvider: {},
      byVehicleType: {},
      byCountry: { origin: {}, destination: {} },
      topRoutes: {},
      freeDealsCount: 0,
      euro1DealsCount: 0,
      fuelIncludedCount: 0,
      ferryIncludedCount: 0,
      avgPrice: 0,
      avgDurationDays: 0
    };

    let totalPrice = 0;
    let totalDays = 0;

    for (const deal of deals) {
      // Provider
      const p = deal.providerName || deal.provider;
      stats.byProvider[p] = (stats.byProvider[p] || 0) + 1;

      // Vehicle
      const v = deal.vehicle.category || "other";
      stats.byVehicleType[v] = (stats.byVehicleType[v] || 0) + 1;

      // Countries
      const origC = deal.origin.countryName || deal.origin.countryCode || "Other";
      const destC = deal.destination.countryName || deal.destination.countryCode || "Other";
      stats.byCountry.origin[origC] = (stats.byCountry.origin[origC] || 0) + 1;
      stats.byCountry.destination[destC] = (stats.byCountry.destination[destC] || 0) + 1;

      // Routes
      const route = `${deal.origin.city} → ${deal.destination.city}`;
      stats.topRoutes[route] = (stats.topRoutes[route] || 0) + 1;

      // Pricing & perks
      if (deal.price.amount === 0) stats.freeDealsCount++;
      if (deal.price.amount <= 1.0) stats.euro1DealsCount++;
      if (deal.inclusions?.fuelIncluded) stats.fuelIncludedCount++;
      if (deal.inclusions?.ferryIncluded) stats.ferryIncludedCount++;

      totalPrice += deal.price.amount || 0;
      totalDays += deal.dates.durationDays || 1;
    }

    stats.avgPrice = deals.length > 0 ? Number((totalPrice / deals.length).toFixed(2)) : 0;
    stats.avgDurationDays = deals.length > 0 ? Number((totalDays / deals.length).toFixed(1)) : 0;

    return stats;
  }

  /**
   * Compares two sets of deals to detect new and dropped deals
   */
  detectDiff(previousDeals = [], currentDeals = []) {
    const prevMap = new Map(previousDeals.map(d => [d.id, d]));
    const currMap = new Map(currentDeals.map(d => [d.id, d]));

    const newDeals = [];
    const droppedDeals = [];

    for (const [id, deal] of currMap.entries()) {
      if (!prevMap.has(id)) {
        newDeals.push(deal);
      }
    }

    for (const [id, deal] of prevMap.entries()) {
      if (!currMap.has(id)) {
        droppedDeals.push(deal);
      }
    }

    return {
      newDeals,
      droppedDeals,
      totalNew: newDeals.length,
      totalDropped: droppedDeals.length
    };
  }
}
