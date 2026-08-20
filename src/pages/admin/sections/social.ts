import { h } from "../../../utils/dom.js";
import { getSocial, updateSocial } from "../../../api/settings.js";
import { skeletonList, errorState } from "../../../components/feedback.js";
import type { SocialLink } from "../../../types/index.js";

export async function renderSocialSection(root: HTMLElement): Promise<void> {
  root.replaceChildren(h("h2", { class: "admin-section__title" }, ["Social"]), skeletonList(2));
  try {
    const links = await getSocial();
    draw(root, links);
  } catch {
    root.replaceChildren(h("h2", { class: "admin-section__title" }, ["Social"]), errorState("Couldn't load social links.", () => renderSocialSection(root)));
  }
}

function draw(root: HTMLElement, links: SocialLink[]): void {
  const rows = links.map((link) => {
    const url = h("input", { class: "input", value: link.url, placeholder: "https://\u2026" }) as HTMLInputElement;
    const visible = h("input", { type: "checkbox", checked: link.visible }) as HTMLInputElement;
    return { link, url, visible, row: h("div", { class: "admin-service-row" }, [
      h("span", { class: "admin-social-row__platform" }, [link.platform]),
      url,
      h("label", { class: "checkbox-label" }, [visible, " Visible"]),
    ]) };
  });

  const saveBtn = h("button", { class: "btn btn--primary" }, ["Save social links"]);
  saveBtn.addEventListener("click", async () => {
    saveBtn.textContent = "Saving\u2026";
    const updated = rows.map((r) => ({ ...r.link, url: r.url.value.trim(), visible: r.visible.checked }));
    try {
      await updateSocial(updated);
      saveBtn.textContent = "Saved";
    } catch {
      saveBtn.textContent = "Failed";
    } finally {
      setTimeout(() => (saveBtn.textContent = "Save social links"), 1500);
    }
  });

  root.replaceChildren(
    h("h2", { class: "admin-section__title" }, ["Social"]),
    h("div", { class: "admin-service-list" }, rows.map((r) => r.row)),
    saveBtn
  );
}
