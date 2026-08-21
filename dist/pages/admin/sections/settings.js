import { h } from "../../../utils/dom.js";
import { getSettings, updateSettings } from "../../../api/settings.js";
import { skeletonList, errorState } from "../../../components/feedback.js";
export async function renderSettingsSection(root) {
    root.replaceChildren(h("h2", { class: "admin-section__title" }, ["الإعدادات"]), skeletonList(1));
    try {
        const settings = await getSettings();
        draw(root, settings);
    }
    catch {
        root.replaceChildren(h("h2", { class: "admin-section__title" }, ["الإعدادات"]), errorState("تعذّر تحميل الإعدادات.", () => renderSettingsSection(root)));
    }
}
const FIELDS = [
    ["site_name", "اسم الموقع"],
    ["photographer_name", "اسم المصور"],
    ["bio", "نبذة تعريفية", "textarea"],
    ["hero_image", "رابط صورة الغلاف الرئيسية"],
    ["location", "الموقع"],
    ["email", "البريد الإلكتروني"],
    ["whatsapp", "واتساب (بالصيغة الدولية)"],
    ["instagram", "رابط إنستغرام"],
    ["facebook", "رابط فيسبوك"],
];
function draw(root, settings) {
    const inputs = new Map();
    const saveBtn = h("button", { class: "btn btn--primary" }, ["حفظ الإعدادات"]);
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
        saveBtn.textContent = "جارٍ الحفظ\u2026";
        try {
            await updateSettings(patch);
            savedMsg.textContent = "تم الحفظ.";
        }
        catch {
            savedMsg.textContent = "تعذّر الحفظ. من فضلك حاول مرة أخرى.";
        }
        finally {
            saveBtn.removeAttribute("disabled");
            saveBtn.textContent = "حفظ الإعدادات";
        }
    });
    root.replaceChildren(h("h2", { class: "admin-section__title" }, ["الإعدادات"]), form);
}
