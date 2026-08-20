import { apiGet, apiPost } from "./client.js";
import { CONFIG } from "../config.js";
import { getSession } from "./auth.js";
export const getPhotos = (albumId) => apiGet("getPhotos", { albumId });
export const deletePhoto = (photo_id) => apiPost("deletePhoto", { photo_id });
export const reorderPhotos = (albumId, order) => apiPost("reorderPhotos", { albumId, order });
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 15 * 1024 * 1024; // 15MB per photo, enforced again server-side
export function validateFile(file) {
    if (!ALLOWED_MIME.includes(file.type)) {
        return "Unsupported file type. Use JPG, PNG, or WEBP.";
    }
    if (file.size > MAX_BYTES) {
        return "File is too large. Maximum size is 15MB.";
    }
    return null;
}
/**
 * Uploads a single photo: file -> base64 -> Apps Script -> ImgBB -> Sheets row.
 * The ImgBB key never touches this code; Apps Script attaches it server-side.
 * Reports progress via onProgress (0-100). Apps Script doPost is a single
 * request/response, so "progress" reflects file-read + request lifecycle,
 * not byte-level network progress (a real byte-level progress bar would
 * require XHR against an endpoint that supports it — noted for a future
 * iteration if Apps Script's limitations become a blocker).
 */
export async function uploadPhoto(albumId, task, onProgress) {
    if (CONFIG.USE_MOCK) {
        // Simulate a realistic progress curve against the in-memory demo data.
        for (const pct of [15, 35, 60, 85]) {
            await new Promise((r) => setTimeout(r, 120));
            onProgress(pct);
        }
        const { mockUploadPhoto } = await import("../data/mock.js");
        const photo = await mockUploadPhoto(albumId, task.file);
        onProgress(100);
        return photo;
    }
    const session = getSession();
    if (!session)
        throw new Error("Not authenticated");
    onProgress(10);
    const base64 = await fileToBase64(task.file);
    onProgress(40);
    const res = await fetch(`${CONFIG.API_BASE_URL}?action=uploadPhoto`, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
            token: session.token,
            albumId,
            filename: task.file.name,
            mimeType: task.file.type,
            base64,
        }),
    });
    onProgress(85);
    const body = await res.json();
    if (!body.ok)
        throw new Error(body.error?.message ?? "Upload failed");
    onProgress(100);
    return body.data;
}
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result;
            resolve(result.split(",")[1] ?? "");
        };
        reader.onerror = () => reject(new Error("Could not read file."));
        reader.readAsDataURL(file);
    });
}
