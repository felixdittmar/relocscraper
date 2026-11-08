import assert from "node:assert";
import {
  resolveCoordinates,
  estimateRegionalTrainTime,
  estimateDriveTime,
  haversineDistance,
  findHybridRoutes
} from "../lib/router.mjs";
import { loadRelocations } from "../lib/storage.mjs";

console.log("Running Hybrid Route Planner Tests...");

// 1. Coordinate Resolution & Normalization
const berlin = resolveCoordinates("Berlin");
assert.ok(berlin && berlin.lat > 52 && berlin.lon > 13, "Berlin coordinates resolved");

const koln = resolveCoordinates("Köln");
assert.ok(koln && koln.lat > 50 && koln.lon > 6, "Köln coordinates resolved with umlaut");

const muenchen = resolveCoordinates("München");
assert.ok(muenchen && muenchen.lat > 48, "München coordinates resolved");

const laatzen = resolveCoordinates("Laatzen (bei Hannover)");
assert.ok(laatzen && laatzen.lat > 52, "Parentheses city resolved to parent hub");

console.log("  ✔ Coordinate resolution and German umlaut normalization OK");

// 2. Haversine distance
const dist = haversineDistance(berlin, koln);
assert.ok(dist > 450 && dist < 520, `Berlin-Köln great-circle distance expected ~475km, got ${dist}`);
console.log(`  ✔ Haversine distance calculation OK (~${dist} km)`);

// 3. Baseline Regional Train (D-Ticket)
const trainTime = estimateRegionalTrainTime("Berlin", "Hamburg");
assert.ok(trainTime.durationMinutes > 240, "Berlin to Hamburg RE should take at least 4 hours");
assert.ok(trainTime.transfers >= 1, "Berlin to Hamburg RE needs at least 1 transfer");
console.log(`  ✔ Baseline D-Ticket train estimation OK (${trainTime.durationHoursStr})`);

// 4. Autobahn driving estimation
const driveTime = estimateDriveTime(280);
assert.ok(driveTime.durationMinutes > 150 && driveTime.durationMinutes < 240, "280km Autobahn drive ~3h");
console.log(`  ✔ Drive time estimation OK (${driveTime.durationHoursStr})`);

// 5. Hybrid Route Integration with Real Data Snapshot
const data = await loadRelocations();
const deals = data.deals || [];

const hybridRes = findHybridRoutes(deals, "Berlin", "Hamburg");
assert.strictEqual(hybridRes.origin, "Berlin");
assert.strictEqual(hybridRes.destination, "Hamburg");
assert.ok(hybridRes.routes.length > 0, "Should find hybrid routes for Berlin -> Hamburg");

const topRoute = hybridRes.routes[0];
assert.ok(topRoute.timeSavedMinutes > 0, "Top hybrid route must save time over baseline RE train");
assert.ok(topRoute.costs.totalEur <= 5.0, "Top hybrid route should cost ultra-low (~1.00 EUR)");
assert.strictEqual(topRoute.legs.length, 3, "Hybrid route must have 3 legs (train -> drive -> train)");

console.log(`  ✔ Hybrid route optimizer OK (Berlin -> Hamburg saves ${topRoute.timeSavedStr})`);

console.log("\n✔ All Hybrid Route Planner Tests Passed!");
