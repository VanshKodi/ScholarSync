import { supabase } from "./utils/supabase.js";

const API_BASE = window.__ENV__?.API_BASE || "https://api.vanshkodi.in";

// Simple session cache / manager
const Session = {
  _session: null,
  async get() {
    if (this._session) return this._session;
    const { data } = await supabase.auth.getSession();
    this._session = data?.session || null;
    return this._session;
  },
  onChange(cb) {
    supabase.auth.onAuthStateChange((_event, session) => {
      this._session = session;
      cb(session);
    });
  }
};

// ── TTL-based request cache ──────────────────────────────────────────────────
const DEFAULT_TTL = 60_000; // 60 seconds

const _cache = new Map();

function _cacheKey(path, options) {
  return `${options.method || "GET"}:${path}`;
}

/**
 * Clear cached responses.
 * - No arguments  → clears everything.
 * - String prefix → clears keys whose path starts with the prefix.
 */
function clearCache(pathPrefix) {
  if (!pathPrefix) {
    _cache.clear();
    return;
  }
  for (const key of _cache.keys()) {
    // key format is "METHOD:/path…"
    if (key.includes(pathPrefix)) _cache.delete(key);
  }
}

async function request(path, options = {}) {
  const session = await Session.get();
  const token = session?.access_token;

  const method = (options.method || "GET").toUpperCase();
  const isGet  = method === "GET";

  // Return cached response for GET requests when available & fresh
  if (isGet && !options.skipCache) {
    const key = _cacheKey(path, options);
    const cached = _cache.get(key);
    if (cached && Date.now() - cached.ts < (options.cacheTTL || DEFAULT_TTL)) {
      return cached.data;
    }
  }

  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const opts = {
    method,
    headers,
  };

  if (options.body) {
    if (options.body instanceof FormData) {
      opts.body = options.body;
    } else {
      opts.headers["Content-Type"] = "application/json";
      opts.body = JSON.stringify(options.body);
    }
  }

  const res = await fetch(API_BASE + path, opts);
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json().catch(() => ({}));

  // Cache GET responses
  if (isGet) {
    _cache.set(_cacheKey(path, options), { data, ts: Date.now() });
  } else {
    // Mutating request → invalidate related caches
    clearCache();
  }

  return data;
}

export { Session, request, clearCache };
