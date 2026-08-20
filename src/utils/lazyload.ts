let observer: IntersectionObserver | null = null;

function getObserver(): IntersectionObserver {
  if (observer) return observer;
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const img = entry.target as HTMLImageElement;
        const src = img.dataset.src;
        if (src) {
          img.src = src;
          img.removeAttribute("data-src");
        }
        img.classList.add("is-loaded");
        observer!.unobserve(img);
      }
    },
    { rootMargin: "200px 0px" }
  );
  return observer;
}

/** Register an <img data-src="..."> for lazy loading. Call once per image after insertion. */
export function lazyImage(img: HTMLImageElement): void {
  getObserver().observe(img);
}

/** Preload a single image URL ahead of display (used by the fullscreen viewer). */
export function preload(url: string): void {
  if (!url) return;
  const img = new Image();
  img.src = url;
}
