import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const log = (step: string, details?: unknown) => {
  console.log(`[check-subscription] ${step}${details ? " - " + JSON.stringify(details) : ""}`);
};

// Map Stripe product name -> internal plan id
const PLAN_BY_PRODUCT_NAME: Record<string, "starter" | "pro" | "expert"> = {
  "SAFEViN Starter": "starter",
  "SAFEViN Pro": "pro",
  "SAFEViN Expert": "expert",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");

    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr) throw new Error(userErr.message);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");
    log("user", { id: user.id });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      log("no customer, ensuring free");
      await supabaseAdmin.rpc("sync_user_plan_from_payment", {
        p_user_id: user.id,
        p_new_plan: "free",
      });
      return new Response(
        JSON.stringify({ subscribed: false, plan: "free", subscription_end: null }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    const customerId = customers.data[0].id;
    const subs = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
      expand: ["data.items.data.price.product"],
    });

    let plan: "free" | "starter" | "pro" | "expert" = "free";
    let subscriptionEnd: string | null = null;
    let subscribed = false;

    if (subs.data.length > 0) {
      const sub = subs.data[0];
      subscribed = true;
      subscriptionEnd = new Date(sub.current_period_end * 1000).toISOString();
      const product = sub.items.data[0]?.price?.product as { name?: string } | undefined;
      const productName = product?.name;
      if (productName && PLAN_BY_PRODUCT_NAME[productName]) {
        plan = PLAN_BY_PRODUCT_NAME[productName];
      }
      log("active sub", { subId: sub.id, productName, plan });
    }

    await supabaseAdmin.rpc("sync_user_plan_from_payment", {
      p_user_id: user.id,
      p_new_plan: plan,
    });

    return new Response(
      JSON.stringify({ subscribed, plan, subscription_end: subscriptionEnd }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log("ERROR", { msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});