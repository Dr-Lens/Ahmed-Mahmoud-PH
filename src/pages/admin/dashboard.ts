import { h, mount } from "../../utils/dom.js";
import { isAuthenticated, logout } from "../../api/auth.js";
import { navigate } from "../../services/router.js";
import { setMeta } from "../../services/meta.js";
import { renderOverview } from "./sections/overview.js";
import { renderAlbumsSection } from "./sections/albums.js";
import { renderSettingsSection } from "./sections/settings.js";
import { renderServicesSection } from "./sections/services.js";
import { renderSocialSection } from "./sections/social.js";
import { renderBeforeAfterSection } from "./sections/beforeAfter.js";

type Tab = "overview" | "albums" | "settings" | "services" | "social" | "beforeAfter";

const TABS: [Tab, string][] = [
  ["overview", "Overview"],
  ["albums", "Albums"],
  ["services", "Services"],
  ["social", "Social"],
  ["beforeAfter", "Before / After"],
  ["settings", "Settings"],
];

export function renderAdminDashboard(outlet: HTMLElement): void {
  if (!isAuthenticated()) {
    navigate("/admin", true);
    return;
  }

  setMeta({ title: "Admin — AHMED MAHMOUD PH", description: "Admin dashboard." });

  const content = h("div", { class: "admin-content" });
  const tabButtons = new Map<Tab, HTMLButtonElement>();

  const nav = h(
    "nav",
    { class: "admin-nav" },
    TABS.map(([id, label]) => {
      const btn = h("button", { class: "admin-nav__item" }, [label]) as HTMLButtonElement;
      btn.addEventListener("click", () => setTab(id));
      tabButtons.set(id, btn);
      return btn;
    })
  );

  const logoutBtn = h("button", { class: "admin-logout" }, ["Log out"]);
  logoutBtn.addEventListener("click", async () => {
    await logout();
    navigate("/admin", true);
  });

  function setTab(tab: Tab): void {
    tabButtons.forEach((btn, id) => btn.classList.toggle("is-active", id === tab));
    const renderers: Record<Tab, (el: HTMLElement) => void> = {
      overview: renderOverview,
      albums: renderAlbumsSection,
      settings: renderSettingsSection,
      services: renderServicesSection,
      social: renderSocialSection,
      beforeAfter: renderBeforeAfterSection,
    };
    renderers[tab](content);
  }

  const page = h("div", { class: "admin" }, [
    h("header", { class: "admin-header" }, [
      h("span", { class: "admin-header__brand" }, ["AHMED MAHMOUD PH"]),
      h("span", { class: "admin-header__tag" }, ["ADMIN"]),
      logoutBtn,
    ]),
    nav,
    content,
  ]);
  mount(outlet, page);
  setTab("overview");
}
