import { h } from "../../../utils/dom.js";
import { getServices, updateService } from "../../../api/settings.js";
import { skeletonList, errorState } from "../../../components/feedback.js";
export async function renderServicesSection(root) {
    root.replaceChildren(h("h2", { class: "admin-section__title" }, ["Services"]), skeletonList(3));
    try {
        const services = await getServices();
        root.replaceChildren(h("h2", { class: "admin-section__title" }, ["Services"]), h("div", { class: "admin-service-list" }, services.map(row)));
    }
    catch {
        root.replaceChildren(h("h2", { class: "admin-section__title" }, ["Services"]), errorState("Couldn't load services.", () => renderServicesSection(root)));
    }
}
function row(service) {
    const title = h("input", { class: "input", value: service.title });
    const desc = h("input", { class: "input", value: service.description });
    const visible = h("input", { type: "checkbox", checked: service.visible });
    const saveBtn = h("button", { class: "btn btn--ghost btn--small" }, ["Save"]);
    saveBtn.addEventListener("click", async () => {
        saveBtn.textContent = "Saving\u2026";
        try {
            await updateService(service.service_id, { title: title.value, description: desc.value, visible: visible.checked });
            saveBtn.textContent = "Saved";
        }
        catch {
            saveBtn.textContent = "Failed";
        }
        finally {
            setTimeout(() => (saveBtn.textContent = "Save"), 1500);
        }
    });
    return h("div", { class: "admin-service-row" }, [
        title,
        desc,
        h("label", { class: "checkbox-label" }, [visible, " Visible"]),
        saveBtn,
    ]);
}
