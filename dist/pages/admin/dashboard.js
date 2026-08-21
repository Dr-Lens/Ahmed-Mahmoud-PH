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
const TABS = [
    ["overview", "نظرة عامة"],
    ["albums", "الألبومات"],
    ["services", "الخدمات"],
    ["social", "التواصل الاجتماعي"],
    ["beforeAfter", "قبل / بعد"],
    ["settings", "الإعدادات"],
];
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
    function setTab(tab) {
        tabButtons.forEach((btn, id) => btn.classList.toggle("is-active", id === tab));
        const renderers = {
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
