// Frontend/src/api/userProfile.js
const API_BASE = import.meta.env.VITE_API_BASE || "";

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
  if (!res.ok) {
    const contentType = res.headers.get("content-type");
    let errorMessage = "Failed to fetch user profile";
    
    try {
      if (contentType && contentType.includes("application/json")) {
        const errorData = await res.json();
        errorMessage = errorData.error || errorMessage;
      } else {
        const errorText = await res.text();
        if (errorText.includes("<html") || errorText.includes("<!DOCTYPE")) {
          errorMessage = "Server error occurred. Please try again.";
        } else {
          errorMessage = errorText || errorMessage;
        }
      }
    } catch (parseError) {
      console.error("Error parsing response:", parseError);
      errorMessage = "Failed to fetch user profile";
    }
    
    throw new Error(errorMessage);
  }
  return res.json();
}

// Update user name
export async function updateUserName(token, name) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
  
  try {
    const res = await fetch(`${API_BASE}/api/user/profile`, {
      method: "PUT",
      headers: {
        ...authHeaders(token),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      const contentType = res.headers.get("content-type");
      let errorMessage = "Failed to update name";
      
      try {
        if (contentType && contentType.includes("application/json")) {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
        } else {
          // Handle non-JSON responses (like HTML error pages)
          const errorText = await res.text();
          // Check if the response contains HTML
          if (errorText.includes("<html") || errorText.includes("<!DOCTYPE")) {
            errorMessage = "Server error occurred. Please try again.";
          } else {
            errorMessage = errorText || errorMessage;
          }
        }
      } catch (parseError) {
        console.error("Error parsing response:", parseError);
        errorMessage = "Failed to update name";
      }
      
      throw new Error(errorMessage);
    }
    
    return res.json();
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error("Request timed out. Please try again.");
    }
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error("Network error. Please check your connection and try again.");
    }
    
    throw error;
  }
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
  if (!res.ok) {
    const contentType = res.headers.get("content-type");
    let errorMessage = "Failed to update profile image";
    
    try {
      if (contentType && contentType.includes("application/json")) {
        const errorData = await res.json();
        errorMessage = errorData.error || errorMessage;
      } else {
        const errorText = await res.text();
        if (errorText.includes("<html") || errorText.includes("<!DOCTYPE")) {
          errorMessage = "Server error occurred. Please try again.";
        } else {
          errorMessage = errorText || errorMessage;
        }
      }
    } catch (parseError) {
      console.error("Error parsing response:", parseError);
      errorMessage = "Failed to update profile image";
    }
    
    throw new Error(errorMessage);
  }
  return res.json();
}

// Remove profile image
export async function removeProfileImage(token) {
  const res = await fetch(`${API_BASE}/api/user/profile-image`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const contentType = res.headers.get("content-type");
    let errorMessage = "Failed to remove profile image";
    
    try {
      if (contentType && contentType.includes("application/json")) {
        const errorData = await res.json();
        errorMessage = errorData.error || errorMessage;
      } else {
        const errorText = await res.text();
        if (errorText.includes("<html") || errorText.includes("<!DOCTYPE")) {
          errorMessage = "Server error occurred. Please try again.";
        } else {
          errorMessage = errorText || errorMessage;
        }
      }
    } catch (parseError) {
      console.error("Error parsing response:", parseError);
      errorMessage = "Failed to remove profile image";
    }
    
    throw new Error(errorMessage);
  }
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
  if (!res.ok) {
    const contentType = res.headers.get("content-type");
    let errorMessage = "Failed to reset password";
    
    try {
      if (contentType && contentType.includes("application/json")) {
        const errorData = await res.json();
        errorMessage = errorData.error || errorMessage;
      } else {
        const errorText = await res.text();
        if (errorText.includes("<html") || errorText.includes("<!DOCTYPE")) {
          errorMessage = "Server error occurred. Please try again.";
        } else {
          errorMessage = errorText || errorMessage;
        }
      }
    } catch (parseError) {
      console.error("Error parsing response:", parseError);
      errorMessage = "Failed to reset password";
    }
    
    throw new Error(errorMessage);
  }
  return res.json();
} 