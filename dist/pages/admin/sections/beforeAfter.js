import { h } from "../../../utils/dom.js";
import { getBeforeAfter, createBeforeAfter, deleteBeforeAfter } from "../../../api/settings.js";
import { skeletonList, errorState, emptyState } from "../../../components/feedback.js";
export async function renderBeforeAfterSection(root) {
    root.replaceChildren(h("h2", { class: "admin-section__title" }, ["Before / After"]), skeletonList(2));
    try {
        const projects = await getBeforeAfter();
        draw(root, projects);
    }
    catch {
        root.replaceChildren(h("h2", { class: "admin-section__title" }, ["Before / After"]), errorState("Couldn't load projects.", () => renderBeforeAfterSection(root)));
    }
}
function draw(root, projects) {
    const title = h("input", { class: "input", placeholder: "Project title" });
    const before = h("input", { class: "input", placeholder: "Before image URL" });
    const after = h("input", { class: "input", placeholder: "After image URL" });
    const addBtn = h("button", { class: "btn btn--primary" }, ["+ Add project"]);
    addBtn.addEventListener("click", async () => {
        if (!title.value.trim() || !before.value.trim() || !after.value.trim())
            return;
        await createBeforeAfter({
            title: title.value.trim(),
            before_url: before.value.trim(),
            after_url: after.value.trim(),
            description: "",
            visible: true,
            sort_order: projects.length + 1,
        });
        renderBeforeAfterSection(root);
    });
    const list = projects.length
        ? h("div", { class: "admin-album-list" }, projects.map((p) => row(root, p)))
        : emptyState("No before/after projects yet.");
    root.replaceChildren(h("h2", { class: "admin-section__title" }, ["Before / After"]), h("div", { class: "admin-form" }, [title, before, after, addBtn]), list);
}
function row(root, project) {
    const deleteBtn = h("button", { class: "btn btn--ghost btn--small btn--danger" }, ["Delete"]);
    deleteBtn.addEventListener("click", async () => {
        if (!confirm(`Delete "${project.title}"?`))
            return;
        await deleteBeforeAfter(project.project_id);
        renderBeforeAfterSection(root);
    });
    return h("div", { class: "admin-album-row" }, [
        h("img", { class: "admin-album-row__cover", src: project.after_url, alt: "" }),
        h("div", { class: "admin-album-row__body" }, [h("strong", {}, [project.title]), h("div", { class: "admin-album-row__actions" }, [deleteBtn])]),
    ]);
}
