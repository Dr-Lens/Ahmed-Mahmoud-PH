import { h, mount } from "../utils/dom.js";
import { getSettings } from "../api/settings.js";
import { getSocial } from "../api/settings.js";
import { skeletonList, errorState } from "../components/feedback.js";
import { setMeta } from "../services/meta.js";
import { CONFIG } from "../config.js";
const PLATFORM_LABEL = {
    instagram: "Instagram",
    facebook: "Facebook",
    whatsapp: "WhatsApp",
    email: "Email",
};
export async function renderAbout(outlet) {
    setMeta({
        title: "About — AHMED MAHMOUD PH",
        description: `About ${CONFIG.BRAND.name}, ${CONFIG.BRAND.title.toLowerCase()}.`,
    });
    const page = h("div", { class: "page page--about" }, [skeletonList(1)]);
    mount(outlet, page);
    try {
        const [settings, social] = await Promise.all([getSettings(), getSocial()]);
        const links = social
            .filter((s) => s.visible && s.url)
            .map((s) => h("a", { href: s.url, class: "social-link", target: "_blank", rel: "noopener" }, [PLATFORM_LABEL[s.platform] ?? s.platform]));
        page.replaceChildren(h("h1", { class: "page__title" }, ["ABOUT"]), h("div", { class: "about" }, [
            h("img", { class: "about__portrait", src: settings.hero_image, alt: settings.photographer_name }),
            h("h2", { class: "about__name" }, [settings.photographer_name.toUpperCase()]),
            h("p", { class: "about__role" }, ["PHOTOGRAPHER", h("br"), "& PHOTO EDITOR"]),
            h("p", { class: "about__bio" }, [settings.bio]),
            h("p", { class: "about__location" }, [settings.location]),
            links.length ? h("div", { class: "about__social" }, links) : h("span", {}),
        ]));
    }
    catch {
        page.replaceChildren(errorState("Couldn't load this page.", () => renderAbout(outlet)));
    }
}
