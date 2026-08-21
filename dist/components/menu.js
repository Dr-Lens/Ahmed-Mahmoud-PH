import { h, trapFocus } from "../utils/dom.js";
import { navigate } from "../services/router.js";
const LINKS = [
    ["الرئيسية", "/"],
    ["الأعمال", "/work"],
    ["نبذة عني", "/about"],
    ["الخدمات", "/services"],
    ["تواصل", "/contact"],
];
let releaseFocus = null;
export function initMenu() {
    const toggle = document.querySelector("[data-menu-toggle]");
    const overlay = document.querySelector("[data-menu-overlay]");
    if (!toggle || !overlay)
        return;
    const nav = h("nav", { class: "menu-links", "aria-label": "التنقل الرئيسي" }, LINKS.map(([label, href], i) => h("a", { href, "data-link": "true", class: "menu-link", style: `--i:${i}` }, [
        h("span", { class: "menu-link__index" }, [String(i + 1).padStart(2, "0")]),
        h("span", { class: "menu-link__label" }, [label]),
    ])));
    overlay.replaceChildren(nav);
    function open() {
        overlay.classList.add("is-open");
        toggle.setAttribute("aria-expanded", "true");
        document.body.classList.add("no-scroll");
        releaseFocus = trapFocus(overlay);
    }
    function close() {
        overlay.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.classList.remove("no-scroll");
        releaseFocus?.();
        toggle.focus();
    }
    toggle.addEventListener("click", () => {
        overlay.classList.contains("is-open") ? close() : open();
    });
    overlay.addEventListener("click", (e) => {
        if (e.target.closest(".menu-link"))
            close();
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && overlay.classList.contains("is-open"))
            close();
    });
    window.addEventListener("popstate", close);
}
export function goHome() {
    navigate("/");
}
