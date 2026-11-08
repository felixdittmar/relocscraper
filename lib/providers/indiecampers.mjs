import { BaseProvider } from "./base-provider.mjs";
import { resolveLocation, normalizeVehicleCategory, generateDealId } from "../schema.mjs";

export class IndieCampersProvider extends BaseProvider {
  constructor() {
    super("indiecampers", "Indie Campers", "https://indiecampers.com");
    this.dealsUrl = "https://indiecampers.com/discover/en-us/deals/europe";
  }

  async scrape(options = {}) {
    const resp = await this.safeFetch(this.dealsUrl, {
      timeout: options.timeout || 15000
    });
    const html = await resp.text();
    const deals = [];

    // Split HTML by route headers: e.g. Barcelona<!-- --> → <!-- -->Lisbon
    const routeRegex = /<h2[^>]*class="text-lg font-semibold"[^>]*>\s*([A-Za-z\s]+)(?:<!-- -->|\s)*→(?:<!-- -->|\s)*([A-Za-z\s]+)<\/h2>/gi;
    const routeMatches = [...html.matchAll(routeRegex)];

    for (let i = 0; i < routeMatches.length; i++) {
      const currentMatch = routeMatches[i];
      const origCity = currentMatch[1].trim();
      const destCity = currentMatch[2].trim();

      const startIdx = currentMatch.index;
      const endIdx = i + 1 < routeMatches.length ? routeMatches[i + 1].index : html.indexOf("</section>", startIdx + 100);
      const sectionHtml = html.slice(startIdx, endIdx > startIdx ? endIdx : startIdx + 15000);

      // In this section, extract all camper cards
      const cardBlocks = sectionHtml.split(/relative flex size-full max-w-90 flex-col/gi).slice(1);

      for (const cardHtml of cardBlocks) {
        // Vehicle model: <h3 class="text-xl font-semibold text-sunset-grey-900">Active Plus</h3>
        const modelMatch = cardHtml.match(/<h3[^>]*>([^<]+)<\/h3>/i);
        const modelName = modelMatch ? modelMatch[1].trim() : "Campervan";

        // Seats: lucide-users size-3.5 ... <span ...>4</span>
        const seatsMatch = cardHtml.match(/lucide-users[\s\S]*?<span[^>]*>(\d+)<\/span>/i);
        const seats = seatsMatch ? parseInt(seatsMatch[1], 10) : 4;

        // Dates: Dates available between</span><span ...>Nov 9<!-- --> –<!-- --> <!-- -->Nov 15</span>
        const datesMatch = cardHtml.match(/Dates available between[\s\S]*?<span[^>]*>([^<]+(?:<!-- -->[^<]*)*)<\/span>/i);
        let datesText = datesMatch ? datesMatch[1].replace(/<!-- -->/g, "").replace(/\s+/g, " ").trim() : "";

        // Nights: Maximum of 5 nights
        const nightsMatch = cardHtml.match(/Maximum of (\d+) nights/i);
        const durationDays = nightsMatch ? parseInt(nightsMatch[1], 10) : 5;

        // Ferry reimbursement check
        const isFerryRoute = ["cagliari", "olbia", "palma", "tenerife", "bastia"].some(
          c => origCity.toLowerCase().includes(c) || destCity.toLowerCase().includes(c)
        );

        const origin = resolveLocation(origCity);
        const destination = resolveLocation(destCity);
        const category = normalizeVehicleCategory("campervan", modelName);

        const dealId = generateDealId("indiecampers", origin.city, destination.city, modelName, datesText);

        deals.push({
          id: dealId,
          provider: "indiecampers",
          providerName: "Indie Campers",
          fleetPartner: null,
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
            earliestDeparture: datesText,
            durationDays,
            durationHours: durationDays * 24
          },
          vehicle: {
            model: `Indie Campers ${modelName}`,
            categoryName: modelName,
            category,
            seats,
            sleeping: seats
          },
          price: {
            amount: 1.0, // Indie Specials / promotional relocations
            currency: "EUR",
            rateType: "per_day"
          },
          inclusions: {
            freeKm: "Unlimited",
            extraKmCostEuro: 0,
            fuelIncluded: false,
            ferryIncluded: isFerryRoute,
            ferryNotes: isFerryRoute ? "Ferry ticket reimbursement available" : null,
            essentialKitIncluded: true
          },
          bookingUrl: this.dealsUrl,
          scrapedAt: new Date().toISOString()
        });
      }
    }

    return deals;
  }
}
