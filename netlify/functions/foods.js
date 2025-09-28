// Netlify Function: foods
// Provides GET (list foods) and POST (add food) endpoints.
// NOTE: For MVP this uses an in-memory fallback when Blobs is unavailable (local dev without Netlify).

import { getStore } from '@netlify/blobs'

const STORE_NAME = 'triangle-health-store'
const FOODS_PREFIX = 'foods_'

// In-memory fallback for local dev without Blobs
const memoryFoods = new Map() // key: userId -> list

function getUserId(event) {
  try {
    const ctx = event.clientContext || {}
    const user = (ctx.user || ctx.identity || {}).sub || (ctx.user && ctx.user.sub)
    return user || 'public'
  } catch {
    return 'public'
  }
}

function keyFor(userId){
  return `${FOODS_PREFIX}${userId}.json`
}

async function readFoods(userId) {
  try {
    const store = getStore({ name: STORE_NAME })
    const contents = await store.get(keyFor(userId), { type: 'json' })
    return Array.isArray(contents) ? contents : []
  } catch {
    // Fallback
    return memoryFoods.get(userId) || []
  }
}

async function writeFoods(userId, list) {
  try {
    const store = getStore({ name: STORE_NAME })
    await store.set(keyFor(userId), JSON.stringify(list), { metadata: { updatedAt: new Date().toISOString(), userId } })
  } catch {
    // Fallback
    memoryFoods.set(userId, list)
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
    const userId = getUserId(event)
    const list = await readFoods(userId)
    return { statusCode: 200, headers, body: JSON.stringify({ items: list }) }
  }

  if (event.httpMethod === 'POST') {
    try {
      const userId = getUserId(event)
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
      const list = await readFoods(userId)
      const updated = [item, ...list]
      await writeFoods(userId, updated)
      return { statusCode: 201, headers, body: JSON.stringify({ item }) }
    } catch (e) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to add food', details: String(e) }) }
    }
  }

  return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) }
}
