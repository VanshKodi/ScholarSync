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
  const info = `
    <p><b>Email:</b> ${user.email}</p>
    <p><b>Profile ID:</b> ${profile.id}</p>
    <p><b>Role:</b> ${profile.role}</p>
    <p><b>University ID:</b> ${profile.university_id ?? 'Not Assigned'}</p>
    <p><b>Status:</b> ${profile.status}</p>
  `;
  document.getElementById('profileInfo').innerHTML = info;

  const adminArea = document.getElementById('adminArea');
  adminArea.innerHTML = '';

  if (profile.role === 'admin' && profile.university_id) {
    const btn = document.createElement('button');
    btn.textContent = 'Manage Join Requests';
    btn.onclick = () => renderAdminRequests(adminArea, profile.university_id);
    adminArea.appendChild(btn);
  } else if (profile.university_id === null) {
    const btn = document.createElement('button');
    btn.textContent = 'Become Admin (create university)';
    btn.onclick = () => becomeAdminFlow(user, container);
    adminArea.appendChild(btn);
  }
}

async function renderAdminRequests(container, universityId) {
  container.innerHTML = '<h3>Pending Requests</h3><div id="requestsList">Loading...</div>';
  const listEl = document.getElementById('requestsList');

  // Prefer backend endpoint; fallback to direct Supabase read if backend not available
  try {
    const json = await apiFetch(`/admin/join-requests?university_id=${encodeURIComponent(universityId)}`);
    const rows = json?.data ?? [];
    if (!rows.length) return (listEl.innerText = 'No pending requests.');

    listEl.innerHTML = rows.map(r => renderRequestItemHtml(r)).join('');
    attachRequestButtons(listEl, universityId);
  } catch (err) {
    // fallback to supabase client
    const { data, error } = await supabase.from('university_join_requests').select('*').eq('university_id', universityId).eq('status', 'pending');
    if (error) return (listEl.innerText = 'Failed to load requests');
    if (!data || !data.length) return (listEl.innerText = 'No pending requests.');
    listEl.innerHTML = data.map(r => renderRequestItemHtml(r)).join('');
    attachRequestButtons(listEl, universityId);
  }
}

function renderRequestItemHtml(r) {
  return `
    <div class="request-item" data-id="${r.request_id}" style="border:1px solid #ddd;padding:8px;margin:8px 0;">
      <div><b>Requester:</b> ${r.requester_id}</div>
      <div><b>Message:</b> ${r.message ?? ''}</div>
      <div style="margin-top:8px;">
        <button data-action="accept" class="acceptBtn">Accept</button>
        <button data-action="reject" class="rejectBtn">Reject</button>
      </div>
    </div>
  `;
}

function attachRequestButtons(listEl, universityId) {
  listEl.querySelectorAll('.acceptBtn, .rejectBtn').forEach(btn => btn.addEventListener('click', async (e) => {
    const id = e.target.closest('.request-item').dataset.id;
    const action = e.target.dataset.action;
    try {
      await handleRequestAction(id, action);
      // reload
      await renderAdminRequests(document.getElementById('adminArea'), universityId);
    } catch (err) {
      alert('Error: ' + (err.message || err));
    }
  }));
}

async function handleRequestAction(requestId, action) {
  // Backend-managed action; endpoint already added: POST /handle-join-request
  await apiFetch('/handle-join-request', { method: 'POST', body: { request_id: requestId, action } });
  alert('Request ' + action + 'ed');
}

async function becomeAdminFlow(user, container) {
  if (!confirm('Create a University and become its admin?')) return;
  const uniName = user.email + "'s University";

  try {
    // Prefer backend creation which will perform all writes server-side (ignoring RLS)
    const json = await apiFetch('/admin/create-university', { method: 'POST', body: { name: uniName } });
    const universityId = json?.university?.university_id;
    if (!universityId) throw new Error('invalid response');

    // ask backend to attach profile to university
    await apiFetch('/admin/assign-admin', { method: 'POST', body: { user_id: user.id, university_id: universityId } });
    alert('You are now Admin');
    await renderProfileArea(container, user);
  } catch (err) {
    // fallback to client-side behavior if backend not present
    try {
      const { data: created, error: createErr } = await supabase.from('universities').insert([{ name: uniName }]).select().single();
      if (createErr) throw createErr;
      const universityId = created.university_id;
      await supabase.from('profiles').update({ role: 'admin', university_id: universityId }).eq('id', user.id);
      alert('You are now Admin');
      await renderProfileArea(container, user);
    } catch (e) {
      alert('Failed to become admin: ' + (e.message || e));
    }
  }
}
