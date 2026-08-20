// Shared type definitions for AHMED MAHMOUD PH
// These types mirror the Google Sheets schema and the Apps Script API contract.
// See /docs/API.md and /docs/SCHEMA.md for the authoritative reference.

export type AlbumStatus = "DRAFT" | "PUBLIC" | "PRIVATE";

export interface Album {
  album_id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  location: string;
  date: string; // ISO date, display-formatted client-side
  cover_url: string;
  featured: boolean;
  visible: boolean;
  status: AlbumStatus;
  sort_order: number;
  created_at: string;
  photo_count?: number; // derived server-side for list views
}

export interface Photo {
  photo_id: string;
  album_id: string;
  filename: string;
  original_url: string;
  display_url: string;
  thumbnail_url: string;
  width: number;
  height: number;
  sort_order: number;
  visible: boolean;
  created_at: string;
}

export interface Category {
  category_id: string;
  name: string;
  slug: string;
  description: string;
  visible: boolean;
  sort_order: number;
}

export interface Service {
  service_id: string;
  title: string;
  description: string;
  visible: boolean;
  sort_order: number;
}

export type SocialPlatform = "instagram" | "facebook" | "whatsapp" | "email";

export interface SocialLink {
  platform: SocialPlatform;
  url: string;
  visible: boolean;
  sort_order: number;
}

export interface BeforeAfter {
  project_id: string;
  title: string;
  before_url: string;
  after_url: string;
  description: string;
  visible: boolean;
  sort_order: number;
  created_at: string;
}

export interface SiteSettings {
  site_name: string;
  photographer_name: string;
  logo_url: string;
  bio: string;
  hero_image: string;
  location: string;
  email: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
  is_placeholder?: boolean; // true when a field has not been configured yet by the admin
}

// ---- API envelope -------------------------------------------------------

export interface ApiSuccess<T> {
  ok: true;
  data: T;
}

export interface ApiFailure {
  ok: false;
  error: {
    code: string;
    message: string; // safe, user-facing message only — never a raw stack trace
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export interface Session {
  token: string;
  expires_at: number; // epoch ms
  admin_name: string;
}

export interface UploadTask {
  file: File;
  filename: string;
  progress: number; // 0-100
  status: "queued" | "uploading" | "success" | "error";
  error?: string;
  photo?: Photo;
}
