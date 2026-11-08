import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");

export const DATA_DIR = path.join(REPO_ROOT, "data");
export const CACHE_DIR = path.join(DATA_DIR, "cache");
export const RELOCATIONS_FILE = path.join(DATA_DIR, "relocations.json");
export const PREVIOUS_RELOCATIONS_FILE = path.join(DATA_DIR, "relocations.previous.json");

/**
 * Ensures data and cache directories exist
 */
export async function ensureDirs() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(CACHE_DIR, { recursive: true });
}

/**
 * Loads currently saved relocations
 */
export async function loadRelocations() {
  await ensureDirs();
  try {
    const raw = await fs.readFile(RELOCATIONS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === "ENOENT") {
      return { lastUpdated: null, deals: [] };
    }
    throw err;
  }
}

/**
 * Saves relocations to data/relocations.json and moves prior to relocations.previous.json
 */
export async function saveRelocations(deals, stats = {}) {
  await ensureDirs();

  // If existing file exists, archive to previous
  try {
    const current = await fs.readFile(RELOCATIONS_FILE, "utf-8");
    await fs.writeFile(PREVIOUS_RELOCATIONS_FILE, current, "utf-8");
  } catch (e) {
    // If not existing, ignore
  }

  const payload = {
    lastUpdated: new Date().toISOString(),
    totalDeals: deals.length,
    stats,
    deals
  };

  await fs.writeFile(RELOCATIONS_FILE, JSON.stringify(payload, null, 2), "utf-8");
  return payload;
}

/**
 * Saves raw provider scrape result to cache
 */
export async function saveProviderCache(providerId, data) {
  await ensureDirs();
  const filePath = path.join(CACHE_DIR, `${providerId}.json`);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

/**
 * Loads raw provider scrape result from cache if available
 */
export async function loadProviderCache(providerId) {
  await ensureDirs();
  const filePath = path.join(CACHE_DIR, `${providerId}.json`);
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
