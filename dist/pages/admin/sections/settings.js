import { h } from "../../../utils/dom.js";
import { getSettings, updateSettings } from "../../../api/settings.js";
import { skeletonList, errorState } from "../../../components/feedback.js";
export async function renderSettingsSection(root) {
    root.replaceChildren(h("h2", { class: "admin-section__title" }, ["Settings"]), skeletonList(1));
    try {
        const settings = await getSettings();
        draw(root, settings);
    }
    catch {
        root.replaceChildren(h("h2", { class: "admin-section__title" }, ["Settings"]), errorState("Couldn't load settings.", () => renderSettingsSection(root)));
    }
}
const FIELDS = [
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
function draw(root, settings) {
    const inputs = new Map();
    const saveBtn = h("button", { class: "btn btn--primary" }, ["Save settings"]);
    const savedMsg = h("p", { class: "admin-form__saved" });
    const form = h("form", { class: "admin-form" }, [
        ...FIELDS.map(([key, label, type]) => {
            const value = String(settings[key] ?? "");
            const el = type === "textarea"
                ? h("textarea", { class: "input textarea" }, [value])
                : h("input", { class: "input", value });
            inputs.set(key, el);
            return h("label", { class: "field" }, [h("span", { class: "field__label" }, [label]), el]);
        }),
        savedMsg,
        h("div", { class: "admin-form__actions" }, [saveBtn]),
    ]);
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const patch = {};
        inputs.forEach((el, key) => {
            patch[key] = el.value.trim();
        });
        saveBtn.setAttribute("disabled", "true");
        saveBtn.textContent = "Saving\u2026";
        try {
            await updateSettings(patch);
            savedMsg.textContent = "Saved.";
        }
        catch {
            savedMsg.textContent = "Couldn't save. Please try again.";
        }
        finally {
            saveBtn.removeAttribute("disabled");
            saveBtn.textContent = "Save settings";
        }
    });
    root.replaceChildren(h("h2", { class: "admin-section__title" }, ["Settings"]), form);
}
