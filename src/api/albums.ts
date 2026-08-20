import { apiGet, apiPost } from "./client.js";
import type { Album } from "../types/index.js";

/** Public listing: only visible, published albums. Used by Work and Home. */
export const getAlbums = () => apiGet<Album[]>("getAlbums");
export const getFeaturedAlbums = () => apiGet<Album[]>("getFeaturedAlbums");
export const getAlbumBySlug = (slug: string) => apiGet<Album>("getAlbum", { slug });

/** Admin listing: every album regardless of status, requires a valid session. */
export const getAdminAlbums = () => apiPost<Album[]>("getAdminAlbums", {});

export type NewAlbum = Omit<Album, "album_id" | "created_at" | "photo_count">;

export const createAlbum = (album: NewAlbum) => apiPost<Album>("createAlbum", { album });
export const updateAlbum = (album_id: string, patch: Partial<NewAlbum>) =>
  apiPost<Album>("updateAlbum", { album_id, patch });
export const deleteAlbum = (album_id: string) => apiPost<void>("deleteAlbum", { album_id });
export const reorderAlbums = (order: { album_id: string; sort_order: number }[]) =>
  apiPost<void>("reorderAlbums", { order });
