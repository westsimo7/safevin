// Convert HEIC/HEIF photos (typical from iPhone/Android) to JPEG so they can
// be previewed and uploaded reliably across browsers, and analyzed by the AI
// (which only accepts standard JPEG/PNG/WebP).
// Non-HEIC files are returned unchanged. Throws on conversion failure so
// callers can skip the file with a user-facing message.

export function isHeicFile(file: File): boolean {
  const name = file.name.toLowerCase();
  const type = (file.type || "").toLowerCase();
  return (
    type === "image/heic" ||
    type === "image/heif" ||
    type === "image/heic-sequence" ||
    type === "image/heif-sequence" ||
    name.endsWith(".heic") ||
    name.endsWith(".heif") ||
    name.endsWith(".hif")
  );
}

// Inspect the first 12 bytes (ISO BMFF "ftyp" box) to detect HEIF/HEIC even
// when the browser provides no MIME type (common on Android / drag-drop).
async function sniffIsHeif(file: File): Promise<boolean> {
  try {
    const buf = await file.slice(0, 32).arrayBuffer();
    const bytes = new Uint8Array(buf);
    // bytes 4..8 should be "ftyp"
    if (bytes[4] !== 0x66 || bytes[5] !== 0x74 || bytes[6] !== 0x79 || bytes[7] !== 0x70) {
      return false;
    }
    const brand = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]).toLowerCase();
    // Known HEIF/HEIC major brands
    return ["heic", "heix", "hevc", "hevx", "heim", "heis", "hevm", "hevs", "mif1", "msf1"].includes(brand);
  } catch {
    return false;
  }
}

export async function ensureBrowserCompatibleImage(file: File): Promise<File> {
  const heif = isHeicFile(file) || (await sniffIsHeif(file));
  if (!heif) return file;

  const { default: heic2any } = await import("heic2any");
  const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
  const blob = Array.isArray(converted) ? converted[0] : converted;
  const baseName = file.name.replace(/\.(heic|heif|hif)$/i, "") || "photo";
  const newName = baseName.includes(".") ? baseName.replace(/\.[^.]+$/, "") + ".jpg" : baseName + ".jpg";
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
