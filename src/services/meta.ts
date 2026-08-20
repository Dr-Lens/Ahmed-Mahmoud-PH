interface MetaOptions {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
}

function upsert(selector: string, create: () => HTMLElement): HTMLElement {
  let el = document.head.querySelector<HTMLElement>(selector);
  if (!el) {
    el = create();
    document.head.append(el);
  }
  return el;
}

export function setMeta({ title, description, image, url, type = "website" }: MetaOptions): void {
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

  const og: [string, string][] = [
    ["og:title", title],
    ["og:description", description],
    ["og:type", type],
    ["og:url", canonicalHref],
  ];
  if (image) og.push(["og:image", image]);
  for (const [prop, content] of og) {
    upsert(`meta[property="${prop}"]`, () => {
      const m = document.createElement("meta");
      m.setAttribute("property", prop);
      return m;
    }).setAttribute("content", content);
  }

  const twitter: [string, string][] = [
    ["twitter:card", image ? "summary_large_image" : "summary"],
    ["twitter:title", title],
    ["twitter:description", description],
  ];
  if (image) twitter.push(["twitter:image", image]);
  for (const [name, content] of twitter) {
    upsert(`meta[name="${name}"]`, () => {
      const m = document.createElement("meta");
      m.setAttribute("name", name);
      return m;
    }).setAttribute("content", content);
  }
}

export function setStructuredData(json: Record<string, unknown>): void {
  let el = document.getElementById("structured-data") as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement("script");
    el.type = "application/ld+json";
    el.id = "structured-data";
    document.head.append(el);
  }
  el.textContent = JSON.stringify(json);
}
