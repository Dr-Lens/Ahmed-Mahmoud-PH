import { h } from "../utils/dom.js";
import type { BeforeAfter } from "../types/index.js";

export function renderBeforeAfter(project: BeforeAfter): HTMLElement {
  const afterWrap = h("div", { class: "ba__after" }, [
    h("img", { src: project.after_url, alt: `${project.title} — بعد`, class: "ba__img" }),
  ]);
  const beforeWrap = h("div", { class: "ba__before" }, [
    h("img", { src: project.before_url, alt: `${project.title} — قبل`, class: "ba__img" }),
  ]);
  const handle = h("div", { class: "ba__handle", role: "slider", "aria-label": "موضع المقارنة", "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": "50", tabindex: "0" }, [
    h("span", { class: "ba__handle-line" }),
    h("span", { class: "ba__handle-grip" }, ["\u2194"]),
  ]);
  const labels = h("div", { class: "ba__labels", dir: "ltr" }, [
    h("span", { class: "ba__label" }, ["قبل"]),
    h("span", { class: "ba__label" }, ["بعد"]),
  ]);

  const frame = h("div", { class: "ba__frame", dir: "ltr" }, [afterWrap, beforeWrap, handle]);
  const wrapper = h("div", { class: "ba" }, [
    h("h3", { class: "ba__title" }, [project.title]),
    frame,
    labels,
  ]);

  function setPosition(pct: number): void {
    const clamped = Math.min(100, Math.max(0, pct));
    beforeWrap.style.clipPath = `inset(0 ${100 - clamped}% 0 0)`;
    handle.style.left = `${clamped}%`;
    handle.setAttribute("aria-valuenow", String(Math.round(clamped)));
  }
  setPosition(50);

  function fromClientX(clientX: number): void {
    const rect = frame.getBoundingClientRect();
    setPosition(((clientX - rect.left) / rect.width) * 100);
  }

  let dragging = false;
  frame.addEventListener("pointerdown", (e) => {
    dragging = true;
    fromClientX(e.clientX);
  });
  window.addEventListener("pointermove", (e) => {
    if (dragging) fromClientX(e.clientX);
  });
  window.addEventListener("pointerup", () => (dragging = false));

  handle.addEventListener("keydown", (e) => {
    const current = Number(handle.getAttribute("aria-valuenow") ?? 50);
    if (e.key === "ArrowLeft") setPosition(current - 5);
    if (e.key === "ArrowRight") setPosition(current + 5);
  });

  return wrapper;
}
