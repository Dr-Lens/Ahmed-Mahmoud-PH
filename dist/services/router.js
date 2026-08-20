const routes = [];
let notFoundHandler = () => { };
/**
 * The directory index.html was actually loaded from. On a GitHub Pages
 * *project* site this is "/repo-name/", not "/" — the app is deployed
 * under a subpath, not the domain root. Every route in this file is a
 * single top-level segment (e.g. /work, /admin, /:slug), so the base path
 * is reliably "everything up to and including the last '/'" in whatever
 * pathname the browser currently shows, whether that's the bare base
 * ("/repo-name/"), a route directly under it ("/repo-name/work"), or a
 * hard refresh on a deep link served via 404.html.
 */
const BASE_PATH = (() => {
    const path = location.pathname;
    return path.slice(0, path.lastIndexOf("/") + 1) || "/";
})();
function toActualPath(logicalPath) {
    const trimmed = logicalPath.replace(/^\/+/, "");
    return trimmed ? BASE_PATH + trimmed : BASE_PATH;
}
function toLogicalPath(actualPath) {
    if (actualPath.startsWith(BASE_PATH)) {
        const rest = actualPath.slice(BASE_PATH.length);
        return "/" + rest;
    }
    return actualPath;
}
function compile(path) {
    const paramNames = [];
    const pattern = path
        .split("/")
        .map((segment) => {
        if (segment.startsWith(":")) {
            paramNames.push(segment.slice(1));
            return "([^/]+)";
        }
        return segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    })
        .join("/");
    return { pattern: new RegExp(`^${pattern}/?$`), paramNames };
}
export function route(path, render) {
    const { pattern, paramNames } = compile(path);
    routes.push({ pattern, paramNames, render });
}
export function notFound(handler) {
    notFoundHandler = handler;
}
export function navigate(logicalPath, replace = false) {
    const actual = toActualPath(logicalPath);
    if (replace)
        history.replaceState({}, "", actual);
    else
        history.pushState({}, "", actual);
    resolve();
}
async function resolve() {
    const logicalPath = toLogicalPath(location.pathname);
    for (const r of routes) {
        const match = logicalPath.match(r.pattern);
        if (match) {
            const params = {};
            r.paramNames.forEach((name, i) => (params[name] = decodeURIComponent(match[i + 1])));
            await r.render(params);
            window.scrollTo({ top: 0, behavior: "instant" });
            return;
        }
    }
    notFoundHandler();
}
export function startRouter() {
    window.addEventListener("popstate", resolve);
    document.addEventListener("click", (e) => {
        const anchor = e.target.closest("a[data-link]");
        if (!anchor)
            return;
        const href = anchor.getAttribute("href");
        if (!href || href.startsWith("http") || href.startsWith("//"))
            return;
        e.preventDefault();
        navigate(href);
    });
    resolve();
}
