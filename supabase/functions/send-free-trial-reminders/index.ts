// Cron: runs every 15 minutes.
// - Trial reminders (2h, 24h, 48h): per utenti free che NON hanno ancora
//   creato il primo annuncio (studio_used = 0).
// - Post-credit reminders (4d, 7d): per utenti free che hanno esaurito
//   i crediti (studio_used >= 1) — spingono su acquisti singoli e premium.
// Idempotency è garantita dal pre-check su email_send_log.
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from 'jsr:@supabase/supabase-js@2/cors'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface Window {
  template: string
  hoursMin: number
  hoursMax: number
  // 'unused' = solo studio_used = 0 (trial reminders)
  // 'exhausted' = studio_used >= 1 (crediti finiti)
  audience: 'unused' | 'exhausted'
}

// Trial sequence: chained on previous email's sent_at (not registration date).
// 1h → 24h after 1h → 48h after 24h. Allows restart by clearing logs.
// Post-credit reminders (4d, 7d) remain registration-based for exhausted users.
const TRIAL_SEQUENCE = [
  { template: 'free-reminder-2h',  prev: null,                   gapHours: 1  }, // first email (1h after signup)
  { template: 'free-reminder-24h', prev: 'free-reminder-2h',     gapHours: 23 }, // ~24h total
  { template: 'free-reminder-48h', prev: 'free-reminder-24h',    gapHours: 24 }, // ~48h total
] as const

const POST_CREDIT_WINDOWS: Window[] = [
  { template: 'free-reminder-7d', hoursMin: 168, hoursMax: 336, audience: 'exhausted' },
  { template: 'free-reminder-4d', hoursMin: 96,  hoursMax: 168, audience: 'exhausted' },
]
const WINDOWS = POST_CREDIT_WINDOWS

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE)
  const results: Record<string, { sent: number; skipped: number; errors: number }> = {}

  for (const win of WINDOWS) {
    results[win.template] = { sent: 0, skipped: 0, errors: 0 }

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

    const { data: credits } = await supabase
      .from('user_credits')
      .select('user_id, plan, studio_used')
      .in('user_id', userIds)

    const eligible = new Set(
      (credits || [])
        .filter(c => {
          if (c.plan !== 'free') return false
          const used = c.studio_used ?? 0
          return win.audience === 'unused' ? used === 0 : used >= 1
        })
        .map(c => c.user_id)
    )

    for (const p of profiles) {
      if (!eligible.has(p.user_id) || !p.email) {
        results[win.template].skipped++
        continue
      }

      const idempotencyKey = `${win.template}-${p.user_id}`

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
      await new Promise(r => setTimeout(r, 600))
    }
  }

  return new Response(JSON.stringify({ ok: true, results }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
