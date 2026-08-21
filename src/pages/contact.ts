import { h, mount } from "../utils/dom.js";
import { CONFIG } from "../config.js";
import { whatsappLink } from "../utils/format.js";
import { setMeta } from "../services/meta.js";

const AVAILABLE_FOR = ["زفاف", "بورتريه", "مناسبات", "أزياء", "تصوير تجاري"];

export function renderContact(outlet: HTMLElement): void {
  setMeta({
    title: "تواصل — أحمد محمود PH",
    description: "تواصل مع أحمد محمود عبر واتساب لترتيب جلسة تصويرك القادمة.",
  });

  const link = whatsappLink(
    CONFIG.BRAND.whatsapp,
    `مرحبًا أحمد، اطّلعت على أعمالك وأحب أتكلم معاك عن مشروع تصوير.`
  );

  const page = h("div", { class: "page page--contact" }, [
    h("h1", { class: "contact__headline" }, ["لنصنع", h("br"), "شيئًا", h("br"), "لا يُنسى."]),
    h("p", { class: "contact__available-label" }, ["متاح لتصوير"]),
    h(
      "ul",
      { class: "contact__available-list" },
      AVAILABLE_FOR.map((item) => h("li", {}, [item]))
    ),
    h("a", { href: link, target: "_blank", rel: "noopener", class: "btn btn--primary contact__cta" }, ["تواصل عبر واتساب"]),
    h("p", { class: "contact__number" }, [CONFIG.BRAND.whatsapp]),
  ]);
  mount(outlet, page);
}
