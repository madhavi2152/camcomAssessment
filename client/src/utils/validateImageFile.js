const MAX_BYTES = 10 * 1024 * 1024;

export function validateImageFile(file) {
  if (!file) return { ok: false, error: "Please select a file." };

  if (file.size > MAX_BYTES) {
    return { ok: false, error: "File too large. Max size is 10MB." };
  }

  const name = String(file.name || "").toLowerCase();
  const extOk = name.endsWith(".jpg") || name.endsWith(".jpeg");
  const mimeOk = file.type === "image/jpeg";
  if (!extOk || !mimeOk) {
    return { ok: false, error: "Only .jpg/.jpeg images are allowed." };
  }

  return { ok: true };
}




