import { CONFIG } from "../config.js";
/**
 * The frontend never evaluates credentials itself. It only stores the
 * opaque session token issued by Apps Script after a server-side check,
 * and treats that token as the single source of truth for "am I logged in".
 * Every protected admin API call is re-verified server-side regardless of
 * what this module reports — see apps-script/Auth.gs.
 */
export function getSession() {
    const raw = localStorage.getItem(CONFIG.SESSION_STORAGE_KEY);
    if (!raw)
        return null;
    try {
        const session = JSON.parse(raw);
        if (!session.token || session.expires_at < Date.now()) {
            clearSession();
            return null;
        }
        return session;
    }
    catch {
        clearSession();
        return null;
    }
}
export function isAuthenticated() {
    return getSession() !== null;
}
export function saveSession(session) {
    localStorage.setItem(CONFIG.SESSION_STORAGE_KEY, JSON.stringify(session));
}
export function clearSession() {
    localStorage.removeItem(CONFIG.SESSION_STORAGE_KEY);
}
export async function login(username, password) {
    const { apiPost } = await import("./client.js");
    const session = await apiPost("login", { username, password }, { auth: false });
    saveSession(session);
    return session;
}
export async function logout() {
    const { apiPost } = await import("./client.js");
    try {
        await apiPost("logout", {}, { auth: true });
    }
    finally {
        clearSession();
    }
}
