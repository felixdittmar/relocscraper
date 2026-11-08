/**
 * Relocation Deal Schema & European Geography Helpers
 */

export const CITY_COUNTRY_MAP = {
  // Germany
  berlin: { countryCode: "DE", countryName: "Germany" },
  hamburg: { countryCode: "DE", countryName: "Germany" },
  munich: { countryCode: "DE", countryName: "Germany" },
  muenchen: { countryCode: "DE", countryName: "Germany" },
  cologne: { countryCode: "DE", countryName: "Germany" },
  koeln: { countryCode: "DE", countryName: "Germany" },
  frankfurt: { countryCode: "DE", countryName: "Germany" },
  stuttgart: { countryCode: "DE", countryName: "Germany" },
  duesseldorf: { countryCode: "DE", countryName: "Germany" },
  dusseldorf: { countryCode: "DE", countryName: "Germany" },
  leipzig: { countryCode: "DE", countryName: "Germany" },
  dresden: { countryCode: "DE", countryName: "Germany" },
  hannover: { countryCode: "DE", countryName: "Germany" },
  nuernberg: { countryCode: "DE", countryName: "Germany" },
  nuremberg: { countryCode: "DE", countryName: "Germany" },
  bremen: { countryCode: "DE", countryName: "Germany" },
  dortmund: { countryCode: "DE", countryName: "Germany" },
  essen: { countryCode: "DE", countryName: "Germany" },
  bonn: { countryCode: "DE", countryName: "Germany" },
  karlsruhe: { countryCode: "DE", countryName: "Germany" },
  freiburg: { countryCode: "DE", countryName: "Germany" },
  chemnitz: { countryCode: "DE", countryName: "Germany" },
  aachen: { countryCode: "DE", countryName: "Germany" },
  kassel: { countryCode: "DE", countryName: "Germany" },
  bielefeld: { countryCode: "DE", countryName: "Germany" },
  osnabrueck: { countryCode: "DE", countryName: "Germany" },
  mannheim: { countryCode: "DE", countryName: "Germany" },
  augsburg: { countryCode: "DE", countryName: "Germany" },
  wiesbaden: { countryCode: "DE", countryName: "Germany" },
  mainz: { countryCode: "DE", countryName: "Germany" },
  erfurt: { countryCode: "DE", countryName: "Germany" },
  rostock: { countryCode: "DE", countryName: "Germany" },
  kiel: { countryCode: "DE", countryName: "Germany" },
  luebeck: { countryCode: "DE", countryName: "Germany" },
  potsdam: { countryCode: "DE", countryName: "Germany" },
  halle: { countryCode: "DE", countryName: "Germany" },
  magdeburg: { countryCode: "DE", countryName: "Germany" },
  leizen: { countryCode: "DE", countryName: "Germany" },
  bad_waldsee: { countryCode: "DE", countryName: "Germany" },

  // France
  paris: { countryCode: "FR", countryName: "France" },
  lyon: { countryCode: "FR", countryName: "France" },
  marseille: { countryCode: "FR", countryName: "France" },
  bordeaux: { countryCode: "FR", countryName: "France" },
  toulouse: { countryCode: "FR", countryName: "France" },
  nantes: { countryCode: "FR", countryName: "France" },
  lille: { countryCode: "FR", countryName: "France" },
  nice: { countryCode: "FR", countryName: "France" },
  strasbourg: { countryCode: "FR", countryName: "France" },
  rennes: { countryCode: "FR", countryName: "France" },
  reims: { countryCode: "FR", countryName: "France" },
  "le havre": { countryCode: "FR", countryName: "France" },
  le_havre: { countryCode: "FR", countryName: "France" },
  "saint-étienne": { countryCode: "FR", countryName: "France" },
  "saint-etienne": { countryCode: "FR", countryName: "France" },
  "saint étienne": { countryCode: "FR", countryName: "France" },
  troyes: { countryCode: "FR", countryName: "France" },
  grenoble: { countryCode: "FR", countryName: "France" },
  dijon: { countryCode: "FR", countryName: "France" },
  angers: { countryCode: "FR", countryName: "France" },
  nimes: { countryCode: "FR", countryName: "France" },
  aix_en_provence: { countryCode: "FR", countryName: "France" },
  brest: { countryCode: "FR", countryName: "France" },
  clermont_ferrand: { countryCode: "FR", countryName: "France" },
  tours: { countryCode: "FR", countryName: "France" },
  amiens: { countryCode: "FR", countryName: "France" },
  limoges: { countryCode: "FR", countryName: "France" },
  perpignan: { countryCode: "FR", countryName: "France" },
  besancon: { countryCode: "FR", countryName: "France" },
  orleans: { countryCode: "FR", countryName: "France" },
  rouen: { countryCode: "FR", countryName: "France" },
  mulhouse: { countryCode: "FR", countryName: "France" },
  caen: { countryCode: "FR", countryName: "France" },
  nancy: { countryCode: "FR", countryName: "France" },
  metz: { countryCode: "FR", countryName: "France" },
  biarritz: { countryCode: "FR", countryName: "France" },
  bastia: { countryCode: "FR", countryName: "France" },
  ajaccio: { countryCode: "FR", countryName: "France" },

  // Spain
  madrid: { countryCode: "ES", countryName: "Spain" },
  barcelona: { countryCode: "ES", countryName: "Spain" },
  viladecans: { countryCode: "ES", countryName: "Spain" },
  valencia: { countryCode: "ES", countryName: "Spain" },
  seville: { countryCode: "ES", countryName: "Spain" },
  sevilla: { countryCode: "ES", countryName: "Spain" },
  bilbao: { countryCode: "ES", countryName: "Spain" },
  malaga: { countryCode: "ES", countryName: "Spain" },
  zaragoza: { countryCode: "ES", countryName: "Spain" },
  alicante: { countryCode: "ES", countryName: "Spain" },
  tenerife: { countryCode: "ES", countryName: "Spain" },
  palma: { countryCode: "ES", countryName: "Spain" },
  "palma de mallorca": { countryCode: "ES", countryName: "Spain" },
  granada: { countryCode: "ES", countryName: "Spain" },
  cordoba: { countryCode: "ES", countryName: "Spain" },
  vigo: { countryCode: "ES", countryName: "Spain" },
  gijon: { countryCode: "ES", countryName: "Spain" },
  "san sebastian": { countryCode: "ES", countryName: "Spain" },
  santander: { countryCode: "ES", countryName: "Spain" },
  murcia: { countryCode: "ES", countryName: "Spain" },
  valladolid: { countryCode: "ES", countryName: "Spain" },

  // Portugal
  lisbon: { countryCode: "PT", countryName: "Portugal" },
  lisboa: { countryCode: "PT", countryName: "Portugal" },
  porto: { countryCode: "PT", countryName: "Portugal" },
  faro: { countryCode: "PT", countryName: "Portugal" },
  coimbra: { countryCode: "PT", countryName: "Portugal" },
  braga: { countryCode: "PT", countryName: "Portugal" },
  funchal: { countryCode: "PT", countryName: "Portugal" },

  // Italy
  rome: { countryCode: "IT", countryName: "Italy" },
  rom: { countryCode: "IT", countryName: "Italy" },
  roma: { countryCode: "IT", countryName: "Italy" },
  milan: { countryCode: "IT", countryName: "Italy" },
  milano: { countryCode: "IT", countryName: "Italy" },
  mailand: { countryCode: "IT", countryName: "Italy" },
  castellanza: { countryCode: "IT", countryName: "Italy" },
  "milan bergamo": { countryCode: "IT", countryName: "Italy" },
  bergamo: { countryCode: "IT", countryName: "Italy" },
  venice: { countryCode: "IT", countryName: "Italy" },
  venezia: { countryCode: "IT", countryName: "Italy" },
  venedig: { countryCode: "IT", countryName: "Italy" },
  florence: { countryCode: "IT", countryName: "Italy" },
  firenze: { countryCode: "IT", countryName: "Italy" },
  florenz: { countryCode: "IT", countryName: "Italy" },
  naples: { countryCode: "IT", countryName: "Italy" },
  napoli: { countryCode: "IT", countryName: "Italy" },
  neapel: { countryCode: "IT", countryName: "Italy" },
  bologna: { countryCode: "IT", countryName: "Italy" },
  turin: { countryCode: "IT", countryName: "Italy" },
  torino: { countryCode: "IT", countryName: "Italy" },
  palermo: { countryCode: "IT", countryName: "Italy" },
  genoa: { countryCode: "IT", countryName: "Italy" },
  genua: { countryCode: "IT", countryName: "Italy" },
  pisa: { countryCode: "IT", countryName: "Italy" },
  "pisa offers": { countryCode: "IT", countryName: "Italy" },
  verona: { countryCode: "IT", countryName: "Italy" },
  bari: { countryCode: "IT", countryName: "Italy" },
  catania: { countryCode: "IT", countryName: "Italy" },
  cagliari: { countryCode: "IT", countryName: "Italy" },
  olbia: { countryCode: "IT", countryName: "Italy" },

  // Austria
  vienna: { countryCode: "AT", countryName: "Austria" },
  wien: { countryCode: "AT", countryName: "Austria" },
  salzburg: { countryCode: "AT", countryName: "Austria" },
  innsbruck: { countryCode: "AT", countryName: "Austria" },
  graz: { countryCode: "AT", countryName: "Austria" },
  linz: { countryCode: "AT", countryName: "Austria" },

  // Switzerland
  zurich: { countryCode: "CH", countryName: "Switzerland" },
  zuerich: { countryCode: "CH", countryName: "Switzerland" },
  geneva: { countryCode: "CH", countryName: "Switzerland" },
  genf: { countryCode: "CH", countryName: "Switzerland" },
  meyrin: { countryCode: "CH", countryName: "Switzerland" },
  basel: { countryCode: "CH", countryName: "Switzerland" },
  bern: { countryCode: "CH", countryName: "Switzerland" },
  lausanne: { countryCode: "CH", countryName: "Switzerland" },

  // Netherlands
  amsterdam: { countryCode: "NL", countryName: "Netherlands" },
  rotterdam: { countryCode: "NL", countryName: "Netherlands" },
  utrecht: { countryCode: "NL", countryName: "Netherlands" },
  "the hague": { countryCode: "NL", countryName: "Netherlands" },
  eindhoven: { countryCode: "NL", countryName: "Netherlands" },

  // Belgium
  brussels: { countryCode: "BE", countryName: "Belgium" },
  bruxelles: { countryCode: "BE", countryName: "Belgium" },
  antwerp: { countryCode: "BE", countryName: "Belgium" },
  ghent: { countryCode: "BE", countryName: "Belgium" },
  bruges: { countryCode: "BE", countryName: "Belgium" },
  liege: { countryCode: "BE", countryName: "Belgium" },

  // United Kingdom / Ireland
  london: { countryCode: "GB", countryName: "United Kingdom" },
  manchester: { countryCode: "GB", countryName: "United Kingdom" },
  birmingham: { countryCode: "GB", countryName: "United Kingdom" },
  edinburgh: { countryCode: "GB", countryName: "United Kingdom" },
  glasgow: { countryCode: "GB", countryName: "United Kingdom" },
  bristol: { countryCode: "GB", countryName: "United Kingdom" },
  dublin: { countryCode: "IE", countryName: "Ireland" }
};

