import { h } from "../../../utils/dom.js";
import { getSocial, updateSocial } from "../../../api/settings.js";
import { skeletonList, errorState } from "../../../components/feedback.js";
import type { SocialLink } from "../../../types/index.js";

const PLATFORM_LABEL: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  whatsapp: "واتساب",
  email: "البريد الإلكتروني",
};

export async function renderSocialSection(root: HTMLElement): Promise<void> {
  root.replaceChildren(h("h2", { class: "admin-section__title" }, ["التواصل الاجتماعي"]), skeletonList(2));
  try {
    const links = await getSocial();
    draw(root, links);
  } catch (err) {
    console.error("[Social] failed to load:", err);
    root.replaceChildren(h("h2", { class: "admin-section__title" }, ["التواصل الاجتماعي"]), errorState("تعذّر تحميل روابط التواصل.", () => renderSocialSection(root)));
  }
}

function draw(root: HTMLElement, links: SocialLink[]): void {
  const rows = links.map((link) => {
    const url = h("input", { class: "input", value: link.url, placeholder: "https://\u2026" }) as HTMLInputElement;
    const visible = h("input", { type: "checkbox", checked: link.visible }) as HTMLInputElement;
    return { link, url, visible, row: h("div", { class: "admin-service-row" }, [
      h("span", { class: "admin-social-row__platform" }, [PLATFORM_LABEL[link.platform] ?? link.platform]),
      url,
      h("label", { class: "checkbox-label" }, [visible, " مرئي"]),
    ]) };
  });

  const saveBtn = h("button", { class: "btn btn--primary" }, ["حفظ روابط التواصل"]);
  saveBtn.addEventListener("click", async () => {
    saveBtn.textContent = "جارٍ الحفظ\u2026";
    const updated = rows.map((r) => ({ ...r.link, url: r.url.value.trim(), visible: r.visible.checked }));
    try {
      await updateSocial(updated);
      saveBtn.textContent = "تم الحفظ";
    } catch (err) {
      console.error("[Social] failed to save:", err);
      saveBtn.textContent = "فشل الحفظ";
    } finally {
      setTimeout(() => (saveBtn.textContent = "حفظ روابط التواصل"), 1500);
    }
  });

  root.replaceChildren(
    h("h2", { class: "admin-section__title" }, ["التواصل الاجتماعي"]),
    h("div", { class: "admin-service-list" }, rows.map((r) => r.row)),
    saveBtn
  );
}
