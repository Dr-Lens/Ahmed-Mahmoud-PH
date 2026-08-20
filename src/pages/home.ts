import { h, mount } from "../utils/dom.js";
import { lazyImage } from "../utils/lazyload.js";
import { getSettings } from "../api/settings.js";
import { getFeaturedAlbums } from "../api/albums.js";
import { formatDate } from "../utils/format.js";
import { skeletonList, errorState } from "../components/feedback.js";
import { setMeta } from "../services/meta.js";
import type { Album } from "../types/index.js";

export async function renderHome(outlet: HTMLElement): Promise<void> {
  setMeta({
    title: "AHMED MAHMOUD PH — Photographer & Photo Editor",
    description: "Editorial wedding, portrait, fashion and commercial photography by Ahmed Mahmoud.",
  });

  const hero = h("section", { class: "hero" }, [
    h("div", { class: "hero__image-wrap" }, [
      h("img", { class: "hero__image", alt: "Ahmed Mahmoud — featured photograph" }),
    ]),
    h("div", { class: "hero__content" }, [
      h("h1", { class: "hero__title" }, ["AHMED MAHMOUD", h("span", {}, [" PH"])]),
      h("p", { class: "hero__subtitle" }, ["PHOTOGRAPHER & PHOTO EDITOR"]),
      h("a", { href: "#selected-work", class: "hero__cta" }, ["EXPLORE WORK", h("span", { class: "hero__cta-arrow" }, [" \u2193"])]),
    ]),
  ]);

  const workSection = h("section", { class: "section", id: "selected-work" }, [
    h("h2", { class: "section__title" }, ["SELECTED WORK"]),
    skeletonList(3),
  ]);

  const page = h("div", { class: "page page--home" }, [hero, workSection]);
  mount(outlet, page);

  try {
    const settings = await getSettings();
    const img = hero.querySelector("img")!;
    img.src = settings.hero_image;
    img.alt = `${settings.photographer_name} — featured photograph`;
  } catch {
    // Hero image failing to load shouldn't block the rest of the page.
  }

  try {
    const albums = await getFeaturedAlbums();
    const list = albums.length
      ? h("div", { class: "album-list" }, albums.map(albumCard))
      : h("p", { class: "state__message" }, ["No albums available yet."]);
    workSection.replaceChildren(h("h2", { class: "section__title" }, ["SELECTED WORK"]), list);
  } catch {
    workSection.replaceChildren(
      h("h2", { class: "section__title" }, ["SELECTED WORK"]),
      errorState("Couldn't load selected work.", () => renderHome(outlet))
    );
  }
}

function albumCard(album: Album): HTMLElement {
  const img = h("img", { class: "album-card__img", "data-src": album.cover_url, alt: album.title, loading: "lazy" }) as HTMLImageElement;
  lazyImage(img);
  const card = h("a", { href: `/${album.slug}`, "data-link": "true", class: "album-card" }, [
    h("div", { class: "album-card__image-wrap" }, [img]),
    h("div", { class: "album-card__meta" }, [
      h("span", { class: "album-card__category" }, [album.category.toUpperCase()]),
      h("h3", { class: "album-card__title" }, [album.title]),
      h("p", { class: "album-card__sub" }, [`${album.location} \u2014 ${formatDate(album.date, { yearOnly: true })}`]),
      h("span", { class: "album-card__link" }, ["VIEW STORY \u2192"]),
    ]),
  ]);
  return card;
}
