let observer = null;
function getObserver() {
    if (observer)
        return observer;
    observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            if (!entry.isIntersecting)
                continue;
            const img = entry.target;
            const src = img.dataset.src;
            if (src) {
                img.src = src;
                img.removeAttribute("data-src");
            }
            img.classList.add("is-loaded");
            observer.unobserve(img);
        }
    }, { rootMargin: "200px 0px" });
    return observer;
}
/** Register an <img data-src="..."> for lazy loading. Call once per image after insertion. */
export function lazyImage(img) {
    getObserver().observe(img);
}
/** Preload a single image URL ahead of display (used by the fullscreen viewer). */
export function preload(url) {
    if (!url)
        return;
    const img = new Image();
    img.src = url;
}
