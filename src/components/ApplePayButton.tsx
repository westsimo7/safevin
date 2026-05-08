import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { speedupCheckoutHover } from "@/lib/checkoutSpeed";

interface Props {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  prewarmFn?: string;
  label?: string;
}

/**
 * Apple Pay button.
 * Tapping opens Stripe Checkout, which presents the native Apple Pay sheet
 * automatically on Safari / iOS devices that support it. On other devices it
 * falls back to a normal card form, so we always show the button.
 *
 * Hover/focus prewarms the Supabase Edge Function and preloads Stripe.js so
 * the redirect happens almost instantly.
 */
const ApplePayButton = ({
  onClick,
  loading,
  disabled,
  className,
  prewarmFn = "create-checkout",
  label,
}: Props) => {
  const warm = () => speedupCheckoutHover(prewarmFn);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={warm}
      onFocus={warm}
      onTouchStart={warm}
      disabled={disabled || loading}
      aria-label={label || "Paga con Apple Pay"}
      className={cn(
        "inline-flex w-full h-10 sm:h-11 px-5 py-2 rounded-2xl items-center justify-center gap-1.5 whitespace-nowrap",
        "bg-black text-white font-semibold text-sm border border-white/15",
        "hover:bg-zinc-900 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300",
        "disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none",
        className
      )}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          <span className="text-[13px] font-medium tracking-tight">Paga con</span>
          {/* Apple logo */}
          <svg
            aria-hidden="true"
            viewBox="0 0 17 20"
            className="w-[14px] h-[16px] -mt-0.5"
            fill="currentColor"
          >
            <path d="M14.04 10.62c-.02-2.32 1.9-3.43 1.99-3.49-1.09-1.59-2.78-1.81-3.38-1.84-1.44-.15-2.81.85-3.54.85-.74 0-1.86-.83-3.06-.81-1.57.02-3.03.92-3.84 2.32-1.64 2.84-.42 7.05 1.18 9.36.78 1.13 1.71 2.4 2.93 2.36 1.18-.05 1.62-.76 3.05-.76 1.42 0 1.83.76 3.07.74 1.27-.02 2.07-1.15 2.84-2.29.9-1.31 1.27-2.59 1.29-2.66-.03-.01-2.47-.95-2.49-3.78zM11.7 3.78c.65-.79 1.09-1.89.97-2.99-.94.04-2.07.62-2.74 1.41-.6.7-1.13 1.83-.99 2.9 1.05.08 2.12-.53 2.76-1.32z" />
          </svg>
          <span className="text-[14px] font-semibold tracking-tight">Pay</span>
          {label && <span className="ml-1 text-[12px] opacity-80">· {label}</span>}
        </>
      )}
    </button>
  );
};

export default ApplePayButton;
