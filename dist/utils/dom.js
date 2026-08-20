export function h(tag, attrs = {}, children = []) {
    const el = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) {
        if (value === undefined || value === false)
            continue;
        if (key === "class")
            el.className = String(value);
        else if (key.startsWith("on") && typeof value === "string")
            continue;
        else if (value === true)
            el.setAttribute(key, "");
        else
            el.setAttribute(key, String(value));
    }
    for (const child of children) {
        el.append(typeof child === "string" ? document.createTextNode(child) : child);
    }
    return el;
}
export function qs(selector, root = document) {
    return root.querySelector(selector);
}
export function mount(root, node) {
    root.replaceChildren(node);
}
export function escapeHtml(input) {
    const div = document.createElement("div");
    div.textContent = input;
    return div.innerHTML;
}
export function trapFocus(container) {
    const focusable = container.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable.length === 0)
        return () => { };
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    function onKeydown(e) {
        if (e.key !== "Tab")
            return;
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        }
        else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    }
    container.addEventListener("keydown", onKeydown);
    first.focus();
    return () => container.removeEventListener("keydown", onKeydown);
}
