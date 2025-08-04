function authHeaders(token) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// Get all evaluation templates (SuperAdmin only)
export async function getEvaluationTemplates(token) {
  const res = await fetch(`/api/evaluation-templates`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Get evaluation template by ID (SuperAdmin only)
export async function getEvaluationTemplateById(token, id) {
  const res = await fetch(`/api/evaluation-templates/${id}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Get evaluation template by job ID (Interviewers, HR, SuperAdmin)
export async function getEvaluationTemplateByJobId(token, jobId) {
  const res = await fetch(`/api/evaluation-templates/job/${jobId}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Create new evaluation template (SuperAdmin only)
export async function createEvaluationTemplate(token, payload) {
  const res = await fetch(`/api/evaluation-templates`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Update evaluation template (SuperAdmin only)
export async function updateEvaluationTemplate(token, id, payload) {
  const res = await fetch(`/api/evaluation-templates/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Delete evaluation template (SuperAdmin only)
export async function deleteEvaluationTemplate(token, id) {
  const res = await fetch(`/api/evaluation-templates/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
} 