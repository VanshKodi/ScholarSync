/**
 * utils/logger.js
 * ---------------
 * Structured console logger for ScholarSync frontend.
 *
 * Usage:
 *   import { createLogger } from "../../utils/logger.js";
 *   const log = createLogger("Documents");
 *
 *   log.dev("raw payload:", data);          // [DEV] Documents: raw payload: ...
 *   log.info("Loaded %d docs", count);      // [INF] Documents: Loaded 3 docs
 *   log.warn("Retrying request");           // [WAR] Documents: Retrying request
 *   log.error("Upload failed", err);        // [ERR] Documents: Upload failed ...
 */

const _LEVELS = { DEV: 0, INF: 1, WAR: 2, ERR: 3 };

// Set to _LEVELS.INF in production to suppress debug output.
const _CURRENT_LEVEL = _LEVELS.DEV;

/**
 * Build the formatted prefix and return an argument list ready for spread
 * into a console method.
 * @param {string} tag    - e.g. "DEV", "INF", "WAR", "ERR"
 * @param {string} module - caller module name
 * @param {any[]}  args   - original arguments
 */
function _fmt(tag, module, args) {
  return [`[${tag}] ${module}:`, ...args];
}

/**
 * Create a named logger for a UI module.
 * @param {string} module - Short module name shown in every log line.
 * @returns {{ dev: Function, info: Function, warn: Function, error: Function }}
 */
export function createLogger(module) {
  return {
    /** Verbose / debug – only shown at DEV level. */
    dev(...args) {
      if (_CURRENT_LEVEL <= _LEVELS.DEV) console.debug(..._fmt("DEV", module, args));
    },
    /** Informational. */
    info(...args) {
      if (_CURRENT_LEVEL <= _LEVELS.INF) console.log(..._fmt("INF", module, args));
    },
    /** Warning – non-fatal unexpected condition. */
    warn(...args) {
      if (_CURRENT_LEVEL <= _LEVELS.WAR) console.warn(..._fmt("WAR", module, args));
    },
    /** Error – operation failed. */
    error(...args) {
      if (_CURRENT_LEVEL <= _LEVELS.ERR) console.error(..._fmt("ERR", module, args));
    },
  };
}
