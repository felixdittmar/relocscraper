/**
 * Terminal UI, Colors, and Table Formatters
 */

const ANSI = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  italic: "\x1b[3m",
  underline: "\x1b[4m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  bgBlue: "\x1b[44m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m"
};

export const colors = {
  bold: (s) => `${ANSI.bold}${s}${ANSI.reset}`,
  dim: (s) => `${ANSI.dim}${s}${ANSI.reset}`,
  green: (s) => `${ANSI.green}${s}${ANSI.reset}`,
  yellow: (s) => `${ANSI.yellow}${s}${ANSI.reset}`,
  blue: (s) => `${ANSI.blue}${s}${ANSI.reset}`,
  magenta: (s) => `${ANSI.magenta}${s}${ANSI.reset}`,
  cyan: (s) => `${ANSI.cyan}${s}${ANSI.reset}`,
  red: (s) => `${ANSI.red}${s}${ANSI.reset}`,
  priceBadge: (amount, currency = "EUR") => {
    if (amount === 0) return `${ANSI.green}${ANSI.bold}0.00 € (FREE)${ANSI.reset}`;
    if (amount <= 1.0) return `${ANSI.green}${ANSI.bold}${amount.toFixed(2)} ${currency}${ANSI.reset}`;
    return `${ANSI.yellow}${amount.toFixed(2)} ${currency}${ANSI.reset}`;
  },
  providerBadge: (name) => {
    switch ((name || "").toLowerCase()) {
      case "movacar": return `${ANSI.blue}[Movacar]${ANSI.reset}`;
      case "imoova": return `${ANSI.magenta}[Imoova]${ANSI.reset}`;
      case "driiveme": return `${ANSI.cyan}[Driiveme]${ANSI.reset}`;
      case "indie campers": return `${ANSI.yellow}[Indie Campers]${ANSI.reset}`;
      case "carl und carla": return `${ANSI.green}[Carl&Carla]${ANSI.reset}`;
      default: return `[${name}]`;
    }
  },
  categoryBadge: (cat) => {
    switch ((cat || "").toLowerCase()) {
      case "campervan": return `${ANSI.magenta}🚐 Camper${ANSI.reset}`;
      case "motorhome": return `${ANSI.magenta}🏠 Motorhome${ANSI.reset}`;
      case "van": return `${ANSI.cyan}📦 Van${ANSI.reset}`;
      case "car": return `${ANSI.blue}🚗 Car${ANSI.reset}`;
      default: return "🚘 Vehicle";
    }
  }
};

/**
 * Truncate string to width with ellipsis
 */
function truncate(str, width) {
  const s = String(str || "");
  if (s.length <= width) return s.padEnd(width);
  return s.slice(0, Math.max(0, width - 1)) + "…";
}

/**
 * Strips ANSI codes to compute true character length
 */
