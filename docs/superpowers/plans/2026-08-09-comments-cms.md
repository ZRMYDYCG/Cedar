# CMS Comments Implementation Plan

> **For agentic workers:** Implement task-by-task. Steps use checkbox syntax.

**Goal:** First-party Payload comments replacing the Waline placeholder.

**Architecture:** `comments` collection + `src/data/cms/comments.ts` + client `Comment` / `RecentComment` UI posting to Payload REST.

**Tech Stack:** Payload 3, Next.js App Router, next-intl

## Global Constraints

- Guest create public; no moderation; one-level replies; honeypot; no Moments comments.

## Tasks

- [ ] Task 1: Comments collection + migration + register in payload.config
- [ ] Task 2: `src/data/cms/comments.ts` list/create helpers + types
- [ ] Task 3: Comment UI + styles + i18n
- [ ] Task 4: RecentComment + call-site `targetKind`
- [ ] Task 5: generate types, migrate, commit, push
