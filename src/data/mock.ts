// ---------------------------------------------------------------------------
// PLACEHOLDER DEMO DATA — replace by connecting a real Apps Script backend.
//
// This module exists so the site is fully browsable before the backend is
// deployed. It implements the exact same action names as the real API
// (see /docs/API.md), so swapping CONFIG.API_BASE_URL from "" to a real
// deployment URL is the only change needed to go live — no UI code changes.
//
// PERSISTENCE: everything mutable here (settings, albums, photos, services,
// social links, before/after projects) is saved to this browser's
// localStorage after every write, and reloaded from it on startup. Without
// this, every full page navigation would re-run this module from scratch
// and silently reset any admin changes back to the defaults below — which
// is exactly what "editing Settings doesn't seem to do anything" looks like
// from the outside. This is browser-local only (not shared across devices);
// once a real Apps Script backend is connected, Google Sheets becomes the
// actual source of truth and this file is bypassed entirely.
//
// Every string below is either structural copy explicitly given in the
// brief (brand name, title, WhatsApp number) or a clearly-labeled sample
// used only for layout purposes. Ahmed replaces all of it from /admin.
// ---------------------------------------------------------------------------

import type {
  Album,
  Photo,
  Category,
  Service,
  SocialLink,
  BeforeAfter,
  SiteSettings,
  Session,
} from "../types/index.js";

const PLACEHOLDER_IMG = (seed: string, w = 1200, h = 1500) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;

interface MockState {
  settings: SiteSettings;
  categories: Category[];
  albums: Album[];
  photosByAlbum: Record<string, Photo[]>;
  services: Service[];
  social: SocialLink[];
  beforeAfter: BeforeAfter[];
  nextAlbumId: number;
  nextPhotoId: number;
  nextBeforeAfterId: number;
}

function defaultState(): MockState {
  return {
    settings: {
      site_name: "أحمد محمود PH",
      photographer_name: "أحمد محمود",
      logo_url: "/public/assets/logo.webp",
      bio: "أضف نبذة قصيرة من لوحة التحكم — الخبرة والتخصصات والقصة الشخصية تُكتب هنا.",
      hero_image: PLACEHOLDER_IMG("hero", 1200, 1600),
      location: "القاهرة، مصر",
      email: "",
      whatsapp: "+201111714320",
      instagram: "",
      facebook: "",
      is_placeholder: true,
    },
    categories: [
      { category_id: "c1", name: "زفاف", slug: "wedding", description: "", visible: true, sort_order: 1 },
      { category_id: "c2", name: "بورتريه", slug: "portrait", description: "", visible: true, sort_order: 2 },
      { category_id: "c3", name: "مناسبات", slug: "event", description: "", visible: true, sort_order: 3 },
      { category_id: "c4", name: "أزياء", slug: "fashion", description: "", visible: true, sort_order: 4 },
    ],
    // No demo albums — the site ships empty by design. Add real albums (and
    // their photos) from /admin.
    albums: [],
    photosByAlbum: {},
    services: [
      { service_id: "s1", title: "تصوير زفاف", description: "تغطية اليوم بالكامل بأسلوب سردي احترافي.", visible: true, sort_order: 1 },
      { service_id: "s2", title: "تصوير بورتريه", description: "جلسات بورتريه في الاستوديو أو في الموقع.", visible: true, sort_order: 2 },
      { service_id: "s3", title: "تصوير مناسبات", description: "تغطية المناسبات الخاصة والفعاليات الرسمية.", visible: true, sort_order: 3 },
      { service_id: "s4", title: "تصوير أزياء", description: "جلسات أزياء وتحرير تحريري احترافي.", visible: true, sort_order: 4 },
      { service_id: "s5", title: "تصوير تجاري", description: "حملات المنتجات والعلامات التجارية.", visible: true, sort_order: 5 },
    ],
    social: [
      { platform: "whatsapp", url: "https://wa.me/201111714320", visible: true, sort_order: 1 },
      { platform: "instagram", url: "", visible: false, sort_order: 2 },
      { platform: "facebook", url: "", visible: false, sort_order: 3 },
      { platform: "email", url: "", visible: false, sort_order: 4 },
    ],
    beforeAfter: [
      {
        project_id: "ba1",
        title: "تعديل بورتريه",
        before_url: PLACEHOLDER_IMG("before1", 1200, 1500),
        after_url: PLACEHOLDER_IMG("after1", 1200, 1500),
        description: "مشروع قبل/بعد تجريبي.",
        visible: true,
        sort_order: 1,
        created_at: "2026-02-01T10:00:00Z",
      },
    ],
    nextAlbumId: 1,
    nextPhotoId: 1000,
    nextBeforeAfterId: 2,
  };
}

const STORAGE_KEY = "amph_mock_state_v1";

function loadState(): MockState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as MockState;
  } catch {
    // Corrupt or inaccessible storage — fall through to a fresh default state.
  }
  return defaultState();
}

const state = loadState();

function persist(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full/unavailable (private browsing, quota) — the change still
    // applies for the rest of this session, it just won't survive a reload.
  }
}

const mockAdmins = [{ username: "admin", password: "changeme" }]; // demo-only, never used in production

