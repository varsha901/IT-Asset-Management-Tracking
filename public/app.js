async function getToken() {
  const existingToken = localStorage.getItem('assettrackToken');
  if (existingToken) {
    return existingToken;
  }

  try {
    const registerResponse = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Demo Admin',
        email: 'admin@example.com',
        password: 'password123',
        role: 'IT_ADMIN',
        department: 'IT'
      })
    });

    if (registerResponse.ok) {
      const data = await registerResponse.json();
      localStorage.setItem('assettrackToken', data.token);
      return data.token;
    }
  } catch (error) {
    // fall through to login attempt
  }

  const loginResponse = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@example.com', password: 'password123' })
  });

  const loginData = await loginResponse.json();
  if (!loginResponse.ok) {
    throw new Error(loginData.message || 'Authentication failed');
  }

  localStorage.setItem('assettrackToken', loginData.token);
  return loginData.token;
}

async function requestJson(url, options = {}) {
  const token = await getToken();
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

async function loadDashboard() {
  const stats = await requestJson('/api/reports/dashboard');

  document.getElementById('totalAssets').textContent = stats.totalAssets ?? 0;
  document.getElementById('assignedAssets').textContent = stats.assignedAssets ?? 0;
  document.getElementById('maintenanceAssets').textContent = stats.maintenanceAssets ?? 0;
  document.getElementById('expiringLicenses').textContent = stats.expiringLicenses ?? 0;
}

async function loadAssets() {
  const status = document.getElementById('assetStatus');
  const rows = document.getElementById('assetRows');

  if (!status || !rows) {
    return;
  }

  try {
    const assets = await requestJson('/api/assets');
    if (!assets.length) {
      rows.innerHTML = '<tr><td colspan="5">No assets found yet.</td></tr>';
      status.textContent = 'No assets recorded yet.';
      return;
    }

    rows.innerHTML = assets.map((asset) => `
      <tr>
        <td>${asset.assetTag}</td>
        <td>${asset.name}</td>
        <td>${asset.type}</td>
        <td>${asset.status}</td>
        <td>${asset.department || '—'}</td>
        <td>
          <div class="inline-actions">
            <select class="status-select" data-id="${asset._id}">
              <option value="AVAILABLE" ${asset.status === 'AVAILABLE' ? 'selected' : ''}>Available</option>
              <option value="ASSIGNED" ${asset.status === 'ASSIGNED' ? 'selected' : ''}>Assigned</option>
              <option value="MAINTENANCE" ${asset.status === 'MAINTENANCE' ? 'selected' : ''}>Maintenance</option>
              <option value="RETIRED" ${asset.status === 'RETIRED' ? 'selected' : ''}>Retired</option>
              <option value="LOST" ${asset.status === 'LOST' ? 'selected' : ''}>Lost</option>
            </select>
            <button class="action-btn danger" data-action="delete" data-id="${asset._id}">Delete</button>
          </div>
        </td>
      </tr>
    `).join('');

    status.textContent = `${assets.length} asset${assets.length === 1 ? '' : 's'} currently tracked.`;
  } catch (error) {
    status.textContent = 'Unable to load assets right now.';
    rows.innerHTML = '<tr><td colspan="5">Please try again later.</td></tr>';
  }
}

async function handleAssetSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const status = document.getElementById('assetStatus');
  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());

  try {
    const data = await requestJson('/api/assets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    form.reset();
    status.textContent = `Added ${data.name}.`;
    await loadAssets();
  } catch (error) {
    status.textContent = error.message || 'Unable to add asset.';
  }
}