function stripAnsi(str) {
  return String(str).replace(/\x1b\[[0-9;]*m/g, "");
}

/**
 * Pad a string that may contain ANSI escape codes
 */
function padWithAnsi(str, targetWidth) {
  const len = stripAnsi(str).length;
  const pad = Math.max(0, targetWidth - len);
  return str + " ".repeat(pad);
}

/**
 * Formats a terminal table of relocation deals
 */
export function formatTable(deals, options = {}) {
  if (!deals || deals.length === 0) {
    return `${colors.yellow("No relocation deals found matching your criteria.")}\n`;
  }

  const columns = [
    { key: "id", title: "ID", width: 14 },
    { key: "provider", title: "Provider", width: 14 },
    { key: "route", title: "Route (Origin → Destination)", width: 34 },
    { key: "vehicle", title: "Vehicle / Category", width: 22 },
    { key: "dates", title: "Dates / Days", width: 22 },
    { key: "seats", title: "Seats", width: 6 },
    { key: "price", title: "Price", width: 10 },
    { key: "perks", title: "Perks", width: 15 }
  ];

  // Top border
  const topBorder = "┌" + columns.map(c => "─".repeat(c.width + 2)).join("┬") + "┐";
  const headerLine = "│" + columns.map(c => ` ${colors.bold(c.title.padEnd(c.width))} `).join("│") + "│";
  const sepBorder = "├" + columns.map(c => "─".repeat(c.width + 2)).join("┼") + "┤";
  const bottomBorder = "└" + columns.map(c => "─".repeat(c.width + 2)).join("┴") + "┘";

  const rows = [];
  rows.push(topBorder);
  rows.push(headerLine);
  rows.push(sepBorder);

  for (const deal of deals) {
    const idShort = deal.id.length > 14 ? deal.id.slice(0, 13) + "…" : deal.id;
    const providerStr = colors.providerBadge(deal.providerName);

    const orig = `${deal.origin.city}${deal.origin.countryCode ? " (" + deal.origin.countryCode + ")" : ""}`;
    const dest = `${deal.destination.city}${deal.destination.countryCode ? " (" + deal.destination.countryCode + ")" : ""}`;
    const routeRaw = `${orig} → ${dest}`;
    const routeTrunc = truncate(routeRaw, 34);

    const vehRaw = `${deal.vehicle.model || "Vehicle"}`;
    const vehTrunc = truncate(vehRaw, 22);

    let datesRaw = "";
    if (deal.dates.earliestDeparture && deal.dates.latestPickup && deal.dates.earliestDeparture !== deal.dates.latestPickup) {
      const d1 = String(deal.dates.earliestDeparture).split("T")[0];
      const d2 = String(deal.dates.latestPickup).split("T")[0];
      const d1Short = d1.length >= 10 ? d1.slice(5) : d1;
      const d2Short = d2.length >= 10 ? d2.slice(5) : d2;
      datesRaw = `${d1Short} → ${d2Short} (${deal.dates.durationDays || 1}d)`;
    } else if (deal.dates.earliestDeparture) {
      const d1 = String(deal.dates.earliestDeparture).split("T")[0];
      datesRaw = `${d1} (${deal.dates.durationDays || 1}d)`;
    } else if (deal.dates.pickupRange) {
      datesRaw = `${deal.dates.pickupRange} (${deal.dates.durationDays || 1}d)`;
    } else if (deal.dates.dateHint) {
      datesRaw = deal.dates.dateHint;
    } else {
      datesRaw = `${deal.dates.durationDays || 1} days`;
    }
    const datesTrunc = truncate(datesRaw, 22);

    const seatsStr = String(deal.vehicle.seats || 2);
    const priceStr = colors.priceBadge(deal.price.amount, deal.price.currency);

    const perksList = [];
    if (deal.inclusions?.freeKm) perksList.push(`${deal.inclusions.freeKm}km`);
    if (deal.inclusions?.fuelIncluded) perksList.push("⛽ Fuel");
    if (deal.inclusions?.ferryIncluded) perksList.push("🚢 Ferry");
    const perksStr = truncate(perksList.join(" ") || "Standard", 15);

    const rowCells = [
      padWithAnsi(idShort, 14),
      padWithAnsi(providerStr, 14),
      padWithAnsi(routeTrunc, 34),
      padWithAnsi(vehTrunc, 22),
      padWithAnsi(datesTrunc, 22),
      padWithAnsi(seatsStr, 6),
      padWithAnsi(priceStr, 10),
      padWithAnsi(perksStr, 15)
    ];

    rows.push("│" + rowCells.map(c => ` ${c} `).join("│") + "│");
  }

  rows.push(bottomBorder);
  return rows.join("\n") + "\n";
}

/**
 * Formats a single detailed deal card
 */
export function formatDealDetail(deal) {
  const lines = [];
  const divider = "═".repeat(60);
  lines.push(divider);
  lines.push(colors.bold(`🚘 RELOCATION OFFER: ${deal.id}`));
  lines.push(divider);
  lines.push(`${colors.bold("Provider:")}      ${deal.providerName} ${deal.fleetPartner ? `(${deal.fleetPartner})` : ""}`);
  lines.push(`${colors.bold("Origin:")}        ${deal.origin.city}, ${deal.origin.countryName || deal.origin.countryCode}`);
  if (deal.origin.street || deal.origin.postalCode) {
    lines.push(`               ${deal.origin.street || ""} ${deal.origin.postalCode || ""}`);
  }
  lines.push(`${colors.bold("Destination:")}   ${deal.destination.city}, ${deal.destination.countryName || deal.destination.countryCode}`);
  if (deal.destination.street || deal.destination.postalCode) {
    lines.push(`               ${deal.destination.street || ""} ${deal.destination.postalCode || ""}`);
  }
  const transStr = deal.vehicle.transmission ? ` (${deal.vehicle.transmission})` : "";
  lines.push(`${colors.bold("Vehicle:")}       ${deal.vehicle.model} [${colors.categoryBadge(deal.vehicle.category)}]${transStr}`);
  lines.push(`${colors.bold("Capacity:")}      ${deal.vehicle.seats || 2} Seats ${deal.vehicle.sleeping ? `(${deal.vehicle.sleeping} Berths)` : ""}`);
  lines.push(`${colors.bold("Trip Duration:")} ${deal.dates.durationDays} days (${deal.dates.durationHours || deal.dates.durationDays * 24} hours)`);
  const pickupWindow = deal.dates.pickupRange || (deal.dates.earliestDeparture ? String(deal.dates.earliestDeparture).split("T")[0] : "Flexible");
  lines.push(`${colors.bold("Pickup Window:")} ${pickupWindow}`);
  if (deal.dates.availablePickupDates && deal.dates.availablePickupDates.length > 1) {
    lines.push(`               Available Days: ${deal.dates.availablePickupDates.join(", ")}`);
  }
  lines.push(`${colors.bold("Deliver By:")}    ${deal.dates.deliverBy ? String(deal.dates.deliverBy).split("T")[0] : "Standard window"}`);
  lines.push(`${colors.bold("Price:")}         ${colors.priceBadge(deal.price.amount, deal.price.currency)} (${deal.price.rateType === "per_day" ? "per day" : "total base rate"})`);
  lines.push(`${colors.bold("Free Km:")}       ${deal.inclusions?.freeKm ? deal.inclusions.freeKm + " km included" : "Standard allowance"}`);
  if (deal.inclusions?.extraKmCostEuro) {
    lines.push(`${colors.bold("Extra Km:")}      ${deal.inclusions.extraKmCostEuro.toFixed(2)} €/km`);
  }
  if (deal.inclusions?.fuelNotes) {
    lines.push(`${colors.bold("Fuel Policy:")}   ${deal.inclusions.fuelNotes}`);
  } else if (deal.inclusions?.fuelIncluded) {
    lines.push(`${colors.bold("Fuel Perk:")}     ${colors.green("1st tank / fuel reimbursement included!")}`);
  } else {
    lines.push(`${colors.bold("Fuel Policy:")}   Driver pays fuel (standard return rules apply)`);
  }
  if (deal.inclusions?.ferryIncluded || deal.inclusions?.ferryNotes) {
    lines.push(`${colors.bold("Ferry Perk:")}    ${deal.inclusions.ferryNotes || "Ferry ticket reimbursement provided!"}`);
  }
  if (deal.liveTelematics?.matchedVehicle) {
    const mv = deal.liveTelematics.matchedVehicle;
    lines.push(divider);
    const title = deal.liveTelematics.verifiedByUser
      ? "🚘 VERIFIED VEHICLE TELEMATICS (Cross-Referenced via MILES App):"
      : "📡 LIVE MILES TELEMATICS (Cross-Referenced):";
    lines.push(colors.bold(title));
    const modelStr = mv.type || deal.vehicle.model;
    const plateStr = mv.licensePlate ? ` [${colors.cyan(mv.licensePlate)}]` : "";
    const colorStr = mv.color ? ` (${mv.color})` : "";
    lines.push(`  • Exact Vehicle:   ${colors.bold(modelStr)}${plateStr}${colorStr}`);
    if (mv.distMeters > 0) lines.push(`  • Location:        ~${mv.distMeters}m from pickup pin`);
    if (mv.remainingRange || mv.fuelPct) {
      const fuelInfo = [mv.fuelPct, mv.remainingRange ? `(${mv.remainingRange} range)` : ""].filter(Boolean).join(" ");
      lines.push(`  • Verified Fuel:   ${colors.yellow(fuelInfo)}`);
    }
    lines.push(`  • Transmission:    Automatic`);
    if (mv.isElectric) lines.push(`  • Powertrain:      Electric (EV)`);
    if (mv.imageUrl) lines.push(`  • Vehicle Photo:   ${colors.blue(mv.imageUrl)}`);
  } else if (deal.fleetPartner === "MILES") {
    lines.push(divider);
    lines.push(colors.bold("📱 MILES APP CROSS-REFERENCE (Ground Truth):"));
    lines.push(`  • Pickup Address:  ${deal.origin.street || "On-Street Pin"}, ${deal.origin.city}`);
    lines.push(`  • App Verification:Open your MILES app map at this address to see your exact`);
    lines.push(`                     vehicle, live fuel %, and plate (e.g. VW Golf B-MI 1234).`);
    lines.push(`  • Telematics Note: MILES restricts live fleet data behind authenticated sessions.`);
    lines.push(`                     Pass your verified stats: --range 320 --fuel 50% --car "VW Golf"`);
  } else if (deal.metadata?.crossReferenceHint) {
    lines.push(`${colors.bold("Pro-Tip:")}       ${colors.cyan(deal.metadata.crossReferenceHint)}`);
  }
  lines.push(`${colors.bold("Booking Link:")}  ${colors.blue(deal.bookingUrl)}`);
  lines.push(divider);
  return lines.join("\n");
}

/**
 * Formats statistics summary
 */
export function formatStats(stats) {
  const lines = [];
  lines.push(colors.bold("📊 EUROPEAN RENTAL RELOCATIONS SUMMARY"));
  lines.push("─".repeat(50));
  lines.push(`${colors.bold("Total Available Relocations:")} ${colors.green(stats.total)}`);
  lines.push(`${colors.bold("Free (0.00 €) Trips:")}        ${colors.green(stats.freeDealsCount)}`);
  lines.push(`${colors.bold("1 Euro Trips:")}               ${colors.green(stats.euro1DealsCount)}`);
  lines.push(`${colors.bold("Fuel Included / Allowance:")}  ${colors.yellow(stats.fuelIncludedCount)}`);
  lines.push(`${colors.bold("Ferry Reimbursed:")}           ${colors.cyan(stats.ferryIncludedCount)}`);
  lines.push(`${colors.bold("Average Trip Duration:")}      ${stats.avgDurationDays} days`);

  lines.push("\n" + colors.bold("📡 Breakdown by Provider:"));
  for (const [p, count] of Object.entries(stats.byProvider)) {
    lines.push(`  • ${colors.providerBadge(p)}: ${colors.bold(count)}`);
  }

  lines.push("\n" + colors.bold("🚙 Breakdown by Vehicle Category:"));
  for (const [v, count] of Object.entries(stats.byVehicleType)) {
    lines.push(`  • ${colors.categoryBadge(v)}: ${count}`);
  }

  lines.push("\n" + colors.bold("📍 Top Departure Countries:"));
  const sortedOrig = Object.entries(stats.byCountry.origin).sort((a, b) => b[1] - a[1]).slice(0, 5);
  for (const [c, count] of sortedOrig) {
    lines.push(`  • ${c}: ${count}`);
  }

  lines.push("\n" + colors.bold("🏁 Top Destination Countries:"));
  const sortedDest = Object.entries(stats.byCountry.destination).sort((a, b) => b[1] - a[1]).slice(0, 5);
  for (const [c, count] of sortedDest) {
    lines.push(`  • ${c}: ${count}`);
  }

  lines.push("\n" + colors.bold("⭐ Popular Corridors:"));
  const topCorridors = Object.entries(stats.topRoutes).sort((a, b) => b[1] - a[1]).slice(0, 8);
  for (const [route, count] of topCorridors) {
    lines.push(`  • ${colors.cyan(route)}: ${count} vehicle${count > 1 ? "s" : ""}`);
  }

  return lines.join("\n");
}

/**
 * Exports to CSV string
 */
export function exportToCsv(deals) {
  const headers = [
    "ID",
    "Provider",
    "Origin_City",
    "Origin_Country",
    "Destination_City",
    "Destination_Country",
    "Vehicle_Model",
    "Vehicle_Category",
    "Seats",
    "Duration_Days",
    "Earliest_Departure",
    "Deliver_By",
    "Price_Amount",
    "Price_Currency",
    "Free_Km",
    "Fuel_Included",
    "Ferry_Included",
    "Booking_URL"
  ];

  const escape = (v) => {
    const s = String(v ?? "");
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const rows = [headers.join(",")];
  for (const d of deals) {
    rows.push([
      escape(d.id),
      escape(d.providerName),
      escape(d.origin.city),
      escape(d.origin.countryCode),
      escape(d.destination.city),
      escape(d.destination.countryCode),
      escape(d.vehicle.model),
      escape(d.vehicle.category),
      escape(d.vehicle.seats),
      escape(d.dates.durationDays),
      escape(d.dates.earliestDeparture),
      escape(d.dates.deliverBy),
      escape(d.price.amount),
      escape(d.price.currency),
      escape(d.inclusions?.freeKm),
      escape(d.inclusions?.fuelIncluded ? "Yes" : "No"),
      escape(d.inclusions?.ferryIncluded ? "Yes" : "No"),
      escape(d.bookingUrl)
    ].join(","));
  }

  return rows.join("\n");
}

/**
 * Exports to Markdown report
 */
export function exportToMarkdown(deals, title = "European Rental Relocations Digest") {
  const lines = [];
  lines.push(`# ${title}`);
  lines.push(`\n*Generated on: ${new Date().toISOString()}*\n`);
  lines.push(`**Total Deals:** ${deals.length}\n`);

  lines.push("| ID | Provider | Route | Vehicle | Days | Price | Inclusions | Booking |");
  lines.push("|---|---|---|---|---|---|---|---|");

  for (const d of deals) {
    const route = `${d.origin.city} (${d.origin.countryCode || ""}) → ${d.destination.city} (${d.destination.countryCode || ""})`;
    const perks = [];
    if (d.inclusions?.freeKm) perks.push(`${d.inclusions.freeKm} km`);
    if (d.inclusions?.fuelIncluded) perks.push("Fuel included");
    if (d.inclusions?.ferryIncluded) perks.push("Ferry reimbursed");

    lines.push(
      `| \`${d.id}\` | ${d.providerName} | ${route} | ${d.vehicle.model} (${d.vehicle.category}) | ${d.dates.durationDays}d | ${d.price.amount} ${d.price.currency} | ${perks.join(", ") || "-"} | [Book Now](${d.bookingUrl}) |`
    );
  }

  return lines.join("\n");
}

/**
 * Formats Deutschlandticket + Relocation Hybrid Route Planner output
 */
export function formatRouteResults(routeData, options = {}) {
  const lines = [];
  const orig = routeData.origin;
  const dest = routeData.destination;
  const baseline = routeData.baselineDTicket;

  lines.push(colors.bold("\n🚆 DEUTSCHLANDTICKET + 🚗 1€ RELOCATION HYBRID ROUTE PLANNER"));
  lines.push("─".repeat(70));
  lines.push(`• Journey:              ${colors.cyan(orig)} → ${colors.cyan(dest)} (~${routeData.directDistanceKm} km direct)`);
  if (baseline) {
    const timetableInfo = baseline.source === "real_timetable" && baseline.serviceSummary
      ? `(Real timetable: ${colors.green(baseline.serviceSummary)}, ${baseline.transfers} transfer${baseline.transfers === 1 ? "" : "s"}, RE/RB only, 0.00 €)`
      : `(${baseline.transfers} transfer${baseline.transfers === 1 ? "" : "s"}, RE/RB trains only, 0.00 €)`;
    lines.push(`• D-Ticket Baseline:    ${colors.yellow(baseline.durationHoursStr)} ${timetableInfo}`);
  }
  lines.push("─".repeat(70));

  if (routeData.error) {
    lines.push(colors.red(`\n✖ ${routeData.error}\n`));
    return lines.join("\n");
  }

  const routes = routeData.routes || [];
  if (routes.length === 0) {
    lines.push(colors.yellow(`\nNo faster hybrid routes found currently for ${orig} → ${dest}.`));
    lines.push(colors.dim("Tips:"));
    lines.push(colors.dim("  • Run 'reloc scan' to ensure you have the freshest relocation offers."));
    lines.push(colors.dim("  • Increase feeder radius with '--max-feeder 220'."));
    lines.push(colors.dim("  • Or pass '--all' to inspect all hybrid combinations even if slower.\n"));
    return lines.join("\n");
  }

  lines.push(colors.bold(`\n⚡ Found ${colors.green(routes.length)} Hybrid Route Itinerar${routes.length === 1 ? "y" : "ies"} Faster Than D-Ticket:\n`));

  const limit = options.limit || 5;
  const subset = routes.slice(0, limit);

  subset.forEach((r, idx) => {
    const d = r.deal;
    const timeSavedBadge = r.timeSavedMinutes > 0
      ? colors.green(`⚡ SAVE ${r.timeSavedStr}`)
      : colors.yellow(`${r.timeSavedStr}`);

    const fuelBadge = r.costs.fuelIncluded
      ? colors.green("FREE (Fuel included!)")
      : r.costs.isMilesOnStreet
        ? r.costs.liveRangeKm != null
          ? r.costs.fuelEur > 0
            ? `~${r.costs.fuelEur} € fuel top-up (starts with live ${r.costs.liveFuelPct || ""} ${r.costs.liveRangeKm}km)`
            : `0.00 € (covered by live ${r.costs.liveRangeKm}km starting range)`
          : r.costs.fuelEur > 0
            ? `~${r.costs.fuelEur} € fuel top-up (starts with current on-street tank)`
            : `0.00 € (within starting on-street tank range)`
        : `~${r.costs.fuelEur} € fuel`;

    lines.push(`${colors.bold(`[Option #${idx + 1}]`)} ${timeSavedBadge}  |  Total Time: ${colors.bold(r.totalHybridDurationStr)}  |  Total Out-Of-Pocket: ${colors.priceBadge(r.costs.totalEur)}`);
    const partnerBadge = d.fleetPartner ? ` (${d.fleetPartner})` : "";
    const vehicleDisplay = r.costs.liveModel
      ? `${r.costs.liveModel} [${colors.cyan(r.costs.livePlate)}]`
      : d.vehicle.model;
    lines.push(`  • Vehicle:      ${vehicleDisplay}${partnerBadge} [${colors.providerBadge(d.providerName)}]`);
    if (d.dates?.pickupRange || d.dates?.earliestDeparture) {
      lines.push(`  • Pickup Dates: ${colors.cyan(d.dates.pickupRange || d.dates.earliestDeparture)} (${d.dates.durationDays || 1}d duration)`);
    }
    lines.push(`  • Costs:        ${r.costs.rentalEur.toFixed(2)} € rental + ${fuelBadge} (Regional transit covered by D-Ticket)`);
    lines.push(`  • Deal ID:      ${colors.dim(d.id)}`);
    lines.push(`  • Route Legs:`);

    r.legs.forEach((leg, legIdx) => {
      const icon = leg.type === "train" ? "🚆" : "🚗";
      lines.push(`     ${legIdx + 1}. ${icon} ${colors.bold(leg.label)}`);
      lines.push(`        From:     ${leg.from}`);
      lines.push(`        To:       ${leg.to}`);
      lines.push(`        Distance: ~${leg.distanceKm} km | Est. Time: ${leg.durationStr} | Cost: ${leg.costStr}`);
    });
    lines.push(`     ℹ Includes ~35 min buffer for vehicle pickup & drop-off inspection`);
    if (r.costs.liveDistMeters != null) {
      lines.push(`  • Live Telematics: ${colors.green(`✔ Cross-referenced in MILES app (~${r.costs.liveDistMeters}m from pickup pin)`)}`);
    } else if (d.metadata?.crossReferenceHint) {
      lines.push(`  • Pro-Tip:      ${colors.cyan(d.metadata.crossReferenceHint)}`);
    }
    lines.push(`  • Direct Link:  ${colors.blue(d.bookingUrl)}`);
    lines.push("─".repeat(70));
  });

  if (routes.length > limit) {
    lines.push(colors.dim(`Showing top ${limit} options. Use --limit ${routes.length} to see all.`));
  }

  return lines.join("\n");
}