/**
 * Resolves country code and country name from city string or postal code
 */
export function resolveLocation(cityName, postalCode = "", fallbackCountry = "") {
  if (!cityName) {
    return {
      city: "Unknown",
      countryCode: fallbackCountry || "EU",
      countryName: fallbackCountry || "Europe"
    };
  }

  const cleanCity = cityName.trim();
  const normalized = stripAccents(cleanCity).toLowerCase().replace(/[-_]/g, " ").replace(/\s+offers$/, "").trim();

  // 1. Direct city match
  if (CITY_COUNTRY_MAP[normalized]) {
    return {
      city: cleanCity,
      countryCode: CITY_COUNTRY_MAP[normalized].countryCode,
      countryName: CITY_COUNTRY_MAP[normalized].countryName
    };
  }

  // 2. Partial word match
  for (const [key, info] of Object.entries(CITY_COUNTRY_MAP)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return {
        city: cleanCity,
        countryCode: info.countryCode,
        countryName: info.countryName
      };
    }
  }

  // 3. Postal code heuristics for European countries
  if (postalCode) {
    const pc = postalCode.trim();
    if (/^\d{5}$/.test(pc)) {
      // 5-digit postal code (Germany, France, Spain, Italy)
      if (pc.startsWith("0") || pc.startsWith("1") || pc.startsWith("2") || pc.startsWith("3") || pc.startsWith("4") || pc.startsWith("5") || pc.startsWith("6") || pc.startsWith("7") || pc.startsWith("8") || pc.startsWith("9")) {
        // Leave to fallback if city not resolved
      }
    } else if (/^\d{4}-\d{3}$/.test(pc)) {
      // Portugal 4+3 format (e.g. 1000-001)
      return { city: cleanCity, countryCode: "PT", countryName: "Portugal" };
    }
  }

  return {
    city: cleanCity,
    countryCode: fallbackCountry || "EU",
    countryName: fallbackCountry || "Europe"
  };
}