async function updateAssetStatus(assetId, status) {
  const statusBanner = document.getElementById('assetStatus');
  try {
    await requestJson(`/api/assets/${assetId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    statusBanner.textContent = 'Asset status updated.';
    await loadAssets();
  } catch (error) {
    statusBanner.textContent = error.message || 'Unable to update asset.';
  }
}

async function deleteAsset(assetId) {
  const statusBanner = document.getElementById('assetStatus');
  try {
    await requestJson(`/api/assets/${assetId}`, { method: 'DELETE' });
    statusBanner.textContent = 'Asset removed.';
    await loadAssets();
  } catch (error) {
    statusBanner.textContent = error.message || 'Unable to delete asset.';
  }
}

document.addEventListener('change', async (event) => {
  if (event.target.classList.contains('status-select')) {
    await updateAssetStatus(event.target.dataset.id, event.target.value);
  }
});

document.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-action="delete"]');
  if (button) {
    await deleteAsset(button.dataset.id);
  }
});

async function loadMaintenanceTickets() {
  const status = document.getElementById('maintenanceStatus');
  const list = document.getElementById('maintenanceList');
  const selector = document.getElementById('maintenanceAsset');

  if (!status || !list) {
    return;
  }

  try {
    const tickets = await requestJson('/api/maintenance');
    if (selector) {
      const assets = await requestJson('/api/assets');
      selector.innerHTML = assets.map((asset) => `<option value="${asset._id}">${asset.assetTag} - ${asset.name}</option>`).join('');
    }

    if (!tickets.length) {
      list.innerHTML = '<li>No maintenance requests yet.</li>';
      status.textContent = 'No open maintenance requests.';
      return;
    }

    list.innerHTML = tickets.map((ticket) => `
      <li>
        <strong>${ticket.title}</strong>
        <div>${ticket.description}</div>
        <small>${ticket.status} · ${ticket.priority} · ${ticket.asset?.assetTag || 'Unassigned'}</small>
      </li>
    `).join('');

    status.textContent = `${tickets.length} maintenance request${tickets.length === 1 ? '' : 's'} tracked.`;
  } catch (error) {
    status.textContent = error.message || 'Unable to load maintenance requests.';
    list.innerHTML = '<li>Unable to load requests right now.</li>';
  }
}

async function handleMaintenanceSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const status = document.getElementById('maintenanceStatus');
  const payload = Object.fromEntries(new FormData(form).entries());

  try {
    await requestJson('/api/maintenance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        priority: payload.priority || 'MEDIUM',
        status: payload.status || 'OPEN'
      })
    });

    form.reset();
    status.textContent = 'Maintenance request created.';
    await loadMaintenanceTickets();
  } catch (error) {
    status.textContent = error.message || 'Unable to create maintenance request.';
  }
}

async function loadLicenses() {
  const status = document.getElementById('licenseStatus');
  const list = document.getElementById('licenseList');

  if (!status || !list) {
    return;
  }

  try {
    const licenses = await requestJson('/api/licenses');
    if (!licenses.length) {
      list.innerHTML = '<li>No software licenses tracked yet.</li>';
      status.textContent = 'No software licenses recorded yet.';
      return;
    }

    list.innerHTML = licenses.map((license) => `
      <li>
        <strong>${license.name}</strong>
        <div>${license.vendor || 'No vendor listed'} · Seats ${license.seats ?? 1} · Used ${license.usedSeats ?? 0}</div>
        <small>${license.status} · Expiry ${license.expiryDate ? new Date(license.expiryDate).toLocaleDateString() : 'N/A'}</small>
      </li>
    `).join('');

    status.textContent = `${licenses.length} license${licenses.length === 1 ? '' : 's'} tracked.`;
  } catch (error) {
    status.textContent = error.message || 'Unable to load licenses.';
    list.innerHTML = '<li>Unable to load licenses right now.</li>';
  }
}

async function handleLicenseSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const status = document.getElementById('licenseStatus');
  const payload = Object.fromEntries(new FormData(form).entries());

  try {
    await requestJson('/api/licenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        seats: Number(payload.seats || 1),
        usedSeats: Number(payload.usedSeats || 0),
        expiryDate: payload.expiryDate ? new Date(payload.expiryDate).toISOString() : undefined
      })
    });

    form.reset();
    status.textContent = 'License added.';
    await loadLicenses();
  } catch (error) {
    status.textContent = error.message || 'Unable to add license.';
  }
}

window.addEventListener('DOMContentLoaded', () => {
  loadDashboard();
  loadAssets();
  loadMaintenanceTickets();

  const form = document.getElementById('assetForm');
  if (form) {
    form.addEventListener('submit', handleAssetSubmit);
  }

  const maintenanceForm = document.getElementById('maintenanceForm');
  if (maintenanceForm) {
    maintenanceForm.addEventListener('submit', handleMaintenanceSubmit);
  }

  const licenseForm = document.getElementById('licenseForm');
  if (licenseForm) {
    licenseForm.addEventListener('submit', handleLicenseSubmit);
  }

  loadLicenses();
});
