function upsert(selector, create) {
    let el = document.head.querySelector(selector);
    if (!el) {
        el = create();
        document.head.append(el);
    }
    return el;
}
export function setMeta({ title, description, image, url, type = "website" }) {
    document.title = title;
    upsert('meta[name="description"]', () => {
        const m = document.createElement("meta");
        m.setAttribute("name", "description");
        return m;
    }).setAttribute("content", description);
    const canonicalHref = url ?? window.location.href;
    upsert('link[rel="canonical"]', () => {
        const l = document.createElement("link");
        l.setAttribute("rel", "canonical");
        return l;
    }).setAttribute("href", canonicalHref);
    const og = [
        ["og:title", title],
        ["og:description", description],
        ["og:type", type],
        ["og:url", canonicalHref],
    ];
    if (image)
        og.push(["og:image", image]);
    for (const [prop, content] of og) {
        upsert(`meta[property="${prop}"]`, () => {
            const m = document.createElement("meta");
            m.setAttribute("property", prop);
            return m;
        }).setAttribute("content", content);
    }
    const twitter = [
        ["twitter:card", image ? "summary_large_image" : "summary"],
        ["twitter:title", title],
        ["twitter:description", description],
    ];
    if (image)
        twitter.push(["twitter:image", image]);
    for (const [name, content] of twitter) {
        upsert(`meta[name="${name}"]`, () => {
            const m = document.createElement("meta");
            m.setAttribute("name", name);
            return m;
        }).setAttribute("content", content);
    }
}
export function setStructuredData(json) {
    let el = document.getElementById("structured-data");
    if (!el) {
        el = document.createElement("script");
        el.type = "application/ld+json";
        el.id = "structured-data";
        document.head.append(el);
    }
    el.textContent = JSON.stringify(json);
}
