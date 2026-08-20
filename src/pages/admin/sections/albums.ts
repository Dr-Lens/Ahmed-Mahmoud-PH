import { h } from "../../../utils/dom.js";
import {
  getAdminAlbums,
  createAlbum,
  updateAlbum,
  deleteAlbum,
  type NewAlbum,
} from "../../../api/albums.js";
import { getPhotos, uploadPhoto, deletePhoto, validateFile } from "../../../api/photos.js";
import { slugify } from "../../../utils/format.js";
import { skeletonList, errorState, emptyState } from "../../../components/feedback.js";
import type { Album, AlbumStatus, UploadTask } from "../../../types/index.js";

export async function renderAlbumsSection(root: HTMLElement): Promise<void> {
  root.replaceChildren(h("h2", { class: "admin-section__title" }, ["Albums"]), skeletonList(3));

  try {
    const albums = await getAdminAlbums();
    draw(root, albums);
  } catch {
    root.replaceChildren(
      h("h2", { class: "admin-section__title" }, ["Albums"]),
      errorState("Couldn't load albums.", () => renderAlbumsSection(root))
    );
  }
}

function draw(root: HTMLElement, albums: Album[]): void {
  const newBtn = h("button", { class: "btn btn--primary" }, ["+ New album"]);
  newBtn.addEventListener("click", () => openEditor(root, null));

  const list = albums.length
    ? h("div", { class: "admin-album-list" }, albums.map((a) => albumRow(root, a)))
    : emptyState("No albums created.", newBtnEmpty(root));

  root.replaceChildren(
    h("div", { class: "admin-section__header" }, [h("h2", { class: "admin-section__title" }, ["Albums"]), newBtn]),
    list
  );
}

function newBtnEmpty(root: HTMLElement): HTMLElement {
  const btn = h("button", { class: "btn btn--primary" }, ["+ Create your first album"]);
  btn.addEventListener("click", () => openEditor(root, null));
  return btn;
}

function albumRow(root: HTMLElement, album: Album): HTMLElement {
  const editBtn = h("button", { class: "btn btn--ghost btn--small" }, ["Edit"]);
  editBtn.addEventListener("click", () => openEditor(root, album));

  const photosBtn = h("button", { class: "btn btn--ghost btn--small" }, ["Photos"]);
  photosBtn.addEventListener("click", () => openPhotoManager(root, album));

  const featureBtn = h("button", { class: `btn btn--chip${album.featured ? " is-active" : ""}` }, [
    album.featured ? "Featured" : "Feature",
  ]);
  featureBtn.addEventListener("click", async () => {
    const updated = await updateAlbum(album.album_id, { featured: !album.featured });
    Object.assign(album, updated);
    draw(root, await getAdminAlbums());
  });

  const statusBtn = h("button", { class: "btn btn--chip" }, [album.status]);
  statusBtn.addEventListener("click", async () => {
    const next: AlbumStatus = album.status === "PUBLIC" ? "DRAFT" : "PUBLIC";
    const updated = await updateAlbum(album.album_id, { status: next, visible: next === "PUBLIC" });
    Object.assign(album, updated);
    draw(root, await getAdminAlbums());
  });

  const deleteBtn = h("button", { class: "btn btn--ghost btn--small btn--danger" }, ["Delete"]);
  deleteBtn.addEventListener("click", async () => {
    if (!confirm(`Delete "${album.title}"? This cannot be undone.`)) return;
    await deleteAlbum(album.album_id);
    draw(root, await getAdminAlbums());
  });

  return h("div", { class: "admin-album-row" }, [
    h("img", { class: "admin-album-row__cover", src: album.cover_url, alt: "" }),
    h("div", { class: "admin-album-row__body" }, [
      h("strong", {}, [album.title]),
      h("span", { class: "admin-album-row__meta" }, [`${album.category} \u00b7 ${album.photo_count ?? 0} photos`]),
      h("div", { class: "admin-album-row__actions" }, [statusBtn, featureBtn, photosBtn, editBtn, deleteBtn]),
    ]),
  ]);
}

