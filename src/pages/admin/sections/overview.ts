import { h } from "../../../utils/dom.js";
import { getAdminAlbums } from "../../../api/albums.js";
import { skeletonList, errorState } from "../../../components/feedback.js";

export async function renderOverview(root: HTMLElement): Promise<void> {
  root.replaceChildren(h("h2", { class: "admin-section__title" }, ["Overview"]), skeletonList(1));

  try {
    const albums = await getAdminAlbums();
    const totalPhotos = albums.reduce((sum, a) => sum + (a.photo_count ?? 0), 0);
    const featured = albums.filter((a) => a.featured).length;

    root.replaceChildren(
      h("h2", { class: "admin-section__title" }, ["Overview"]),
      h("div", { class: "stat-grid" }, [
        statCard("Albums", String(albums.length)),
        statCard("Photos", String(totalPhotos)),
        statCard("Featured", String(featured)),
      ])
    );
  } catch {
    root.replaceChildren(h("h2", { class: "admin-section__title" }, ["Overview"]), errorState("Couldn't load overview.", () => renderOverview(root)));
  }
}

function statCard(label: string, value: string): HTMLElement {
  return h("div", { class: "stat-card" }, [
    h("span", { class: "stat-card__value" }, [value]),
    h("span", { class: "stat-card__label" }, [label]),
  ]);
}
