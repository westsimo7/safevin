import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const LEGACY_PRICE_ID = "price_1TUc2XQjr3o863GD5mwBifjm"; // 0.59€ per ad
const COUPON_10 = "OnXtQyhj";
const COUPON_15 = "9VbrLq1R";
const COUPON_20 = "1LCLkhLY";
const pickCoupon = (q: number) =>
  q >= 60 ? COUPON_20 : q >= 30 ? COUPON_15 : q >= 10 ? COUPON_10 : null;

// Fixed bundle tiers (one-time, custom price)
const TIER_PRICE_BY_QTY: Record<number, string> = {
  5: "price_1TXRTMQjr3o863GDb9VgMTPO",   // €2,95
  10: "price_1TXRTmQjr3o863GDK3enbIxw",  // €5,95
  15: "price_1TXRUCQjr3o863GDLNJtkzud",  // €9,95
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not set");

    const body = await req.json().catch(() => ({}));
    const quantity = Math.max(1, Math.min(500, Number(body?.quantity) || 1));

    let userEmail: string | undefined;
    let userId: string | undefined;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      );
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabase.auth.getUser(token);
      userEmail = data.user?.email ?? undefined;
      userId = data.user?.id ?? undefined;
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    let customerId: string | undefined;
    if (userEmail) {
      const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
      customerId = customers.data[0]?.id;
    }

    const origin = req.headers.get("origin") || "http://localhost:3000";
    const tierPrice = TIER_PRICE_BY_QTY[quantity];
    const useTier = Boolean(tierPrice);
    const lineItems = useTier
      ? [{ price: tierPrice, quantity: 1 }]
      : [{ price: LEGACY_PRICE_ID, quantity }];
    const discounts = useTier
      ? undefined
      : (pickCoupon(quantity) ? [{ coupon: pickCoupon(quantity)! }] : undefined);

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : userEmail,
      line_items: lineItems,
      mode: "payment",
      payment_method_types: ["card"],
      allow_promotion_codes: true,
      discounts,
      success_url: `${origin}/home?status=success&bundle=${quantity}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?status=cancel`,
      metadata: {
        user_id: userId ?? "",
        quantity: String(quantity),
        product: useTier ? `single_listings_bundle_${quantity}` : "single_listings_bundle",
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[create-bundle-checkout]", msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
