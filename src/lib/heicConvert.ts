// Convert HEIC/HEIF photos (typical from iPhone) to JPEG so they can be
// previewed and uploaded reliably across browsers. Non-HEIC files are
// returned unchanged. Throws on conversion failure so callers can skip
// the file with a user-facing message.
export function isHeicFile(file: File): boolean {
  const name = file.name.toLowerCase();
  const type = (file.type || "").toLowerCase();
  return (
    type === "image/heic" ||
    type === "image/heif" ||
    type === "image/heic-sequence" ||
    type === "image/heif-sequence" ||
    name.endsWith(".heic") ||
    name.endsWith(".heif")
  );
}

export async function ensureBrowserCompatibleImage(file: File): Promise<File> {
  if (!isHeicFile(file)) return file;

  const { default: heic2any } = await import("heic2any");
  const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
  const blob = Array.isArray(converted) ? converted[0] : converted;
  const newName = file.name.replace(/\.(heic|heif)$/i, "") + ".jpg";
  return new File([blob], newName, { type: "image/jpeg", lastModified: Date.now() });
}

export interface ConversionResult {
  files: File[];
  failed: string[];
}

export async function ensureBrowserCompatibleImages(files: File[]): Promise<ConversionResult> {
  const out: File[] = [];
  const failed: string[] = [];
  for (const f of files) {
    try {
      out.push(await ensureBrowserCompatibleImage(f));
    } catch (e) {
      console.warn("HEIC conversion failed for", f.name, e);
      failed.push(f.name);
    }
  }
  return { files: out, failed };
}
