import assert from "node:assert";
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");
const CLI_PATH = path.join(REPO_ROOT, "bin", "reloc.mjs");

console.log("Running CLI Integration Tests...");

function runCli(args = "") {
  return execSync(`node ${CLI_PATH} ${args}`, {
    cwd: REPO_ROOT,
    encoding: "utf-8"
  });
}

// 1. Help
const helpOut = runCli("help");
assert.ok(helpOut.includes("Rental Relocations Scraper & Explorer CLI"), "Help output missing header");
assert.ok(helpOut.includes("indiecampers.com"), "Help missing indiecampers");
assert.ok(helpOut.includes("movacar.de"), "Help missing movacar");
assert.ok(helpOut.includes("driiveme.com"), "Help missing driiveme");
assert.ok(helpOut.includes("imoova.com"), "Help missing imoova");
assert.ok(helpOut.includes("carlundcarla.de"), "Help missing carlundcarla");
console.log("  ✔ CLI help command works");

// 2. Display
const displayOut = runCli("display --limit 5");
assert.ok(displayOut.includes("relocations:"), "Display output missing relocations summary");
console.log("  ✔ CLI display command works");

// 3. Filter
const filterOut = runCli("filter --vehicle campervan --limit 5");
assert.ok(filterOut.includes("Filtered Relocations"), "Filter output missing matches header");
console.log("  ✔ CLI filter command works");

// 4. Sort
const sortOut = runCli("sort price asc --limit 5");
assert.ok(sortOut.includes("Sorted by"), "Sort output missing header");
console.log("  ✔ CLI sort command works");

// 5. Stats
const statsOut = runCli("stats");
assert.ok(statsOut.includes("EUROPEAN RENTAL RELOCATIONS SUMMARY"), "Stats missing header");
assert.ok(statsOut.includes("Breakdown by Provider:"), "Stats missing provider breakdown");
console.log("  ✔ CLI stats command works");

// 6. Export Markdown
const exportMdOut = runCli("export --format md");
assert.ok(exportMdOut.includes("# European Rental Relocations Digest"), "Export markdown missing header");
console.log("  ✔ CLI export markdown works");

// 7. Export CSV
const exportCsvOut = runCli("export --format csv");
assert.ok(exportCsvOut.includes("ID,Provider,Origin_City"), "Export csv missing CSV headers");
console.log("  ✔ CLI export csv works");

// 8. Watch Once
const watchOut = runCli("watch --once");
assert.ok(watchOut.includes("Relocation Watcher Mode"), "Watch output missing header");
console.log("  ✔ CLI watch mode works");

console.log("\n✔ All CLI Integration Tests Passed!");
