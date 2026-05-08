// Speeds up Stripe Checkout by:
// 1) preconnecting to Stripe domains (also done in index.html)
// 2) preloading Stripe.js (browser keeps a hot connection)
// 3) "prewarming" our Supabase Edge Function on hover/focus so the cold start
//    happens before the user actually clicks.
import { supabase } from "@/integrations/supabase/client";

let stripeJsPreloaded = false;
export function preloadStripeJs() {
  if (stripeJsPreloaded || typeof document === "undefined") return;
  stripeJsPreloaded = true;
  const s = document.createElement("link");
  s.rel = "preload";
  s.as = "script";
  s.href = "https://js.stripe.com/v3/";
  s.crossOrigin = "anonymous";
  document.head.appendChild(s);
}

const warmedFns = new Set<string>();
export function prewarmEdgeFunction(fn: string) {
  if (warmedFns.has(fn)) return;
  warmedFns.add(fn);
  // Fire-and-forget OPTIONS to wake the function. We swallow errors.
  try {
    supabase.functions
      .invoke(fn, { body: { __prewarm: true }, headers: { "x-prewarm": "1" } })
      .catch(() => {});
  } catch {
    /* noop */
  }
}

export function speedupCheckoutHover(fn: string) {
  preloadStripeJs();
  prewarmEdgeFunction(fn);
}
