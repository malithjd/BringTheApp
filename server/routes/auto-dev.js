import { Router } from 'express';
import { isEnabled } from '../config.js';

const router = Router();

const AUTO_DEV_BASE = 'https://api.auto.dev';
// Read lazily — dotenv.config() in index.js runs after ESM imports resolve
function getApiKey() { return process.env.AUTO_DEV_API_KEY; }

// ---------------------------------------------------------------------------
// Simple TTL cache (30 min default)
// ---------------------------------------------------------------------------
class TTLCache {
  constructor(ttlMs = 30 * 60 * 1000) {
    this.ttl = ttlMs;
    this.store = new Map();
  }
  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expires) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }
  set(key, value) {
    this.store.set(key, { value, expires: Date.now() + this.ttl });
  }
}

const cache = new TTLCache();

// ---------------------------------------------------------------------------
// Rate limiter — 5 req/sec sliding window for Auto.dev
// ---------------------------------------------------------------------------
class RateLimiter {
  constructor(maxPerSec = 5) {
    this.max = maxPerSec;
    this.timestamps = [];
  }
  async acquire() {
    const now = Date.now();
    this.timestamps = this.timestamps.filter(t => now - t < 1000);
    if (this.timestamps.length >= this.max) {
      const waitMs = 1000 - (now - this.timestamps[0]);
      await new Promise(r => setTimeout(r, waitMs));
    }
    this.timestamps.push(Date.now());
  }
}

const limiter = new RateLimiter(5);

// ---------------------------------------------------------------------------
// Auto.dev fetch helper
// ---------------------------------------------------------------------------
async function autoDevFetch(path, params = {}) {
  if (!getApiKey()) return null;
  await limiter.acquire();

  const url = new URL(path, AUTO_DEV_BASE);
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== '') url.searchParams.set(k, String(v));
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${getApiKey()}` },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) {
      console.warn(`Auto.dev ${res.status}: ${url.pathname}`);
      return null;
    }
    return res.json();
  } catch (err) {
    clearTimeout(timeout);
    console.warn(`Auto.dev fetch failed: ${err.message}`);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Helper: bucket mileage to nearest 10k for cache key
// ---------------------------------------------------------------------------
function mileageBucket(m) {
  if (!m) return 'any';
  return String(Math.round(Number(m) / 10000) * 10000);
}

// ---------------------------------------------------------------------------
// Core: fetchMarketListings — reusable by routes AND analyze.js
// Returns null if disabled/unconfigured. Returns result object otherwise.
// ---------------------------------------------------------------------------
export async function fetchMarketListings(year, make, model, mileage) {
  if (!isEnabled('marketListings') || !getApiKey()) {
    return { enabled: false, reason: !getApiKey() ? 'not_configured' : 'disabled' };
  }

  const cacheKey = `listings-${year}-${make}-${model}-${mileageBucket(mileage)}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    // Build mileage range: +/- 25k from input, or 0-200k if none
    let milesParam = '0-200000';
    if (mileage) {
      const m = Number(mileage);
      milesParam = `${Math.max(0, m - 25000)}-${m + 25000}`;
    }

    const data = await autoDevFetch('/listings', {
      'vehicle.year': year,
      'vehicle.make': make,
      'vehicle.model': model,
      'retailListing.miles': milesParam,
      limit: 50,
    });

    // Auto.dev response: { data: [...listings], links: {...}, api: {...} }
    const allListings = data?.data || data?.listings || [];
    if (!Array.isArray(allListings) || allListings.length === 0) {
      const empty = {
        enabled: true,
        avgPrice: null,
        medianPrice: null,
        listingCount: 0,
        priceRange: null,
        sampleListings: [],
      };
      cache.set(cacheKey, empty);
      return empty;
    }

    const listings = allListings.filter(l => l.retailListing);
    const withPrices = listings.filter(l => l.retailListing?.price > 0);
    const prices = withPrices.length > 0
      ? withPrices.map(l => l.retailListing.price).sort((a, b) => a - b)
      : null;

    const avg = prices ? Math.round(prices.reduce((s, p) => s + p, 0) / prices.length) : null;
    const median = prices
      ? (prices.length % 2 === 0
        ? Math.round((prices[prices.length / 2 - 1] + prices[prices.length / 2]) / 2)
        : prices[Math.floor(prices.length / 2)])
      : null;

    const samples = [];
    const step = Math.max(1, Math.floor(listings.length / 5));
    for (let i = 0; i < listings.length && samples.length < 5; i += step) {
      const l = listings[i];
      const rl = l.retailListing || {};
      samples.push({
        price: rl.price || null,
        mileage: rl.miles || null,
        dealer: rl.dealer || rl.dealerName || null,
        city: rl.city || null,
        state: rl.state || null,
        photoUrl: rl.primaryImage || rl.photoUrl || rl.primaryPhotoUrl || null,
        listingUrl: rl.vdp || rl.listingUrl || rl.url || null,
        trim: l.vehicle?.trim || null,
        baseMsrp: l.vehicle?.baseMsrp || null,
      });
    }

    const result = {
      enabled: true,
      avgPrice: avg,
      medianPrice: median,
      listingCount: listings.length,
      priceRange: prices ? { low: prices[0], high: prices[prices.length - 1] } : null,
      sampleListings: samples,
    };

    cache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.error('Market listings error:', err.message);
    return { enabled: true, avgPrice: null, listingCount: 0, sampleListings: [] };
  }
}

// ---------------------------------------------------------------------------
// GET /api/market/listings — HTTP wrapper
// ---------------------------------------------------------------------------
router.get('/listings', async (req, res) => {
  const { year, make, model, mileage } = req.query;
  if (!year || !make || !model) {
    return res.status(400).json({ error: 'year, make, model required' });
  }
  const result = await fetchMarketListings(year, make, model, mileage);
  return res.json(result);
});

// ---------------------------------------------------------------------------
// GET /api/market/photo
// Returns a photo URL for the vehicle
// ---------------------------------------------------------------------------
router.get('/photo', async (req, res) => {
  if (!isEnabled('vehiclePhotos') || !getApiKey()) {
    return res.json({ enabled: false, photoUrl: null });
  }

  const { year, make, model, trim } = req.query;
  if (!year || !make || !model) {
    return res.status(400).json({ error: 'year, make, model required' });
  }

  const cacheKey = `photo-${year}-${make}-${model}-${trim || 'any'}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json(cached);

  try {
    const params = {
      'vehicle.year': year,
      'vehicle.make': make,
      'vehicle.model': model,
      limit: 5,
    };
    if (trim) params['vehicle.trim'] = trim;

    const data = await autoDevFetch('/listings', params);

    let photoUrl = null;
    const photoListings = data?.data || data?.listings || [];
    for (const l of photoListings) {
      const url = l.retailListing?.primaryImage || l.retailListing?.photoUrl || l.retailListing?.primaryPhotoUrl;
      if (url) {
        photoUrl = url;
        break;
      }
    }

    const result = { enabled: true, photoUrl };
    cache.set(cacheKey, result);
    return res.json(result);
  } catch (err) {
    console.error('Vehicle photo error:', err.message);
    return res.json({ enabled: true, photoUrl: null });
  }
});

export default router;
