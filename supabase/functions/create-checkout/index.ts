import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const PRODUCT_NAME_BY_PLAN: Record<string, string> = {
  starter: "SAFEViN Starter",
  pro: "SAFEViN Pro",
  expert: "SAFEViN Expert",
};

const log = (step: string, details?: unknown) => {
  console.log(`[create-checkout] ${step}${details ? " - " + JSON.stringify(details) : ""}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr) throw new Error(userErr.message);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");
    log("user", { id: user.id, email: user.email });

    const body = await req.json().catch(() => ({}));
    const plan = String(body?.plan || "").toLowerCase();
    const productName = PRODUCT_NAME_BY_PLAN[plan];
    if (!productName) throw new Error(`Invalid plan: ${plan}`);

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Find Stripe product by name, then take its first active recurring price
    const products = await stripe.products.list({ active: true, limit: 100 });
    const product = products.data.find((p) => p.name === productName);
    if (!product) throw new Error(`Product not found: ${productName}`);
    const prices = await stripe.prices.list({ product: product.id, active: true, limit: 10 });
    const recurring = prices.data.find((p) => p.recurring?.interval === "month") || prices.data[0];
    if (!recurring) throw new Error(`No price for product ${productName}`);
    const stripePriceId = recurring.id;
    log("priceResolved", { productName, productId: product.id, stripePriceId });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    const customerId = customers.data[0]?.id;

    const origin = req.headers.get("origin") || "http://localhost:3000";
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{ price: stripePriceId, quantity: 1 }],
      mode: "subscription",
      allow_promotion_codes: true,
      success_url: `${origin}/home?status=success&plan=${plan}`,
      cancel_url: `${origin}/home?status=cancel`,
      metadata: { user_id: user.id, plan },
      subscription_data: { metadata: { user_id: user.id, plan } },
    });

    log("sessionCreated", { id: session.id });
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log("ERROR", { msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});