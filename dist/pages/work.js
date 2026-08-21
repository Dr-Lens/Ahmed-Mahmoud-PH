import { h, mount } from "../utils/dom.js";
import { lazyImage } from "../utils/lazyload.js";
import { getAlbums } from "../api/albums.js";
import { formatDate } from "../utils/format.js";
import { skeletonList, errorState, emptyState } from "../components/feedback.js";
import { setMeta } from "../services/meta.js";
const ALL_LABEL = "الكل";
export async function renderWork(outlet) {
    setMeta({
        title: "الأعمال — أحمد محمود PH",
        description: "تصفح كامل الأعمال من تصوير الزفاف والبورتريه والمناسبات والأزياء والتصوير التجاري.",
    });
    const list = h("div", { class: "album-list" }, [skeletonList(4)]);
    const filters = h("div", { class: "filters", role: "tablist", "aria-label": "التصفية حسب الفئة" });
    const page = h("div", { class: "page page--work" }, [
        h("h1", { class: "page__title" }, ["الأعمال"]),
        filters,
        list,
    ]);
    mount(outlet, page);
    try {
        const albums = await getAlbums();
        const categories = [ALL_LABEL, ...Array.from(new Set(albums.map((a) => a.category)))];
        let active = ALL_LABEL;
        function draw() {
            const filtered = active === ALL_LABEL ? albums : albums.filter((a) => a.category === active);
            list.replaceChildren(filtered.length
                ? h("div", { class: "album-list" }, filtered.map(albumCard))
                : emptyState("لا توجد أعمال في هذه الفئة بعد."));
        }
        filters.replaceChildren(...categories.map((cat) => {
            const btn = h("button", { class: `filter-chip${cat === active ? " is-active" : ""}`, role: "tab" }, [cat]);
            btn.addEventListener("click", () => {
                active = cat;
                filters.querySelectorAll(".filter-chip").forEach((c) => c.classList.remove("is-active"));
                btn.classList.add("is-active");
                draw();
            });
            return btn;
        }));
        draw();
    }
    catch {
        list.replaceChildren(errorState("تعذّر تحميل الأعمال.", () => renderWork(outlet)));
    }
}
function albumCard(album) {
    const img = h("img", { class: "album-card__img", "data-src": album.cover_url, alt: album.title, loading: "lazy" });
    lazyImage(img);
    return h("a", { href: `/${album.slug}`, "data-link": "true", class: "album-card" }, [
        h("div", { class: "album-card__image-wrap" }, [img]),
        h("div", { class: "album-card__meta" }, [
            h("span", { class: "album-card__category" }, [album.category]),
            h("h3", { class: "album-card__title" }, [album.title]),
            h("p", { class: "album-card__sub" }, [`${album.location} \u2014 ${formatDate(album.date, { yearOnly: true })}`]),
            h("span", { class: "album-card__link" }, ["عرض القصة \u2190"]),
        ]),
    ]);
}
