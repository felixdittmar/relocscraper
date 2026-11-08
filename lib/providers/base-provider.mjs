/**
 * Base Provider Contract for Rental Relocation Scrapers
 */

export class BaseProvider {
  /**
   * @param {string} id - Provider identifier (e.g. 'movacar', 'imoova')
   * @param {string} name - Display name (e.g. 'Movacar')
   * @param {string} url - Website URL
   */
  constructor(id, name, url) {
    this.id = id;
    this.name = name;
    this.url = url;
    this.defaultHeaders = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,application/json,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9,de;q=0.8,fr;q=0.7,es;q=0.6"
    };
  }

  /**
   * Safe fetch with timeout
   */
  async safeFetch(url, options = {}) {
    const timeoutMs = options.timeout || 15000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const headers = { ...this.defaultHeaders, ...(options.headers || {}) };
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText} from ${url}`);
      }

      return response;
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Scrape method to be implemented by each provider subclass
   * @param {object} options
   * @returns {Promise<Array<object>>}
   */
  async scrape(options = {}) {
    throw new Error(`scrape() not implemented in ${this.constructor.name}`);
  }
}
