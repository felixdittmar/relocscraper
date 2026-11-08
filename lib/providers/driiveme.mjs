import { BaseProvider } from "./base-provider.mjs";
import { resolveLocation, normalizeVehicleCategory, generateDealId, decodeHtmlEntities } from "../schema.mjs";

export class DriivemeProvider extends BaseProvider {
  constructor() {
    super("driiveme", "Driiveme", "https://www.driiveme.com");
    this.locales = ["en-GB", "de-DE", "fr-FR", "es-ES"];
  }

  async scrape(options = {}) {
    const deals = [];
    const seenIds = new Set();
    let networkErrors = 0;
    const maxPages = options.maxPages || 2;
    const delay = (ms) => new Promise(res => setTimeout(res, ms));

    // Fetch across key European locales to capture all localized routes
    for (const locale of this.locales) {
      for (let page = 1; page <= maxPages; page++) {
        try {
          const url = `https://www.driiveme.com/${locale}/component/transport-list?page=${page}`;
          const resp = await this.safeFetch(url, {
            headers: { "X-Requested-With": "XMLHttpRequest" },
            timeout: options.timeout || 12000
          });

          const html = await resp.text();
          const cardMatches = [...html.matchAll(/class="block-trajet\s+filtr-item[^"]*"[\s\S]*?(?=(?:class="block-trajet\s+filtr-item|$))/gi)];
          if (cardMatches.length === 0) break; // no more pages for this locale

          for (const cm of cardMatches) {
          const cardHtml = cm[0];

          // Departure
          const depMatch = cardHtml.match(/class="departure"[\s\S]*?<span[^>]*title="([^"]*)"[^>]*>([^<]+)<\/span>/i);
          const depTooltip = depMatch ? depMatch[1].trim() : "";
          const depCityRaw = depMatch ? depMatch[2].trim() : "";
          const depPostal = (depTooltip.match(/\b\d{4,5}\b/) || [])[0] || "";

          // Arrival
          const arrMatch = cardHtml.match(/class="arrival"[\s\S]*?<span[^>]*title="([^"]*)"[^>]*>([^<]+)<\/span>/i);
          const arrTooltip = arrMatch ? arrMatch[1].trim() : "";
          const arrCityRaw = arrMatch ? arrMatch[2].trim() : "";
          const arrPostal = (arrTooltip.match(/\b\d{4,5}\b/) || [])[0] || "";

          if (!depCityRaw || !arrCityRaw) continue;

          // Validity dates
          const validMatch = cardHtml.match(/Valid between\s+(\d{2}\/\d{2}\/\d{4})\s+and\s+(\d{2}\/\d{2}\/\d{4})/i);
          const dateStart = validMatch ? validMatch[1] : null;
          const dateEnd = validMatch ? validMatch[2] : null;

          // Proposed by
          const proposedMatch = cardHtml.match(/proposed by\s+([^<]+)/i);
          const partner = proposedMatch ? proposedMatch[1].trim() : null;

          // Vehicle info
          const vehImgMatch = cardHtml.match(/class="cell\s+cell-vehicle"[\s\S]*?<img[^>]*title="([^"]*)"/i);
          const rawVehDesc = vehImgMatch ? vehImgMatch[1].replace(/&lt;br&gt;/gi, ", ") : "Vehicle";
          const vehDesc = decodeHtmlEntities(rawVehDesc);

          const vehValMatch = cardHtml.match(/name="filterVehiculeValue"\s+value="([^"]*)"/i);
          const vehTypeVal = vehValMatch ? vehValMatch[1].trim() : "";

          // Seats
          const seatsMatch = cardHtml.match(/title="(\d+)\s+seats"/i);
          const seats = seatsMatch ? parseInt(seatsMatch[1], 10) : 2;

          // Duration
          const durationMatch = cardHtml.match(/title="(\d+)\s+rental hours"/i);
          const hours = durationMatch ? parseInt(durationMatch[1], 10) : 24;
          const durationDays = Math.max(1, Math.ceil(hours / 24));

          // Countdown / offer ends
          const countdownMatch = cardHtml.match(/title="Offer ends on<br\/>([^"]+)"/i);
          const offerEnds = countdownMatch ? countdownMatch[1].replace("<br/>", " ").trim() : null;

          // Locations
          const origin = resolveLocation(depCityRaw, depPostal);
          const destination = resolveLocation(arrCityRaw, arrPostal);
          const category = normalizeVehicleCategory(vehTypeVal, vehDesc);

          const dealId = generateDealId("driiveme", origin.city, destination.city, vehDesc, dateStart || "");
          if (seenIds.has(dealId)) continue;
          seenIds.add(dealId);

          deals.push({
            id: dealId,
            provider: "driiveme",
            providerName: "Driiveme",
            fleetPartner: partner,
            origin: {
              city: origin.city,
              countryCode: origin.countryCode,
              countryName: origin.countryName,
              postalCode: depPostal || null
            },
            destination: {
              city: destination.city,
              countryCode: destination.countryCode,
              countryName: destination.countryName,
              postalCode: arrPostal || null
            },
            dates: {
              earliestDeparture: dateStart,
              deliverBy: dateEnd,
              durationDays,
              durationHours: hours,
              offerEnds
            },
            vehicle: {
              model: vehDesc,
              categoryName: vehTypeVal || "Standard",
              category,
              seats
            },
            price: {
              amount: 1.0,
              currency: "EUR",
              rateType: "total"
            },
            inclusions: {
              freeKm: null,
              fuelIncluded: false,
              ferryIncluded: false
            },
            bookingUrl: `https://www.driiveme.com/${locale}/search-rental.html`,
            scrapedAt: new Date().toISOString()
          });
        }
        await delay(350);
      } catch (err) {
        networkErrors++;
        break;
      }
    }
  }

  if (deals.length === 0 && networkErrors >= this.locales.length) {
    throw new Error(`Driiveme network request failed across all ${this.locales.length} locales`);
  }

    return deals;
  }
}
