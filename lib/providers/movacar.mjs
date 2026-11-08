import { BaseProvider } from "./base-provider.mjs";
import { resolveLocation, normalizeVehicleCategory, generateDealId } from "../schema.mjs";

export class MovacarProvider extends BaseProvider {
  constructor() {
    super("movacar", "Movacar", "https://movacar.com");
    this.apiUrl = "https://crowd-api-production-615013621295.europe-west1.run.app/v1/offers";
  }

  async scrape(options = {}) {
    const today = new Date();
    const dFrom = today.toISOString().split("T")[0];
    const futureDate = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);
    const dTo = futureDate.toISOString().split("T")[0];

    const pageSize = options.size || 2000;
    const url = `${this.apiUrl}?locale=de&pickupDateFrom=${dFrom}&pickupDateTo=${dTo}&size=${pageSize}`;
    const resp = await this.safeFetch(url, {
      headers: { Accept: "application/json" },
      timeout: options.timeout || 15000
    });

    const json = await resp.json();
    const offers = json.data || [];
    const includedMap = new Map();

    for (const item of json.included || []) {
      includedMap.set(`${item.type}_${item.id}`, item);
    }

    const deals = [];

    for (const offer of offers) {
      const attrs = offer.attributes || {};
      const rels = offer.relationships || {};

      const origData = rels.origin?.data;
      const destData = rels.destination?.data;
      const priceData = rels.base_price?.data;

      const origStation = origData ? includedMap.get(`${origData.type}_${origData.id}`) : null;
      const destStation = destData ? includedMap.get(`${destData.type}_${destData.id}`) : null;
      const priceItem = priceData ? includedMap.get(`${priceData.type}_${priceData.id}`) : null;

      const origAttrs = origStation?.attributes || {};
      const destAttrs = destStation?.attributes || {};
      const priceAttrs = priceItem?.attributes || {};

      const rawOrigCity = origAttrs.alternative_city || origAttrs.city || "Unknown";
      const rawDestCity = destAttrs.alternative_city || destAttrs.city || "Unknown";

      const origin = resolveLocation(rawOrigCity, origAttrs.postal_code, "DE");
      const destination = resolveLocation(rawDestCity, destAttrs.postal_code, "DE");

      // Inclusions & pricing
      const amountEur = priceAttrs.amount_minor_units ? priceAttrs.amount_minor_units / 100 : 1.0;
      const currency = priceAttrs.currency || "EUR";

      const freeKm = attrs.free_km ?? null;
      const extraKmCost = attrs.cents_per_extra_km ? attrs.cents_per_extra_km / 100 : null;

      const makeModel = [attrs.make, attrs.model].filter(Boolean).join(" ") || "Rental Vehicle";
      const category = normalizeVehicleCategory(attrs.vehicle_category_name || "", makeModel);

      // Duration & dates
      const periodHours = attrs.period || 24;
      const durationDays = Math.ceil(periodHours / 24);

      // Check for partner fleet
      let fleetPartner = null;
      const origCode = (origAttrs.code || "").toLowerCase();
      const destCode = (destAttrs.code || "").toLowerCase();
      const brandImg = (attrs.brand_image_url || "").toLowerCase();
      const addInfo = (attrs.additional_info || "").toLowerCase();

      if (origCode.includes("carlundcarla") || destCode.includes("carlundcarla")) {
        fleetPartner = "Carl und Carla";
      } else if (brandImg.includes("indiecampers") || addInfo.includes("indie")) {
        fleetPartner = "Indie Campers";
      } else if (brandImg.includes("roadsurfer")) {
        fleetPartner = "Roadsurfer";
      }

      const offerId = attrs.offer_id || offer.id;
      const dealId = `movacar_${offerId}`;

      deals.push({
        id: dealId,
        provider: "movacar",
        providerName: "Movacar",
        fleetPartner,
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
          durationDays,
          durationHours: periodHours
        },
        vehicle: {
          model: makeModel,
          categoryName: attrs.vehicle_category_name || "Standard",
          category,
          seats: attrs.seats || 2,
          sleeping: attrs.sleeping || null,
          fuelType: attrs.fuel_type || null,
          gearType: attrs.gear_type || null
        },
        price: {
          amount: amountEur,
          currency,
          rateType: "total"
        },
        inclusions: {
          freeKm,
          extraKmCostEuro: extraKmCost,
          fuelIncluded: false,
          ferryIncluded: false
        },
        bookingUrl: `https://movacar.com/de-DE/offers/${offerId}`,
        scrapedAt: new Date().toISOString()
      });
    }

    return deals;
  }
}
