/**
 * Hybrid Route Planner: Deutschlandticket + Rental Relocation Deals
 * Combines free regional transit (D-Ticket: RE, RB, S-Bahn) with high-speed 1€ relocations.
 */

import { stripAccents } from "./schema.mjs";

export const CITY_COORDS = {
  // Germany - Major Metros & Hubs
  berlin: { lat: 52.5200, lon: 13.4050, name: "Berlin" },
  hamburg: { lat: 53.5511, lon: 9.9937, name: "Hamburg" },
  munich: { lat: 48.1351, lon: 11.5820, name: "München" },
  muenchen: { lat: 48.1351, lon: 11.5820, name: "München" },
  munchen: { lat: 48.1351, lon: 11.5820, name: "München" },
  cologne: { lat: 50.9375, lon: 6.9603, name: "Köln" },
  koeln: { lat: 50.9375, lon: 6.9603, name: "Köln" },
  koln: { lat: 50.9375, lon: 6.9603, name: "Köln" },
  frankfurt: { lat: 50.1109, lon: 8.6821, name: "Frankfurt am Main" },
  "frankfurt am main": { lat: 50.1109, lon: 8.6821, name: "Frankfurt am Main" },
  stuttgart: { lat: 48.7758, lon: 9.1829, name: "Stuttgart" },
  duesseldorf: { lat: 51.2277, lon: 6.7735, name: "Düsseldorf" },
  dusseldorf: { lat: 51.2277, lon: 6.7735, name: "Düsseldorf" },
  leipzig: { lat: 51.3397, lon: 12.3731, name: "Leipzig" },
  dresden: { lat: 51.0504, lon: 13.7373, name: "Dresden" },
  hannover: { lat: 52.3759, lon: 9.7320, name: "Hannover" },
  hanover: { lat: 52.3759, lon: 9.7320, name: "Hannover" },
  nuernberg: { lat: 49.4521, lon: 11.0767, name: "Nürnberg" },
  nuremberg: { lat: 49.4521, lon: 11.0767, name: "Nürnberg" },
  nurnberg: { lat: 49.4521, lon: 11.0767, name: "Nürnberg" },
  bremen: { lat: 53.0793, lon: 8.8017, name: "Bremen" },
  dortmund: { lat: 51.5136, lon: 7.4653, name: "Dortmund" },
  essen: { lat: 51.4556, lon: 7.0116, name: "Essen" },
  mannheim: { lat: 49.4875, lon: 8.4660, name: "Mannheim" },
  karlsruhe: { lat: 49.0069, lon: 8.4037, name: "Karlsruhe" },
  augsburg: { lat: 48.3705, lon: 10.8978, name: "Augsburg" },
  wiesbaden: { lat: 50.0782, lon: 8.2398, name: "Wiesbaden" },
  mainz: { lat: 49.9929, lon: 8.2473, name: "Mainz" },
  bonn: { lat: 50.7374, lon: 7.0982, name: "Bonn" },
  muenster: { lat: 51.9607, lon: 7.6261, name: "Münster" },
  munster: { lat: 51.9607, lon: 7.6261, name: "Münster" },
  aachen: { lat: 50.7753, lon: 6.0839, name: "Aachen" },
  erfurt: { lat: 50.9848, lon: 11.0299, name: "Erfurt" },
  kassel: { lat: 51.3127, lon: 9.4797, name: "Kassel" },
  freiburg: { lat: 47.9990, lon: 7.8421, name: "Freiburg" },
  kiel: { lat: 54.3233, lon: 10.1228, name: "Kiel" },
  magdeburg: { lat: 52.1205, lon: 11.6276, name: "Magdeburg" },
  rostock: { lat: 54.0924, lon: 12.0991, name: "Rostock" },
  halle: { lat: 51.4828, lon: 11.9697, name: "Halle (Saale)" },
  bielefeld: { lat: 52.0302, lon: 8.5325, name: "Bielefeld" },
  chemnitz: { lat: 50.8278, lon: 12.9214, name: "Chemnitz" },
  potsdam: { lat: 52.3906, lon: 13.0645, name: "Potsdam" },
  wuerzburg: { lat: 49.7913, lon: 9.9534, name: "Würzburg" },
  wurzburg: { lat: 49.7913, lon: 9.9534, name: "Würzburg" },
  ulm: { lat: 48.4011, lon: 9.9876, name: "Ulm" },
  regensburg: { lat: 49.0134, lon: 12.1016, name: "Regensburg" },
  luebeck: { lat: 53.8655, lon: 10.6866, name: "Lübeck" },
  lubeck: { lat: 53.8655, lon: 10.6866, name: "Lübeck" },
  erxleben: { lat: 52.1746, lon: 11.2588, name: "Erxleben" },
  "hessisch lichtenau": { lat: 51.1947, lon: 9.7386, name: "Hessisch Lichtenau" },
  zoerbig: { lat: 51.6304, lon: 12.1392, name: "Zörbig" },
  zorbig: { lat: 51.6304, lon: 12.1392, name: "Zörbig" },
  dessau: { lat: 51.8385, lon: 12.2385, name: "Dessau-Roßlau" },
  "dessau-rosslau": { lat: 51.8385, lon: 12.2385, name: "Dessau-Roßlau" },
  "dessau rosslau": { lat: 51.8385, lon: 12.2385, name: "Dessau-Roßlau" },
  saarbruecken: { lat: 49.2401, lon: 6.9969, name: "Saarbrücken" },
  saarbrucken: { lat: 49.2401, lon: 6.9969, name: "Saarbrücken" },
  heidelberg: { lat: 49.3988, lon: 8.6724, name: "Heidelberg" },
  osnabrueck: { lat: 52.2799, lon: 8.0472, name: "Osnabrück" },
  osnabruck: { lat: 52.2799, lon: 8.0472, name: "Osnabrück" },
  oldenburg: { lat: 53.1435, lon: 8.2146, name: "Oldenburg" },
  braunschweig: { lat: 52.2689, lon: 10.5268, name: "Braunschweig" },
  goettingen: { lat: 51.5413, lon: 9.9158, name: "Göttingen" },
  gottingen: { lat: 51.5413, lon: 9.9158, name: "Göttingen" },
  wolfsburg: { lat: 52.4227, lon: 10.7865, name: "Wolfsburg" },
  koblenz: { lat: 50.3569, lon: 7.5890, name: "Koblenz" },
  trier: { lat: 49.7499, lon: 6.6371, name: "Trier" },
  paderborn: { lat: 51.7189, lon: 8.7575, name: "Paderborn" },
  ingolstadt: { lat: 48.7665, lon: 11.4258, name: "Ingolstadt" },
  bamberg: { lat: 49.8988, lon: 10.9028, name: "Bamberg" },
  passau: { lat: 48.5667, lon: 13.4319, name: "Passau" },
  flensburg: { lat: 54.7836, lon: 9.4321, name: "Flensburg" },
  stralsund: { lat: 54.3091, lon: 13.0818, name: "Stralsund" },
  schwerin: { lat: 53.6355, lon: 11.4012, name: "Schwerin" },
  cottbus: { lat: 51.7563, lon: 14.3329, name: "Cottbus" },
  jena: { lat: 50.9271, lon: 11.5892, name: "Jena" },
  gera: { lat: 50.8854, lon: 12.0830, name: "Gera" },
  weimar: { lat: 50.9795, lon: 11.3235, name: "Weimar" },
  heilbronn: { lat: 49.1427, lon: 9.2109, name: "Heilbronn" },
  pforzheim: { lat: 48.8911, lon: 8.6946, name: "Pforzheim" },
  reutlingen: { lat: 48.4833, lon: 9.2167, name: "Reutlingen" },
  tuebingen: { lat: 48.5216, lon: 9.0576, name: "Tübingen" },
  tubingen: { lat: 48.5216, lon: 9.0576, name: "Tübingen" },
  konstanz: { lat: 47.6779, lon: 9.1732, name: "Konstanz" },
  friedrichshafen: { lat: 47.6542, lon: 9.4795, name: "Friedrichshafen" },
  lindau: { lat: 47.5463, lon: 9.6843, name: "Lindau" },
  kempten: { lat: 47.7286, lon: 10.3158, name: "Kempten" },
  rosenheim: { lat: 47.8564, lon: 12.1225, name: "Rosenheim" },
  fulda: { lat: 50.5528, lon: 9.6757, name: "Fulda" },
  giessen: { lat: 50.5873, lon: 8.6755, name: "Gießen" },
  marburg: { lat: 50.8022, lon: 8.7668, name: "Marburg" },
  siegen: { lat: 50.8748, lon: 8.0243, name: "Siegen" },
  hagen: { lat: 51.3671, lon: 7.4633, name: "Hagen" },
  wuppertal: { lat: 51.2562, lon: 7.1508, name: "Wuppertal" },
  solingen: { lat: 51.1712, lon: 7.0841, name: "Solingen" },
  leverkusen: { lat: 51.0459, lon: 6.9865, name: "Leverkusen" },
  moenchengladbach: { lat: 51.1805, lon: 6.4428, name: "Mönchengladbach" },
  monchengladbach: { lat: 51.1805, lon: 6.4428, name: "Mönchengladbach" },
  krefeld: { lat: 51.3388, lon: 6.5853, name: "Krefeld" },
  oberhausen: { lat: 51.4782, lon: 6.8660, name: "Oberhausen" },
  duisburg: { lat: 51.4344, lon: 6.7623, name: "Duisburg" },
  bochum: { lat: 51.4818, lon: 7.2162, name: "Bochum" },
  gelsenkirchen: { lat: 51.5177, lon: 7.0857, name: "Gelsenkirchen" },
  recklinghausen: { lat: 51.6141, lon: 7.1982, name: "Recklinghausen" },
  hamm: { lat: 51.6811, lon: 7.8197, name: "Hamm" },
  guetersloh: { lat: 51.9064, lon: 8.3782, name: "Gütersloh" },
  gutersloh: { lat: 51.9064, lon: 8.3782, name: "Gütersloh" },
  minden: { lat: 52.2886, lon: 8.9169, name: "Minden" },
  hildesheim: { lat: 52.1548, lon: 9.9579, name: "Hildesheim" },
  celle: { lat: 52.6248, lon: 10.0815, name: "Celle" },
  lueneburg: { lat: 53.2464, lon: 10.4115, name: "Lüneburg" },
  luneburg: { lat: 53.2464, lon: 10.4115, name: "Lüneburg" },
  cuxhaven: { lat: 53.8617, lon: 8.6941, name: "Cuxhaven" },
  bremerhaven: { lat: 53.5396, lon: 8.5809, name: "Bremerhaven" },
  wilhelmshaven: { lat: 53.5298, lon: 8.1137, name: "Wilhelmshaven" },
  emden: { lat: 53.3670, lon: 7.2060, name: "Emden" },
  aschaffenburg: { lat: 49.9757, lon: 9.1508, name: "Aschaffenburg" },
  schweinfurt: { lat: 50.0489, lon: 10.2319, name: "Schweinfurt" },
  bayreuth: { lat: 49.9456, lon: 11.5713, name: "Bayreuth" },
  hof: { lat: 50.3167, lon: 11.9167, name: "Hof" },
  erlangen: { lat: 49.5897, lon: 11.0039, name: "Erlangen" },
  fuerth: { lat: 49.4774, lon: 10.9886, name: "Fürth" },
  furth: { lat: 49.4774, lon: 10.9886, name: "Fürth" },
  landshut: { lat: 48.5442, lon: 12.1469, name: "Landshut" },
  straubing: { lat: 48.8817, lon: 12.5694, name: "Straubing" },
  deggendorf: { lat: 48.8353, lon: 12.9644, name: "Deggendorf" },
  lingen: { lat: 52.5233, lon: 7.3172, name: "Lingen" },
  rehden: { lat: 52.6078, lon: 8.4764, name: "Rehden" },
  "bad toelz": { lat: 47.7606, lon: 11.5583, name: "Bad Tölz" },
  "bad tolz": { lat: 47.7606, lon: 11.5583, name: "Bad Tölz" },
  zwickau: { lat: 50.7189, lon: 12.4922, name: "Zwickau" },
  plauen: { lat: 50.4950, lon: 12.1383, name: "Plauen" },
  goerlitz: { lat: 51.1527, lon: 14.9873, name: "Görlitz" },
  gorlitz: { lat: 51.1527, lon: 14.9873, name: "Görlitz" },
  darmstadt: { lat: 49.8728, lon: 8.6512, name: "Darmstadt" },
  offenbach: { lat: 50.1006, lon: 8.7668, name: "Offenbach" },
  hanau: { lat: 50.1328, lon: 8.9169, name: "Hanau" },
  kaiserslautern: { lat: 49.4447, lon: 7.7690, name: "Kaiserslautern" },
  ludwigshafen: { lat: 49.4774, lon: 8.4452, name: "Ludwigshafen" },
  worms: { lat: 49.6358, lon: 8.3611, name: "Worms" },
  speyer: { lat: 49.3173, lon: 8.4311, name: "Speyer" },

  // Surrounding European Gateways & Cross-Border Hubs
  wien: { lat: 48.2082, lon: 16.3738, name: "Wien" },
  vienna: { lat: 48.2082, lon: 16.3738, name: "Wien" },
  salzburg: { lat: 47.8095, lon: 13.0550, name: "Salzburg" },
  innsbruck: { lat: 47.2692, lon: 11.4041, name: "Innsbruck" },
  graz: { lat: 47.0707, lon: 15.4395, name: "Graz" },
  linz: { lat: 48.3069, lon: 14.2858, name: "Linz" },
  zurich: { lat: 47.3769, lon: 8.5417, name: "Zürich" },
  zuerich: { lat: 47.3769, lon: 8.5417, name: "Zürich" },
  basel: { lat: 47.5596, lon: 7.5886, name: "Basel" },
  geneva: { lat: 46.2044, lon: 6.1432, name: "Genf" },
  genf: { lat: 46.2044, lon: 6.1432, name: "Genf" },
  meyrin: { lat: 46.2333, lon: 6.0833, name: "Meyrin (Genf)" },
  prague: { lat: 50.0755, lon: 14.4378, name: "Prag" },
  prag: { lat: 50.0755, lon: 14.4378, name: "Prag" },
  amsterdam: { lat: 52.3676, lon: 4.9041, name: "Amsterdam" },
  rotterdam: { lat: 51.9244, lon: 4.4777, name: "Rotterdam" },
  brussels: { lat: 50.8503, lon: 4.3517, name: "Brüssel" },
  bruessel: { lat: 50.8503, lon: 4.3517, name: "Brüssel" },
  strasbourg: { lat: 48.5734, lon: 7.7521, name: "Strasbourg" },
  strassburg: { lat: 48.5734, lon: 7.7521, name: "Strasbourg" },
  luxembourg: { lat: 49.6116, lon: 6.1319, name: "Luxemburg" },
  paris: { lat: 48.8566, lon: 2.3522, name: "Paris" },
  lyon: { lat: 45.7640, lon: 4.8357, name: "Lyon" },
  marseille: { lat: 43.2965, lon: 5.3698, name: "Marseille" },
  bordeaux: { lat: 44.8378, lon: -0.5792, name: "Bordeaux" },
  lille: { lat: 50.6292, lon: 3.0573, name: "Lille" },
  milan: { lat: 45.4642, lon: 9.1900, name: "Mailand" },
  mailand: { lat: 45.4642, lon: 9.1900, name: "Mailand" },
  venice: { lat: 45.4408, lon: 12.3155, name: "Venedig" },
  venedig: { lat: 45.4408, lon: 12.3155, name: "Venedig" },
  florence: { lat: 43.7696, lon: 11.2558, name: "Florenz" },
  florenz: { lat: 43.7696, lon: 11.2558, name: "Florenz" },
  barcelona: { lat: 41.3879, lon: 2.1699, name: "Barcelona" },
  madrid: { lat: 40.4168, lon: -3.7038, name: "Madrid" }
};

