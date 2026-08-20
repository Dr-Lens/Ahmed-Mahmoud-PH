import { CONFIG } from "../config.js";
const routes = [];
let notFoundHandler = () => { };
/**
 * The repo-prefix portion of the URL on a GitHub Pages project site, e.g.
 * "/repo-name/". Computed by keeping exactly CONFIG.PATH_SEGMENTS_TO_KEEP
 * leading path segments — NOT by guessing from slash positions in the
 * current URL, because that guess breaks the moment a path has (or is
 * missing) a trailing slash. This must stay in sync with the equivalent
 * constant in /404.html; see that file's comment for the full mechanism
 * (a 404→index.html redirect that survives any path shape).
 */
const BASE_PATH = (() => {
    const segments = location.pathname.split("/").filter(Boolean);
    const kept = segments.slice(0, CONFIG.PATH_SEGMENTS_TO_KEEP);
    return "/" + (kept.length ? kept.join("/") + "/" : "");
})();
function toActualPath(logicalPath) {
    const trimmed = logicalPath.replace(/^\/+/, "");
    return trimmed ? BASE_PATH + trimmed : BASE_PATH;
}
function toLogicalPath(actualPath) {
    const normalized = actualPath.replace(/\/+$/, "") || "/"; // trailing slash never carries route meaning here
    const basePrefix = BASE_PATH.slice(0, -1); // BASE_PATH always ends in "/": "" at true root, "/repo-name" otherwise
    if (!basePrefix)
        return normalized; // deployed at the domain root — no prefix to strip
    if (normalized.startsWith(basePrefix)) {
        const rest = normalized.slice(basePrefix.length);
        return rest === "" ? "/" : rest;
    }
    return normalized;
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
