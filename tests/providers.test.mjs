import { describe, it } from "node:test";
import assert from "node:assert";
import { MovacarProvider } from "../lib/providers/movacar.mjs";
import { ImoovaProvider } from "../lib/providers/imoova.mjs";
import { DriivemeProvider } from "../lib/providers/driiveme.mjs";
import { IndieCampersProvider } from "../lib/providers/indiecampers.mjs";
import { CarlUndCarlaProvider } from "../lib/providers/carlundcarla.mjs";

console.log("Running Provider Unit Tests...");

async function run() {
  const providers = [
    new MovacarProvider(),
    new ImoovaProvider(),
    new DriivemeProvider(),
    new IndieCampersProvider(),
    new CarlUndCarlaProvider()
  ];

  let passed = 0;
  let failed = 0;

  for (const p of providers) {
    try {
      console.log(`Testing provider: ${p.name}...`);
      const deals = await p.scrape({ timeout: 15000 });
      assert.ok(Array.isArray(deals), `${p.name} scrape result should be an array`);
      assert.ok(deals.length > 0, `${p.name} should return at least 1 deal`);

      const first = deals[0];
      assert.ok(first.id, `${p.name} deal missing id`);
      assert.ok(first.origin?.city, `${p.name} deal missing origin city`);
      assert.ok(first.destination?.city, `${p.name} deal missing destination city`);
      assert.ok(first.price?.amount !== undefined, `${p.name} deal missing price`);
      assert.ok(first.bookingUrl, `${p.name} deal missing bookingUrl`);

      console.log(`  ✔ ${p.name}: OK (${deals.length} deals)`);
      passed++;
    } catch (err) {
      console.error(`  ✖ ${p.name} failed:`, err.message);
      failed++;
    }
  }

  console.log(`\nProvider Tests Finished: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

run();
