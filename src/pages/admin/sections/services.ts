import { h } from "../../../utils/dom.js";
import { getServices, updateService } from "../../../api/settings.js";
import { skeletonList, errorState } from "../../../components/feedback.js";
import type { Service } from "../../../types/index.js";

export async function renderServicesSection(root: HTMLElement): Promise<void> {
  root.replaceChildren(h("h2", { class: "admin-section__title" }, ["الخدمات"]), skeletonList(3));
  try {
    const services = await getServices();
    root.replaceChildren(h("h2", { class: "admin-section__title" }, ["الخدمات"]), h("div", { class: "admin-service-list" }, services.map(row)));
  } catch {
    root.replaceChildren(h("h2", { class: "admin-section__title" }, ["الخدمات"]), errorState("تعذّر تحميل الخدمات.", () => renderServicesSection(root)));
  }
}

function row(service: Service): HTMLElement {
  const title = h("input", { class: "input", value: service.title }) as HTMLInputElement;
  const desc = h("input", { class: "input", value: service.description }) as HTMLInputElement;
  const visible = h("input", { type: "checkbox", checked: service.visible }) as HTMLInputElement;
  const saveBtn = h("button", { class: "btn btn--ghost btn--small" }, ["حفظ"]);

  saveBtn.addEventListener("click", async () => {
    saveBtn.textContent = "جارٍ الحفظ\u2026";
    try {
      await updateService(service.service_id, { title: title.value, description: desc.value, visible: visible.checked });
      saveBtn.textContent = "تم الحفظ";
    } catch {
      saveBtn.textContent = "فشل الحفظ";
    } finally {
      setTimeout(() => (saveBtn.textContent = "حفظ"), 1500);
    }
  });

  return h("div", { class: "admin-service-row" }, [
    title,
    desc,
    h("label", { class: "checkbox-label" }, [visible, " مرئي"]),
    saveBtn,
  ]);
}
