// Cron: runs every 15 minutes.
// - Trial reminders (1h, 24h, 48h, 4d, 5d, 7d): per utenti free che NON hanno ancora
//   creato il primo annuncio (studio_used = 0).
// Idempotency è garantita dal pre-check su email_send_log.
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from 'jsr:@supabase/supabase-js@2/cors'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Trial sequence: chained on previous email's sent_at (not registration date).
// 1h → 24h → 48h → 4d → 5d → 7d. Allows restart by clearing logs.
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

  // ===== Trial sequence (chained on previous email's sent_at) =====
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

  for (const step of TRIAL_SEQUENCE) {
    results[step.template] = { sent: 0, skipped: 0, errors: 0 }
    for (const p of trialProfiles || []) {
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
        const { error } = await supabase.functions.invoke('send-transactional-email', {
          body: {
            templateName: step.template,
            recipientEmail: p.email,
            idempotencyKey: `${step.template}-${p.user_id}-${Date.now()}`,
            templateData: { name: p.nome || undefined },
          },
        })
        if (error) { console.error('send err', step.template, p.email, error); results[step.template].errors++ }
        else { results[step.template].sent++ }
      } catch (e) {
        console.error('invoke err', e); results[step.template].errors++
      }
      await new Promise(r => setTimeout(r, 400))
    }
  }

  return new Response(JSON.stringify({ ok: true, results }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
