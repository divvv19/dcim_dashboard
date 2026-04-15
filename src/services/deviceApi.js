const API_BASE_URL = import.meta.env.VITE_DCIM_API_URL ?? 'http://localhost:5000';

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}/api${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const details = payload.issues?.map((issue) => issue.message).join(' ') ?? '';
    throw new Error(payload.error || details || 'API request failed.');
  }

  return payload;
}

export async function fetchBuses() {
  const payload = await apiRequest('/buses');
  return payload.buses ?? [];
}

export async function createBus(busPayload) {
  const payload = await apiRequest('/buses', {
    method: 'POST',
    body: JSON.stringify(busPayload),
  });

  return payload.bus;
}

export async function fetchProfiles(deviceType) {
  const suffix = deviceType ? `?deviceType=${encodeURIComponent(deviceType)}` : '';
  const payload = await apiRequest(`/profiles${suffix}`);
  return payload.profiles ?? [];
}

export async function fetchDevices() {
  const payload = await apiRequest('/devices');
  return payload.devices ?? [];
}

export async function testDeviceConnection(devicePayload) {
  const payload = await apiRequest('/devices/test-connection', {
    method: 'POST',
    body: JSON.stringify(devicePayload),
  });

  return payload.result;
}

export async function createDevice(devicePayload) {
  return apiRequest('/devices', {
    method: 'POST',
    body: JSON.stringify(devicePayload),
  });
}

export async function updateDevice(deviceId, devicePayload) {
  return apiRequest(`/devices/${deviceId}`, {
    method: 'PUT',
    body: JSON.stringify(devicePayload),
  });
}

export { API_BASE_URL };
