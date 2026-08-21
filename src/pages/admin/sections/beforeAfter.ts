import { h } from "../../../utils/dom.js";
import { getBeforeAfter, createBeforeAfter, deleteBeforeAfter } from "../../../api/settings.js";
import { skeletonList, errorState, emptyState } from "../../../components/feedback.js";
import type { BeforeAfter } from "../../../types/index.js";

export async function renderBeforeAfterSection(root: HTMLElement): Promise<void> {
  root.replaceChildren(h("h2", { class: "admin-section__title" }, ["قبل / بعد"]), skeletonList(2));
  try {
    const projects = await getBeforeAfter();
    draw(root, projects);
  } catch {
    root.replaceChildren(h("h2", { class: "admin-section__title" }, ["قبل / بعد"]), errorState("تعذّر تحميل المشاريع.", () => renderBeforeAfterSection(root)));
  }
}

function draw(root: HTMLElement, projects: BeforeAfter[]): void {
  const title = h("input", { class: "input", placeholder: "عنوان المشروع" }) as HTMLInputElement;
  const before = h("input", { class: "input", placeholder: "رابط صورة قبل" }) as HTMLInputElement;
  const after = h("input", { class: "input", placeholder: "رابط صورة بعد" }) as HTMLInputElement;
  const addBtn = h("button", { class: "btn btn--primary" }, ["+ إضافة مشروع"]);

  addBtn.addEventListener("click", async () => {
    if (!title.value.trim() || !before.value.trim() || !after.value.trim()) return;
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
    : emptyState("لا توجد مشاريع قبل/بعد بعد.");

  root.replaceChildren(
    h("h2", { class: "admin-section__title" }, ["قبل / بعد"]),
    h("div", { class: "admin-form" }, [title, before, after, addBtn]),
    list
  );
}

function row(root: HTMLElement, project: BeforeAfter): HTMLElement {
  const deleteBtn = h("button", { class: "btn btn--ghost btn--small btn--danger" }, ["حذف"]);
  deleteBtn.addEventListener("click", async () => {
    if (!confirm(`حذف "${project.title}"؟`)) return;
    await deleteBeforeAfter(project.project_id);
    renderBeforeAfterSection(root);
  });
  return h("div", { class: "admin-album-row" }, [
    h("img", { class: "admin-album-row__cover", src: project.after_url, alt: "" }),
    h("div", { class: "admin-album-row__body" }, [h("strong", {}, [project.title]), h("div", { class: "admin-album-row__actions" }, [deleteBtn])]),
  ]);
}
