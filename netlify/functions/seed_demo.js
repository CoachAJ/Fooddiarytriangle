// Netlify Function: seed_demo
// Seeds demo foods and symptoms for a quick WOW experience.
import { getStore } from '@netlify/blobs'

const STORE_NAME = 'triangle-health-store'
const FOODS_PREFIX = 'foods_'
const SYMPTOMS_PREFIX = 'symptoms_'

function daysAgo(n){
  const d = new Date(); d.setDate(d.getDate()-n); return d
}

function getUserId(event){
  try{
    const ctx = event.clientContext || {}
    const user = (ctx.user || ctx.identity || {}).sub || (ctx.user && ctx.user.sub)
    return user || 'public'
  }catch{
    return 'public'
  }
}

export async function handler(event){
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  try {
    const userId = getUserId(event)
    const store = getStore({ name: STORE_NAME })

    const foods = [
      { id: crypto.randomUUID(), name: 'Greek Yogurt', feeling: 'Satisfied', time: daysAgo(0).toISOString(), created_at: new Date().toISOString() },
      { id: crypto.randomUUID(), name: 'Protein Omelette', feeling: 'Energized', time: daysAgo(1).toISOString(), created_at: new Date().toISOString() },
      { id: crypto.randomUUID(), name: 'Pasta Alfredo (Cheese)', feeling: 'Bloated', time: daysAgo(2).toISOString(), created_at: new Date().toISOString() },
      { id: crypto.randomUUID(), name: 'Grilled Chicken Salad', feeling: 'Light', time: daysAgo(3).toISOString(), created_at: new Date().toISOString() },
      { id: crypto.randomUUID(), name: 'Ice Cream', feeling: 'Sluggish', time: daysAgo(4).toISOString(), created_at: new Date().toISOString() }
    ]

    const symptoms = [
      { id: crypto.randomUUID(), name: 'Bloating', severity: 4, time: daysAgo(2).toISOString(), created_at: new Date().toISOString() },
      { id: crypto.randomUUID(), name: 'Fatigue', severity: 3, time: daysAgo(4).toISOString(), created_at: new Date().toISOString() },
      { id: crypto.randomUUID(), name: 'Energy Crash', severity: 2, time: daysAgo(1).toISOString(), created_at: new Date().toISOString() },
      { id: crypto.randomUUID(), name: 'Headache', severity: 2, time: daysAgo(0).toISOString(), created_at: new Date().toISOString() }
    ]

    await store.set(`${FOODS_PREFIX}${userId}.json`, JSON.stringify(foods), { metadata: { seededAt: new Date().toISOString(), userId } })
    await store.set(`${SYMPTOMS_PREFIX}${userId}.json`, JSON.stringify(symptoms), { metadata: { seededAt: new Date().toISOString(), userId } })

    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, foods: foods.length, symptoms: symptoms.length }) }
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to seed demo', details: String(e) }) }
  }
}
