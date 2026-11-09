import assert from "node:assert";
import {
  resolveVerifiedMilesVehicle,
  enrichRoutesWithTelematics
} from "../lib/miles.mjs";

console.log("Running MILES Telematics Integration Tests...");

// 1. resolveVerifiedMilesVehicle validation
const noFlags = resolveVerifiedMilesVehicle({});
assert.strictEqual(noFlags, null, "Empty options should return null");

const onlyRangeRes = resolveVerifiedMilesVehicle({ range: 335 });
assert.strictEqual(onlyRangeRes.matchedVehicle.remainingRangeKm, 335);
assert.strictEqual(onlyRangeRes.matchedVehicle.licensePlate, null);
assert.strictEqual(onlyRangeRes.matchedVehicle.type, null);

const verifiedRes = resolveVerifiedMilesVehicle({
  userRange: 320,
  userCar: "VW Golf",
  userPlate: "B-MI 1234",
  userFuel: "50%"
});
assert.strictEqual(verifiedRes.verifiedByUser, true, "Should be marked as verified by user");
assert.strictEqual(verifiedRes.matchedVehicle.licensePlate, "B-MI 1234", "Should preserve user plate");
assert.strictEqual(verifiedRes.matchedVehicle.type, "VW Golf", "Should preserve car model");
assert.strictEqual(verifiedRes.matchedVehicle.remainingRangeKm, 320, "Should preserve user range");
assert.strictEqual(verifiedRes.matchedVehicle.transmission, "automatic", "MILES car is automatic");
console.log("  ✔ User-verified telematics resolver OK");

// 3. enrichRoutesWithTelematics safety with empty or non-miles routes
const emptyRes = enrichRoutesWithTelematics({ routes: [] }, {});
assert.deepStrictEqual(emptyRes, { routes: [] }, "Empty routes should return unchanged");

const mockNonMilesRoute = {
  deal: { id: "movacar_123", fleetPartner: "Movacar", origin: {} },
  costs: { rentalEur: 1.0, fuelEur: 30 }
};
const nonMilesRes = enrichRoutesWithTelematics({ routes: [mockNonMilesRoute] }, { range: 335 });
assert.strictEqual(nonMilesRes.routes[0].costs.fuelEur, 30, "Non-miles route costs should remain unchanged");

// 4. enrichRoutesWithTelematics on MILES route
const mockMilesRoute = {
  deal: { id: "ugoki_123", fleetPartner: "MILES", vehicle: { model: "Car" }, origin: {} },
  costs: { rentalEur: 1.0, fuelEur: 0 },
  legs: [{}, { distanceKm: 546 }]
};
const milesRes = enrichRoutesWithTelematics({ routes: [mockMilesRoute] }, { range: 335, car: "Opel Astra ST" });
assert.strictEqual(milesRes.routes[0].costs.verifiedByUser, true, "Should mark route verified by user");
assert.strictEqual(milesRes.routes[0].costs.liveModel, "Opel Astra ST", "Should update model");
assert.strictEqual(milesRes.routes[0].costs.liveRangeKm, 335, "Should update starting range");
assert.ok(milesRes.routes[0].costs.fuelEur > 30, "Should compute realistic fuel top-up for 546km");
console.log(`  ✔ Route telematics enrichment OK (~${milesRes.routes[0].costs.fuelEur} € fuel for 546km)`);

console.log("\n✔ All MILES Telematics Unit Tests Passed!");
