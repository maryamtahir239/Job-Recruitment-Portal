// Frontend/src/api/userProfile.js
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001";

function authHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

// Get user profile
export async function getUserProfile(token) {
  const res = await fetch(`${API_BASE}/api/user/profile`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Update profile image
export async function updateProfileImage(token, file) {
  const formData = new FormData();
  formData.append('profile_image', file);

  const res = await fetch(`${API_BASE}/api/user/profile-image`, {
    method: "PUT",
    headers: {
      ...authHeaders(token),
    },
    body: formData,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Remove profile image
export async function removeProfileImage(token) {
  const res = await fetch(`${API_BASE}/api/user/profile-image`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Reset password
export async function resetPassword(token, currentPassword, newPassword) {
  const res = await fetch(`${API_BASE}/api/user/reset-password`, {
    method: "PUT",
    headers: {
      ...authHeaders(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
} 