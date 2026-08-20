import { h } from "../utils/dom.js";
import { lazyImage } from "../utils/lazyload.js";
import { aspectClass } from "../utils/format.js";
import { openViewer } from "./viewer.js";
/**
 * Renders an editorial photo layout: portrait photos take a large vertical
 * slot, landscape photos take a large horizontal slot, and consecutive
 * squares fall into a two-up grid — rather than one uniform grid for every
 * image regardless of its shape.
 */
export function renderGallery(photos) {
    const container = h("div", { class: "gallery" });
    let i = 0;
    while (i < photos.length) {
        const photo = photos[i];
        const shape = aspectClass(photo.width, photo.height);
        if (shape === "square" && photos[i + 1] && aspectClass(photos[i + 1].width, photos[i + 1].height) === "square") {
            const row = h("div", { class: "gallery__row gallery__row--pair" }, [
                figureFor(photos[i], i, photos),
                figureFor(photos[i + 1], i + 1, photos),
            ]);
            container.append(row);
            i += 2;
            continue;
        }
        container.append(h("div", { class: `gallery__row gallery__row--${shape}` }, [figureFor(photo, i, photos)]));
        i += 1;
    }
    return container;
}
function figureFor(photo, index, all) {
    const img = h("img", {
        "data-src": photo.display_url,
        alt: photo.filename.replace(/\.[a-z0-9]+$/i, ""),
        class: "gallery__img",
        loading: "lazy",
        decoding: "async",
    });
    lazyImage(img);
    const fig = h("figure", { class: "gallery__figure", role: "button", tabindex: "0", "aria-label": "Open photo" }, [img]);
    fig.addEventListener("click", () => openViewer(all, index));
    fig.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openViewer(all, index);
        }
    });
    return fig;
}
