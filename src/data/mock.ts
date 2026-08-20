// ---------------------------------------------------------------------------
// PLACEHOLDER DEMO DATA — replace by connecting a real Apps Script backend.
//
// This module exists so the site is fully browsable before the backend is
// deployed. It implements the exact same action names as the real API
// (see /docs/API.md), so swapping CONFIG.API_BASE_URL from "" to a real
// deployment URL is the only change needed to go live — no UI code changes.
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

const settings: SiteSettings = {
  site_name: "AHMED MAHMOUD PH",
  photographer_name: "Ahmed Mahmoud",
  logo_url: "/public/assets/logo.webp",
  bio: "Add a short biography from the Admin Dashboard — experience, specializations, and story go here.",
  hero_image: PLACEHOLDER_IMG("hero", 1200, 1600),
  location: "Cairo, Egypt",
  email: "",
  whatsapp: "+201111714320",
  instagram: "",
  facebook: "",
  is_placeholder: true,
};

const categories: Category[] = [
  { category_id: "c1", name: "Wedding", slug: "wedding", description: "", visible: true, sort_order: 1 },
  { category_id: "c2", name: "Portrait", slug: "portrait", description: "", visible: true, sort_order: 2 },
  { category_id: "c3", name: "Event", slug: "event", description: "", visible: true, sort_order: 3 },
  { category_id: "c4", name: "Fashion", slug: "fashion", description: "", visible: true, sort_order: 4 },
];

const albums: Album[] = [
  {
    album_id: "a1",
    title: "Ahmed & Sara",
    slug: "wedding-ahmed-sara",
    category: "Wedding",
    description: "A placeholder wedding story. Replace with a real album and photos from /admin.",
    location: "Cairo",
    date: "2026-04-12",
    cover_url: PLACEHOLDER_IMG("wedding-cover", 1200, 1500),
    featured: true,
    visible: true,
    status: "PUBLIC",
    sort_order: 1,
    created_at: "2026-04-13T10:00:00Z",
    photo_count: 8,
  },
  {
    album_id: "a2",
    title: "Studio Portraits",
    slug: "studio-portraits",
    category: "Portrait",
    description: "Placeholder portrait session.",
    location: "Cairo Studio",
    date: "2026-03-02",
    cover_url: PLACEHOLDER_IMG("portrait-cover", 1200, 1500),
    featured: true,
    visible: true,
    status: "PUBLIC",
    sort_order: 2,
    created_at: "2026-03-03T10:00:00Z",
    photo_count: 6,
  },
  {
    album_id: "a3",
    title: "Nour Fashion Editorial",
    slug: "nour-fashion-editorial",
    category: "Fashion",
    description: "Placeholder fashion editorial.",
    location: "Downtown Cairo",
    date: "2026-01-20",
    cover_url: PLACEHOLDER_IMG("fashion-cover", 1500, 1200),
    featured: false,
    visible: true,
    status: "PUBLIC",
    sort_order: 3,
    created_at: "2026-01-21T10:00:00Z",
    photo_count: 5,
  },
];

const aspectSeeds: [string, number, number][] = [
  ["p1", 1200, 1600], // portrait
  ["p2", 1600, 1067], // landscape
  ["p3", 1200, 1200], // square
  ["p4", 1200, 1700],
  ["p5", 1600, 1067],
  ["p6", 1200, 1200],
  ["p7", 1200, 1700],
  ["p8", 1600, 1067],
];

function buildPhotos(albumId: string, count: number): Photo[] {
  return Array.from({ length: count }, (_, i) => {
    const [seedBase, w, h] = aspectSeeds[i % aspectSeeds.length];
    const seed = `${albumId}-${seedBase}-${i}`;
    return {
      photo_id: `${albumId}-ph${i + 1}`,
      album_id: albumId,
      filename: `photo${String(i + 1).padStart(2, "0")}.jpg`,
      original_url: PLACEHOLDER_IMG(seed, w, h),
      display_url: PLACEHOLDER_IMG(seed, Math.round(w * 0.75), Math.round(h * 0.75)),
      thumbnail_url: PLACEHOLDER_IMG(seed, Math.round(w * 0.25), Math.round(h * 0.25)),
      width: w,
      height: h,
      sort_order: i + 1,
      visible: true,
      created_at: "2026-04-13T10:00:00Z",
    };
  });
}

const photosByAlbum: Record<string, Photo[]> = {
  a1: buildPhotos("a1", 8),
  a2: buildPhotos("a2", 6),
  a3: buildPhotos("a3", 5),
};

const services: Service[] = [
  { service_id: "s1", title: "Wedding Photography", description: "Full-day coverage, editorial storytelling.", visible: true, sort_order: 1 },
  { service_id: "s2", title: "Portrait Photography", description: "Studio and on-location portrait sessions.", visible: true, sort_order: 2 },
  { service_id: "s3", title: "Event Photography", description: "Corporate and private event coverage.", visible: true, sort_order: 3 },
  { service_id: "s4", title: "Fashion Photography", description: "Editorial and lookbook shoots.", visible: true, sort_order: 4 },
  { service_id: "s5", title: "Commercial Photography", description: "Product and brand campaigns.", visible: true, sort_order: 5 },
];

const social: SocialLink[] = [
  { platform: "whatsapp", url: "https://wa.me/201111714320", visible: true, sort_order: 1 },
  { platform: "instagram", url: "", visible: false, sort_order: 2 },
  { platform: "facebook", url: "", visible: false, sort_order: 3 },
  { platform: "email", url: "", visible: false, sort_order: 4 },
];

