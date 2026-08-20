import { CONFIG } from "../config.js";
import type { ApiResponse } from "../types/index.js";
import { getSession, clearSession } from "./auth.js";

/**
 * Single point of contact with the Apps Script backend.
 * No other module should call fetch() directly against the API —
 * this keeps auth headers, error shape, and mock fallback in one place.
 */

export class ApiError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

export class SessionExpiredError extends ApiError {
  constructor() {
    super("SESSION_EXPIRED", "Your session has expired. Please log in again.");
  }
}

interface RequestOptions {
  auth?: boolean; // attach the admin session token
}

async function request<T>(
  action: string,
  method: "GET" | "POST",
  payload: Record<string, unknown> | undefined,
  opts: RequestOptions = {}
): Promise<T> {
  if (CONFIG.USE_MOCK) {
    const { mockDispatch } = await import("../data/mock.js");
    return mockDispatch<T>(action, payload);
  }

  const session = opts.auth ? getSession() : null;
  if (opts.auth && !session) {
    throw new SessionExpiredError();
  }

  let url = `${CONFIG.API_BASE_URL}?action=${encodeURIComponent(action)}`;
  const init: RequestInit = { method };

  if (method === "GET") {
    if (payload) {
      for (const [k, v] of Object.entries(payload)) {
        url += `&${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`;
      }
    }
  } else {
    // Apps Script doPost reads e.postData.contents — plain text body avoids
    // CORS preflights that Apps Script web apps don't handle well.
    init.headers = { "Content-Type": "text/plain;charset=utf-8" };
    init.body = JSON.stringify({
      ...payload,
      token: session?.token,
    });
  }

  let res: Response;
  try {
    res = await fetch(url, init);
  } catch {
    throw new ApiError("NETWORK_ERROR", "Something went wrong. Please check your connection and try again.");
  }

  if (!res.ok) {
    throw new ApiError("HTTP_ERROR", "Something went wrong. Please try again.");
  }

  let body: ApiResponse<T>;
  try {
    body = await res.json();
  } catch {
    throw new ApiError("PARSE_ERROR", "Something went wrong. Please try again.");
  }

  if (!body.ok) {
    if (body.error.code === "SESSION_EXPIRED" || body.error.code === "UNAUTHORIZED") {
      clearSession();
      throw new SessionExpiredError();
    }
    throw new ApiError(body.error.code, body.error.message);
  }

  return body.data;
}

export const apiGet = <T>(action: string, params?: Record<string, unknown>, opts?: RequestOptions) =>
  request<T>(action, "GET", params, opts);

export const apiPost = <T>(action: string, payload?: Record<string, unknown>, opts: RequestOptions = { auth: true }) =>
  request<T>(action, "POST", payload, opts);
