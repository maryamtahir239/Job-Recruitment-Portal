function authHeaders(token) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// Get all jobs (no auth required for public jobs)
export async function listJobs(token = null) {
  const headers = token ? authHeaders(token) : { "Content-Type": "application/json" };
  
  const res = await fetch(`/api/jobs`, {
    headers,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Get job by ID
export async function getJobById(id, token = null) {
  const headers = token ? authHeaders(token) : { "Content-Type": "application/json" };
  
  const res = await fetch(`/api/jobs/${id}`, {
    headers,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Create new job (requires auth)
export async function createJob(token, payload) {
  const res = await fetch(`/api/jobs`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Update job (requires auth)
export async function updateJob(token, id, payload) {
  const res = await fetch(`/api/jobs/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Delete job (requires auth)
export async function deleteJob(token, id) {
  const res = await fetch(`/api/jobs/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
} 