import { h, mount } from "../../utils/dom.js";
import { isAuthenticated, logout } from "../../api/auth.js";
import { navigate } from "../../services/router.js";
import { setMeta } from "../../services/meta.js";
const TABS = [
    ["overview", "نظرة عامة"],
    ["albums", "الألبومات"],
    ["services", "الخدمات"],
    ["social", "التواصل الاجتماعي"],
    ["beforeAfter", "قبل / بعد"],
    ["settings", "الإعدادات"],
];
// Loaded on first use of each tab rather than all six eagerly whenever
// /admin renders — most sessions only touch one or two tabs.
const SECTION_LOADERS = {
    overview: async () => (await import("./sections/overview.js")).renderOverview,
    albums: async () => (await import("./sections/albums.js")).renderAlbumsSection,
    settings: async () => (await import("./sections/settings.js")).renderSettingsSection,
    services: async () => (await import("./sections/services.js")).renderServicesSection,
    social: async () => (await import("./sections/social.js")).renderSocialSection,
    beforeAfter: async () => (await import("./sections/beforeAfter.js")).renderBeforeAfterSection,
};
export function renderAdminDashboard(outlet) {
    if (!isAuthenticated()) {
        navigate("/admin", true);
        return;
    }
    setMeta({ title: "لوحة التحكم — أحمد محمود PH", description: "لوحة تحكم الإدارة." });
    const content = h("div", { class: "admin-content" });
    const tabButtons = new Map();
    const nav = h("nav", { class: "admin-nav" }, TABS.map(([id, label]) => {
        const btn = h("button", { class: "admin-nav__item" }, [label]);
        btn.addEventListener("click", () => setTab(id));
        tabButtons.set(id, btn);
        return btn;
    }));
    const logoutBtn = h("button", { class: "admin-logout" }, ["تسجيل الخروج"]);
    logoutBtn.addEventListener("click", async () => {
        await logout();
        navigate("/admin", true);
    });
    async function setTab(tab) {
        tabButtons.forEach((btn, id) => btn.classList.toggle("is-active", id === tab));
        const render = await SECTION_LOADERS[tab]();
        render(content);
    }
    const page = h("div", { class: "admin" }, [
        h("header", { class: "admin-header" }, [
            h("span", { class: "admin-header__brand" }, ["أحمد محمود PH"]),
            h("span", { class: "admin-header__tag" }, ["الإدارة"]),
            logoutBtn,
        ]),
        nav,
        content,
    ]);
    mount(outlet, page);
    setTab("overview");
}
