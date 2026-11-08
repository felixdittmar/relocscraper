import { BaseProvider } from "./base-provider.mjs";
import { resolveLocation, normalizeVehicleCategory, generateDealId } from "../schema.mjs";

export class ImoovaProvider extends BaseProvider {
  constructor() {
    super("imoova", "Imoova", "https://www.imoova.com");
    this.tableUrl = "https://www.imoova.com/relocations/table/europe";
  }

  async scrape(options = {}) {
    const resp = await this.safeFetch(this.tableUrl, {
      timeout: options.timeout || 15000
    });
    const html = await resp.text();

    const deals = [];
    const rowMatches = html.matchAll(/<tr[^>]*>(.*?)<\/tr>/gis);

    for (const match of rowMatches) {
      const rowHtml = match[1];
      if (rowHtml.includes("<th")) continue; // skip header row

      const cells = [];
      const cellMatches = rowHtml.matchAll(/<td[^>]*>(.*?)<\/td>/gis);
      for (const cm of cellMatches) {
        const text = cm[1].replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").trim();
        cells.push(text.replace(/\s+/g, " "));
      }

      if (cells.length < 9) continue;

      // Check for link with slug and ref
      const linkMatch = rowHtml.match(/href="([^"]*relocations\/europe\/[^"]+)"/i);
      const relativeLink = linkMatch ? linkMatch[1] : null;

      // Extract fields according to table header:
      // Ref | From | To | Depart | Deliver | Vehicle | Rate | Duration | Seats | Fuel | Ferry
      // Sometimes an extra action column is at index 0
      let refIdx = cells.findIndex(c => /^RLC\d+$/i.test(c));
      if (refIdx === -1) {
        // Look for any cell containing RLC
        refIdx = cells.findIndex(c => /RLC\d+/i.test(c));
      }

      if (refIdx === -1) continue;

      const ref = (cells[refIdx].match(/RLC\d+/i) || [])[0] || cells[refIdx];
      const fromCity = cells[refIdx + 1] || "Unknown";
      const toCity = cells[refIdx + 2] || "Unknown";
      const departStr = cells[refIdx + 3] || "";
      const deliverStr = cells[refIdx + 4] || "";
      const vehicleStr = cells[refIdx + 5] || "Campervan";
      const rateStr = cells[refIdx + 6] || "€1";
      const durationStr = cells[refIdx + 7] || "1 night";
      const seatsStr = cells[refIdx + 8] || "2";
      const fuelStr = cells[refIdx + 9] || "No";
      const ferryStr = cells[refIdx + 10] || "No";

      const origin = resolveLocation(fromCity);
      const destination = resolveLocation(toCity);
      const category = normalizeVehicleCategory("campervan", vehicleStr);

      const seats = parseInt(seatsStr, 10) || 2;
      const durationNightsMatch = durationStr.match(/(\d+)\s*night/i);
      const durationDays = durationNightsMatch ? parseInt(durationNightsMatch[1], 10) : 1;

      // Rate extraction
      const rateNumMatch = rateStr.match(/[\$€£]?\s*(\d+(?:\.\d+)?)/);
      const rate = rateNumMatch ? parseFloat(rateNumMatch[1]) : 1.0;

      // Inclusions
      const hasFuel = !/^(no|none|nein)$/i.test(fuelStr.trim());
      const hasFerry = !/^(no|none|nein)$/i.test(ferryStr.trim());

      const bookingUrl = relativeLink
        ? (relativeLink.startsWith("http") ? relativeLink : `https://www.imoova.com${relativeLink}`)
        : `https://www.imoova.com/relocations/table/europe#${ref}`;

      deals.push({
        id: `imoova_${ref}`,
        provider: "imoova",
        providerName: "Imoova",
        fleetPartner: vehicleStr.toLowerCase().includes("active") ? "Indie Campers" : null,
        origin: {
          city: origin.city,
          countryCode: origin.countryCode,
          countryName: origin.countryName
        },
        destination: {
          city: destination.city,
          countryCode: destination.countryCode,
          countryName: destination.countryName
        },
        dates: {
          earliestDeparture: departStr,
          deliverBy: deliverStr,
          durationDays,
          durationHours: durationDays * 24
        },
        vehicle: {
          model: vehicleStr,
          categoryName: vehicleStr,
          category,
          seats,
          sleeping: seats
        },
        price: {
          amount: rate,
          currency: "EUR",
          rateType: "per_day"
        },
        inclusions: {
          freeKm: null,
          fuelIncluded: hasFuel,
          fuelNotes: hasFuel ? fuelStr : null,
          ferryIncluded: hasFerry,
          ferryNotes: hasFerry ? ferryStr : null
        },
        bookingUrl,
        scrapedAt: new Date().toISOString()
      });
    }

    return deals;
  }
}
