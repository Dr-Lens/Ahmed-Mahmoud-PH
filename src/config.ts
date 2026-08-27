// Centralized, PUBLIC-ONLY configuration.
// Never put API keys, admin passwords, or any secret in this file or anywhere
// in /frontend. Secrets live exclusively in Apps Script PropertiesService.
// See /docs/README.md → "Connecting the backend" for setup steps.

export const CONFIG = {
  /**
   * Your deployed Apps Script Web App URL, e.g.
   * "https://script.google.com/macros/s/AKfycb.../exec"
   * Leave empty to run the site in MOCK mode against local placeholder data
   * (useful for design/dev before the backend is deployed).
   */
  API_BASE_URL: "https://script.google.com/macros/s/AKfycbyLFzGWVg71tzXZsawi9PiS4ANthQOLhyuMzn9gIFsUqejKFYxlVOGvDE4vSRRLZOg9hQ/exec",

  /** Falls back to bundled placeholder content when API_BASE_URL is empty. */
  get USE_MOCK(): boolean {
    return this.API_BASE_URL.trim().length === 0;
  },

  BRAND: {
    name: "أحمد محمود PH", // matches the logo's brand name
    shortName: "أحمد PH",
    title: "مصور ومحرر صور",
    whatsapp: "+201111714320", // international format, used for wa.me links
  },

  /**
   * How many leading URL segments are the GitHub Pages *repo* prefix rather
   * than part of the app's own route. Must match `segmentsToKeep` in
   * /404.html — see the comment there for why these two values must agree.
   *   - 1 → a GitHub *project* page: https://username.github.io/repo-name/...
   *         (this is the default — true for any repo not named username.github.io)
   *   - 0 → a GitHub *user/org* page (repo named username.github.io) or a
   *         custom domain served at its root
   */
  PATH_SEGMENTS_TO_KEEP: 1,

  /** Local session storage key. The token itself is opaque and validated server-side. */
  SESSION_STORAGE_KEY: "amph_admin_session",

  IMAGE: {
    // Preload budget for the fullscreen viewer: current + N neighbours each side.
    PRELOAD_NEIGHBOURS: 1,
  },
} as const;