/**
 * Normalizes city names for lookup, generating spelling variations and parent cities.
 */
export function normalizeCitySearch(name) {
  if (!name) return [];
  const raw = String(name).trim();

  // Strip parentheses and brackets: "Laatzen (bei Hannover)" -> "Laatzen"
  const withoutParens = raw.replace(/\(.*?\)/g, "").replace(/\[.*?\]/g, "").trim();

  // Extract inside parentheses: "Laatzen (bei Hannover)" -> "Hannover"
  const parensMatch = raw.match(/\((?:bei|near|de|da)?\s*([^)]+)\)/i);
  const insideParens = parensMatch ? parensMatch[1].trim() : null;

  const candidates = [raw, withoutParens];
  if (insideParens) candidates.push(insideParens);

  const variations = new Set();
  for (const c of candidates) {
    if (!c) continue;
    const lower = c.toLowerCase();
    variations.add(lower);

    // Diacritic stripping
    const stripped = stripAccents(c).toLowerCase().replace(/[-_]/g, " ").trim();
    variations.add(stripped);

    // German umlaut transcription (ö -> oe, ü -> ue, ä -> ae, ß -> ss)
    const umlautReplaced = lower
      .replace(/ä/g, "ae")
      .replace(/ö/g, "oe")
      .replace(/ü/g, "ue")
      .replace(/ß/g, "ss")
      .replace(/[-_]/g, " ")
      .trim();
    variations.add(umlautReplaced);

    // Direct vowel simplification (ö -> o, ü -> u, ä -> a)
    const umlautStripped = lower
      .replace(/ä/g, "a")
      .replace(/ö/g, "o")
      .replace(/ü/g, "u")
      .replace(/ß/g, "ss")
      .replace(/[-_]/g, " ")
      .trim();
    variations.add(umlautStripped);
  }

  return Array.from(variations).filter((s) => s.length > 0);
}

