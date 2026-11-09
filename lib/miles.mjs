/**
 * MILES Mobility Integration Helper
 *
 * Provides utilities for cross-referencing MILES carsharing transfers with
 * verified user input from the official MILES mobile app.
 *
 * Automated unauthenticated network scraping against MILES is omitted because
 * the provider serves randomized mock data to unauthenticated clients. Ground-truth
 * telemetry is verified directly in the MILES mobile app and passed via CLI flags.
 */

/**
 * Calculates distance in meters between two lat/lon coordinates
 */
export function haversineDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Resolves verified vehicle telematics from CLI flags / user input.
 *
 * @param {Object} options
 * @param {number|string} [options.userRange] - Remaining autonomy in km from app (e.g. 320)
 * @param {string} [options.userFuel] - Fuel percentage string from app (e.g. "50%")
 * @param {string} [options.userCar] - Vehicle model name from app (e.g. "VW Golf")
 * @param {string} [options.userPlate] - Vehicle license plate from app (e.g. "B-MI 1234")
 * @returns {Object|null}
 */
export function resolveVerifiedMilesVehicle(options = {}) {
  const rangeRaw = options.userRange || options.range || options["starting-range"] || options["start-range"] || options["miles-range"];
  const fuelRaw = options.userFuel || options.fuel || options["starting-fuel"] || options["fuel-pct"];
  const carRaw = options.userCar || options.car || options.model;
  const plateRaw = options.userPlate || options.plate || options["license-plate"];

  if (!rangeRaw && !fuelRaw && !carRaw && !plateRaw) {
    return null;
  }

  const rangeKm = rangeRaw ? parseInt(String(rangeRaw).replace(/km/i, ""), 10) : null;
  const fuelPct = fuelRaw ? (String(fuelRaw).includes("%") ? String(fuelRaw) : `${fuelRaw}%`) : null;
  const model = carRaw ? String(carRaw).trim() : null;
  const plate = plateRaw ? String(plateRaw).trim() : null;

  return {
    verifiedByUser: true,
    matchedVehicle: {
      licensePlate: plate,
      type: model,
      color: null,
      size: "M",
      isVan: false,
      isElectric: false,
      fuelPct,
      fuelNum: fuelPct ? parseInt(fuelPct, 10) : null,
      remainingRange: rangeKm != null ? `${rangeKm}km` : null,
      remainingRangeKm: rangeKm,
      distMeters: 0,
      transmission: "automatic"
    }
  };
}

/**
 * Enriches hybrid route results with verified MILES telematics when supplied by the user.
 * Recalculates exact out-of-pocket fuel top-up costs using real vehicle autonomy.
 *
 * @param {Object} routeResult - Result from findHybridRoutes()
 * @param {Object} [options={}] - User CLI flags
 * @returns {Object}
 */
export function enrichRoutesWithTelematics(routeResult, options = {}) {
  const routes = routeResult?.routes || [];
  if (routes.length === 0) return routeResult;

  const verified = resolveVerifiedMilesVehicle(options);
  if (!verified) return routeResult;

  const mv = verified.matchedVehicle;

  for (const r of routes) {
    if (r.deal?.fleetPartner !== "MILES") continue;

    const d = r.deal;
    d.liveTelematics = verified;
    if (mv.type) d.vehicle.liveModel = mv.type;
    if (mv.licensePlate) d.vehicle.liveLicensePlate = mv.licensePlate;

    // Usable starting range: vehicle's remaining range minus 50 km reserve required by Ugoki return rules
    const actualRangeKm = mv.remainingRangeKm != null ? mv.remainingRangeKm : 250;
    const usableStartingKm = Math.max(0, actualRangeKm - 50);
    const dealDriveDist = r.legs[1]?.distanceKm || 300;
    const deficitKm = Math.max(0, dealDriveDist - usableStartingKm);
    const fuelCost = Math.round((deficitKm / 100) * 7.5 * 1.8);

    r.costs.fuelEur = fuelCost;
    r.costs.totalEur = r.costs.rentalEur + fuelCost;
    r.costs.liveRangeKm = mv.remainingRangeKm;
    r.costs.liveFuelPct = mv.fuelPct;
    r.costs.livePlate = mv.licensePlate;
    r.costs.liveModel = mv.type;
    r.costs.verifiedByUser = true;

    // Update driving leg costStr & label
    if (r.legs[1]) {
      const plateLabel = mv.licensePlate ? ` [${mv.licensePlate}]` : "";
      const modelLabel = mv.type || d.vehicle.model;
      r.legs[1].label = `1€ Relocation [Ugoki - MILES] - ${modelLabel}${plateLabel}`;
      r.legs[1].costStr = fuelCost > 0
        ? `${r.costs.rentalEur.toFixed(2)} € (+~${fuelCost}€ fuel top-up beyond starting ${mv.remainingRange || actualRangeKm + "km"} range)`
        : `${r.costs.rentalEur.toFixed(2)} € (Covered by starting ${mv.remainingRange || actualRangeKm + "km"} range)`;
    }
  }

  return routeResult;
}
