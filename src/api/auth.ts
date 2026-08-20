import { CONFIG } from "../config.js";
import type { Session } from "../types/index.js";

/**
 * The frontend never evaluates credentials itself. It only stores the
 * opaque session token issued by Apps Script after a server-side check,
 * and treats that token as the single source of truth for "am I logged in".
 * Every protected admin API call is re-verified server-side regardless of
 * what this module reports — see apps-script/Auth.gs.
 */

export function getSession(): Session | null {
  const raw = localStorage.getItem(CONFIG.SESSION_STORAGE_KEY);
  if (!raw) return null;
  try {
    const session: Session = JSON.parse(raw);
    if (!session.token || session.expires_at < Date.now()) {
      clearSession();
      return null;
    }
    return session;
  } catch {
    clearSession();
    return null;
  }
}

export function isAuthenticated(): boolean {
  return getSession() !== null;
}

export function saveSession(session: Session): void {
  localStorage.setItem(CONFIG.SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(CONFIG.SESSION_STORAGE_KEY);
}

export async function login(username: string, password: string): Promise<Session> {
  const { apiPost } = await import("./client.js");
  const session = await apiPost<Session>(
    "login",
    { username, password },
    { auth: false }
  );
  saveSession(session);
  return session;
}

export async function logout(): Promise<void> {
  const { apiPost } = await import("./client.js");
  try {
    await apiPost<void>("logout", {}, { auth: true });
  } finally {
    clearSession();
  }
}