/**
 * Decodes HTML entities into normal text
 */
export function decodeHtmlEntities(str) {
  if (!str) return "";
  return String(str)
    .replace(/&#x20;/g, " ")
    .replace(/&#x00B3;/g, "³")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Strips diacritics / accents for robust matching (e.g. València -> Valencia, München -> Munchen)
 */
export function stripAccents(str) {
  if (!str) return "";
  return String(str).normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * Normalizes vehicle category to campervan | van | car | motorhome | other
 */
export function normalizeVehicleCategory(rawCategory = "", rawModel = "") {
  const text = `${rawCategory} ${rawModel}`.toLowerCase();

  if (
    text.includes("camper") ||
    text.includes("poptop") ||
    text.includes("nomad") ||
    text.includes("atlas") ||
    text.includes("california") ||
    text.includes("nugget") ||
    text.includes("marco polo") ||
    text.includes("active plus") ||
    text.includes("roadsurfer") ||
    text.includes("wohnmobil")
  ) {
    return "campervan";
  }

  if (
    text.includes("motorhome") ||
    text.includes("alcove") ||
    text.includes("integrated") ||
    text.includes("semi-integrated") ||
    text.includes("teilintegriert")
  ) {
    return "motorhome";
  }

  if (
    text.includes("transporter") ||
    text.includes("sprinter") ||
    text.includes("crafter") ||
    text.includes("master") ||
    text.includes("movano") ||
    text.includes("transit") ||
    text.includes("iveco") ||
    text.includes("daily") ||
    text.includes("ducato") ||
    text.includes("boxer") ||
    text.includes("jumper") ||
    text.includes("carl") ||
    text.includes("carlos") ||
    text.includes("carla") ||
    text.includes("nutzfahrzeug") ||
    text.includes("fourgon") ||
    text.includes("utilitaire") ||
    text.includes("van") ||
    text.includes("6m³") ||
    text.includes("12m³") ||
    text.includes("20m³") ||
    text.includes("cargo")
  ) {
    return "van";
  }

  if (
    text.includes("car") ||
    text.includes("pkw") ||
    text.includes("voiture") ||
    text.includes("sedan") ||
    text.includes("hatchback") ||
    text.includes("suv") ||
    text.includes("kombi") ||
    text.includes("golf") ||
    text.includes("clio") ||
    text.includes("corsa") ||
    text.includes("polo") ||
    text.includes("berline") ||
    text.includes("citadine")
  ) {
    return "car";
  }

  return "other";
}

/**
 * Creates a unique reproducible ID for a relocation deal
 */
export function generateDealId(provider, originCity, destCity, vehicleModel, dateHint = "") {
  const norm = (s) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const p = norm(provider);
  const o = norm(originCity);
  const d = norm(destCity);
  const v = norm(vehicleModel).slice(0, 15);
  const dt = norm(dateHint).slice(0, 10);
  return `${p}_${o}_to_${d}_${v}${dt ? "_" + dt : ""}`;
}
