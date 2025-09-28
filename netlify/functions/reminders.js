/* eslint-env node */
// Netlify Scheduled Function: reminders
// Sends (logs) periodic reminder events. In production, integrate with email/push providers.
import { getStore } from '@netlify/blobs'
import { Resend } from 'resend'

export const config = {
  schedule: '@hourly', // run hourly; adjust as needed
}

const STORE_NAME = 'triangle-health-store'
const SUBSCRIBERS_KEY = 'subscribers.json'

export async function handler() {
  try {
    const resendApiKey = process.env.RESEND_API_KEY
    if (!resendApiKey) {
      console.warn('[reminders] RESEND_API_KEY not set; skipping email send')
      return { statusCode: 200, body: JSON.stringify({ ok: true, skipped: true }) }
    }
    const resend = new Resend(resendApiKey)
    const store = getStore({ name: STORE_NAME })
    const subs = await store.get(SUBSCRIBERS_KEY, { type: 'json' }).catch(() => null) || []
    if (!Array.isArray(subs) || subs.length === 0) {
      return { statusCode: 200, body: JSON.stringify({ ok: true, sent: 0 }) }
    }

    // Compose a simple email
    const from = process.env.REMINDER_FROM_EMAIL || 'no-reply@triangle-health.app'
    const subject = process.env.REMINDER_SUBJECT || 'Your Triangle Health Check-in'
    let sent = 0
    for (const s of subs) {
      if (!s.enabled || !s.email) continue
      try {
        await resend.emails.send({
          from,
          to: s.email,
          subject,
          text: 'How are you feeling? Log your foods and symptoms to see fresh insights.',
        })
        sent++
      } catch (e) {
        console.error('[reminders] send failed', s.email, e)
      }
    }
    return { statusCode: 200, body: JSON.stringify({ ok: true, sent }) }
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: 'reminders failed', details: String(e) }) }
  }
}
