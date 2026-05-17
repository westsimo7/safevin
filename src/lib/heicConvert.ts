// Convert HEIC/HEIF photos (typical from iPhone) to JPEG so they can be
// previewed and uploaded reliably across browsers. Non-HEIC files are
// returned unchanged.
export async function ensureBrowserCompatibleImage(file: File): Promise<File> {
  const name = file.name.toLowerCase();
  const type = (file.type || "").toLowerCase();
  const isHeic =
    type === "image/heic" ||
    type === "image/heif" ||
    type === "image/heic-sequence" ||
    type === "image/heif-sequence" ||
    name.endsWith(".heic") ||
    name.endsWith(".heif");

  if (!isHeic) return file;

  try {
    const { default: heic2any } = await import("heic2any");
    const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
    const blob = Array.isArray(converted) ? converted[0] : converted;
    const newName = file.name.replace(/\.(heic|heif)$/i, "") + ".jpg";
    return new File([blob], newName, { type: "image/jpeg", lastModified: Date.now() });
  } catch (e) {
    console.warn("HEIC conversion failed for", file.name, e);
    return file;
  }
}

export async function ensureBrowserCompatibleImages(files: File[]): Promise<File[]> {
  return Promise.all(files.map(ensureBrowserCompatibleImage));
}
