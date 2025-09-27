// Netlify Function: insights
// Computes simple rule-based insights by looking at foods and symptoms within a 24h window.

import { getStore } from '@netlify/blobs'

const STORE_NAME = 'triangle-health-store'
const FOODS_KEY = 'foods.json'
const SYMPTOMS_KEY = 'symptoms.json'

async function readList(key) {
  try {
    const store = getStore({ name: STORE_NAME })
    const contents = await store.get(key, { type: 'json' })
    return Array.isArray(contents) ? contents : []
  } catch {
    return []
  }
}

function toDate(v) {
  const d = new Date(v)
  return isNaN(d.getTime()) ? new Date() : d
}

export async function handler() {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  }
  try {
    const [foods, symptoms] = await Promise.all([
      readList(FOODS_KEY),
      readList(SYMPTOMS_KEY),
    ])

    const insights = []

    // Example rule: If any food tag/name includes dairy and user has bloating within 24h, create insight
    const dairyFoods = foods.filter(f => /milk|cheese|yogurt|dairy/i.test(f.name || ''))
    const bloating = symptoms.filter(s => /bloat/i.test(s.name || ''))
    for (const df of dairyFoods) {
      const t0 = toDate(df.time)
      const within = bloating.some(b => {
        const tb = toDate(b.time)
        const diff = Math.abs(tb - t0)
        return diff <= 24 * 60 * 60 * 1000
      })
      if (within) {
        insights.push("You're more likely to experience bloating within 24h of consuming dairy. Consider alternatives.")
        break
      }
    }

    // Example rule: If many symptoms logged late afternoon, suggest protein-rich breakfast
    const afternoon = symptoms.filter(s => {
      const h = toDate(s.time).getHours()
      return h >= 14 && h <= 18
    })
    if (afternoon.length >= 3) {
      insights.push('Afternoon symptom spikes detected. Try a protein-rich breakfast to stabilize energy.')
    }

    // Fallback if none
    if (insights.length === 0) {
      insights.push('Keep logging your foods and symptoms — insights will appear as more data is collected.')
    }

    return { statusCode: 200, headers, body: JSON.stringify({ insights }) }
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to compute insights', details: String(e) }) }
  }
}
