import { BaseProvider } from "./base-provider.mjs";
import { resolveLocation, normalizeVehicleCategory } from "../schema.mjs";

export class UgokiProvider extends BaseProvider {
  constructor() {
    super("ugoki", "Ugoki (FlipCar)", "https://ugoki.com");
    this.apiUrl = "https://production.flipcar.app/api/v3/transfers.json";
    this.apiKey = process.env.UGOKI_API_KEY || "1E19F37647E563D726279F8A0FD5A4";
  }

  async scrape(options = {}) {
    const allTransfers = [];
    let page = 1;
    const perPage = options.perPage || 500;

    // Fetch all paginated transfers
    while (true) {
      const url = `${this.apiUrl}?per_page=${perPage}&page=${page}`;
      const resp = await this.safeFetch(url, {
        headers: {
          "Api-Key": this.apiKey,
          "Accept": "application/json"
        },
        timeout: options.timeout || 15000
      });

      const transfers = await resp.json();
      if (!Array.isArray(transfers) || transfers.length === 0) {
        break;
      }

      allTransfers.push(...transfers);

      if (transfers.length < perPage) {
        break;
      }
      page++;
    }

    const deals = [];

    for (const t of allTransfers) {
      const startAddr = t.start_shop?.address || {};
      const endAddr = t.end_shop?.address || {};

      const rawOrigCity = startAddr.city_name || startAddr.town_name || t.start_shop?.city?.name || "Unknown";
      const rawDestCity = endAddr.city_name || endAddr.town_name || t.end_shop?.city?.name || "Unknown";

      const origCountryHint = (startAddr.country_name || "").toLowerCase().includes("schweiz") ? "CH" :
                              (startAddr.country_name || "").toLowerCase().includes("österreich") ? "AT" :
                              (startAddr.country_name || "").toLowerCase().includes("frankreich") ? "FR" :
                              (startAddr.country_name || "").toLowerCase().includes("spanien") ? "ES" :
                              (startAddr.country_name || "").toLowerCase().includes("italien") ? "IT" : "DE";

      const destCountryHint = (endAddr.country_name || "").toLowerCase().includes("schweiz") ? "CH" :
                              (endAddr.country_name || "").toLowerCase().includes("österreich") ? "AT" :
                              (endAddr.country_name || "").toLowerCase().includes("frankreich") ? "FR" :
                              (endAddr.country_name || "").toLowerCase().includes("spanien") ? "ES" :
                              (endAddr.country_name || "").toLowerCase().includes("italien") ? "IT" : "DE";

      const origin = resolveLocation(rawOrigCity, startAddr.postcode, origCountryHint);
      origin.street = startAddr.street_name_and_number || startAddr.name || null;
      origin.stationCode = String(t.start_shop?.id || "");
      if (t.start_shop?.location) {
        origin.coordinates = {
          latitude: t.start_shop.location.latitude,
          longitude: t.start_shop.location.longitude
        };
      }

      const destination = resolveLocation(rawDestCity, endAddr.postcode, destCountryHint);
      destination.street = endAddr.street_name_and_number || endAddr.name || null;
      destination.stationCode = String(t.end_shop?.id || "");
      if (t.end_shop?.location) {
        destination.coordinates = {
          latitude: t.end_shop.location.latitude,
          longitude: t.end_shop.location.longitude
        };
      }

      // Partner fleet
      const rawClient = t.start_shop?.client?.name || t.end_shop?.client?.name || "";
      let fleetPartner = "Ugoki";
      if (rawClient.toLowerCase().includes("sixt")) {
        fleetPartner = "Sixt";
      } else if (rawClient.toLowerCase().includes("miles")) {
        fleetPartner = "MILES";
      } else if (rawClient.toLowerCase().includes("mietsmart")) {
        fleetPartner = "MietSmart";
      } else if (rawClient) {
        fleetPartner = rawClient.replace(/GmbH.*|AG.*|KG.*/i, "").trim();
      }

      // Dates & Duration
      let pickupDate = null;
      let dropoffDate = null;
      if (t.latest_reservation_date) {
        pickupDate = t.latest_reservation_date.split("T")[0];
      }
      if (t.booking_hours && typeof t.booking_hours === "object") {
        const dates = Object.keys(t.booking_hours);
        if (dates.length > 0) {
          // Format DDMMAAAA -> YYYY-MM-DD
          const dStr = dates[0];
          if (dStr.length === 8) {
            const day = dStr.slice(0, 2);
            const month = dStr.slice(2, 4);
            const year = dStr.slice(4, 8);
            pickupDate = `${year}-${month}-${day}`;
          }
        }
      }

      // Duration: duration is in seconds (travel time)
      const durationSeconds = t.duration || 86400;
      const durationDays = Math.max(1, Math.ceil(durationSeconds / (3600 * 24)));

      // Vehicle
      const v = t.vehicle || {};
      let vehicleName = v.name || [v.brand, v.model].filter(Boolean).join(" ") || "Rental Vehicle";
      if (fleetPartner === "MILES") {
        if (vehicleName.toLowerCase() === "pkw") {
          vehicleName = "MILES Car / PKW";
        } else if (vehicleName.toLowerCase() === "transporter") {
          vehicleName = "MILES Transporter";
        }
      }

      const category = normalizeVehicleCategory(vehicleName, [v.brand, v.model].filter(Boolean).join(" "));

      // Transmission & features
      const icons = t.icons || [];
      const isAuto = icons.some(ic => (ic.title || "").toLowerCase().includes("automatik"));
      const transmission = isAuto ? "automatic" : "manual";

      let seats = 5;
      if (category === "van") seats = 2;
      if (category === "motorhome") seats = 4;
      if (vehicleName.toLowerCase().includes("tourneo") || vehicleName.toLowerCase().includes("9-sitz")) {
        seats = 9;
      }

      // Inclusions & perks
      const distanceKm = t.distance ? Math.round(t.distance / 1000) : null;
      const perks = ["1st Tank Included"];
      if (isAuto) perks.push("Automatic");
      if (t.has_remote_vehicle_control) perks.push("App Unlock");
      if (distanceKm) perks.push(`${distanceKm}km`);

      // Price
      const pkg = (t.insurance_packages || [])[0] || {};
      const amountEur = pkg.price ? pkg.price / 100 : 1.0;

      const vClass = t.vehicle_class || {};
      const depositEur = vClass.deposit ? vClass.deposit / 100 : null;
      const deductibleEur = vClass.retention ? vClass.retention / 100 : null;

      deals.push({
        id: `ugoki_${t.id}`,
        provider: "ugoki",
        providerName: "Ugoki",
        fleetPartner,
        origin,
        destination,
        dates: {
          pickupDate,
          dropoffDate,
          durationDays,
          dateHint: pickupDate ? `${pickupDate} (${durationDays}d)` : `${durationDays} day(s)`
        },
        vehicle: {
          category,
          model: vehicleName,
          seats,
          transmission,
          imageUrl: v.image_url || null
        },
        price: {
          amount: amountEur,
          currency: "EUR",
          deposit: depositEur,
          deductible: deductibleEur
        },
        inclusions: {
          freeKm: distanceKm,
          extraKmCost: null,
          fuelIncluded: true,
          insuranceIncluded: true,
          perks
        },
        bookingUrl: "https://ugoki.com",
        scrapedAt: new Date().toISOString(),
        metadata: {
          transferId: t.id,
          minimumAge: t.minimum_age,
          coinsWin: vClass.coins_win,
          bookingBufferSeconds: t.booking_time_buffer,
          hasRemoteUnlock: Boolean(t.has_remote_vehicle_control)
        }
      });
    }

    return deals;
  }
}
