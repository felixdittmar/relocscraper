#!/usr/bin/env node

/**
 * Rental Relocations Scraper & Explorer CLI
 * Supports: indiecampers.com, movacar.de, driiveme.com, imoova.com, carlundcarla.de
 */

import { RelocEngine } from "../lib/engine.mjs";
import { loadConfig } from "../lib/config.mjs";
import { loadRelocations, loadProviderCache } from "../lib/storage.mjs";
import {
  colors,
  formatTable,
  formatDealDetail,
  formatStats,
  exportToCsv,
  exportToMarkdown
} from "../lib/formatter.mjs";
import fs from "fs/promises";
import path from "path";

const args = process.argv.slice(2);
const command = args[0] ? args[0].toLowerCase() : "help";

function parseFlags(argv) {
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
    }
  }
  return flags;
}

const flags = parseFlags(args.slice(1));

async function main() {
  const engine = new RelocEngine();
  const config = await loadConfig();

  switch (command) {
    case "scan": {
      console.log(colors.bold("\n🚀 Scraping European vehicle rental relocations..."));
      console.log(colors.dim("Target platforms: Indie Campers, Movacar (incl. Carl und Carla fleet), Driiveme, Imoova\n"));

      const startTime = Date.now();
      const providersFilter = flags.provider ? [flags.provider] : null;

      const result = await engine.scanAll({
        providers: providersFilter,
        timeout: 18000
      });

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

      console.log(colors.bold("📡 Scrape Status per Provider:"));
      for (const [id, stat] of Object.entries(result.stats)) {
        if (stat.status === "ok") {
          console.log(`  ${colors.green("✔")} ${stat.name}: ${colors.bold(stat.count)} relocations found`);
        } else {
          const cachedNote = stat.cachedFallback ? ` ${colors.yellow("(using cached: " + stat.count + ")")}` : "";
          console.log(`  ${colors.red("✖")} ${stat.name}: Failed (${stat.error})${cachedNote}`);
        }
      }

      console.log(
        `\n${colors.bold("Total:")} ${colors.green(result.deals.length)} deals collected in ${elapsed}s.`
      );
      console.log(colors.dim("Run 'reloc display' or 'reloc filter' to view available routes.\n"));
      break;
    }

    case "display":
    case "list": {
      let data = await loadRelocations();
      let deals = data.deals || [];

      if (deals.length === 0) {
        console.log(colors.yellow("No saved deals found. Running automatic scan first..."));
        const scanRes = await engine.scanAll();
        deals = scanRes.deals;
      }

      // Check for inline filters
      const filtered = engine.filterDeals(deals, {
        origin: flags.origin,
        destination: flags.destination || flags.dest,
        provider: flags.provider,
        vehicleType: flags.vehicle || flags.type,
        minSeats: flags.seats ? parseInt(flags.seats, 10) : undefined,
        maxPrice: flags["max-price"] ? parseFloat(flags["max-price"]) : undefined,
        freeOnly: flags.free,
        crossBorder: flags["cross-border"],
        fuelIncluded: flags.fuel,
        ferryIncluded: flags.ferry
      });

      const sorted = engine.sortDeals(
        filtered,
        flags["sort-by"] || flags.sort || "date",
        flags.order || "asc"
      );

      const limit = flags.limit ? parseInt(flags.limit, 10) : 50;
      const displaySubset = sorted.slice(0, limit);

      console.log(
        `\n${colors.bold("Showing")} ${colors.green(displaySubset.length)} of ${colors.bold(deals.length)} relocations:`
      );
      console.log(formatTable(displaySubset));

      if (sorted.length > limit) {
        console.log(colors.dim(`Use --limit ${sorted.length} to display all results.`));
      }
      break;
    }

    case "filter": {
      let data = await loadRelocations();
      let deals = data.deals || [];
      if (deals.length === 0) {
        const scanRes = await engine.scanAll();
        deals = scanRes.deals;
      }

      const positionalOrigin = args[1] && !args[1].startsWith("--") ? args[1] : undefined;

      const filtered = engine.filterDeals(deals, {
        origin: flags.origin || positionalOrigin,
        destination: flags.destination || flags.dest,
        provider: flags.provider,
        vehicleType: flags.vehicle || flags.type,
        minSeats: flags.seats ? parseInt(flags.seats, 10) : undefined,
        maxPrice: flags["max-price"] ? parseFloat(flags["max-price"]) : undefined,
        freeOnly: flags.free,
        crossBorder: flags["cross-border"],
        fuelIncluded: flags.fuel,
        ferryIncluded: flags.ferry
      });

      const sorted = engine.sortDeals(
        filtered,
        flags["sort-by"] || flags.sort || "date",
        flags.order || "asc"
      );

      console.log(
        `\n${colors.bold("Filtered Relocations")} (${colors.green(sorted.length)} matches):`
      );
      console.log(formatTable(sorted.slice(0, flags.limit ? parseInt(flags.limit, 10) : 50)));
      break;
    }

    case "sort": {
      let data = await loadRelocations();
      let deals = data.deals || [];
      if (deals.length === 0) {
        const scanRes = await engine.scanAll();
        deals = scanRes.deals;
      }

      const sortBy = (args[1] && !args[1].startsWith("--") ? args[1] : null) || flags["by"] || flags["sort-by"] || flags.sort || "price";
      const order = (args[2] && !args[2].startsWith("--") ? args[2] : null) || flags["order"] || "asc";

      const sorted = engine.sortDeals(deals, sortBy, order);
      console.log(
        `\n${colors.bold("Sorted by")} ${colors.cyan(sortBy)} (${colors.dim(order)}):`
      );
      console.log(formatTable(sorted.slice(0, flags.limit ? parseInt(flags.limit, 10) : 50)));
      break;
    }

    case "detail": {
      const id = args[1];
      if (!id) {
        console.error(colors.red("Error: Please provide a deal ID. Example: reloc detail movacar_12345"));
        process.exit(1);
      }

      const data = await loadRelocations();
      const deal = (data.deals || []).find(d => d.id.toLowerCase() === id.toLowerCase() || d.id.includes(id));

      if (!deal) {
        console.error(colors.red(`No deal found matching ID: ${id}`));
        process.exit(1);
      }

      console.log("\n" + formatDealDetail(deal) + "\n");
      break;
    }

    case "stats": {
      let data = await loadRelocations();
      let deals = data.deals || [];
      if (deals.length === 0) {
        const scanRes = await engine.scanAll();
        deals = scanRes.deals;
      }

      const stats = engine.computeStats(deals);
      console.log("\n" + formatStats(stats) + "\n");
      break;
    }

    case "export": {
      let data = await loadRelocations();
      let deals = data.deals || [];
      if (deals.length === 0) {
        const scanRes = await engine.scanAll();
        deals = scanRes.deals;
      }

      // Apply any filters
      const filtered = engine.filterDeals(deals, {
        origin: flags.origin,
        destination: flags.destination || flags.dest,
        provider: flags.provider,
        vehicleType: flags.vehicle,
        minSeats: flags.seats ? parseInt(flags.seats, 10) : undefined,
        maxPrice: flags["max-price"] ? parseFloat(flags["max-price"]) : undefined,
        freeOnly: flags.free
      });

      const format = (flags.format || "json").toLowerCase();
      let output = "";

      if (format === "csv") {
        output = exportToCsv(filtered);
      } else if (format === "md" || format === "markdown") {
        output = exportToMarkdown(filtered);
      } else {
        output = JSON.stringify(filtered, null, 2);
      }

      if (flags.output || flags.out) {
        const targetPath = path.resolve(process.cwd(), flags.output || flags.out);
        await fs.writeFile(targetPath, output, "utf-8");
        console.log(colors.green(`\n✔ Successfully exported ${filtered.length} deals to ${targetPath}\n`));
      } else {
        process.stdout.write(output + "\n");
      }
      break;
    }

    case "watch": {
      console.log(colors.bold("\n👀 Relocation Watcher Mode (Monitoring changes in Europe)"));
      console.log(colors.dim("Scanning providers and detecting newly added trips...\n"));

      const prevData = await loadRelocations();
      const prevDeals = prevData.deals || [];

      const currentRes = await engine.scanAll();
      const diff = engine.detectDiff(prevDeals, currentRes.deals);

      console.log(`\n${colors.bold("Scan completed.")} Total active: ${currentRes.deals.length}`);
      if (diff.totalNew > 0) {
        console.log(colors.green(`\n🎉 ${diff.totalNew} NEW RELOCATION DEALS FOUND:`));
        console.log(formatTable(diff.newDeals));
      } else {
        console.log(colors.dim("No new deals since last snapshot."));
      }

      if (diff.totalDropped > 0) {
        console.log(colors.dim(`(${diff.totalDropped} expired/booked deals removed)`));
      }

      if (!flags.once) {
        const intervalSec = parseInt(flags.interval || "300", 10);
        console.log(colors.cyan(`\nWatching every ${intervalSec}s. Press Ctrl+C to exit.`));
        setInterval(async () => {
          const snapshot = await loadRelocations();
          const nextRes = await engine.scanAll();
          const nextDiff = engine.detectDiff(snapshot.deals, nextRes.deals);
          if (nextDiff.totalNew > 0) {
            console.log(colors.green(`\n[${new Date().toLocaleTimeString()}] 🎉 ${nextDiff.totalNew} NEW DEALS:`));
            console.log(formatTable(nextDiff.newDeals));
          } else {
            console.log(colors.dim(`[${new Date().toLocaleTimeString()}] No changes.`));
          }
        }, intervalSec * 1000);
      }
      break;
    }

    case "book": {
      const id = args[1];
      if (!id) {
        console.error(colors.red("Error: Please provide a deal ID to book. Example: reloc book movacar_12345"));
        process.exit(1);
      }

      const data = await loadRelocations();
      const deal = (data.deals || []).find(d => d.id.toLowerCase() === id.toLowerCase() || d.id.includes(id));

      if (!deal) {
        console.error(colors.red(`No deal found matching ID: ${id}`));
        process.exit(1);
      }

      console.log("\n" + colors.bold(`📋 PRE-FLIGHT BOOKING CHECKLIST: ${deal.id}`));
      console.log("─".repeat(50));
      console.log(`• Provider:         ${deal.providerName}`);
      console.log(`• Route:            ${deal.origin.city} → ${deal.destination.city}`);
      console.log(`• Base Rate:        ${colors.priceBadge(deal.price.amount, deal.price.currency)}`);
      console.log(`• Duration:         ${deal.dates.durationDays} days (${deal.dates.durationHours || 24} hours)`);
      console.log(`• Min Drivers Age:  18-21 (Check provider terms)`);
      console.log(`• License:          Valid EU / International Driving License`);
      console.log(`• Deposit:          Credit card usually required at pickup`);
      console.log(`• Booking URL:      ${colors.blue(deal.bookingUrl)}`);
      console.log("─".repeat(50));
      console.log(colors.cyan(`Open this link in your browser to finalize your reservation:`));
      console.log(deal.bookingUrl + "\n");
      break;
    }

    case "help":
    default: {
      console.log(`
${colors.bold("Rental Relocations Scraper & Explorer CLI")}
${colors.dim("Automated tool for 1€ & free vehicle relocations across Europe")}

${colors.bold("SUPPORTED PROVIDERS & FLEETS:")}
  • ${colors.yellow("indiecampers.com")}  (Campervan specials across Europe, up to 80% off, ferry refunds)
  • ${colors.blue("movacar.de")}         (1€ car & van transfers across Germany & Europe; includes Carl und Carla fleet)
  • ${colors.cyan("driiveme.com")}       (1€ one-way car & van rentals in France, Germany, Spain, UK, etc.)
  • ${colors.magenta("imoova.com")}         (1€ campervan relocations in Europe & UK)

${colors.bold("USAGE:")}
  reloc <command> [options]

${colors.bold("COMMANDS (MODES):")}
  ${colors.bold("scan")}                   Scrape all 5 providers and update local database
  ${colors.bold("display | list")}         Show relocation deals in an ANSI table
  ${colors.bold("filter")}                 Filter listings by route, provider, vehicle, seats, price
  ${colors.bold("sort")}                   Sort listings by date, price, duration, seats, origin
  ${colors.bold("detail <id>")}            Show complete specifications & station details for an offer
  ${colors.bold("stats")}                  Show aggregate market intelligence and corridor stats
  ${colors.bold("watch")}                  Monitor for new deals and notify on route changes
  ${colors.bold("export")}                 Export listings to json, csv, or markdown
  ${colors.bold("book <id>")}              Show booking checklist and direct booking URL

${colors.bold("OPTIONS & FILTER FLAGS:")}
  --origin <city|country>   Filter departure city or country (e.g. "Berlin", "Germany", "FR")
  --destination <city|country> Filter destination city or country (e.g. "Spain", "Lisbon")
  --provider <name>         Filter by provider (indiecampers, movacar, driiveme, imoova, carlundcarla)
  --vehicle <type>          Filter by type: campervan | van | car | motorhome
  --seats <min>             Minimum passenger seats (e.g. 2, 4, 9)
  --max-price <eur>         Maximum price in EUR (e.g. 1.0)
  --free                    Show only 0.00 € free relocations
  --cross-border            Show only routes crossing international borders
  --fuel                    Filter routes with fuel allowance / reimbursement
  --ferry                   Filter routes with ferry reimbursement
  --sort <field>            Sort by: price | date | duration | seats | origin | destination
  --order <asc|desc>        Sort order (default: asc)
  --limit <n>               Max rows to display (default: 50)
  --format <json|csv|md>    Export format (default: json)
  --output <file>           Export destination file path

${colors.bold("EXAMPLES:")}
  reloc scan
  reloc display --origin Germany
  reloc filter --origin Berlin --destination Munich
  reloc filter --vehicle campervan --cross-border
  reloc filter --free
  reloc sort price asc
  reloc stats
  reloc watch --once
  reloc export --format md --output data/relocations.md
  reloc detail movacar_260109_7190_57624
`);
      break;
    }
  }
}

main().catch((err) => {
  console.error(colors.red("\nFatal Error:"), err);
  process.exit(1);
});
