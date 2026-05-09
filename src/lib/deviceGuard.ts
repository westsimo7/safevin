import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { supabase } from "@/integrations/supabase/client";

let fpPromise: Promise<string> | null = null;

async function getFingerprint(): Promise<string> {
  if (!fpPromise) {
    fpPromise = (async () => {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      return result.visitorId;
    })();
  }
  return fpPromise;
}

export interface DeviceCheckResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Verifica e registra il dispositivo per l'utente loggato.
 * Se il dispositivo è già associato a un altro account, ritorna { allowed: false }.
 */
export async function checkAndRegisterDevice(): Promise<DeviceCheckResult> {
  try {
    const fingerprint = await getFingerprint();
    const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : null;

    const { data, error } = await supabase.rpc("register_or_check_device", {
      p_fingerprint: fingerprint,
      p_user_agent: userAgent,
      p_ip: null,
    });

    if (error) {
      console.error("[deviceGuard] rpc error", error);
      // In caso di errore non blocchiamo l'utente
      return { allowed: true, reason: "rpc_error" };
    }

    const result = data as { allowed: boolean; reason?: string } | null;
    return result ?? { allowed: true };
  } catch (e) {
    console.error("[deviceGuard] exception", e);
    return { allowed: true, reason: "exception" };
  }
}
