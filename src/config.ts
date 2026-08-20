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
  API_BASE_URL: "",

  /** Falls back to bundled placeholder content when API_BASE_URL is empty. */
  get USE_MOCK(): boolean {
    return this.API_BASE_URL.trim().length === 0;
  },

  BRAND: {
    name: "AHMED MAHMOUD PH",
    shortName: "AHMED PH",
    title: "Photographer & Photo Editor",
    whatsapp: "+201111714320", // international format, used for wa.me links
  },

  /** Local session storage key. The token itself is opaque and validated server-side. */
  SESSION_STORAGE_KEY: "amph_admin_session",

  IMAGE: {
    // Preload budget for the fullscreen viewer: current + N neighbours each side.
    PRELOAD_NEIGHBOURS: 1,
  },
} as const;
