import { supabase } from "@/integrations/supabase/client";

const BUCKET = "chat-attachments";

/** Extracts the storage path from either a stored path or a (legacy) public URL. */
export function extractAttachmentPath(value: string): string {
  if (!value) return value;
  const marker = `/object/public/${BUCKET}/`;
  const i = value.indexOf(marker);
  if (i !== -1) return value.substring(i + marker.length);
  const signMarker = `/object/sign/${BUCKET}/`;
  const j = value.indexOf(signMarker);
  if (j !== -1) {
    const rest = value.substring(j + signMarker.length);
    return rest.split("?")[0];
  }
  return value; // assume already a path
}

/** Returns a signed URL valid for 1h (or the input if it's an external http URL we cannot sign). */
export async function getAttachmentSignedUrl(value: string): Promise<string> {
  if (!value) return "";
  const path = extractAttachmentPath(value);
  // If extraction didn't change a non-storage external URL, return it as-is
  if (path === value && /^https?:\/\//.test(value) && !value.includes(`/${BUCKET}/`)) {
    return value;
  }
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600, {
    download: false,
  });
  if (error || !data) return value;
  return data.signedUrl;
}

/** Returns a signed URL with download disposition. */
export async function getAttachmentDownloadUrl(value: string, filename?: string): Promise<string> {
  const path = extractAttachmentPath(value);
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600, {
    download: filename || true,
  });
  return data?.signedUrl || value;
}
