import { supabase } from "./utils/supabase.js";

const API_BASE = window.__ENV__?.API_BASE || "https://api.vanshkodi.in";

// Simple session manager
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

async function request(path, options = {}) {
  const session = await Session.get();
  const token = session?.access_token;

  const method = (options.method || "GET").toUpperCase();

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
  return res.json().catch(() => ({}));
}

export { Session, request };
