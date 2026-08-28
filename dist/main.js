import { route, notFound, startRouter } from "./services/router.js";
import { initMenu } from "./components/menu.js";
import { isAuthenticated } from "./api/auth.js";
import { getSettings } from "./api/settings.js";
import { CONFIG } from "./config.js";
import { loadStylesheet } from "./utils/loadStylesheet.js";
/**
 * PERFORMANCE: every route below is a dynamic import() rather than a
 * top-of-file static import. With native ES modules and no bundler, a
 * static `import { renderX } from "./pages/x.js"` at the top of main.ts
 * is fetched and parsed immediately on every single visit — including all
 * six admin section files, the admin dashboard shell, and the login page,
 * none of which a public visitor ever touches. Dynamic imports defer that
 * fetch until the matching route is actually visited, so a visit to "/"
 * only ever loads home.js and its own dependencies.
 */
function buildShell() {
    const outlet = document.getElementById("outlet");
    if (!outlet)
        throw new Error("Missing #outlet element in index.html");
    return outlet;
}
/**
 * A single "/admin" route (rather than separate "/admin" and "/admin/login"
 * routes) so every route in the app is exactly one top-level segment — see
 * services/router.ts for why that matters on a GitHub Pages project site.
 */
async function renderAdminRoute(outlet) {
    // admin.css is only ever needed on this route — see loadStylesheet's
    // comment for why it isn't in index.html's initial <link> list.
    loadStylesheet("src/styles/admin.css");
    if (isAuthenticated()) {
        const { renderAdminDashboard } = await import("./pages/admin/dashboard.js");
        renderAdminDashboard(outlet);
    }
    else {
        const { renderAdminLogin } = await import("./pages/admin/login.js");
        renderAdminLogin(outlet);
    }
}
/**
 * The header ships with a static fallback name so it never renders blank,
 * then swaps in the real value from Settings once it loads. This is the
 * one thing in the header that Settings → "اسم الموقع" actually controls —
 * the logo image itself is a fixed brand asset and is never overwritten.
 */
async function applySiteName() {
    const nameEl = document.querySelector("[data-site-name]");
    if (!nameEl)
        return;
    try {
        const settings = await getSettings();
        if (settings.site_name)
            nameEl.textContent = settings.site_name;
    }
    catch {
        // Keep the static fallback already in the markup — a failed settings
        // fetch shouldn't leave the header blank.
    }
}
function main() {
    const outlet = buildShell();
    initMenu();
    applySiteName();
    route("/", async () => {
        const { renderHome } = await import("./pages/home.js");
        renderHome(outlet);
    });
    route("/work", async () => {
        const { renderWork } = await import("./pages/work.js");
        renderWork(outlet);
    });
    route("/about", async () => {
        const { renderAbout } = await import("./pages/about.js");
        renderAbout(outlet);
    });
    route("/services", async () => {
        const { renderServices } = await import("./pages/services.js");
        renderServices(outlet);
    });
    route("/contact", async () => {
        const { renderContact } = await import("./pages/contact.js");
        renderContact(outlet);
    });
    route("/admin", () => renderAdminRoute(outlet));
    route("/:slug", async (params) => {
        const { renderAlbum } = await import("./pages/album.js");
        renderAlbum(outlet, params.slug);
    });
    notFound(() => {
        outlet.innerHTML = "";
        const el = document.createElement("div");
        el.className = "page state state--error";
        el.innerHTML = `<p class="state__message">الصفحة غير موجودة.</p><a href="/" data-link class="btn btn--ghost">العودة للرئيسية</a>`;
        outlet.append(el);
    });
    startRouter();
    // Hide the header/menu chrome on admin routes — the admin UI has its own shell.
    const chromeEls = document.querySelectorAll("[data-public-chrome]");
    const syncChrome = () => {
        const hide = location.pathname.replace(/\/+$/, "").endsWith("/admin");
        chromeEls.forEach((el) => el.classList.toggle("is-hidden", hide));
    };
    syncChrome();
    window.addEventListener("popstate", syncChrome);
    document.addEventListener("click", () => setTimeout(syncChrome, 0));
    if (CONFIG.BRAND.name) {
        document.title = `${CONFIG.BRAND.name} — ${CONFIG.BRAND.title}`;
    }
}
main();
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("service-worker.js").catch(() => {
            // Offline caching is a progressive enhancement — failures shouldn't block the app.
        });
    });
}
