import { h, mount } from "../utils/dom.js";
import { CONFIG } from "../config.js";
import { whatsappLink } from "../utils/format.js";
import { setMeta } from "../services/meta.js";
const AVAILABLE_FOR = ["Weddings", "Portraits", "Events", "Fashion", "Commercial"];
export function renderContact(outlet) {
    setMeta({
        title: "Contact — AHMED MAHMOUD PH",
        description: "Get in touch with Ahmed Mahmoud on WhatsApp to plan your next shoot.",
    });
    const link = whatsappLink(CONFIG.BRAND.whatsapp, `Hi Ahmed, I found your portfolio and I'd love to talk about a photography project.`);
    const page = h("div", { class: "page page--contact" }, [
        h("h1", { class: "contact__headline" }, ["LET'S CREATE", h("br"), "SOMETHING", h("br"), "MEMORABLE."]),
        h("p", { class: "contact__available-label" }, ["Available for"]),
        h("ul", { class: "contact__available-list" }, AVAILABLE_FOR.map((item) => h("li", {}, [item]))),
        h("a", { href: link, target: "_blank", rel: "noopener", class: "btn btn--primary contact__cta" }, ["CONTACT ON WHATSAPP"]),
        h("p", { class: "contact__number" }, [CONFIG.BRAND.whatsapp]),
    ]);
    mount(outlet, page);
}
