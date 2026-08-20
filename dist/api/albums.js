import { apiGet, apiPost } from "./client.js";
/** Public listing: only visible, published albums. Used by Work and Home. */
export const getAlbums = () => apiGet("getAlbums");
export const getFeaturedAlbums = () => apiGet("getFeaturedAlbums");
export const getAlbumBySlug = (slug) => apiGet("getAlbum", { slug });
/** Admin listing: every album regardless of status, requires a valid session. */
export const getAdminAlbums = () => apiPost("getAdminAlbums", {});
export const createAlbum = (album) => apiPost("createAlbum", { album });
export const updateAlbum = (album_id, patch) => apiPost("updateAlbum", { album_id, patch });
export const deleteAlbum = (album_id) => apiPost("deleteAlbum", { album_id });
export const reorderAlbums = (order) => apiPost("reorderAlbums", { order });