export async function mockUploadPhoto(albumId: string, file: File): Promise<Photo> {
  const objectUrl = URL.createObjectURL(file);
  const photo: Photo = {
    photo_id: `mock-ph${state.nextPhotoId++}`,
    album_id: albumId,
    filename: file.name,
    original_url: objectUrl,
    display_url: objectUrl,
    thumbnail_url: objectUrl,
    width: 1200,
    height: 1500,
    sort_order: (state.photosByAlbum[albumId]?.length ?? 0) + 1,
    visible: true,
    created_at: new Date().toISOString(),
  };
  state.photosByAlbum[albumId] = [...(state.photosByAlbum[albumId] ?? []), photo];
  const album = state.albums.find((a) => a.album_id === albumId);
  if (album) album.photo_count = (album.photo_count ?? 0) + 1;
  // Not persisted: object URLs (blob:...) are only valid for this tab's
  // lifetime anyway, so a photo added via mock upload won't survive a
  // reload regardless — this is a known mock-mode limitation, not a bug.
  return photo;
}

export async function mockDispatch<T>(action: string, payload?: Record<string, unknown>): Promise<T> {
  await new Promise((r) => setTimeout(r, 120)); // simulate latency

  switch (action) {
    case "getSettings":
      return state.settings as unknown as T;
    case "getAlbums":
      return state.albums.filter((a) => a.visible && a.status === "PUBLIC") as unknown as T;
    case "getAdminAlbums":
      return state.albums as unknown as T;
    case "getFeaturedAlbums":
      return state.albums.filter((a) => a.visible && a.featured && a.status === "PUBLIC") as unknown as T;
    case "getAlbum": {
      const found = state.albums.find((a) => a.slug === payload?.slug);
      if (!found) throw Object.assign(new Error("الألبوم غير موجود"), { code: "NOT_FOUND" });
      return found as unknown as T;
    }
    case "getPhotos":
      return (state.photosByAlbum[String(payload?.albumId)] ?? []) as unknown as T;
    case "deletePhoto": {
      const id = String(payload?.photo_id);
      for (const key of Object.keys(state.photosByAlbum)) {
        const before = state.photosByAlbum[key].length;
        state.photosByAlbum[key] = state.photosByAlbum[key].filter((p) => p.photo_id !== id);
        if (state.photosByAlbum[key].length !== before) {
          const album = state.albums.find((a) => a.album_id === key);
          if (album) album.photo_count = state.photosByAlbum[key].length;
        }
      }
      persist();
      return undefined as unknown as T;
    }
    case "getCategories":
      return state.categories as unknown as T;
    case "createAlbum": {
      const a = payload?.album as Omit<Album, "album_id" | "created_at" | "photo_count">;
      const album: Album = { ...a, album_id: `mock-a${state.nextAlbumId++}`, created_at: new Date().toISOString(), photo_count: 0 };
      state.albums.push(album);
      state.photosByAlbum[album.album_id] = [];
      persist();
      return album as unknown as T;
    }
    case "updateAlbum": {
      const id = String(payload?.album_id);
      const album = state.albums.find((a) => a.album_id === id);
      if (!album) throw Object.assign(new Error("الألبوم غير موجود"), { code: "NOT_FOUND" });
      Object.assign(album, payload?.patch);
      persist();
      return album as unknown as T;
    }
    case "deleteAlbum": {
      const id = String(payload?.album_id);
      const idx = state.albums.findIndex((a) => a.album_id === id);
      if (idx >= 0) state.albums.splice(idx, 1);
      delete state.photosByAlbum[id];
      persist();
      return undefined as unknown as T;
    }
    case "getServices":
      return state.services.filter((s) => s.visible) as unknown as T;
    case "updateService": {
      const id = String(payload?.service_id);
      const service = state.services.find((s) => s.service_id === id);
      if (!service) throw Object.assign(new Error("الخدمة غير موجودة"), { code: "NOT_FOUND" });
      Object.assign(service, payload?.patch);
      persist();
      return service as unknown as T;
    }
    case "getSocial":
      return state.social as unknown as T;
    case "updateSocial": {
      const links = payload?.links as SocialLink[];
      state.social.splice(0, state.social.length, ...links);
      persist();
      return state.social as unknown as T;
    }
    case "getBeforeAfter":
      return state.beforeAfter.filter((b) => b.visible) as unknown as T;
    case "createBeforeAfter": {
      const p = payload?.project as Omit<BeforeAfter, "project_id" | "created_at">;
      const project: BeforeAfter = { ...p, project_id: `mock-ba${state.nextBeforeAfterId++}`, created_at: new Date().toISOString() };
      state.beforeAfter.push(project);
      persist();
      return project as unknown as T;
    }
    case "deleteBeforeAfter": {
      const id = String(payload?.project_id);
      const idx = state.beforeAfter.findIndex((b) => b.project_id === id);
      if (idx >= 0) state.beforeAfter.splice(idx, 1);
      persist();
      return undefined as unknown as T;
    }
    case "updateSettings": {
      Object.assign(state.settings, payload?.patch);
      state.settings.is_placeholder = false;
      persist();
      return state.settings as unknown as T;
    }
    case "login": {
      const { username, password } = payload as { username: string; password: string };
      const match = mockAdmins.find((a) => a.username === username && a.password === password);
      if (!match) throw Object.assign(new Error("اسم المستخدم أو كلمة المرور غير صحيحة."), { code: "INVALID_CREDENTIALS" });
      const session: Session = {
        token: "mock-" + Math.random().toString(36).slice(2),
        expires_at: Date.now() + 1000 * 60 * 60 * 4,
        admin_name: username,
      };
      return session as unknown as T;
    }
    case "logout":
      return undefined as unknown as T;
    default:
      throw Object.assign(new Error(`Mock action not implemented: ${action}`), { code: "NOT_IMPLEMENTED" });
  }
}
