import { supabase } from "../../utils/supabase.js";

const API_BASE = 'https://scholarsync-3s4e.onrender.com';

async function waitForUser(timeout = 5000) {
  const { data: sessionData } = await supabase.auth.getSession();
  if (sessionData?.session?.user) return sessionData.session.user;

  return new Promise((resolve) => {
    const start = Date.now();
    const { data: sub } = supabase.auth.onAuthStateChange((event, sess) => {
      if (sess?.user) {
        sub.subscription.unsubscribe();
        resolve(sess.user);
      } else if (Date.now() - start > timeout) {
        sub.subscription.unsubscribe();
        resolve(null);
      }
    });
  });
}

async function getAuthHeaders() {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function apiFetch(path, opts = {}) {
  const headers = Object.assign({}, opts.headers || {}, await getAuthHeaders());
  if (opts.body && !(opts.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(opts.body);
  }

  const res = await fetch(API_BASE + path, Object.assign({}, opts, { headers }));
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const err = new Error(text || `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json().catch(() => ({}));
}

export async function Overview(container) {
  const user = await waitForUser();
  if (!user) {
    container.innerHTML = `<p>Not authenticated</p>`;
    return;
  }

  await renderProfileArea(container, user);
}

async function renderProfileArea(container, user) {
  container.innerHTML = `
    <div class="overview-wrapper" style="max-width:900px;margin:32px auto;font-family:Arial, sans-serif;">
      <h1>Profile</h1>
      <div id="profileInfo"></div>

      <div style="margin-top:20px;display:flex;gap:12px;flex-wrap:wrap;">
        <button id="becomeAdminBtn">Become Admin</button>
        <button id="joinUniBtn">Request To Join University</button>
        <button id="viewRequestsBtn">View Join Requests</button>
      </div>

      <div id="adminArea" style="margin-top:20px;"></div>
    </div>
  `;

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    document.getElementById('profileInfo').innerText = 'Failed to load profile.';
    return;
  }

  if (!profile) {
    document.getElementById('profileInfo').innerHTML =
      `<p>No profile found. Please create one first.</p>`;
    disableAllButtons("Create profile first");
    return;
  }

  const escapeHtml = (str) => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  };

  document.getElementById('profileInfo').innerHTML = `
    <p><b>Email:</b> ${escapeHtml(user.email)}</p>
    <p><b>Role:</b> ${escapeHtml(profile.role)}</p>
    <p><b>University ID:</b> ${escapeHtml(profile.university_id ?? 'None')}</p>
    <p><b>Status:</b> ${escapeHtml(profile.status)}</p>
  `;

  // Attach handlers
  document.getElementById('becomeAdminBtn').onclick = () =>
    becomeAdminFlow(user, container);

  document.getElementById('joinUniBtn').onclick = () =>
    joinUniversityFlow(user, container);

  document.getElementById('viewRequestsBtn').onclick = async () => {
    if (!profile.university_id) {
      alert("You are not assigned to any university.");
      return;
    }
    await renderAdminRequests(document.getElementById('adminArea'), profile.university_id);
  };

  // Disable logic (UI-level safety)
  if (profile.university_id !== null) {
    disableButton('becomeAdminBtn', "Already assigned to university");
  }

  if (profile.role !== 'faculty') {
    disableButton('joinUniBtn', "Only faculty can request to join");
  }

  if (profile.role !== 'admin') {
    disableButton('viewRequestsBtn', "Only admins can view requests");
  }
}
async function renderAdminRequests(adminArea, universityId) {
  // Placeholder for admin requests rendering
}

async function joinUniversityFlow(user, container) {
  const uniId = prompt("Enter university id to join:");
  if (!uniId) return;
  try {
    const encodedId = encodeURIComponent(uniId);

    await apiFetch(`/apply-to-join-university/${encodedId}`, {
      method: 'POST'
    });

    alert('Join request sent');
    await renderProfileArea(container, user);

  } catch (err) {
    alert('Failed to send join request: ' + (err.message || err));
  }
}

async function becomeAdminFlow(user, container) {
  const uniName = prompt("Enter university name:");
  if (!uniName) return;

  try {
    const encodedName = encodeURIComponent(uniName);

    await apiFetch(`/become-admin/${encodedName}`, {
      method: 'POST'
    });

    alert('You are now Admin');
    await renderProfileArea(container, user);

  } catch (err) {
    alert('Failed to become admin: ' + (err.message || err));
  }

}
function disableButton(id, reason) {
  const btn = document.getElementById(id);
  if (!btn) return;
  btn.disabled = true;
  btn.title = reason;
  btn.style.opacity = "0.6";
  btn.style.cursor = "not-allowed";
}

function disableAllButtons(reason) {
  ["becomeAdminBtn", "joinUniBtn", "viewRequestsBtn"].forEach(id => {
    disableButton(id, reason);
  });
}