import { h, trapFocus } from "../utils/dom.js";
import { navigate } from "../services/router.js";

const LINKS: [string, string][] = [
  ["الرئيسية", "/"],
  ["الأعمال", "/work"],
  ["نبذة عني", "/about"],
  ["الخدمات", "/services"],
  ["تواصل", "/contact"],
];

let releaseFocus: (() => void) | null = null;

export function initMenu(): void {
  const toggle = document.querySelector<HTMLButtonElement>("[data-menu-toggle]");
  const overlay = document.querySelector<HTMLElement>("[data-menu-overlay]");
  const closeBtn = document.querySelector<HTMLButtonElement>("[data-menu-close]");
  const linksSlot = document.querySelector<HTMLElement>("[data-menu-links]");
  if (!toggle || !overlay || !closeBtn || !linksSlot) return;

  linksSlot.replaceChildren(
    ...LINKS.map(([label, href], i) =>
      h("a", { href, "data-link": "true", class: "menu-link", style: `--i:${i}` }, [
        h("span", { class: "menu-link__index" }, [String(i + 1).padStart(2, "0")]),
        h("span", { class: "menu-link__label" }, [label]),
      ])
    )
  );

  function open() {
    overlay!.classList.add("is-open");
    toggle!.setAttribute("aria-expanded", "true");
    document.body.classList.add("no-scroll");
    releaseFocus = trapFocus(overlay!);
  }
  function close() {
    overlay!.classList.remove("is-open");
    toggle!.setAttribute("aria-expanded", "false");
    document.body.classList.remove("no-scroll");
    releaseFocus?.();
    toggle!.focus();
  }

  toggle.addEventListener("click", () => {
    overlay.classList.contains("is-open") ? close() : open();
  });
  closeBtn.addEventListener("click", close);
  linksSlot.addEventListener("click", (e) => {
    if ((e.target as HTMLElement).closest(".menu-link")) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("is-open")) close();
  });
  window.addEventListener("popstate", close);
}

export function goHome(): void {
  navigate("/");
}
