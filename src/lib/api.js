// Simple API client for Netlify Functions
const BASE = '/.netlify/functions'

export async function listFoods() {
  const res = await fetch(`${BASE}/foods`)
  if (!res.ok) throw new Error('Failed to fetch foods')
  const data = await res.json()
  return data.items || []
}

export async function addFoodApi(payload) {
  const res = await fetch(`${BASE}/foods`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Failed to add food')
  const data = await res.json()
  return data.item
}

export async function listSymptoms() {
  const res = await fetch(`${BASE}/symptoms`)
  if (!res.ok) throw new Error('Failed to fetch symptoms')
  const data = await res.json()
  return data.items || []
}

export async function addSymptomApi(payload) {
  const res = await fetch(`${BASE}/symptoms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Failed to add symptom')
  const data = await res.json()
  return data.item
}

export async function getInsights() {
  const res = await fetch(`${BASE}/insights`)
  if (!res.ok) throw new Error('Failed to fetch insights')
  const data = await res.json()
  return data.insights || []
}

// Seed demo data for WOW experience
export async function seedDemo() {
  const res = await fetch(`${BASE}/seed_demo`)
  if (!res.ok) throw new Error('Failed to seed demo data')
  return res.json()
}

// Export CSV of foods and symptoms
export async function exportCSV() {
  const res = await fetch(`${BASE}/export_csv`)
  if (!res.ok) throw new Error('Failed to export CSV')
  const blob = await res.blob()
  return blob
}
