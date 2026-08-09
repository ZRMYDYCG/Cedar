# CMS Comments Design

Date: 2026-08-09  
Status: implemented (v1)  
Project: Cedar (`aurora-web`)

## Goal

Replace the `#waline` comment placeholder with first-party comments stored in Payload CMS. Guests and admins can comment; comments publish immediately (no moderation queue). Sidebar “recent comments” reads the same collection.

## Decisions (locked)

| Topic | Choice |
| --- | --- |
| Who can comment | Guests (name + email) and Payload admins (optional `users` relation, shown as 博主) |
| Moderation | None — create = public |
| Storage | Payload collection `comments` (not Waline/Twikoo, not nested on posts) |
| Threading | One level of reply via optional `parent` |
| Surfaces | Posts, CMS pages (`/page/[slug]`), about (`uid=about`), links (`uid=links`) |
| Out of scope | Moments / 人生小记 comments, email notify, rich text, likes, captcha (beyond honeypot) |

## Architecture

```
Browser Comment UI
  → POST /api/comments (Payload REST, public create)
  → GET  /api/comments?where[target][equals]=… (public read)
Admin
  → Payload Admin CRUD / delete spam
Sidebar RecentComment
  → server or client fetch latest N comments (same collection)
```

Data access mirrors existing `src/data/cms/*` helpers (Local API on the server where possible). Client form uses Payload REST create against `/api/comments`.

## Data model

Collection slug: `comments`

| Field | Type | Notes |
| --- | --- | --- |
| `target` | text, required, indexed | Matches existing `Comment` `uid` (post slug, page slug, `about`, `links`) |
| `content` | textarea, required | Plain text; max length 2000 |
| `authorName` | text, required | Guest display name; for admin-linked comments, default from user/site nick |
| `authorEmail` | email, optional | Guest; not rendered publicly (Admin only / spam signal) |
| `authorUrl` | text, optional | Guest website; render only if http(s) |
| `author` | relationship → `users`, optional | Set when a logged-in Payload user posts (Admin session); UI badge「博主」 |
| `parent` | relationship → `comments`, optional | Reply target; only top-level parents allowed (reject parent-of-parent) |
| `createdAt` / `updatedAt` | system | Sort newest-first in lists |

No `_status` / draft versions. No separate `approved` flag.

### Access control

- `read`: `() => true`
- `create`: `() => true` (public)
- `update`: authenticated admin only
- `delete`: authenticated admin only

### Validation / hooks

- Trim strings; reject empty `content` / `authorName`
- Max lengths: name 40, email 120, url 200, content 2000, target 200
- `target` must be non-empty slug-like string (no spaces)
- If `parent` set: parent must exist, same `target`, and `parent.parent` must be empty
- Honeypot field on the form (e.g. `website_url` not in schema): if filled, return 204/fake success and do not create
- Optional: strip HTML from `content` (store plain text only)

## Frontend

### `Comment` component (`src/components/comment/comment.tsx`)

Replace placeholder with:

1. **List** — load comments for `uid` (`target`), group replies under parents
2. **Form** — nickname*, email (optional), website (optional), content*, honeypot (hidden)
3. **Reply** — “回复” sets `parent`; cancel clears it
4. Props stay compatible: `title`, `uid` (required for data), `body` unused for storage

Author identity (v1):

- Frontend form always posts as **guest** (`authorName` / optional email / url). No frontend Payload login in v1.
- 「博主」badge only when `author` relation is set (create/edit in Payload Admin, or a later session-aware enhancement).

### `RecentComment` sidebar

- Fetch latest ~5–8 comments (any `target`), show authorName + truncated content + link:
  - `about` → `/about`
  - `links` → `/links`
  - else try `/post/{encodePathSegment(target)}` (posts); pages under `/page/{slug}` only if we later store a `targetKind` — **v1:** store optional `targetKind`: `post` \| `page` \| `about` \| `links` so links are correct.

Add field:

| Field | Type | Notes |
| --- | --- | --- |
| `targetKind` | select | `post` \| `page` \| `about` \| `links`; set by the Comment UI from the call site |

Call sites pass kind explicitly (post-view → `post`, about → `about`, links → `links`, page/[slug] → `page`).

### i18n

Add keys under `settings` / new `comments` namespace for form labels, empty state, submit, errors (zh-CN / zh-TW / en).

## API usage

- List: Payload `find` with `where: { target: { equals: uid } }`, `sort: createdAt`, `limit: 100`, `depth: 1` (for parent/author)
- Create: REST `POST /api/comments` with JSON body
- Recent: `find` sort `-createdAt`, `limit: 8`, `depth: 0`

Rate limiting: not in v1 beyond honeypot; document as follow-up if spam appears.

## Migration

- New migration creating `comments` (+ relationships) table
- Register collection in `payload.config.ts`
- `pnpm ci` / Vercel build runs `payload migrate`

## Testing / acceptance

1. Post a guest comment on a published article → appears without Admin action
2. Reply once → nested under parent; cannot reply to a reply
3. About + links pages accept comments with correct `target` / `targetKind`
4. Sidebar shows recent items with working deep links
5. Admin can delete a comment in Payload; frontend list updates after refresh
6. Honeypot filled → no row created
7. Existing pages without comments still render empty list + form (no Waline placeholder copy)

## Non-goals / follow-ups

- Moments comments
- Email / webhook notifications
- Markdown or Lexical in comments
- Captcha / IP rate limit
- Editing own comments as guest
