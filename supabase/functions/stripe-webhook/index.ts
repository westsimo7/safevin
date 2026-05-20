import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const log = (step: string, details?: unknown) => {
  console.log(`[stripe-webhook] ${step}${details ? " - " + JSON.stringify(details) : ""}`);
};

const PLAN_BY_PRODUCT_NAME: Record<string, "starter" | "pro" | "expert"> = {
  "SAFEViN Starter": "starter",
  "SAFEViN Pro": "pro",
  "SAFEViN Expert": "expert",
};

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  { auth: { persistSession: false } }
);

async function resolvePlanFromSubscription(stripe: Stripe, sub: Stripe.Subscription) {
  const item = sub.items.data[0];
  let productName: string | undefined;
  const product = item?.price?.product;
  if (typeof product === "string") {
    const p = await stripe.products.retrieve(product);
    productName = p.name;
  } else if (product && "name" in product) {
    productName = (product as Stripe.Product).name;
  }
  const plan = productName ? PLAN_BY_PRODUCT_NAME[productName] : undefined;
  return { plan, productName };
}

async function resolveUserId(stripe: Stripe, sub: Stripe.Subscription): Promise<string | null> {
  const metaUserId = (sub.metadata as any)?.user_id;
  if (metaUserId) return metaUserId;

  // Fallback: lookup profile by customer email
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const cust = await stripe.customers.retrieve(customerId);
  const email = (cust as Stripe.Customer).email;
  if (!email) return null;
  const { data } = await supabaseAdmin
    .from("profiles")
    .select("user_id")
    .eq("email", email)
    .maybeSingle();
  return data?.user_id ?? null;
}

async function syncFromSubscription(stripe: Stripe, sub: Stripe.Subscription) {
  const userId = await resolveUserId(stripe, sub);
  if (!userId) { log("no user resolved", { sub: sub.id }); return; }

  const isActive = ["active", "trialing", "past_due"].includes(sub.status);
  let plan: "free" | "starter" | "pro" | "expert" = "free";
  let periodEnd: string | null = null;

  if (isActive) {
    const r = await resolvePlanFromSubscription(stripe, sub);
    if (r.plan) plan = r.plan;
    periodEnd = new Date(sub.current_period_end * 1000).toISOString();
  }

  const { error } = await supabaseAdmin.rpc("sync_user_plan_from_payment", {
    p_user_id: userId,
    p_new_plan: plan,
    p_period_end: periodEnd,
  });
  if (error) log("sync error", { msg: error.message });
  else log("synced", { userId, plan, periodEnd });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!stripeKey || !webhookSecret) {
    log("missing secrets");
    return new Response("Server misconfigured", { status: 500 });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature!, webhookSecret);
  } catch (err) {
    log("signature verification failed", { msg: (err as Error).message });
    return new Response("Invalid signature", { status: 400 });
  }

  log("event", { type: event.type, id: event.id });

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription" && session.subscription) {
          const subId = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
          const sub = await stripe.subscriptions.retrieve(subId);
          // Propagate metadata.user_id from session to subscription if missing
          if (!sub.metadata?.user_id && session.metadata?.user_id) {
            await stripe.subscriptions.update(subId, {
              metadata: { ...sub.metadata, user_id: session.metadata.user_id, plan: session.metadata.plan ?? "" },
            });
            sub.metadata = { ...sub.metadata, user_id: session.metadata.user_id };
          }
          await syncFromSubscription(stripe, sub);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
      case "invoice.paid":
      case "invoice.payment_failed": {
        const obj: any = event.data.object;
        const subId = obj.subscription ?? obj.id;
        if (typeof subId === "string") {
          const sub = await stripe.subscriptions.retrieve(subId);
          await syncFromSubscription(stripe, sub);
        }
        break;
      }
      default:
        log("ignored", { type: event.type });
    }
  } catch (err) {
    log("handler error", { msg: (err as Error).message });
    return new Response(JSON.stringify({ received: true, error: (err as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200, // ack to avoid retries on internal errors we've logged
    });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
});
