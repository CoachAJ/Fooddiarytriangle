// Simple API client for Netlify Functions
const BASE = '/.netlify/functions'

function getAuthHeaders() {
  try {
    const id = window.netlifyIdentity
    if (id) {
      const user = id.currentUser()
      if (user && user.token && typeof user.token === 'object' && user.token.access_token) {
        return { Authorization: `Bearer ${user.token.access_token}` }
      }
    }
  } catch { /* netlify identity not available */ }
  return {}
}

export async function listFoods() {
  const res = await fetch(`${BASE}/foods`, { headers: { ...getAuthHeaders() } })
  if (!res.ok) throw new Error('Failed to fetch foods')
  const data = await res.json()
  return data.items || []
}

export async function addFoodApi(payload) {
  const res = await fetch(`${BASE}/foods`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Failed to add food')
  const data = await res.json()
  return data.item
}

export async function listSymptoms() {
  const res = await fetch(`${BASE}/symptoms`, { headers: { ...getAuthHeaders() } })
  if (!res.ok) throw new Error('Failed to fetch symptoms')
  const data = await res.json()
  return data.items || []
}

export async function addSymptomApi(payload) {
  const res = await fetch(`${BASE}/symptoms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Failed to add symptom')
  const data = await res.json()
  return data.item
}

export async function getInsights() {
  const res = await fetch(`${BASE}/insights`, { headers: { ...getAuthHeaders() } })
  if (!res.ok) throw new Error('Failed to fetch insights')
  const data = await res.json()
  return data.insights || []
}

// Seed demo data for WOW experience
export async function seedDemo() {
  const res = await fetch(`${BASE}/seed_demo`, { headers: { ...getAuthHeaders() } })
  if (!res.ok) throw new Error('Failed to seed demo data')
  return res.json()
}

// Export CSV of foods and symptoms
export async function exportCSV() {
  const res = await fetch(`${BASE}/export_csv`, { headers: { ...getAuthHeaders() } })
  if (!res.ok) throw new Error('Failed to export CSV')
  const blob = await res.blob()
  return blob
}

export async function subscribeReminders(email) {
  const res = await fetch(`${BASE}/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ email })
  })
  if (!res.ok) throw new Error('Failed to subscribe')
  return res.json()
}
