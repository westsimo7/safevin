// Cron: runs every 15 minutes. Sends free trial reminders (2h, 24h, 48h)
// to free users who haven't created their first listing yet.
// Idempotency is enforced via the email API's `idempotency_key`.
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from 'jsr:@supabase/supabase-js@2/cors'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface Window {
  template: string
  hoursMin: number
  hoursMax: number
}

// Order matters: process oldest windows first (48h before 24h before 2h)
const WINDOWS: Window[] = [
  { template: 'free-reminder-48h', hoursMin: 48, hoursMax: 96 },
  { template: 'free-reminder-24h', hoursMin: 24, hoursMax: 48 },
  { template: 'free-reminder-2h',  hoursMin: 2,  hoursMax: 24 },
]

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE)
  const results: Record<string, { sent: number; skipped: number; errors: number }> = {}

  for (const win of WINDOWS) {
    results[win.template] = { sent: 0, skipped: 0, errors: 0 }

    // Find candidates: free users with 0 studio_used, registered within window
    const minDate = new Date(Date.now() - win.hoursMax * 3600 * 1000).toISOString()
    const maxDate = new Date(Date.now() - win.hoursMin * 3600 * 1000).toISOString()

    const { data: profiles, error: pErr } = await supabase
      .from('profiles')
      .select('user_id, email, nome, created_at')
      .gte('created_at', minDate)
      .lte('created_at', maxDate)
      .limit(500)

    if (pErr) {
      console.error('profiles err', pErr)
      results[win.template].errors++
      continue
    }
    if (!profiles?.length) continue

    const userIds = profiles.map(p => p.user_id)

    // Filter to free plan with 0 studio_used
    const { data: credits } = await supabase
      .from('user_credits')
      .select('user_id, plan, studio_used')
      .in('user_id', userIds)

    const eligible = new Set(
      (credits || [])
        .filter(c => c.plan === 'free' && (c.studio_used ?? 0) === 0)
        .map(c => c.user_id)
    )

    for (const p of profiles) {
      if (!eligible.has(p.user_id) || !p.email) {
        results[win.template].skipped++
        continue
      }

      const idempotencyKey = `${win.template}-${p.user_id}`

      // Pre-check: skip if already logged (prevents repeated invokes)
      const { data: existing } = await supabase
        .from('email_send_log')
        .select('id')
        .eq('recipient_email', p.email)
        .eq('template_name', win.template)
        .limit(1)
        .maybeSingle()
      if (existing) {
        results[win.template].skipped++
        continue
      }

      try {
        const { error } = await supabase.functions.invoke('send-transactional-email', {
          body: {
            templateName: win.template,
            recipientEmail: p.email,
            idempotencyKey,
            templateData: { name: p.nome || undefined },
          },
        })
        if (error) {
          console.error('send err', win.template, p.email, error)
          results[win.template].errors++
        } else {
          results[win.template].sent++
        }
      } catch (e) {
        console.error('invoke err', e)
        results[win.template].errors++
      }
      // Throttle: stay under invocation rate limit
      await new Promise(r => setTimeout(r, 600))
    }
  }

  return new Response(JSON.stringify({ ok: true, results }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
