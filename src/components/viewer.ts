import { h, trapFocus } from "../utils/dom.js";
import { preload } from "../utils/lazyload.js";
import { CONFIG } from "../config.js";
import type { Photo } from "../types/index.js";

let root: HTMLElement | null = null;
let photos: Photo[] = [];
let index = 0;
let releaseFocus: (() => void) | null = null;

// pinch/pan state
let scale = 1;
let originX = 0;
let originY = 0;
let pointers = new Map<number, PointerEvent>();
let lastPinchDist = 0;
let dragStartX = 0;
let dragging = false;

function getRoot(): HTMLElement {
  if (root) return root;
  root = h("div", { class: "viewer", role: "dialog", "aria-modal": "true", "aria-label": "Photo viewer" });
  document.body.append(root);
  return root;
}

export function openViewer(list: Photo[], startIndex: number): void {
  photos = list;
  index = startIndex;
  const el = getRoot();
  document.body.classList.add("no-scroll");
  render();
  el.classList.add("is-open");
  releaseFocus = trapFocus(el);
  document.addEventListener("keydown", onKeydown);
}

export function closeViewer(): void {
  if (!root) return;
  root.classList.remove("is-open");
  document.body.classList.remove("no-scroll");
  document.removeEventListener("keydown", onKeydown);
  releaseFocus?.();
}

function onKeydown(e: KeyboardEvent): void {
  if (e.key === "Escape") closeViewer();
  if (e.key === "ArrowRight") go(1);
  if (e.key === "ArrowLeft") go(-1);
}

function go(delta: number): void {
  const next = index + delta;
  if (next < 0 || next >= photos.length) return;
  index = next;
  resetZoom();
  render();
}

function resetZoom(): void {
  scale = 1;
  originX = 0;
  originY = 0;
}

function render(): void {
  const el = getRoot();
  const photo = photos[index];

  const img = h("img", {
    src: photo.display_url,
    alt: photo.filename.replace(/\.[a-z0-9]+$/i, ""),
    class: "viewer__img",
    draggable: "false",
  }) as HTMLImageElement;
  applyTransform(img);
  attachGestures(img);

  const closeBtn = h("button", { class: "viewer__close", "aria-label": "Close viewer" }, ["\u00d7"]);
  closeBtn.addEventListener("click", closeViewer);

  const prevBtn = h("button", { class: "viewer__nav viewer__nav--prev", "aria-label": "Previous photo", disabled: index === 0 }, ["\u2190"]);
  prevBtn.addEventListener("click", () => go(-1));

  const nextBtn = h("button", { class: "viewer__nav viewer__nav--next", "aria-label": "Next photo", disabled: index === photos.length - 1 }, ["\u2192"]);
  nextBtn.addEventListener("click", () => go(1));

  const counter = h("div", { class: "viewer__counter" }, [
    `${String(index + 1).padStart(2, "0")} / ${String(photos.length).padStart(2, "0")}`,
  ]);

  el.replaceChildren(
    closeBtn,
    h("div", { class: "viewer__stage" }, [img]),
    prevBtn,
    nextBtn,
    counter
  );

  // Preload neighbours so swiping forward/back feels instant.
  const n = CONFIG.IMAGE.PRELOAD_NEIGHBOURS;
  for (let d = 1; d <= n; d++) {
    if (photos[index + d]) preload(photos[index + d].display_url);
    if (photos[index - d]) preload(photos[index - d].display_url);
  }
}

function applyTransform(img: HTMLImageElement): void {
  img.style.transform = `translate(${originX}px, ${originY}px) scale(${scale})`;
}

function attachGestures(img: HTMLImageElement): void {
  img.addEventListener("pointerdown", (e) => {
    pointers.set(e.pointerId, e);
    if (pointers.size === 1) {
      dragging = true;
      dragStartX = e.clientX;
    }
  });

  img.addEventListener("pointermove", (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, e);

    if (pointers.size === 2) {
      const pts = [...pointers.values()];
      const dist = Math.hypot(pts[0].clientX - pts[1].clientX, pts[0].clientY - pts[1].clientY);
      if (lastPinchDist) {
        scale = Math.min(4, Math.max(1, scale * (dist / lastPinchDist)));
        applyTransform(img);
      }
      lastPinchDist = dist;
    } else if (dragging && scale > 1) {
      originX += e.movementX;
      originY += e.movementY;
      applyTransform(img);
    }
  });

  const endDrag = (e: PointerEvent) => {
    if (dragging && scale === 1) {
      const delta = e.clientX - dragStartX;
      if (Math.abs(delta) > 60) {
        delta < 0 ? go(1) : go(-1);
      }
    }
    pointers.delete(e.pointerId);
    if (pointers.size < 2) lastPinchDist = 0;
    dragging = false;
  };
  img.addEventListener("pointerup", endDrag);
  img.addEventListener("pointercancel", endDrag);

  img.addEventListener("dblclick", () => {
    scale = scale > 1 ? 1 : 2;
    originX = 0;
    originY = 0;
    applyTransform(img);
  });
}
