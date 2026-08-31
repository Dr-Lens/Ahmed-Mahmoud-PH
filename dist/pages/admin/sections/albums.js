import { h } from "../../../utils/dom.js";
import { getAdminAlbums, createAlbum, updateAlbum, deleteAlbum, } from "../../../api/albums.js";
import { getPhotos, uploadPhoto, deletePhoto, validateFile } from "../../../api/photos.js";
import { slugify } from "../../../utils/format.js";
import { skeletonList, errorState, emptyState } from "../../../components/feedback.js";
const STATUS_LABEL = {
    DRAFT: "مسودة",
    PUBLIC: "منشور",
    PRIVATE: "خاص",
};
export async function renderAlbumsSection(root) {
    root.replaceChildren(h("h2", { class: "admin-section__title" }, ["الألبومات"]), skeletonList(3));
    try {
        const albums = await getAdminAlbums();
        draw(root, albums);
    }
    catch (err) {
        console.error("[Albums] failed to load:", err);
        root.replaceChildren(h("h2", { class: "admin-section__title" }, ["الألبومات"]), errorState("تعذّر تحميل الألبومات.", () => renderAlbumsSection(root)));
    }
}
function draw(root, albums) {
    const newBtn = h("button", { class: "btn btn--primary" }, ["+ ألبوم جديد"]);
    newBtn.addEventListener("click", () => openEditor(root, null));
    const list = albums.length
        ? h("div", { class: "admin-album-list" }, albums.map((a) => albumRow(root, a)))
        : emptyState("لا يوجد ألبومات بعد.", newBtnEmpty(root));
    root.replaceChildren(h("div", { class: "admin-section__header" }, [h("h2", { class: "admin-section__title" }, ["الألبومات"]), newBtn]), list);
}
function newBtnEmpty(root) {
    const btn = h("button", { class: "btn btn--primary" }, ["+ أنشئ أول ألبوم لك"]);
    btn.addEventListener("click", () => openEditor(root, null));
    return btn;
}
function albumRow(root, album) {
    const editBtn = h("button", { class: "btn btn--ghost btn--small" }, ["تعديل"]);
    editBtn.addEventListener("click", () => openEditor(root, album));
    const photosBtn = h("button", { class: "btn btn--ghost btn--small" }, ["الصور"]);
    photosBtn.addEventListener("click", () => openPhotoManager(root, album));
    const featureBtn = h("button", { class: `btn btn--chip${album.featured ? " is-active" : ""}` }, [
        album.featured ? "مميز" : "تمييز",
    ]);
    featureBtn.addEventListener("click", async () => {
        try {
            const updated = await updateAlbum(album.album_id, { featured: !album.featured });
            Object.assign(album, updated);
            draw(root, await getAdminAlbums());
        }
        catch (err) {
            console.error("[Albums] failed to toggle featured:", err);
            alert("تعذّر تحديث الألبوم. من فضلك حاول مرة أخرى.");
        }
    });
    const statusBtn = h("button", { class: "btn btn--chip" }, [STATUS_LABEL[album.status]]);
    statusBtn.addEventListener("click", async () => {
        try {
            const next = album.status === "PUBLIC" ? "DRAFT" : "PUBLIC";
            const updated = await updateAlbum(album.album_id, { status: next, visible: next === "PUBLIC" });
            Object.assign(album, updated);
            draw(root, await getAdminAlbums());
        }
        catch (err) {
            console.error("[Albums] failed to toggle status:", err);
            alert("تعذّر تحديث الألبوم. من فضلك حاول مرة أخرى.");
        }
    });
    const deleteBtn = h("button", { class: "btn btn--ghost btn--small btn--danger" }, ["حذف"]);
    deleteBtn.addEventListener("click", async () => {
        if (!confirm(`حذف "${album.title}"؟ لا يمكن التراجع عن هذا الإجراء.`))
            return;
        try {
            await deleteAlbum(album.album_id);
            draw(root, await getAdminAlbums());
        }
        catch (err) {
            console.error("[Albums] failed to delete:", err);
            alert("تعذّر حذف الألبوم. من فضلك حاول مرة أخرى.");
        }
    });
    return h("div", { class: "admin-album-row" }, [
        h("img", { class: "admin-album-row__cover", src: album.cover_url, alt: "" }),
        h("div", { class: "admin-album-row__body" }, [
            h("strong", {}, [album.title]),
            h("span", { class: "admin-album-row__meta" }, [`${album.category} \u00b7 ${album.photo_count ?? 0} صورة`]),
            h("div", { class: "admin-album-row__actions" }, [statusBtn, featureBtn, photosBtn, editBtn, deleteBtn]),
        ]),
    ]);
}
function openEditor(root, album) {
    const isNew = album === null;
    const title = h("input", { class: "input", value: album?.title ?? "" });
    const slug = h("input", { class: "input", value: album?.slug ?? "" });
    const category = h("input", { class: "input", value: album?.category ?? "" });
    const location = h("input", { class: "input", value: album?.location ?? "" });
    const date = h("input", { class: "input", type: "date", value: album?.date?.slice(0, 10) ?? "" });
    const cover = h("input", { class: "input", value: album?.cover_url ?? "", placeholder: "https://\u2026" });
    const description = h("textarea", { class: "input textarea" }, [album?.description ?? ""]);
    const sortOrder = h("input", { class: "input", type: "number", value: String(album?.sort_order ?? 1) });
    let slugTouched = !isNew;
    title.addEventListener("input", () => {
        if (!slugTouched)
            slug.value = slugify(title.value);
    });
    slug.addEventListener("input", () => (slugTouched = true));
    const error = h("p", { class: "admin-login__error", role: "alert" });
    const saveBtn = h("button", { class: "btn btn--primary" }, [isNew ? "إنشاء الألبوم" : "حفظ التغييرات"]);
    const cancelBtn = h("button", { class: "btn btn--ghost" }, ["إلغاء"]);
    const form = h("form", { class: "admin-form" }, [
        field("العنوان", title),
        field("الرابط المختصر (Slug)", slug),
        field("الفئة", category),
        field("الموقع", location),
        field("التاريخ", date),
        field("رابط صورة الغلاف", cover),
        field("الوصف", description),
        field("ترتيب العرض", sortOrder),
        error,
        h("div", { class: "admin-form__actions" }, [saveBtn, cancelBtn]),
    ]);
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        error.textContent = "";
        if (!title.value.trim() || !slug.value.trim()) {
            error.textContent = "العنوان والرابط المختصر مطلوبان.";
            return;
        }
        const payload = {
            title: title.value.trim(),
            slug: slugify(slug.value),
            category: category.value.trim(),
            description: description.value.trim(),
            location: location.value.trim(),
            date: date.value || new Date().toISOString().slice(0, 10),
            cover_url: cover.value.trim(),
            featured: album?.featured ?? false,
            visible: album?.visible ?? false,
            status: album?.status ?? "DRAFT",
            sort_order: Number(sortOrder.value) || 1,
        };
        try {
            if (isNew)
                await createAlbum(payload);
            else
                await updateAlbum(album.album_id, payload);
            draw(root, await getAdminAlbums());
        }
        catch (err) {
            error.textContent = err instanceof Error ? err.message : "تعذّر حفظ هذا الألبوم.";
        }
    });
    cancelBtn.addEventListener("click", async () => draw(root, await getAdminAlbums()));
    root.replaceChildren(h("div", { class: "admin-section__header" }, [h("h2", { class: "admin-section__title" }, [isNew ? "ألبوم جديد" : "تعديل الألبوم"])]), form);
}
async function openPhotoManager(root, album) {
    root.replaceChildren(h("h2", { class: "admin-section__title" }, [`الصور \u2014 ${album.title}`]), skeletonList(2));
    const fileInput = h("input", { type: "file", accept: "image/jpeg,image/png,image/webp", multiple: "true", class: "input" });
    const addBtn = h("button", { class: "btn btn--primary" }, ["+ إضافة صور"]);
    const backBtn = h("button", { class: "btn btn--ghost" }, ["\u2192 العودة إلى الألبومات"]);
    const uploadList = h("div", { class: "upload-list" });
    const grid = h("div", { class: "admin-photo-grid" });
    addBtn.addEventListener("click", () => fileInput.click());
    backBtn.addEventListener("click", async () => draw(root, await getAdminAlbums()));
    fileInput.addEventListener("change", async () => {
        const files = Array.from(fileInput.files ?? []);
        fileInput.value = "";
        for (const file of files) {
            const err = validateFile(file);
            const task = { file, filename: file.name, progress: 0, status: err ? "error" : "queued", error: err ?? undefined };
            const row = uploadRow(task);
            uploadList.append(row.el);
            if (err)
                continue;
            try {
                task.status = "uploading";
                row.update(task);
                const photo = await uploadPhoto(album.album_id, task, (pct) => {
                    task.progress = pct;
                    row.update(task);
                });
                task.status = "success";
                task.photo = photo;
                row.update(task);
                grid.prepend(photoTile(album, photo, grid));
            }
            catch (uploadErr) {
                task.status = "error";
                task.error = uploadErr instanceof Error ? uploadErr.message : "فشل الرفع.";
                row.update(task);
            }
        }
    });
    root.replaceChildren(h("div", { class: "admin-section__header" }, [h("h2", { class: "admin-section__title" }, [`الصور \u2014 ${album.title}`]), backBtn]), h("div", { class: "upload-panel" }, [addBtn, fileInput, uploadList]), grid);
    try {
        const photos = await getPhotos(album.album_id);
        grid.replaceChildren(photos.length ? h("span", {}) : emptyState("لا توجد صور في هذا الألبوم بعد."), ...photos.map((p) => photoTile(album, p, grid)));
    }
    catch (err) {
        console.error("[Albums] failed to load photos:", err);
        grid.replaceChildren(errorState("تعذّر تحميل الصور."));
    }
}
function uploadRow(task) {
    const status = h("span", { class: "upload-row__status" }, [statusLabel(task)]);
    const bar = h("div", { class: "upload-row__bar" }, [h("div", { class: "upload-row__bar-fill" })]);
    const el = h("div", { class: "upload-row" }, [
        h("span", { class: "upload-row__name" }, [task.filename]),
        bar,
        status,
    ]);
    function update(t) {
        bar.firstElementChild.style.width = `${t.progress}%`;
        status.textContent = statusLabel(t);
        el.classList.toggle("is-error", t.status === "error");
        el.classList.toggle("is-success", t.status === "success");
    }
    update(task);
    return { el, update };
}
function statusLabel(t) {
    if (t.status === "error")
        return t.error ?? "فشل";
    if (t.status === "success")
        return "تم";
    if (t.status === "uploading")
        return `${t.progress}%`;
    return "في الانتظار";
}
function photoTile(_album, photo, _grid) {
    const img = h("img", { class: "admin-photo-tile__img", src: photo.thumbnail_url, alt: photo.filename });
    const removeBtn = h("button", { class: "admin-photo-tile__remove", "aria-label": "حذف الصورة" }, ["\u00d7"]);
    const tile = h("div", { class: "admin-photo-tile" }, [img, removeBtn]);
    removeBtn.addEventListener("click", async () => {
        if (!confirm("حذف هذه الصورة؟"))
            return;
        try {
            await deletePhoto(photo.photo_id);
            tile.remove();
        }
        catch (err) {
            console.error("[Albums] failed to delete photo:", err);
            alert("تعذّر حذف الصورة. من فضلك حاول مرة أخرى.");
        }
    });
    return tile;
}
function field(label, input) {
    return h("label", { class: "field" }, [h("span", { class: "field__label" }, [label]), input]);
}
