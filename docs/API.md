# API Contract

Base URL: your deployed Apps Script Web App `/exec` URL, set in `frontend/src/config.ts` as `API_BASE_URL`.

Every response is a JSON envelope:

```jsonc
// success
{ "ok": true, "data": /* ... */ }

// failure
{ "ok": false, "error": { "code": "SOME_CODE", "message": "Safe, user-facing message." } }
```

## GET actions (public, no auth)

Called as `?action=NAME&param=value`.

| Action | Params | Returns |
|---|---|---|
| `getSettings` | — | `SiteSettings` |
| `getAlbums` | — | `Album[]` (visible + PUBLIC only) |
| `getFeaturedAlbums` | — | `Album[]` |
| `getAlbum` | `slug` | `Album` |
| `getPhotos` | `albumId` | `Photo[]` |
| `getCategories` | — | `Category[]` |
| `getServices` | — | `Service[]` |
| `getSocial` | — | `SocialLink[]` |
| `getBeforeAfter` | — | `BeforeAfter[]` |

## POST actions

Body is `text/plain` containing JSON (avoids CORS preflight against Apps Script). All admin actions require `token` in the body — obtained from `login` and issued by the server, never asserted by the client.

| Action | Auth | Body | Returns |
|---|---|---|---|
| `login` | — | `{ username, password }` | `Session` |
| `logout` | token | `{}` | `null` |
| `getAdminAlbums` | token | `{}` | `Album[]` (all statuses) |
| `createAlbum` | token | `{ album: NewAlbum }` | `Album` |
| `updateAlbum` | token | `{ album_id, patch }` | `Album` |
| `deleteAlbum` | token | `{ album_id }` | `null` (cascades photos) |
| `reorderAlbums` | token | `{ order: [{album_id, sort_order}] }` | `null` |
| `uploadPhoto` | token | `{ albumId, filename, mimeType, base64 }` | `Photo` |
| `deletePhoto` | token | `{ photo_id }` | `null` |
| `reorderPhotos` | token | `{ albumId, order: [{photo_id, sort_order}] }` | `null` |
| `updateSettings` | token | `{ patch }` | `SiteSettings` |
| `updateService` | token | `{ service_id, patch }` | `Service` |
| `updateSocial` | token | `{ links: SocialLink[] }` | `SocialLink[]` |
| `createBeforeAfter` | token | `{ project }` | `BeforeAfter` |
| `deleteBeforeAfter` | token | `{ project_id }` | `null` |

## Error codes

| Code | Meaning |
|---|---|
| `VALIDATION_ERROR` | Missing/invalid required field |
| `INVALID_CREDENTIALS` | Login failed |
| `TOO_MANY_ATTEMPTS` | Login throttled |
| `UNAUTHORIZED` / `SESSION_EXPIRED` | Missing or expired session token — frontend clears local session and redirects to `/admin/login` |
| `NOT_FOUND` | Album/photo/project not found |
| `SLUG_TAKEN` | Album slug already exists |
| `INVALID_FILE_TYPE` / `FILE_TOO_LARGE` | Upload rejected before hitting ImgBB |
| `UPLOAD_FAILED` | ImgBB request failed |
| `CONFIG_ERROR` | Missing `SPREADSHEET_ID` / `IMGBB_API_KEY` script property |
| `UNKNOWN_ACTION` | Action name not recognized |
| `INTERNAL_ERROR` | Unexpected server error (logged server-side, generic message returned) |

See `frontend/src/types/index.ts` for the exact TypeScript shapes referenced above.
