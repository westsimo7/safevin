// Cron: runs every 15 minutes.
// Trial reminders (1h, 24h, 48h, 4d, 5d, 7d) for free users with studio_used=0.
// Uses the DB RPC invoke_send_transactional_email (which reads the legacy JWT
// from vault) to bypass the new sb_secret_* key format that breaks verify_jwt.
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from 'jsr:@supabase/supabase-js@2/cors'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const TRIAL_SEQUENCE = [
  { template: 'free-reminder-2h',  prev: null,                gapHours: 1  },
  { template: 'free-reminder-24h', prev: 'free-reminder-2h',  gapHours: 23 },
  { template: 'free-reminder-48h', prev: 'free-reminder-24h', gapHours: 24 },
  { template: 'free-reminder-4d',  prev: 'free-reminder-48h', gapHours: 48 },
  { template: 'free-reminder-5d',  prev: 'free-reminder-4d',  gapHours: 24 },
  { template: 'free-reminder-7d',  prev: 'free-reminder-5d',  gapHours: 48 },
] as const

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE)
  const results: Record<string, { sent: number; skipped: number; errors: number }> = {}

  const { data: trialCredits } = await supabase
    .from('user_credits')
    .select('user_id')
    .eq('plan', 'free')
    .eq('studio_used', 0)
    .limit(2000)
  const trialUserIds = (trialCredits || []).map(c => c.user_id)
  const { data: trialProfiles } = trialUserIds.length
    ? await supabase
        .from('profiles')
        .select('user_id, email, nome, created_at')
        .in('user_id', trialUserIds)
    : { data: [] as any[] }

  // Cap per run to smooth load. 50/run x 15min = ~200/h.
  const MAX_SENDS_PER_RUN = 50
  let sentThisRun = 0

  for (const step of TRIAL_SEQUENCE) {
    results[step.template] = { sent: 0, skipped: 0, errors: 0 }
    for (const p of trialProfiles || []) {
      if (sentThisRun >= MAX_SENDS_PER_RUN) { results[step.template].skipped++; continue }
      if (!p.email) { results[step.template].skipped++; continue }

      const { data: alreadySent } = await supabase
        .from('email_send_log')
        .select('id')
        .eq('recipient_email', p.email)
        .eq('template_name', step.template)
        .limit(1)
        .maybeSingle()
      if (alreadySent) { results[step.template].skipped++; continue }

      let anchorTime: Date
      if (step.prev) {
        const { data: prevLog } = await supabase
          .from('email_send_log')
          .select('created_at')
          .eq('recipient_email', p.email)
          .eq('template_name', step.prev)
          .order('created_at', { ascending: true })
          .limit(1)
          .maybeSingle()
        if (!prevLog) { results[step.template].skipped++; continue }
        anchorTime = new Date(prevLog.created_at)
      } else {
        anchorTime = new Date(p.created_at)
      }
      const elapsedH = (Date.now() - anchorTime.getTime()) / 3600000
      if (elapsedH < step.gapHours) { results[step.template].skipped++; continue }

      try {
        // Use DB RPC which authenticates via vault legacy JWT — bypasses the
        // sb_secret_* key format incompatibility with verify_jwt=true.
        const { data, error } = await supabase.rpc('invoke_send_transactional_email', {
          p_template_name: step.template,
          p_recipient_email: p.email,
          p_idempotency_key: `${step.template}-${p.user_id}-${Date.now()}`,
          p_template_data: { name: p.nome || undefined },
        })
        if (error) {
          console.error('rpc err', step.template, p.email, error.message)
          results[step.template].errors++
        } else if (data === null) {
          console.error('rpc returned null (vault key missing?)', step.template, p.email)
          results[step.template].errors++
        } else {
          results[step.template].sent++
          sentThisRun++
        }
      } catch (e) {
        console.error('invoke err', e); results[step.template].errors++
      }
      // Light delay to avoid spike on pg_net.
      await new Promise(r => setTimeout(r, 150))
    }
  }

  return new Response(JSON.stringify({ ok: true, sentThisRun, results }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
