import { h, mount } from "../utils/dom.js";
import { lazyImage } from "../utils/lazyload.js";
import { getAlbums } from "../api/albums.js";
import { formatDate } from "../utils/format.js";
import { skeletonList, errorState, emptyState } from "../components/feedback.js";
import { setMeta } from "../services/meta.js";
import type { Album } from "../types/index.js";

export async function renderWork(outlet: HTMLElement): Promise<void> {
  setMeta({
    title: "Work — AHMED MAHMOUD PH",
    description: "Browse the full portfolio of wedding, portrait, event, fashion and commercial photography.",
  });

  const list = h("div", { class: "album-list" }, [skeletonList(4)]);
  const filters = h("div", { class: "filters", role: "tablist", "aria-label": "Filter by category" });
  const page = h("div", { class: "page page--work" }, [
    h("h1", { class: "page__title" }, ["WORK"]),
    filters,
    list,
  ]);
  mount(outlet, page);

  try {
    const albums = await getAlbums();
    const categories = ["All", ...Array.from(new Set(albums.map((a) => a.category)))];
    let active = "All";

    function draw(): void {
      const filtered = active === "All" ? albums : albums.filter((a) => a.category === active);
      list.replaceChildren(
        filtered.length
          ? h("div", { class: "album-list" }, filtered.map(albumCard))
          : emptyState("No albums in this category yet.")
      );
    }

    filters.replaceChildren(
      ...categories.map((cat) => {
        const btn = h("button", { class: `filter-chip${cat === active ? " is-active" : ""}`, role: "tab" }, [cat.toUpperCase()]);
        btn.addEventListener("click", () => {
          active = cat;
          filters.querySelectorAll(".filter-chip").forEach((c) => c.classList.remove("is-active"));
          btn.classList.add("is-active");
          draw();
        });
        return btn;
      })
    );
    draw();
  } catch {
    list.replaceChildren(errorState("Couldn't load the portfolio.", () => renderWork(outlet)));
  }
}

function albumCard(album: Album): HTMLElement {
  const img = h("img", { class: "album-card__img", "data-src": album.cover_url, alt: album.title, loading: "lazy" }) as HTMLImageElement;
  lazyImage(img);
  return h("a", { href: `/${album.slug}`, "data-link": "true", class: "album-card" }, [
    h("div", { class: "album-card__image-wrap" }, [img]),
    h("div", { class: "album-card__meta" }, [
      h("span", { class: "album-card__category" }, [album.category.toUpperCase()]),
      h("h3", { class: "album-card__title" }, [album.title]),
      h("p", { class: "album-card__sub" }, [`${album.location} \u2014 ${formatDate(album.date, { yearOnly: true })}`]),
      h("span", { class: "album-card__link" }, ["VIEW STORY \u2192"]),
    ]),
  ]);
}
