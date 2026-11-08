import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");

const testFiles = [
  "tests/providers.test.mjs",
  "tests/filter-sort.test.mjs",
  "tests/cli.test.mjs"
];

console.log("==================================================");
console.log("  RUNNING ALL RELOCATION SCRAPER SUITE TESTS      ");
console.log("==================================================\n");

let passedCount = 0;

for (const tf of testFiles) {
  console.log(`\n▶ EXECUTING: ${tf}`);
  console.log("--------------------------------------------------");
  try {
    execSync(`node ${path.join(REPO_ROOT, tf)}`, {
      cwd: REPO_ROOT,
      stdio: "inherit"
    });
    passedCount++;
  } catch (err) {
    console.error(`\n✖ Test file ${tf} failed!`);
    process.exit(1);
  }
}

console.log("\n==================================================");
console.log(`  ALL ${passedCount} TEST SUITES PASSED CLEANLY!  `);
console.log("==================================================\n");
