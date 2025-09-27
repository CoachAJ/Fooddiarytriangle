// Netlify Function: foods
// Provides GET (list foods) and POST (add food) endpoints.
// NOTE: For MVP this uses an in-memory fallback when Blobs is unavailable (local dev without Netlify).

import { getStore } from '@netlify/blobs'

const STORE_NAME = 'triangle-health-store'
const FOODS_KEY = 'foods.json'

// In-memory fallback for local dev without Blobs
let memoryFoods = []

async function readFoods() {
  try {
    const store = getStore({ name: STORE_NAME })
    const contents = await store.get(FOODS_KEY, { type: 'json' })
    return Array.isArray(contents) ? contents : []
  } catch (e) {
    // Fallback
    return memoryFoods
  }
}

async function writeFoods(list) {
  try {
    const store = getStore({ name: STORE_NAME })
    await store.set(FOODS_KEY, JSON.stringify(list), { metadata: { updatedAt: new Date().toISOString() } })
  } catch (e) {
    // Fallback
    memoryFoods = list
  }
}

export async function handler(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers }
  }

  if (event.httpMethod === 'GET') {
    const list = await readFoods()
    return { statusCode: 200, headers, body: JSON.stringify({ items: list }) }
  }

  if (event.httpMethod === 'POST') {
    try {
      const payload = JSON.parse(event.body || '{}')
      const { name, time, feeling, tags } = payload
      if (!name) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'name is required' }) }
      }
      const item = {
        id: crypto.randomUUID(),
        name,
        time: time || new Date().toISOString(),
        feeling: feeling || 'Not rated',
        tags: Array.isArray(tags) ? tags : [],
        created_at: new Date().toISOString()
      }
      const list = await readFoods()
      const updated = [item, ...list]
      await writeFoods(updated)
      return { statusCode: 201, headers, body: JSON.stringify({ item }) }
    } catch (e) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to add food', details: String(e) }) }
    }
  }

  return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) }
}
