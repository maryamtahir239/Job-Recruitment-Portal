// Frontend/src/api/adminUsers.js
function authHeaders(token) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function listAdminUsers(token) {
  const res = await fetch(`/api/admin/users`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createAdminUser(token, payload) {
  const res = await fetch(`/api/admin/users`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateAdminUser(token, id, payload) {
  const res = await fetch(`/api/admin/users/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteAdminUser(token, id) {
  const res = await fetch(`/api/admin/users/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
