// Netlify Function: subscribe
// Stores or updates a user's reminder subscription email
import { getStore } from '@netlify/blobs'

const STORE_NAME = 'triangle-health-store'
const SUBSCRIBERS_KEY = 'subscribers.json'

function getUserId(event){
  try{
    const ctx = event.clientContext || {}
    const user = (ctx.user || ctx.identity || {}).sub || (ctx.user && ctx.user.sub)
    return user || null
  }catch{
    return null
  }
}

export async function handler(event){
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  }
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers }
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) }

  const userId = getUserId(event)
  if (!userId) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) }

  try{
    const { email } = JSON.parse(event.body || '{}')
    if (!email) return { statusCode: 400, headers, body: JSON.stringify({ error: 'email is required' }) }

    const store = getStore({ name: STORE_NAME })
    const list = await store.get(SUBSCRIBERS_KEY, { type: 'json' }).catch(() => null) || []
    const others = list.filter(x => x.userId !== userId)
    const entry = { userId, email, enabled: true, updated_at: new Date().toISOString() }
    const updated = [entry, ...others]
    await store.set(SUBSCRIBERS_KEY, JSON.stringify(updated), { metadata: { updatedAt: new Date().toISOString() } })

    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) }
  }catch(e){
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to subscribe', details: String(e) }) }
  }
}
