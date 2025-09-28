// Netlify Function: export_csv
// Exports foods and symptoms as a CSV download
import { getStore } from '@netlify/blobs'

const STORE_NAME = 'triangle-health-store'
const FOODS_KEY = 'foods.json'
const SYMPTOMS_KEY = 'symptoms.json'

function toCSV(rows){
  return rows.map(r => r.map(v => {
    if (v == null) return ''
    const s = String(v)
    if (/[",\n]/.test(s)) return '"' + s.replace(/"/g,'""') + '"'
    return s
  }).join(',')).join('\n')
}

export async function handler(){
  try {
    const store = getStore({ name: STORE_NAME })
    const [foods, symptoms] = await Promise.all([
      store.get(FOODS_KEY, { type: 'json' }).then(v => Array.isArray(v)?v:[]).catch(()=>[]),
      store.get(SYMPTOMS_KEY, { type: 'json' }).then(v => Array.isArray(v)?v:[]).catch(()=>[]),
    ])

    const rows = []
    rows.push(['Type','ID','Name','Severity','Feeling','Time'])
    for(const f of foods){
      rows.push(['food', f.id||'', f.name||'', '', f.feeling||'', f.time||''])
    }
    for(const s of symptoms){
      rows.push(['symptom', s.id||'', s.name||'', s.severity ?? '', '', s.time||''])
    }

    const csv = toCSV(rows)
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="triangle-health-export.csv"',
        'Access-Control-Allow-Origin': '*'
      },
      body: csv
    }
  } catch (e) {
    return { statusCode: 500, body: String(e) }
  }
}