function openEditor(root: HTMLElement, album: Album | null): void {
  const isNew = album === null;
  const title = h("input", { class: "input", value: album?.title ?? "" }) as HTMLInputElement;
  const slug = h("input", { class: "input", value: album?.slug ?? "" }) as HTMLInputElement;
  const category = h("input", { class: "input", value: album?.category ?? "" }) as HTMLInputElement;
  const location = h("input", { class: "input", value: album?.location ?? "" }) as HTMLInputElement;
  const date = h("input", { class: "input", type: "date", value: album?.date?.slice(0, 10) ?? "" }) as HTMLInputElement;
  const cover = h("input", { class: "input", value: album?.cover_url ?? "", placeholder: "https://\u2026" }) as HTMLInputElement;
  const description = h("textarea", { class: "input textarea" }, [album?.description ?? ""]) as HTMLTextAreaElement;
  const sortOrder = h("input", { class: "input", type: "number", value: String(album?.sort_order ?? 1) }) as HTMLInputElement;

  let slugTouched = !isNew;
  title.addEventListener("input", () => {
    if (!slugTouched) slug.value = slugify(title.value);
  });
  slug.addEventListener("input", () => (slugTouched = true));

  const error = h("p", { class: "admin-login__error", role: "alert" });
  const saveBtn = h("button", { class: "btn btn--primary" }, [isNew ? "Create album" : "Save changes"]);
  const cancelBtn = h("button", { class: "btn btn--ghost" }, ["Cancel"]);

  const form = h("form", { class: "admin-form" }, [
    field("Title", title),
    field("Slug", slug),
    field("Category", category),
    field("Location", location),
    field("Date", date),
    field("Cover image URL", cover),
    field("Description", description),
    field("Sort order", sortOrder),
    error,
    h("div", { class: "admin-form__actions" }, [saveBtn, cancelBtn]),
  ]);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    error.textContent = "";
    if (!title.value.trim() || !slug.value.trim()) {
      error.textContent = "Title and slug are required.";
      return;
    }
    const payload: NewAlbum = {
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
      if (isNew) await createAlbum(payload);
      else await updateAlbum(album!.album_id, payload);
      draw(root, await getAdminAlbums());
    } catch (err) {
      error.textContent = err instanceof Error ? err.message : "Couldn't save this album.";
    }
  });
  cancelBtn.addEventListener("click", async () => draw(root, await getAdminAlbums()));

  root.replaceChildren(
    h("div", { class: "admin-section__header" }, [h("h2", { class: "admin-section__title" }, [isNew ? "New album" : "Edit album"])]),
    form
  );
}

async function openPhotoManager(root: HTMLElement, album: Album): Promise<void> {
  root.replaceChildren(h("h2", { class: "admin-section__title" }, [`Photos \u2014 ${album.title}`]), skeletonList(2));

  const fileInput = h("input", { type: "file", accept: "image/jpeg,image/png,image/webp", multiple: "true", class: "input" }) as HTMLInputElement;
  const addBtn = h("button", { class: "btn btn--primary" }, ["+ Add photos"]);
  const backBtn = h("button", { class: "btn btn--ghost" }, ["\u2190 Back to albums"]);
  const uploadList = h("div", { class: "upload-list" });
  const grid = h("div", { class: "admin-photo-grid" });

  addBtn.addEventListener("click", () => fileInput.click());
  backBtn.addEventListener("click", async () => draw(root, await getAdminAlbums()));

  fileInput.addEventListener("change", async () => {
    const files = Array.from(fileInput.files ?? []);
    fileInput.value = "";
    for (const file of files) {
      const err = validateFile(file);
      const task: UploadTask = { file, filename: file.name, progress: 0, status: err ? "error" : "queued", error: err ?? undefined };
      const row = uploadRow(task);
      uploadList.append(row.el);
      if (err) continue;
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
      } catch (uploadErr) {
        task.status = "error";
        task.error = uploadErr instanceof Error ? uploadErr.message : "Upload failed.";
        row.update(task);
      }
    }
  });

  root.replaceChildren(
    h("div", { class: "admin-section__header" }, [h("h2", { class: "admin-section__title" }, [`Photos \u2014 ${album.title}`]), backBtn]),
    h("div", { class: "upload-panel" }, [addBtn, fileInput, uploadList]),
    grid
  );

  try {
    const photos = await getPhotos(album.album_id);
    grid.replaceChildren(photos.length ? h("span", {}) : emptyState("No photos in this album yet."), ...photos.map((p) => photoTile(album, p, grid)));
  } catch {
    grid.replaceChildren(errorState("Couldn't load photos."));
  }
}

function uploadRow(task: UploadTask): { el: HTMLElement; update: (t: UploadTask) => void } {
  const status = h("span", { class: "upload-row__status" }, [statusLabel(task)]);
  const bar = h("div", { class: "upload-row__bar" }, [h("div", { class: "upload-row__bar-fill" })]);
  const el = h("div", { class: "upload-row" }, [
    h("span", { class: "upload-row__name" }, [task.filename]),
    bar,
    status,
  ]);
  function update(t: UploadTask): void {
    (bar.firstElementChild as HTMLElement).style.width = `${t.progress}%`;
    status.textContent = statusLabel(t);
    el.classList.toggle("is-error", t.status === "error");
    el.classList.toggle("is-success", t.status === "success");
  }
  update(task);
  return { el, update };
}

function statusLabel(t: UploadTask): string {
  if (t.status === "error") return t.error ?? "Failed";
  if (t.status === "success") return "Done";
  if (t.status === "uploading") return `${t.progress}%`;
  return "Queued";
}

function photoTile(_album: Album, photo: import("../../../types/index.js").Photo, _grid: HTMLElement): HTMLElement {
  const img = h("img", { class: "admin-photo-tile__img", src: photo.thumbnail_url, alt: photo.filename });
  const removeBtn = h("button", { class: "admin-photo-tile__remove", "aria-label": "Delete photo" }, ["\u00d7"]);
  const tile = h("div", { class: "admin-photo-tile" }, [img, removeBtn]);
  removeBtn.addEventListener("click", async () => {
    if (!confirm("Delete this photo?")) return;
    await deletePhoto(photo.photo_id);
    tile.remove();
  });
  return tile;
}

function field(label: string, input: HTMLElement): HTMLElement {
  return h("label", { class: "field" }, [h("span", { class: "field__label" }, [label]), input]);
}