/**
 * Calculates Haversine great-circle distance between two coordinates in km
 */
export function haversineDistance(coordA, coordB) {
  if (!coordA || !coordB || coordA.lat === undefined || coordB.lat === undefined) {
    return 0;
  }
  const R = 6371; // Earth radius in km
  const dLat = ((coordB.lat - coordA.lat) * Math.PI) / 180;
  const dLon = ((coordB.lon - coordA.lon) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coordA.lat * Math.PI) / 180) *
      Math.cos((coordB.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Resolves city coordinates from dictionary or deal coordinates
 */
export function resolveCoordinates(cityName, fallbackCoords = null) {
  if (fallbackCoords && (fallbackCoords.latitude !== undefined || fallbackCoords.lat !== undefined)) {
    return {
      lat: fallbackCoords.latitude ?? fallbackCoords.lat,
      lon: fallbackCoords.longitude ?? fallbackCoords.lon
    };
  }
  if (!cityName) return null;

  const searchTokens = normalizeCitySearch(cityName);

  // 1. Try exact match on generated tokens
  for (const token of searchTokens) {
    if (CITY_COORDS[token]) {
      return { lat: CITY_COORDS[token].lat, lon: CITY_COORDS[token].lon };
    }
  }

  // 2. Try prefix or substring matching against dictionary keys
  for (const token of searchTokens) {
    if (token.length < 3) continue;
    for (const [key, val] of Object.entries(CITY_COORDS)) {
      if (token === key || token.startsWith(key) || key.startsWith(token) || token.includes(key) || key.includes(token)) {
        return { lat: val.lat, lon: val.lon };
      }
    }
  }

  return null;
}

/**
 * Estimates baseline travel time for Deutsche Bahn regional trains (D-Ticket: RE/RB/S-Bahn only)
 * Regional trains have an effective average speed of ~60-70 km/h, plus ~20-25m per transfer.
 */
export function estimateRegionalTrainTime(originCity, destCity, distKm = null) {
  let d = distKm;
  if (!d) {
    const cA = resolveCoordinates(originCity);
    const cB = resolveCoordinates(destCity);
    d = cA && cB ? Math.round(haversineDistance(cA, cB) * 1.25) : 300;
  }

  // Regional train transfers: roughly 1 transfer per ~160km
  const transfers = Math.max(0, Math.floor(d / 160));
  const transferPenaltyMin = transfers * 22;
  const runningMinutes = Math.round((d / 65) * 60);
  const totalMinutes = runningMinutes + transferPenaltyMin;

  return {
    distanceKm: d,
    transfers,
    durationMinutes: totalMinutes,
    durationHoursStr: formatMinutes(totalMinutes)
  };
}

/**
 * Estimates driving time on Autobahn (average 110-120 km/h with 15min traffic buffer)
 */
export function estimateDriveTime(distKm) {
  const roadDist = Math.round(distKm * 1.15);
  const minutes = Math.round((roadDist / 110) * 60) + 15;
  return {
    roadDistanceKm: roadDist,
    durationMinutes: minutes,
    durationHoursStr: formatMinutes(minutes)
  };
}

export function formatMinutes(m) {
  const hrs = Math.floor(m / 60);
  const mins = m % 60;
  if (hrs === 0) return `${mins}m`;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

/**
 * Finds hybrid routes combining Deutschlandticket regional train legs with 1€ relocation offers
 */
export function findHybridRoutes(deals, fromCity, toCity, options = {}) {
  const cOrigin = resolveCoordinates(fromCity);
  const cDest = resolveCoordinates(toCity);

  if (!cOrigin || !cDest) {
    return {
      error: `Could not resolve geographic coordinates for "${fromCity}" or "${toCity}".`,
      routes: []
    };
  }

  const directDistance = Math.round(haversineDistance(cOrigin, cDest) * 1.25);
  const baselineDTicket = estimateRegionalTrainTime(fromCity, toCity, directDistance);

  const hybridRoutes = [];
  const maxFeederKm = options.maxFeederKm || 180;
  const onlyFaster = options.onlyFaster !== false; // default: true

  for (const deal of deals) {
    // Optional filters
    if (options.fuelOnly && !deal.inclusions?.fuelIncluded) continue;

    if (options.date) {
      const dates = deal.dates || {};
      const targetDate = options.date.trim();
      const inAvailableList = dates.availablePickupDates && dates.availablePickupDates.includes(targetDate);
      const inRange = dates.earliestDeparture && dates.latestPickup &&
        targetDate >= dates.earliestDeparture && targetDate <= dates.latestPickup;
      if (!inAvailableList && !inRange) continue;
    }

    const dealOrigCity = deal.origin?.city || "";
    const dealDestCity = deal.destination?.city || "";

    const cDealOrig = resolveCoordinates(dealOrigCity, deal.origin?.coordinates);
    const cDealDest = resolveCoordinates(dealDestCity, deal.destination?.coordinates);

    if (!cDealOrig || !cDealDest) continue;

    // Leg 1: From user origin to relocation pickup station
    const leg1Dist = Math.round(haversineDistance(cOrigin, cDealOrig) * 1.25);
    if (leg1Dist > maxFeederKm) continue;

    // Leg 3: From relocation drop-off station to user final destination
    const leg3Dist = Math.round(haversineDistance(cDealDest, cDest) * 1.25);
    if (leg3Dist > maxFeederKm) continue;

    // Direction check: ensure the drop-off is significantly closer to final destination than origin
    const distDealDestToFinal = haversineDistance(cDealDest, cDest);
    const distOriginToFinal = haversineDistance(cOrigin, cDest);
    if (distOriginToFinal > 80 && distDealDestToFinal >= distOriginToFinal * 0.85) {
      // The relocation does not advance the traveler towards their destination
      continue;
    }

    // Leg 2: Relocation drive
    const includedKm = typeof deal.inclusions?.freeKm === "number" ? deal.inclusions.freeKm : null;
    const dealDriveDist = includedKm && includedKm > 50
      ? includedKm
      : Math.round(haversineDistance(cDealOrig, cDealDest) * 1.25);

    if (dealDriveDist < 40) continue; // skip trivial local shuffles

    const driveEst = estimateDriveTime(dealDriveDist);

    // Leg 1 transit time (0€ with D-Ticket)
    const leg1Time = leg1Dist < 12
      ? 15 // local city transit / S-Bahn
      : estimateRegionalTrainTime(fromCity, dealOrigCity, leg1Dist).durationMinutes;

    // Leg 3 transit time (0€ with D-Ticket)
    const leg3Time = leg3Dist < 12
      ? 15 // local city transit / S-Bahn
      : estimateRegionalTrainTime(dealDestCity, toCity, leg3Dist).durationMinutes;

    // Pickup & Drop-off buffer (inspection, key exchange): 20 min pickup, 15 min return
    const bufferMin = 35;

    const totalHybridMinutes = leg1Time + driveEst.durationMinutes + leg3Time + bufferMin;
    const timeSavedMinutes = baselineDTicket.durationMinutes - totalHybridMinutes;

    if (onlyFaster && timeSavedMinutes <= 0) continue;

    // Out-of-pocket costs
    const rentalCost = deal.price.amount || 1.0;
    const fuelCost = deal.inclusions?.fuelIncluded
      ? 0.0
      : Math.round((dealDriveDist / 100) * 7.5 * 1.8); // ~7.5L/100km @ 1.80€/L

    const totalExtraCost = rentalCost + fuelCost;

    hybridRoutes.push({
      deal,
      timeSavedMinutes,
      isFaster: timeSavedMinutes > 0,
      baselineDTicket,
      totalHybridMinutes,
      totalHybridDurationStr: formatMinutes(totalHybridMinutes),
      timeSavedStr: timeSavedMinutes > 0 ? formatMinutes(timeSavedMinutes) : `-${formatMinutes(Math.abs(timeSavedMinutes))}`,
      costs: {
        rentalEur: rentalCost,
        fuelEur: fuelCost,
        totalEur: totalExtraCost,
        fuelIncluded: Boolean(deal.inclusions?.fuelIncluded)
      },
      legs: [
        {
          type: "train",
          label: "D-Ticket Regional Transit",
          from: fromCity,
          to: `${dealOrigCity} (${deal.origin.street || "Station"})`,
          distanceKm: leg1Dist,
          durationStr: formatMinutes(leg1Time),
          costStr: "0.00 € (D-Ticket)"
        },
        {
          type: "drive",
          label: `1€ Relocation [${deal.providerName}] - ${deal.vehicle.model}`,
          from: dealOrigCity,
          to: dealDestCity,
          distanceKm: dealDriveDist,
          durationStr: driveEst.durationHoursStr,
          costStr: deal.inclusions?.fuelIncluded
            ? `${rentalCost.toFixed(2)} € (Fuel included!)`
            : `${rentalCost.toFixed(2)} € (+~${fuelCost}€ fuel)`
        },
        {
          type: "train",
          label: "D-Ticket Regional Transit",
          from: `${dealDestCity} (${deal.destination.street || "Drop-off"})`,
          to: toCity,
          distanceKm: leg3Dist,
          durationStr: formatMinutes(leg3Time),
          costStr: "0.00 € (D-Ticket)"
        }
      ]
    });
  }

  // Deduplicate equivalent route legs if identical provider and cities
  const seenKey = new Set();
  const dedupedRoutes = [];
  for (const r of hybridRoutes) {
    const key = `${r.deal.provider}_${r.deal.origin.city}_${r.deal.destination.city}_${r.costs.fuelIncluded}_${r.deal.vehicle.category}`;
    if (!seenKey.has(key)) {
      seenKey.add(key);
      dedupedRoutes.push(r);
    }
  }

  // Sort by time saved descending (fastest options first)
  dedupedRoutes.sort((a, b) => b.timeSavedMinutes - a.timeSavedMinutes);

  return {
    origin: fromCity,
    destination: toCity,
    directDistanceKm: directDistance,
    baselineDTicket,
    routes: dedupedRoutes
  };
}
