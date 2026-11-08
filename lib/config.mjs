import fs from "fs/promises";
import path from "path";
import { load } from "js-yaml";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");

export const CONFIG_FILE = path.join(REPO_ROOT, "config", "preferences.yml");
export const CUSTOM_MODE_FILE = path.join(REPO_ROOT, "modes", "_custom.md");

export async function loadConfig() {
  let config = {
    user: {
      home_country: "DE",
      home_city: "Berlin",
      favorite_destinations: []
    },
    filters: {
      max_price_eur: 10.0,
      min_seats: 1,
      vehicle_types: ["campervan", "van", "car", "motorhome"],
      include_providers: ["indiecampers", "movacar", "driiveme", "imoova"]
    },
    notifications: {
      on_new_deal: true,
      min_alert_seats: 2,
      notify_destinations: []
    }
  };

  try {
    const raw = await fs.readFile(CONFIG_FILE, "utf-8");
    const parsed = load(raw);
    if (parsed && typeof parsed === "object") {
      config = {
        ...config,
        ...parsed,
        user: { ...config.user, ...(parsed.user || {}) },
        filters: { ...config.filters, ...(parsed.filters || {}) },
        notifications: { ...config.notifications, ...(parsed.notifications || {}) }
      };
    }
  } catch (e) {
    // defaults apply
  }

  // Also parse modes/_custom.md if user has custom markdown rules
  try {
    const customMd = await fs.readFile(CUSTOM_MODE_FILE, "utf-8");
    // Extract yaml frontmatter if present
    const fmMatch = customMd.match(/^---\s*([\s\S]*?)\s*---/);
    if (fmMatch) {
      const parsedFm = load(fmMatch[1]);
      if (parsedFm && typeof parsedFm === "object") {
        config = { ...config, ...parsedFm };
      }
    }
  } catch (e) {
    // no custom mode file
  }

  return config;
}
