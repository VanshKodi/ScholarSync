import { startRouter } from "./3_router.js";
import { showLoader, hideLoader } from "./components/Loader.js";
import { supabase } from "./utils/supabase.js";
import { Session } from "./api.js";

const root = document.getElementById("root");

showLoader("Loading ScholarSync...");

(async () => {
  // Extract OAuth tokens from hash if redirected from Google login
  const hash = window.location.hash.slice(1);
  const params = new URLSearchParams(hash);
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");

  if (accessToken && refreshToken) {
    await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    });
    window.history.replaceState(null, "", "#/");
  }

  // Check if user has an active session (uses centralized Session)
  const session = await Session.get();
  const hasSession = !!session;

  // Start router and redirect authenticated users to dashboard
  startRouter(root);

  if (hasSession) {
    window.location.hash = "#/dashboard";
  }

  hideLoader();
})();

// React to auth state changes
Session.onChange((session) => {
  if (session) {
    window.location.hash = "#/dashboard";
  } else {
    window.location.hash = "#/";
  }
});