import { h, mount } from "../utils/dom.js";
import { getServices, getBeforeAfter } from "../api/settings.js";
import { renderBeforeAfter } from "../components/beforeAfter.js";
import { skeletonList, errorState } from "../components/feedback.js";
import { setMeta } from "../services/meta.js";
import type { Service } from "../types/index.js";

export async function renderServices(outlet: HTMLElement): Promise<void> {
  setMeta({
    title: "الخدمات — أحمد محمود PH",
    description: "خدمات تصوير الزفاف والبورتريه والمناسبات والأزياء والتصوير التجاري.",
  });

  const list = h("div", { class: "service-list" }, [skeletonList(4)]);
  const baSection = h("section", { class: "section" }, [
    h("h2", { class: "section__title" }, ["قبل / بعد"]),
    skeletonList(1),
  ]);

  const page = h("div", { class: "page page--services" }, [
    h("h1", { class: "page__title" }, ["الخدمات"]),
    list,
    baSection,
  ]);
  mount(outlet, page);

  try {
    const services = await getServices();
    list.replaceChildren(...services.map(serviceRow));
  } catch {
    list.replaceChildren(errorState("تعذّر تحميل الخدمات.", () => renderServices(outlet)));
  }

  try {
    const projects = await getBeforeAfter();
    baSection.replaceChildren(
      h("h2", { class: "section__title" }, ["قبل / بعد"]),
      ...(projects.length
        ? projects.map(renderBeforeAfter)
        : [h("p", { class: "state__message" }, ["لا توجد مشاريع قبل/بعد بعد."])])
    );
  } catch {
    baSection.replaceChildren(h("h2", { class: "section__title" }, ["قبل / بعد"]), errorState("تعذّر تحميل هذا القسم."));
  }
}

function serviceRow(service: Service, i: number): HTMLElement {
  return h("div", { class: "service-row" }, [
    h("span", { class: "service-row__index" }, [String(i + 1).padStart(2, "0")]),
    h("div", { class: "service-row__body" }, [
      h("h3", { class: "service-row__title" }, [service.title]),
      service.description ? h("p", { class: "service-row__desc" }, [service.description]) : h("span", {}),
    ]),
  ]);
}
