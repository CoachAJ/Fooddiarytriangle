// Netlify Function: symptoms
// Provides GET (list symptoms) and POST (add symptom) endpoints.

import { getStore } from '@netlify/blobs'

const STORE_NAME = 'triangle-health-store'
const SYMPTOMS_KEY = 'symptoms.json'

let memorySymptoms = []

async function readSymptoms() {
  try {
    const store = getStore({ name: STORE_NAME })
    const contents = await store.get(SYMPTOMS_KEY, { type: 'json' })
    return Array.isArray(contents) ? contents : []
  } catch {
    return memorySymptoms
  }
}

async function writeSymptoms(list) {
  try {
    const store = getStore({ name: STORE_NAME })
    await store.set(SYMPTOMS_KEY, JSON.stringify(list), { metadata: { updatedAt: new Date().toISOString() } })
  } catch {
    memorySymptoms = list
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
    const list = await readSymptoms()
    return { statusCode: 200, headers, body: JSON.stringify({ items: list }) }
  }

  if (event.httpMethod === 'POST') {
    try {
      const payload = JSON.parse(event.body || '{}')
      const { name, severity, time } = payload
      if (!name) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'name is required' }) }
      }
      const item = {
        id: crypto.randomUUID(),
        name,
        severity: typeof severity === 'number' ? severity : 3,
        time: time || new Date().toISOString(),
        created_at: new Date().toISOString()
      }
      const list = await readSymptoms()
      const updated = [item, ...list]
      await writeSymptoms(updated)
      return { statusCode: 201, headers, body: JSON.stringify({ item }) }
    } catch (e) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to add symptom', details: String(e) }) }
    }
  }

  return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) }
}
