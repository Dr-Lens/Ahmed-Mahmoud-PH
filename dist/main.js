import { route, notFound, startRouter } from "./services/router.js";
import { initMenu } from "./components/menu.js";
import { renderHome } from "./pages/home.js";
import { renderWork } from "./pages/work.js";
import { renderAlbum } from "./pages/album.js";
import { renderAbout } from "./pages/about.js";
import { renderServices } from "./pages/services.js";
import { renderContact } from "./pages/contact.js";
import { renderAdminLogin } from "./pages/admin/login.js";
import { renderAdminDashboard } from "./pages/admin/dashboard.js";
import { isAuthenticated } from "./api/auth.js";
import { CONFIG } from "./config.js";
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
function renderAdminRoute(outlet) {
    isAuthenticated() ? renderAdminDashboard(outlet) : renderAdminLogin(outlet);
}
function main() {
    const outlet = buildShell();
    initMenu();
    route("/", () => renderHome(outlet));
    route("/work", () => renderWork(outlet));
    route("/about", () => renderAbout(outlet));
    route("/services", () => renderServices(outlet));
    route("/contact", () => renderContact(outlet));
    route("/admin", () => renderAdminRoute(outlet));
    route("/:slug", (params) => renderAlbum(outlet, params.slug));
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
