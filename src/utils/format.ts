export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function formatDate(iso: string, opts: { yearOnly?: boolean } = {}): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  if (opts.yearOnly) return String(d.getFullYear());
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function whatsappLink(internationalNumber: string, message: string): string {
  const digits = internationalNumber.replace(/[^\d]/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function aspectClass(width: number, height: number): "portrait" | "landscape" | "square" {
  const ratio = width / height;
  if (ratio > 1.15) return "landscape";
  if (ratio < 0.87) return "portrait";
  return "square";
}
