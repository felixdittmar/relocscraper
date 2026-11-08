import { BaseProvider } from "./base-provider.mjs";
import { resolveLocation, normalizeVehicleCategory, generateDealId } from "../schema.mjs";

export class CarlUndCarlaProvider extends BaseProvider {
  constructor() {
    super("carlundcarla", "Carl und Carla", "https://carlundcarla.de");
    this.angeboteUrl = "https://carlundcarla.de/angebote";
    this.blogUrl = "https://carlundcarla.de/blog/aktion-kostenfreie-einwegmieten";
    this.movacarApiUrl = "https://crowd-api-production-615013621295.europe-west1.run.app/v1/offers";
  }

  async scrape(options = {}) {
    const deals = [];
    const seenIds = new Set();

    // 1. Scrape real-time bookable Carl und Carla transfers syndicated on Movacar
    try {
      const today = new Date();
      const dFrom = today.toISOString().split("T")[0];
      const futureDate = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);
      const dTo = futureDate.toISOString().split("T")[0];

      const url = `${this.movacarApiUrl}?locale=de&pickupDateFrom=${dFrom}&pickupDateTo=${dTo}`;
      const resp = await this.safeFetch(url, {
        headers: { Accept: "application/json" },
        timeout: options.timeout || 12000
      });

      const json = await resp.json();
      const offers = json.data || [];
      const includedMap = new Map();
      for (const item of json.included || []) {
        includedMap.set(`${item.type}_${item.id}`, item);
      }

      for (const offer of offers) {
        const attrs = offer.attributes || {};
        const rels = offer.relationships || {};

        const origData = rels.origin?.data;
        const destData = rels.destination?.data;
        const origStation = origData ? includedMap.get(`${origData.type}_${origData.id}`) : null;
        const destStation = destData ? includedMap.get(`${destData.type}_${destData.id}`) : null;

        const origAttrs = origStation?.attributes || {};
        const destAttrs = destStation?.attributes || {};

        const origCode = (origAttrs.code || "").toLowerCase();
        const destCode = (destAttrs.code || "").toLowerCase();

        // Check if this is a Carl und Carla station/fleet code
        const isCarlCarla = origCode.includes("carlundcarla") || destCode.includes("carlundcarla");
        if (!isCarlCarla) continue;

        const rawOrigCity = origAttrs.alternative_city || origAttrs.city || "Unknown";
        const rawDestCity = destAttrs.alternative_city || destAttrs.city || "Unknown";

        const origin = resolveLocation(rawOrigCity, origAttrs.postal_code, "DE");
        const destination = resolveLocation(rawDestCity, destAttrs.postal_code, "DE");

        const makeModel = [attrs.make, attrs.model].filter(Boolean).join(" ") || "Carl Transporter";
        const category = normalizeVehicleCategory("van", makeModel);

        const dealId = `carlundcarla_${attrs.offer_id || offer.id}`;
        if (seenIds.has(dealId)) continue;
        seenIds.add(dealId);

        deals.push({
          id: dealId,
          provider: "carlundcarla",
          providerName: "Carl und Carla",
          fleetPartner: "Carl und Carla (via Movacar)",
          origin: {
            city: origin.city,
            countryCode: origin.countryCode,
            countryName: origin.countryName,
            postalCode: origAttrs.postal_code || null,
            street: origAttrs.street || null,
            stationCode: origAttrs.code || null
          },
          destination: {
            city: destination.city,
            countryCode: destination.countryCode,
            countryName: destination.countryName,
            postalCode: destAttrs.postal_code || null,
            street: destAttrs.street || null,
            stationCode: destAttrs.code || null
          },
          dates: {
            earliestDeparture: attrs.start_date || null,
            latestPickup: attrs.valid_until || null,
            deliverBy: attrs.end_date || null,
            durationDays: Math.ceil((attrs.period || 24) / 24),
            durationHours: attrs.period || 24
          },
          vehicle: {
            model: makeModel,
            categoryName: attrs.vehicle_category_name || "Transporter",
            category,
            seats: attrs.seats || 3
          },
          price: {
            amount: 1.0,
            currency: "EUR",
            rateType: "total"
          },
          inclusions: {
            freeKm: attrs.free_km ?? null,
            extraKmCostEuro: attrs.cents_per_extra_km ? attrs.cents_per_extra_km / 100 : null,
            fuelIncluded: false
          },
          bookingUrl: `https://movacar.com/de-DE/offers/${attrs.offer_id || offer.id}`,
          scrapedAt: new Date().toISOString()
        });
      }
    } catch (e) {
      // Continue to check direct campaign page
    }

    // 2. Check Carl und Carla's direct "Kostenfreie Einwegmieten" campaign page
    try {
      const resp = await this.safeFetch(this.angeboteUrl, { timeout: options.timeout || 10000 });
      const html = await resp.text();

      if (html.includes("kostenfreie Einwegmiete") || html.includes("Aktion kostenfreie Einwegmieten")) {
        // Direct campaign is active
        const campaignDealId = "carlundcarla_direct_einwegmiete";
        if (!seenIds.has(campaignDealId)) {
          seenIds.add(campaignDealId);
          deals.push({
            id: campaignDealId,
            provider: "carlundcarla",
            providerName: "Carl und Carla",
            fleetPartner: "Carl und Carla Direct",
            origin: {
              city: "German Hubs (Berlin, Dresden, Cologne, Leipzig, Munich, Hamburg)",
              countryCode: "DE",
              countryName: "Germany"
            },
            destination: {
              city: "German Hubs (Flexible Dropoff across Germany)",
              countryCode: "DE",
              countryName: "Germany"
            },
            dates: {
              earliestDeparture: "Available on request (Seasonal Fleet Transfer)",
              durationDays: 3,
              durationHours: 72
            },
            vehicle: {
              model: "Carl Transporter / Carlos XL / Carla 9-Sitzer",
              categoryName: "Transporter & Kleinbus",
              category: "van",
              seats: 3
            },
            price: {
              amount: 0.0, // 100% Free rental
              currency: "EUR",
              rateType: "total"
            },
            inclusions: {
              freeKm: "Generous transfer mileage included",
              fuelIncluded: false,
              ferryIncluded: false,
              notes: "Free one-way transfer rental (0€ base rate). Booked directly via Carl und Carla Kundenservice."
            },
            bookingUrl: this.blogUrl,
            scrapedAt: new Date().toISOString()
          });
        }
      }
    } catch (e) {
      // ignore
    }

    return deals;
  }
}
