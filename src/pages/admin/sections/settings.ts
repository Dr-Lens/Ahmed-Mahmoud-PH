import { h } from "../../../utils/dom.js";
import { getSettings, updateSettings } from "../../../api/settings.js";
import { skeletonList, errorState } from "../../../components/feedback.js";
import type { SiteSettings } from "../../../types/index.js";

export async function renderSettingsSection(root: HTMLElement): Promise<void> {
  root.replaceChildren(h("h2", { class: "admin-section__title" }, ["Settings"]), skeletonList(1));

  try {
    const settings = await getSettings();
    draw(root, settings);
  } catch {
    root.replaceChildren(h("h2", { class: "admin-section__title" }, ["Settings"]), errorState("Couldn't load settings.", () => renderSettingsSection(root)));
  }
}

const FIELDS: [keyof SiteSettings, string, string?][] = [
  ["site_name", "Site name"],
  ["photographer_name", "Photographer name"],
  ["bio", "Biography", "textarea"],
  ["hero_image", "Hero image URL"],
  ["location", "Location"],
  ["email", "Email"],
  ["whatsapp", "WhatsApp (international format)"],
  ["instagram", "Instagram URL"],
  ["facebook", "Facebook URL"],
];

function draw(root: HTMLElement, settings: SiteSettings): void {
  const inputs = new Map<keyof SiteSettings, HTMLInputElement | HTMLTextAreaElement>();
  const saveBtn = h("button", { class: "btn btn--primary" }, ["Save settings"]);
  const savedMsg = h("p", { class: "admin-form__saved" });

  const form = h(
    "form",
    { class: "admin-form" },
    [
      ...FIELDS.map(([key, label, type]) => {
        const value = String(settings[key] ?? "");
        const el =
          type === "textarea"
            ? (h("textarea", { class: "input textarea" }, [value]) as HTMLTextAreaElement)
            : (h("input", { class: "input", value }) as HTMLInputElement);
        inputs.set(key, el);
        return h("label", { class: "field" }, [h("span", { class: "field__label" }, [label]), el]);
      }),
      savedMsg,
      h("div", { class: "admin-form__actions" }, [saveBtn]),
    ]
  );

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const patch: Partial<SiteSettings> = {};
    inputs.forEach((el, key) => {
      (patch as Record<string, string>)[key] = el.value.trim();
    });
    saveBtn.setAttribute("disabled", "true");
    saveBtn.textContent = "Saving\u2026";
    try {
      await updateSettings(patch);
      savedMsg.textContent = "Saved.";
    } catch {
      savedMsg.textContent = "Couldn't save. Please try again.";
    } finally {
      saveBtn.removeAttribute("disabled");
      saveBtn.textContent = "Save settings";
    }
  });

  root.replaceChildren(h("h2", { class: "admin-section__title" }, ["Settings"]), form);
}
