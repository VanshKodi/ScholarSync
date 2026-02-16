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
  // Minimal, easy-to-scan layout. Prefer backend actions for writes.
  container.innerHTML = `
    <div class="overview-wrapper" style="max-width:900px;margin:32px auto;font-family:Arial, sans-serif;">
      <h1>Profile</h1>
      <div id="profileInfo"></div>
      <div id="adminArea" style="margin-top:18px;"></div>
    </div>
  `;

  // Try to fetch profile from Supabase client (read). Backend can be used instead if you add an endpoint.
  const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
  if (error) {
    document.getElementById('profileInfo').innerText = 'Failed to load profile.';
    return;
  }

  if (!profile) {
    document.getElementById('profileInfo').innerHTML = `<p>No profile found. <button id="createProfileBtn">Create profile</button></p>`;
    document.getElementById('createProfileBtn').onclick = async () => {
      // Prefer backend-controlled creation. Fallback to client-side upsert.
      try {
        await apiFetch('/profiles/create', { method: 'POST', body: { id: user.id } });
      } catch (err) {
        // fallback
        await supabase.from('profiles').upsert({ id: user.id, role: 'faculty', university_id: null, status: 'active' });
      }
      await renderProfileArea(container, user);
    };
    return;
  }

  // render compact profile
  const escapeHtml = (str) => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  };
  const info = `
    <p><b>Email:</b> ${escapeHtml(user.email)}</p>
    <p><b>Profile ID:</b> ${escapeHtml(profile.id)}</p>
    <p><b>Role:</b> ${escapeHtml(profile.role)}</p>
    <p><b>University ID:</b> ${escapeHtml(profile.university_id ?? 'Not Assigned')}</p>
    <p><b>Status:</b> ${escapeHtml(profile.status)}</p>
  `;
  document.getElementById('profileInfo').innerHTML = info;

  const adminArea = document.getElementById('adminArea');
  adminArea.innerHTML = '';
  if (profile.university_id === null) {
    const btn = document.createElement('button');
    btn.textContent = 'Become Admin (create university)';
    btn.onclick = () => becomeAdminFlow(user, container);
    adminArea.appendChild(btn);
  }else if (profile.role === 'admin') {
    await renderAdminRequests(adminArea, profile.university_id);
  }else if (profile.role !== 'admin') {
    const btn = document.createElement('button');
    btn.textContent = 'Join University(Apply)';
    btn.onclick = () => joinUniversityFlow(user, container);
    adminArea.appendChild(btn);
  }
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