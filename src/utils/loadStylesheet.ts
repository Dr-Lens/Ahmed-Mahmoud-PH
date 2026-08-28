const loaded = new Set<string>();

/**
 * Injects a <link rel="stylesheet"> once per href, then never again — safe
 * to call on every navigation to a route that needs it (e.g. every time
 * /admin renders) without creating duplicate link tags.
 */
export function loadStylesheet(href: string): void {
  if (loaded.has(href)) return;
  loaded.add(href);
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.append(link);
}
