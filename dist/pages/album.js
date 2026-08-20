import { h, mount } from "../utils/dom.js";
import { getAlbumBySlug } from "../api/albums.js";
import { getPhotos } from "../api/photos.js";
import { renderGallery } from "../components/gallery.js";
import { formatDate } from "../utils/format.js";
import { skeletonList, errorState } from "../components/feedback.js";
import { setMeta, setStructuredData } from "../services/meta.js";
import { navigate } from "../services/router.js";
export async function renderAlbum(outlet, slug) {
    const page = h("div", { class: "page page--album" }, [skeletonList(1)]);
    mount(outlet, page);
    try {
        const album = await getAlbumBySlug(slug);
        setMeta({
            title: `${album.title} — AHMED MAHMOUD PH`,
            description: album.description || `${album.category} photography in ${album.location}.`,
            image: album.cover_url,
            type: "article",
        });
        setStructuredData({
            "@context": "https://schema.org",
            "@type": "ImageGallery",
            name: album.title,
            description: album.description,
            about: album.category,
        });
        const backBtn = h("a", { href: "/work", "data-link": "true", class: "back-link" }, ["\u2190 BACK"]);
        const header = h("header", { class: "album-header" }, [
            backBtn,
            h("p", { class: "album-header__category" }, [album.category.toUpperCase()]),
            h("h1", { class: "album-header__title" }, [album.title]),
            h("p", { class: "album-header__meta" }, [`${album.location} \u2014 ${formatDate(album.date, { yearOnly: true })}`]),
            album.description ? h("p", { class: "album-header__desc" }, [album.description]) : h("span", {}),
        ]);
        const gallerySlot = h("div", {}, [skeletonList(2)]);
        page.replaceChildren(header, gallerySlot);
        try {
            const photos = await getPhotos(album.album_id);
            gallerySlot.replaceChildren(photos.length ? renderGallery(photos) : errorState("No photos in this story yet."));
        }
        catch {
            gallerySlot.replaceChildren(errorState("Couldn't load photos.", () => renderAlbum(outlet, slug)));
        }
    }
    catch {
        page.replaceChildren(h("div", { class: "state state--error" }, [
            h("p", { class: "state__message" }, ["This story couldn't be found."]),
            (() => {
                const btn = h("button", { class: "btn btn--ghost" }, ["Back to Work"]);
                btn.addEventListener("click", () => navigate("/work"));
                return btn;
            })(),
        ]));
    }
}
