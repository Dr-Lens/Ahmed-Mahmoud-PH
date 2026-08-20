import { h } from "../utils/dom.js";

export function skeletonList(count = 3): HTMLElement {
  return h(
    "div",
    { class: "skeleton-list" },
    Array.from({ length: count }, () => h("div", { class: "skeleton-card" }))
  );
}

export function brandedLoader(): HTMLElement {
  return h("div", { class: "brand-loader" }, [
    h("span", { class: "brand-loader__mark" }, ["AM"]),
    h("span", { class: "brand-loader__bar" }),
  ]);
}

export function errorState(message = "Something went wrong. Please try again.", onRetry?: () => void): HTMLElement {
  const children: (Node | string)[] = [h("p", { class: "state__message" }, [message])];
  if (onRetry) {
    const btn = h("button", { class: "btn btn--ghost" }, ["Try again"]);
    btn.addEventListener("click", onRetry);
    children.push(btn);
  }
  return h("div", { class: "state state--error" }, children);
}

export function emptyState(message: string, action?: HTMLElement): HTMLElement {
  const children: (Node | string)[] = [h("p", { class: "state__message" }, [message])];
  if (action) children.push(action);
  return h("div", { class: "state state--empty" }, children);
}
