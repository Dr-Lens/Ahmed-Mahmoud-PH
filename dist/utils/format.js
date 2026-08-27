/**
 * Turns a title into a URL slug. Uses Unicode letter/number classes (not
 * a-z0-9) so Arabic — or any non-Latin script — titles produce a real,
 * meaningful slug instead of being stripped down to an empty string, which
 * previously made it impossible to create an album with an Arabic-only
 * title from /admin. Modern browsers handle non-ASCII URL segments fine
 * (they're percent-encoded automatically).
 */
export function slugify(input) {
    const slug = input
        .toLowerCase()
        .trim()
        .replace(/[^\p{L}\p{N}]+/gu, "-")
        .replace(/(^-|-$)+/g, "");
    return slug || `album-${Date.now().toString(36)}`;
}
export function formatDate(iso, opts = {}) {
    const d = new Date(iso);
    if (isNaN(d.getTime()))
        return iso;
    if (opts.yearOnly)
        return String(d.getFullYear());
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
export function whatsappLink(internationalNumber, message) {
    const digits = internationalNumber.replace(/[^\d]/g, "");
    return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
export function aspectClass(width, height) {
    const ratio = width / height;
    if (ratio > 1.15)
        return "landscape";
    if (ratio < 0.87)
        return "portrait";
    return "square";
}
