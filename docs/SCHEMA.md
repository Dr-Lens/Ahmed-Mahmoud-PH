# Database Schema — Google Sheets

Create **one spreadsheet** with the sheets and header rows below (row 1 = headers, exactly as written — the backend maps columns by header name).

## SETTINGS
Single data row (row 2). If empty, the API returns sensible defaults.

| site_name | photographer_name | logo_url | bio | hero_image | location | email | whatsapp | instagram | facebook |
|---|---|---|---|---|---|---|---|---|---|

## ADMINS
Never store plaintext passwords. Populate via the `setupAdmin_()` helper in `Code.gs` — do not type a password directly into this sheet.

| username | password_hash | password_salt | created_at |
|---|---|---|---|

## SESSIONS
Managed entirely by the backend (`Code.gs`). Leave empty; rows are created on login and removed on logout/expiry.

| token | username | expires_at | created_at |
|---|---|---|---|

## ALBUMS

| album_id | title | slug | category | description | location | date | cover_url | featured | visible | status | sort_order | created_at |
|---|---|---|---|---|---|---|---|---|---|---|---|---|

- `featured`, `visible`: `TRUE` / `FALSE`
- `status`: `DRAFT` / `PUBLIC` / `PRIVATE`

## PHOTOS

| photo_id | album_id | filename | original_url | display_url | thumbnail_url | width | height | sort_order | visible | created_at |
|---|---|---|---|---|---|---|---|---|---|---|

## CATEGORIES

| category_id | name | slug | description | visible | sort_order |
|---|---|---|---|---|---|

## SERVICES

| service_id | title | description | visible | sort_order |
|---|---|---|---|---|

## SOCIAL
One row per platform: `instagram`, `facebook`, `whatsapp`, `email`.

| platform | url | visible | sort_order |
|---|---|---|---|

## BEFORE_AFTER

| project_id | title | before_url | after_url | description | visible | sort_order | created_at |
|---|---|---|---|---|---|---|---|

---

Ahmed manages all of this content through **/admin**, never by opening the spreadsheet directly. The sheet is the storage engine, not the CMS interface.