const beforeAfter: BeforeAfter[] = [
  {
    project_id: "ba1",
    title: "Portrait Retouch",
    before_url: PLACEHOLDER_IMG("before1", 1200, 1500),
    after_url: PLACEHOLDER_IMG("after1", 1200, 1500),
    description: "Placeholder before/after project.",
    visible: true,
    sort_order: 1,
    created_at: "2026-02-01T10:00:00Z",
  },
];

let mockAdmins = [{ username: "admin", password: "changeme" }]; // demo-only, never used in production
let nextAlbumId = albums.length + 1;
let nextPhotoId = 1000;

export async function mockUploadPhoto(albumId: string, file: File): Promise<Photo> {
  const objectUrl = URL.createObjectURL(file);
  const photo: Photo = {
    photo_id: `mock-ph${nextPhotoId++}`,
    album_id: albumId,
    filename: file.name,
    original_url: objectUrl,
    display_url: objectUrl,
    thumbnail_url: objectUrl,
    width: 1200,
    height: 1500,
    sort_order: (photosByAlbum[albumId]?.length ?? 0) + 1,
    visible: true,
    created_at: new Date().toISOString(),
  };
  photosByAlbum[albumId] = [...(photosByAlbum[albumId] ?? []), photo];
  const album = albums.find((a) => a.album_id === albumId);
  if (album) album.photo_count = (album.photo_count ?? 0) + 1;
  return photo;
}

export async function mockDispatch<T>(action: string, payload?: Record<string, unknown>): Promise<T> {
  await new Promise((r) => setTimeout(r, 120)); // simulate latency

  switch (action) {
    case "getSettings":
      return settings as unknown as T;
    case "getAlbums":
      return albums.filter((a) => a.visible && a.status === "PUBLIC") as unknown as T;
    case "getAdminAlbums":
      return albums as unknown as T;
    case "getFeaturedAlbums":
      return albums.filter((a) => a.visible && a.featured && a.status === "PUBLIC") as unknown as T;
    case "getAlbum": {
      const found = albums.find((a) => a.slug === payload?.slug);
      if (!found) throw Object.assign(new Error("Album not found"), { code: "NOT_FOUND" });
      return found as unknown as T;
    }
    case "getPhotos":
      return (photosByAlbum[String(payload?.albumId)] ?? []) as unknown as T;
    case "deletePhoto": {
      const id = String(payload?.photo_id);
      for (const key of Object.keys(photosByAlbum)) {
        const before = photosByAlbum[key].length;
        photosByAlbum[key] = photosByAlbum[key].filter((p) => p.photo_id !== id);
        if (photosByAlbum[key].length !== before) {
          const album = albums.find((a) => a.album_id === key);
          if (album) album.photo_count = photosByAlbum[key].length;
        }
      }
      return undefined as unknown as T;
    }
    case "getCategories":
      return categories as unknown as T;
    case "createAlbum": {
      const a = payload?.album as Omit<Album, "album_id" | "created_at" | "photo_count">;
      const album: Album = { ...a, album_id: `mock-a${nextAlbumId++}`, created_at: new Date().toISOString(), photo_count: 0 };
      albums.push(album);
      photosByAlbum[album.album_id] = [];
      return album as unknown as T;
    }
    case "updateAlbum": {
      const id = String(payload?.album_id);
      const album = albums.find((a) => a.album_id === id);
      if (!album) throw Object.assign(new Error("Album not found"), { code: "NOT_FOUND" });
      Object.assign(album, payload?.patch);
      return album as unknown as T;
    }
    case "deleteAlbum": {
      const id = String(payload?.album_id);
      const idx = albums.findIndex((a) => a.album_id === id);
      if (idx >= 0) albums.splice(idx, 1);
      delete photosByAlbum[id];
      return undefined as unknown as T;
    }
    case "getServices":
      return services.filter((s) => s.visible) as unknown as T;
    case "updateService": {
      const id = String(payload?.service_id);
      const service = services.find((s) => s.service_id === id);
      if (!service) throw Object.assign(new Error("Service not found"), { code: "NOT_FOUND" });
      Object.assign(service, payload?.patch);
      return service as unknown as T;
    }
    case "getSocial":
      return social as unknown as T;
    case "updateSocial": {
      const links = payload?.links as SocialLink[];
      social.splice(0, social.length, ...links);
      return social as unknown as T;
    }
    case "getBeforeAfter":
      return beforeAfter.filter((b) => b.visible) as unknown as T;
    case "createBeforeAfter": {
      const p = payload?.project as Omit<BeforeAfter, "project_id" | "created_at">;
      const project: BeforeAfter = { ...p, project_id: `mock-ba${beforeAfter.length + 1}`, created_at: new Date().toISOString() };
      beforeAfter.push(project);
      return project as unknown as T;
    }
    case "deleteBeforeAfter": {
      const id = String(payload?.project_id);
      const idx = beforeAfter.findIndex((b) => b.project_id === id);
      if (idx >= 0) beforeAfter.splice(idx, 1);
      return undefined as unknown as T;
    }
    case "updateSettings": {
      Object.assign(settings, payload?.patch);
      settings.is_placeholder = false;
      return settings as unknown as T;
    }
    case "login": {
      const { username, password } = payload as { username: string; password: string };
      const match = mockAdmins.find((a) => a.username === username && a.password === password);
      if (!match) throw Object.assign(new Error("Invalid username or password."), { code: "INVALID_CREDENTIALS" });
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
